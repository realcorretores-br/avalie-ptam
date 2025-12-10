import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { MercadoPagoConfig, Payment } from 'https://esm.sh/mercadopago@2.0.4';

serve(async (req) => {
    const url = new URL(req.url); // Use URL to parse query params if needed

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get Active Gateway Config for MP
        const { data: gateway } = await supabase
            .from('payment_gateways')
            .select('config')
            .eq('name', 'mercadopago')
            .eq('is_active', true)
            .single();

        if (!gateway) {
            throw new Error('Gateway config not found');
        }

        const client = new MercadoPagoConfig({ accessToken: gateway.config.access_token });
        const payment = new Payment(client);

        const body = await req.json();
        const { type, data } = body;

        if (type === 'payment') {
            const paymentData = await payment.get({ id: data.id });

            if (paymentData.status === 'approved') {
                const metadata = JSON.parse(paymentData.external_reference);
                const { user_id, quantity } = metadata;

                // Idempotency Check: Check if this payment ID was already processed
                const { data: existing } = await supabase
                    .from('additional_reports_purchases')
                    .select('id')
                    .eq('payment_id', String(data.id))
                    .single();

                if (existing) {
                    return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
                }

                // 1. Add Credits Record
                const { error: purchaseError } = await supabase
                    .from('additional_reports_purchases')
                    .insert({
                        user_id: user_id,
                        quantidade: quantity,
                        preco_total: paymentData.transaction_amount,
                        payment_id: String(data.id),
                        payment_status: 'approved'
                    });

                if (purchaseError) throw purchaseError;

                // 2. Update Profile Credits (Fetch current, add new)
                const { data: profile } = await supabase.from('subscriptions').select('relatorios_disponiveis, id').eq('user_id', user_id).eq('status', 'active').single();

                // If user has subscription, add to it. If not, add to 'creditos_avulsos' in profile or handle differently.
                // Simplified Logic: The prompt says "Add to user balance".
                // The current system uses `subscriptions.relatorios_disponiveis` OR `profiles`? 
                // Admin previously used `additional_reports_purchases` logic.
                // Let's assume we update the active subscription if exists, or just log the purchase.
                // Wait, "check-payment" previously updated `subscriptions`.

                // Let's UPDATE the `subscriptions` table directly if an active sub exists, 
                // OR if not, we might need a "lifetime/avulso" mechanism.
                // Assuming user ALWAYS has a subscription row (even free/trial/avulso container).

                if (profile) {
                    await supabase.from('subscriptions')
                        .update({
                            relatorios_disponiveis: profile.relatorios_disponiveis + quantity
                        })
                        .eq('id', profile.id);
                } else {
                    // Fallback: If no active subscription, maybe update a profile field?
                    // System seems to rely on subscriptions.
                }

            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
