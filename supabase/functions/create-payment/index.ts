import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        console.log("Starting create-payment function");
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get request body safely
        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.error("Error parsing JSON:", e);
            throw new Error("Invalid request body");
        }

        const { userId, quantity, planId } = body;
        console.log(`Processing payment for User: ${userId}, Quantity: ${quantity}, Plan: ${planId}`);

        if (!userId || !quantity) {
            console.error("Missing required params");
            throw new Error('Missing required params: userId and quantity are mandatory');
        }

        // 1. Get Active Gateway Config
        const { data: gateway, error: gatewayError } = await supabase
            .from('payment_gateways')
            .select('config')
            .eq('name', 'mercadopago')
            .eq('is_active', true)
            .single();

        if (gatewayError || !gateway) {
            console.error("Gateway configuration error:", gatewayError);
            throw new Error('Mercado Pago gateway not active or configured');
        }

        const config = gateway.config;
        // Verify we have an access token
        if (!config.access_token) {
            throw new Error('Mercado Pago Access Token is missing in configuration');
        }

        // 2. Calculate Price
        let unitPrice = 29.90;
        let planName = 'Crédito Avulso';

        // Fetch plan details to ensure we have correct price
        if (planId) {
            const { data: plan } = await supabase.from('plans').select('preco, nome').eq('id', planId).single();
            if (plan) {
                unitPrice = Number(plan.preco);
                planName = plan.nome;
            }
        } else {
            const { data: plan } = await supabase.from('plans').select('preco, nome').eq('tipo', 'avulso').eq('ativo', true).single();
            if (plan) {
                unitPrice = Number(plan.preco);
                planName = plan.nome;
            }
        }

        console.log(`Price configuration - Unit: ${unitPrice}, Quantity: ${quantity}, Total: ${unitPrice * quantity}`);

        // 3. Create Preference using direct API call (replacing SDK)
        const preferenceData = {
            items: [
                {
                    id: planId || 'avulso',
                    title: `${planName} (x${quantity})`,
                    quantity: Number(quantity),
                    currency_id: 'BRL',
                    unit_price: Number(unitPrice)
                }
            ],
            external_reference: JSON.stringify({
                user_id: userId,
                quantity: Number(quantity),
                type: 'credits'
            }),
            auto_return: 'approved',
            back_urls: {
                success: `${req.headers.get('origin')}/payment-success-popup`,
                failure: `${req.headers.get('origin')}/payment-success-popup?status=failure`,
                pending: `${req.headers.get('origin')}/payment-success-popup?status=pending`
            },
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`
        };

        // Add Payer info if possible
        const { data: profile } = await supabase.from('profiles').select('email, nome_completo').eq('id', userId).single();
        if (profile && profile.email) {
            (preferenceData as any).payer = {
                email: profile.email,
                name: profile.nome_completo || 'Usuario'
            }
        }

        console.log("Creating MP preference via API...");

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.access_token}`
            },
            body: JSON.stringify(preferenceData)
        });

        if (!mpResponse.ok) {
            const errorText = await mpResponse.text();
            console.error('Mercado Pago API Error:', mpResponse.status, errorText);
            throw new Error(`Mercado Pago API failed: ${errorText}`);
        }

        const result = await mpResponse.json();
        console.log("MP Preference created successfully:", result.id);

        return new Response(
            JSON.stringify({ init_point: result.init_point, id: result.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Payment processing error:', error);

        return new Response(
            JSON.stringify({
                error: error.message || 'Unknown error',
                details: error
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
