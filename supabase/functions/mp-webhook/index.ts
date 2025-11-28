// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

// Validate Mercado Pago webhook signature
function validateMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !xRequestId) {
    console.error('Missing signature headers');
    return false;
  }

  try {
    // Parse signature header (format: "ts=timestamp,v1=hash")
    const parts = xSignature.split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !hash) {
      console.error('Invalid signature format');
      return false;
    }

    // Create manifest: id + request-id + ts
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Generate HMAC SHA256
    const hmac = createHmac('sha256', secret);
    hmac.update(manifest);
    const computedHash = hmac.digest('hex');

    // Compare hashes
    const isValid = computedHash === hash;
    if (!isValid) {
      console.error('Signature validation failed');
    }
    return isValid;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    // Validate webhook signature
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const secret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');

    if (!secret) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }

    const isValid = validateMercadoPagoSignature(
      xSignature,
      xRequestId,
      data?.id || '',
      secret
    );

    if (!isValid) {
      console.error('Invalid webhook signature - potential attack attempt');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('Webhook signature validated successfully');

    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar detalhes do pagamento
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')}`,
        },
      });

      const payment = await mpResponse.json();
      console.log('Payment details:', { status: payment.status, external_reference: payment.external_reference });

      if (payment.status === 'approved') {
        const externalReference = payment.external_reference;
        const planId = payment.metadata?.plan_id;

        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Check if this is an additional reports purchase (UUID format)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalReference);

        if (isUUID && !planId) {
          // This is an additional reports purchase
          console.log('Processing additional reports purchase:', externalReference);

          const { data: purchase, error: purchaseError } = await supabaseClient
            .from('additional_reports_purchases')
            .select('*, subscriptions(id)')
            .eq('id', externalReference)
            .single();

          if (purchaseError || !purchase) {
            console.error('Purchase not found:', purchaseError);
            throw new Error('Purchase not found');
          }

          // Update purchase status
          // Update additional reports purchase with expiration date (30 days)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await supabaseClient
            .from('additional_reports_purchases')
            .update({
              payment_status: 'approved',
              status: 'approved',
              expires_at: expiresAt.toISOString()
            })
            .eq('id', externalReference);

          // Add reports to active subscription
          const { data: activeSubscription } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', purchase.user_id)
            .eq('status', 'active')
            .single();

          if (activeSubscription) {
            await supabaseClient
              .from('subscriptions')
              .update({
                relatorios_disponiveis: activeSubscription.relatorios_disponiveis + purchase.quantidade,
              })
              .eq('id', activeSubscription.id);

            console.log(`Added ${purchase.quantidade} reports to subscription ${activeSubscription.id}`);
          } else {
            console.error('No active subscription found for user:', purchase.user_id);
          }
        } else {
          // This is a regular plan subscription
          const userId = externalReference;
          console.log('Processing plan subscription for user:', userId);

          // Buscar plano
          const { data: plan } = await supabaseClient
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

          if (!plan) {
            throw new Error('Plano não encontrado');
          }

          // Verificar se já existe assinatura ativa
          // Use limit(1) and order by created_at desc to handle potential duplicates gracefully
          const { data: existingSubscription, error: subError } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (subError) {
            console.error('Error fetching existing subscription:', subError);
          }

          console.log('Existing subscription found:', existingSubscription ? existingSubscription.id : 'None');

          if (existingSubscription) {
            console.log('Updating existing subscription:', existingSubscription.id);

            // Check for downgrade (if new plan price is lower than current plan price)
            // We need to fetch the current plan to compare prices
            const { data: currentPlan } = await supabaseClient
              .from('plans')
              .select('preco')
              .eq('id', existingSubscription.plan_id)
              .single();

            let legacyCredits = existingSubscription.legacy_credits || 0;
            let legacyExpiresAt = existingSubscription.legacy_credits_expires_at;

            // If it's a downgrade (new price < old price), move current credits to legacy
            if (currentPlan && plan.preco < currentPlan.preco) {
              console.log('Downgrade detected. Moving credits to legacy.');
              legacyCredits += existingSubscription.relatorios_disponiveis;

              // Set expiry to 3 days from now
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 3);
              legacyExpiresAt = expiryDate.toISOString();
            }

            // Atualizar assinatura existente
            const { error: updateError } = await supabaseClient
              .from('subscriptions')
              .update({
                plan_id: planId,
                payment_id: paymentId,
                payment_status: 'approved',
                relatorios_disponiveis: plan.relatorios_incluidos, // Reset to new plan's limit
                legacy_credits: legacyCredits,
                legacy_credits_expires_at: legacyExpiresAt,
                data_expiracao: plan.tipo === 'avulso'
                  ? existingSubscription.data_expiracao
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('id', existingSubscription.id);

            if (updateError) {
              console.error('Error updating subscription:', updateError);
              throw new Error('Failed to update subscription');
            }
            console.log('Subscription updated successfully');

          } else {
            console.log('Creating new subscription for user:', userId);
            // Criar nova assinatura
            const { error: insertError } = await supabaseClient.from('subscriptions').insert({
              user_id: userId,
              plan_id: planId,
              status: 'active',
              payment_id: paymentId,
              payment_status: 'approved',
              relatorios_disponiveis: plan.relatorios_incluidos,
              relatorios_usados: 0,
              data_inicio: new Date().toISOString(),
              data_expiracao: plan.tipo === 'avulso'
                ? null
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });

            if (insertError) {
              console.error('Error creating subscription:', insertError);
              throw new Error('Failed to create subscription');
            }
            console.log('New subscription created successfully');
          }

          // Atualizar profile - remover bloqueio
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({ bloqueado_ate: null })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
