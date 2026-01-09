import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get Active Gateway Config
        const { data: gateway } = await supabase
            .from('payment_gateways')
            .select('config')
            .eq('name', 'mercadopago')
            .eq('is_active', true)
            .single();

        if (!gateway || !gateway.config.access_token) {
            throw new Error('Gateway config invalid');
        }

        const body = await req.json();
        const { type, data } = body;

        console.log("Webhook received:", { type, id: data?.id });

        if (type === 'payment') {
            // 1. Fetch Payment Details from Mercado Pago API
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                headers: {
                    'Authorization': `Bearer ${gateway.config.access_token}`
                }
            });

            if (!mpResponse.ok) {
                console.error("MP API Error:", await mpResponse.text());
                throw new Error("Failed to fetch payment details");
            }

            const paymentData = await mpResponse.json();
            console.log("Payment status:", paymentData.status);

            if (paymentData.status === 'approved') {
                const metadata = JSON.parse(paymentData.external_reference);
                const { user_id, quantity } = metadata;

                console.log("Processing approved payment for user:", user_id, "qty:", quantity);

                // 2. Idempotency Check
                const { data: existing } = await supabase
                    .from('additional_reports_purchases')
                    .select('id')
                    .eq('payment_id', String(data.id))
                    .single();

                if (existing) {
                    console.log("Payment already processed:", data.id);
                    return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
                }

                // 3. Record Purchase
                const { error: purchaseError } = await supabase
                    .from('additional_reports_purchases')
                    .insert({
                        user_id: user_id,
                        quantidade: Number(quantity),
                        preco_total: paymentData.transaction_amount,
                        payment_id: String(data.id),
                        payment_status: 'approved'
                    });

                if (purchaseError) {
                    console.error("Error inserting purchase:", purchaseError);
                    throw purchaseError;
                }

                // 4. Update Subscription/Credits
                // First check if user has an active subscription row
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('id, relatorios_disponiveis, creditos_extra')
                    .eq('user_id', user_id)
                    .single();

                const isCreditPurchase = metadata.type === 'credits';

                if (subscription) {
                    let updateData = {};
                    let newBalance = 0;

                    if (isCreditPurchase) {
                        // Update EXTRA CREDITS (Avulso)
                        newBalance = (subscription.creditos_extra || 0) + Number(quantity);
                        updateData = { creditos_extra: newBalance };
                        console.log("Updating Extra Credits (Avulso). New Balance:", newBalance);
                    } else {
                        // Update PLAN CREDITS
                        newBalance = (subscription.relatorios_disponiveis || 0) + Number(quantity);
                        updateData = { relatorios_disponiveis: newBalance };
                        console.log("Updating Plan Credits. New Balance:", newBalance);
                    }

                    const { error: updateError } = await supabase
                        .from('subscriptions')
                        .update(updateData)
                        .eq('id', subscription.id);

                    if (updateError) {
                        console.error("Error updating subscription:", updateError);
                        throw updateError;
                    }
                } else {
                    console.warn("No subscription found for user:", user_id);
                    // Handle edge case if needed
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
