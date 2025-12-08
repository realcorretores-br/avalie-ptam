// @ts-nocheck
// This is a Supabase Edge Function running on Deno runtime
// TypeScript errors are expected in IDE as it uses Node.js types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purchaseId, userId, quantity, totalPrice, action } = await req.json();

    console.log('Request received:', { action, purchaseId, userId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- CHECK STATUS ACTION ---
    if (action === 'check_status') {
      if (!purchaseId) throw new Error('Purchase ID is required for check_status');

      // Get purchase details
      const { data: purchase, error: purchaseError } = await supabase
        .from('additional_reports_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (purchaseError || !purchase) throw new Error('Purchase not found');

      if (purchase.payment_status === 'approved') {
        return new Response(
          JSON.stringify({ status: 'approved', message: 'Payment already approved' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get active payment gateway
      const { data: gateway, error: gatewayError } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (gatewayError || !gateway) throw new Error('No active payment gateway found');

      let paymentStatus = 'pending';

      if (gateway.name === 'mercadopago') {
        const accessToken = Deno.env.get(gateway.config.access_token_key);
        if (!accessToken) throw new Error('Mercado Pago access token not found');

        // Check by payment_id if available
        if (purchase.payment_id) {
          const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${purchase.payment_id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (mpResponse.ok) {
            const paymentData = await mpResponse.json();
            paymentStatus = paymentData.status;
            console.log('Mercado Pago status:', paymentStatus);
          }
        }
      }

      // If approved in gateway but not in DB, update DB
      if (paymentStatus === 'approved') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await supabase
          .from('additional_reports_purchases')
          .update({
            payment_status: 'approved',
            status: 'approved',
            expires_at: expiresAt.toISOString()
          })
          .eq('id', purchaseId);

        // Add reports to active subscription
        const { data: activeSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', purchase.user_id)
          .eq('status', 'active')
          .single();

        if (activeSubscription) {
          await supabase
            .from('subscriptions')
            .update({
              relatorios_disponiveis: activeSubscription.relatorios_disponiveis + purchase.quantidade,
            })
            .eq('id', activeSubscription.id);
        }

        return new Response(
          JSON.stringify({ status: 'approved', message: 'Payment verified and approved' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ status: paymentStatus, message: 'Payment still pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // --- END CHECK STATUS ACTION ---

    if (!purchaseId || !userId || !quantity || !totalPrice) {
      throw new Error('Missing required fields');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, nome_completo, cpf, telefone')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('User not found');
    }

    // Get active payment gateway
    const { data: gateway, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      console.error('Error fetching payment gateway:', gatewayError);
      throw new Error('No active payment gateway found');
    }

    console.log('Using payment gateway:', gateway.display_name);

    // Determine base URL for return/callback
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${origin}/dashboard?payment=success`;
    const cancelUrl = `${origin}/dashboard?payment=failure`;

    if (gateway.name === 'mercadopago') {
      const accessToken = Deno.env.get(gateway.config.access_token_key);
      if (!accessToken) {
        throw new Error(`Secret ${gateway.config.access_token_key} não configurado`);
      }

      // Create Mercado Pago preference
      const preference = {
        items: [
          {
            title: `${quantity} Relatório${quantity > 1 ? 's' : ''} Avulso${quantity > 1 ? 's' : ''}`,
            description: `Créditos adicionais - ${quantity} relatório${quantity > 1 ? 's' : ''}`,
            quantity: 1,
            unit_price: Number(totalPrice),
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: profile.email,
          name: profile.nome_completo,
          identification: profile.cpf ? { type: 'CPF', number: profile.cpf.replace(/\D/g, '') } : undefined
        },
        back_urls: {
          success: returnUrl,
          failure: cancelUrl,
          pending: `${origin}/dashboard?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: purchaseId,
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      };

      console.log('Creating Mercado Pago preference:', preference);

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error('Mercado Pago error:', errorText);
        throw new Error(`Mercado Pago error: ${mpResponse.status} - ${errorText}`);
      }

      const mpData = await mpResponse.json();
      console.log('Mercado Pago preference created:', mpData.id);

      // Update purchase with payment info
      const { error: updateError } = await supabase
        .from('additional_reports_purchases')
        .update({
          payment_id: mpData.id,
          payment_status: 'pending',
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
      }

      return new Response(
        JSON.stringify({
          init_point: mpData.init_point,
          preference_id: mpData.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (gateway.name === 'abacatepay') {
      const apiKey = Deno.env.get(gateway.config.access_token_key);
      if (!apiKey) {
        throw new Error(`Secret ${gateway.config.access_token_key} não configurado`);
      }

      console.log('Creating AbacatePay billing for additional reports...');

      // Clean CPF
      const taxId = profile.cpf ? profile.cpf.replace(/\D/g, '') : null;

      if (!taxId) {
        throw new Error('CPF é obrigatório para pagamentos via PIX. Por favor, atualize seu perfil.');
      }

      // Sanitize CPF and Phone
      const cleanTaxId = taxId.replace(/\D/g, '');
      const cleanPhone = profile.telefone ? profile.telefone.replace(/\D/g, '') : '11999999999'; // Fallback

      const pixPayload = {
        amount: Math.round(totalPrice * 100), // Price in cents
        description: `Compra de ${quantity} laudos adicionais`,
        customer: {
          name: profile.nome_completo || 'Cliente',
          email: profile.email,
          taxId: cleanTaxId,
          cellphone: cleanPhone
        },
        metadata: {
          user_id: userId,
          quantity: quantity,
          externalId: `reports_${userId}_${Date.now()}`
        }
      };

      console.log('AbacatePay Payload:', JSON.stringify(pixPayload));

      const abacateResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pixPayload),
      });

      const pixData = await abacateResponse.json();
      console.log('AbacatePay Response Status:', abacateResponse.status);
      console.log('AbacatePay Response Body:', JSON.stringify(pixData));

      if (!abacateResponse.ok) {
        console.error('AbacatePay Error:', pixData);
        throw new Error('Erro AbacatePay: ' + (pixData.error?.message || JSON.stringify(pixData)));
      }

      // Update purchase with payment info
      const { error: updateError } = await supabase
        .from('additional_reports_purchases')
        .update({
          payment_id: pixData.data.id, // Assuming pixData.data.id is the payment ID
          payment_status: 'pending',
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
      }

      return new Response(
        JSON.stringify({
          pix_code: pixData.data.brCode,
          pix_image: pixData.data.brCodeBase64,
          payment_id: pixData.data.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
<<<<<<< HEAD
    }

    throw new Error(`Gateway ${gateway.display_name} não suportado para esta operação`);
=======

    } else {
      throw new Error(`Gateway ${gateway.display_name} não suportado para esta operação`);
    }
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
  } catch (error) {
    console.error('Error in create-additional-reports-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Explicitly return 200 so the client can read the error message
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
