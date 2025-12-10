// @ts-nocheck
// This is a Supabase Edge Function running on Deno runtime
// TypeScript errors are expected in IDE as it uses Node.js types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { purchaseId, paymentId } = await req.json();

        if (!purchaseId && !paymentId) {
            throw new Error('Purchase ID or Payment ID is required');
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let purchase = null;

        // 1. Resolve Purchase from DB if purchaseId is provided
        if (purchaseId) {
            const { data: p, error: pError } = await supabase
                .from('additional_reports_purchases')
                .select('*')
                .eq('id', purchaseId)
                .single();

            if (!pError && p) {
                purchase = p;
                if (purchase.payment_status === 'approved') {
                    return new Response(
                        JSON.stringify({ status: 'approved', message: 'Payment already approved' }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
            }
        }

        // FORCE SWITCH TO MERCADO PAGO for check-payment
        const gateway = {
            name: 'mercadopago',
            config: { access_token_key: 'HARDCODED' }
        };

        if (!gateway) {
            throw new Error('No active payment gateway found');
        }

        let paymentStatus = 'pending';
        let paymentData = null;

        if (gateway.name === 'mercadopago') {
            // User provided hardcoded credentials
            const accessToken = 'APP_USR-4196436067933490-102406-f5fbb599bd45ccd66aad2fe22e8829dd-287066595';
            if (!accessToken) {
                throw new Error('Mercado Pago access token not found');
            }

            // If we have a payment_id (either from args or purchase), check it directly
            const targetPaymentId = paymentId || (purchase ? purchase.payment_id : null);

            if (targetPaymentId) {
                const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${targetPaymentId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (mpResponse.ok) {
                    paymentData = await mpResponse.json();
                    paymentStatus = paymentData.status; // approved, pending, etc.
                }
            }
        }

        // If approved in gateway, update DB
        if (paymentStatus === 'approved') {

            // Try to recover userId from purchase or metadata
            let userId = purchase?.user_id;

            if (!userId && paymentData) {
                // Try to find user_id in metadata (if sent during create-payment)
                userId = paymentData.metadata?.user_id || paymentData.external_reference;
            }

            if (userId) {
                // If we don't have the purchase object yet (came from paymentId only), try to find it
                if (!purchase && paymentData) {
                    // Try to find by payment_id match
                    const { data: pFound } = await supabase
                        .from('additional_reports_purchases')
                        .select('*')
                        .eq('payment_id', paymentData.id.toString())
                        .maybeSingle();
                    purchase = pFound;
                }

                // A. It is a Purchase (Avulso)
                if (purchase) {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 30);

                    await supabase
                        .from('additional_reports_purchases')
                        .update({
                            payment_status: 'approved',
                            status: 'approved',
                            expires_at: expiresAt.toISOString()
                        })
                        .eq('id', purchase.id);

                    // Add credits to subscription
                    const { data: activeSubscription } = await supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('status', 'active')
                        .maybeSingle();

                    if (activeSubscription) {
                        await supabase
                            .from('subscriptions')
                            .update({
                                relatorios_disponiveis: (activeSubscription.relatorios_disponiveis || 0) + purchase.quantidade,
                            })
                            .eq('id', activeSubscription.id);
                    }
                }
                // B. It might be a Subscription (or user not found in purchases)
                else {
                    // If we can't find a purchase record but MP says approved, distinct action might be needed
                    // For now, if we have userId, we assume it's valid and returning approved is enough 
                    // for the frontend to re-fetch/refresh.
                }
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

    } catch (error) {
        console.error('Error checking payment:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
