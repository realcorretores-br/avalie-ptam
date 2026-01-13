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

                // 4. Update Subscription/Credits with STRICT EXPIRATION logic
                // First check if user has an active subscription row
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('id, relatorios_disponiveis')
                    .eq('user_id', user_id)
                    .single();

                if (subscription) {
                    // Logic:
                    // 1. ADD exact quantity to current balance (No multiplication)
                    // 2. RESET expiration to 30 days from NOW (Last purchase)

                    const currentBalance = subscription.relatorios_disponiveis || 0;
                    const creditosParaAdicionar = Number(quantity);
                    const newBalance = currentBalance + creditosParaAdicionar;

                    const newExpirationDate = new Date();
                    newExpirationDate.setDate(newExpirationDate.getDate() + 30); // NOW + 30 days

                    console.log(`Updating Credits. Old: ${currentBalance}, Adding: ${creditosParaAdicionar}, New: ${newBalance}`);
                    console.log(`New Expiration Date: ${newExpirationDate.toISOString()}`);

                    const { error: updateError } = await supabase
                        .from('subscriptions')
                        .update({
                            relatorios_disponiveis: newBalance,
                            data_expiracao: newExpirationDate.toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', subscription.id);

                    if (updateError) {
                        console.error("Error updating subscription:", updateError);
                        throw updateError;
                    }
                } else {
                    console.warn("No subscription found for user:", user_id);
                    // Optionally create a subscription row if missing? 
                    // For now, assuming user must have a row (created on signup).
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
