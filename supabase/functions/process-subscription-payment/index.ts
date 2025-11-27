import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subscription_id, plan_id, payment_method_id } = await req.json();

    if (!subscription_id || !plan_id) {
      return new Response(
        JSON.stringify({ error: 'subscription_id and plan_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados da assinatura e plano
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (
          nome,
          preco,
          tipo,
          relatorios_incluidos
        ),
        profiles (
          email,
          nome_completo
        )
      `)
      .eq('id', subscription_id)
      .single();

    if (subError || !subscription) {
      console.error('Error fetching subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const plan = Array.isArray(subscription.plans) ? subscription.plans[0] : subscription.plans;
    const profile = Array.isArray(subscription.profiles) ? subscription.profiles[0] : subscription.profiles;

    // Criar pagamento no gateway ativo
    const { data: activeGateway } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!activeGateway) {
      return new Response(
        JSON.stringify({ error: 'No active payment gateway found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let paymentUrl = null;

    if (activeGateway.name === 'mercadopago') {
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      
      if (!accessToken) {
        console.error('Mercado Pago access token not configured');
        return new Response(
          JSON.stringify({ error: 'Payment gateway not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if we have a saved payment method for automatic billing
      if (payment_method_id) {
        // Automatic card billing
        const payment = {
          transaction_amount: Number(plan.preco),
          token: payment_method_id,
          installments: 1,
          description: `Renovação - ${plan.nome}`,
          payer: {
            email: profile.email,
          },
          external_reference: subscription_id,
          notification_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/mp-webhook`
        };

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payment)
        });

        if (!mpResponse.ok) {
          const errorText = await mpResponse.text();
          console.error('Mercado Pago automatic payment error:', errorText);
          throw new Error('Failed to process automatic payment');
        }

        const mpData = await mpResponse.json();
        
        // Update subscription immediately if payment was approved
        if (mpData.status === 'approved') {
          const newExpirationDate = new Date();
          newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);

          await supabase
            .from('subscriptions')
            .update({ 
              payment_id: mpData.id.toString(),
              payment_status: 'approved',
              status: 'active',
              data_expiracao: newExpirationDate.toISOString(),
              relatorios_usados: 0,
              relatorios_disponiveis: plan.relatorios_incluidos
            })
            .eq('id', subscription_id);
        } else {
          await supabase
            .from('subscriptions')
            .update({ 
              payment_id: mpData.id.toString(),
              payment_status: mpData.status
            })
            .eq('id', subscription_id);
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            automatic_charge: true,
            payment_status: mpData.status,
            subscription_id 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Manual payment - create payment preference
      const preference = {
        items: [
          {
            title: `Renovação - ${plan.nome}`,
            quantity: 1,
            unit_price: Number(plan.preco),
            currency_id: 'BRL'
          }
        ],
        payer: {
          email: profile.email,
          name: profile.nome_completo
        },
        back_urls: {
          success: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard/perfil`,
          failure: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard/perfil`,
          pending: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard/perfil`
        },
        auto_return: 'approved',
        external_reference: subscription_id,
        notification_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/mp-webhook`
      };

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error('Mercado Pago API error:', errorText);
        throw new Error('Failed to create payment preference');
      }

      const mpData = await mpResponse.json();
      paymentUrl = mpData.init_point;

      // Atualizar subscription com payment_id
      await supabase
        .from('subscriptions')
        .update({ 
          payment_id: mpData.id,
          payment_status: 'pending'
        })
        .eq('id', subscription_id);
    }

    console.log(`Payment created for subscription ${subscription_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_url: paymentUrl,
        subscription_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});