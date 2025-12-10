import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.4';

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

        const { userId, quantity, planId } = await req.json();

        if (!userId || !quantity) {
            throw new Error('Missing required params');
        }

        // 1. Get Active Gateway Config
        const { data: gateway, error: gatewayError } = await supabase
            .from('payment_gateways')
            .select('config')
            .eq('name', 'mercadopago')
            .eq('is_active', true)
            .single();

        if (gatewayError || !gateway) {
            throw new Error('Mercado Pago gateway not active or configured');
        }

        const config = gateway.config;
        const client = new MercadoPagoConfig({ accessToken: config.access_token });
        const preference = new Preference(client);

        // 2. Calculate Price (Fetch 'avulso' plan or use fixed logic based on prompt)
        // The prompt implies "Avulso", usually tied to a plan price. Let's fetch the plan.
        let unitPrice = 29.90; // Default fallback
        let planName = 'Crédito Avulso';

        if (planId) {
            const { data: plan } = await supabase.from('plans').select('preco, nome').eq('id', planId).single();
            if (plan) {
                unitPrice = plan.preco;
                planName = plan.nome;
            }
        } else {
            // Try to find the default 'avulso' plan
            const { data: plan } = await supabase.from('plans').select('preco, nome').eq('tipo', 'avulso').eq('ativo', true).single();
            if (plan) {
                unitPrice = plan.preco;
                planName = plan.nome;
            }
        }

        const totalAmount = unitPrice * quantity;

        // 3. Create Preference
        const preferenceData = {
            items: [
                {
                    id: planId || 'avulso',
                    title: `${planName} (x${quantity})`,
                    quantity: 1, // We sell a "bundle" of X credits as 1 item to MP, or we could pass quantity. Let's pass 1 item with total price to be safe with unit logic? No, MP handles quantity * unit_price. 
                    // Let's use quantity properly.
                    quantity: quantity,
                    currency_id: 'BRL',
                    unit_price: unitPrice
                }
            ],
            payer: {
                // We could fetch user email if needed, but MP allows guest checkout or asks email there.
                // Better execution: fetch user email.
            },
            external_reference: JSON.stringify({
                user_id: userId,
                quantity: quantity,
                type: 'credits'
            }),
            auto_return: 'approved',
            back_urls: {
                success: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard?payment=success`,
                failure: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard?payment=failure`,
                pending: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/dashboard?payment=pending`
            },
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`
        };

        // Add Payer info if possible
        const { data: profile } = await supabase.from('profiles').select('email, nome_completo').eq('id', userId).single();
        if (profile) {
            (preferenceData as any).payer = {
                email: profile.email,
                name: profile.nome_completo
            }
        }

        const result = await preference.create({ body: preferenceData });

        return new Response(
            JSON.stringify({ init_point: result.init_point, id: result.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Payment error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
