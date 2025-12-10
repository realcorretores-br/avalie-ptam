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

                // If we have a payment_id, check it directly
                if (purchase.payment_id) {
                    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${purchase.payment_id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    });

                    if (mpResponse.ok) {
                        paymentData = await mpResponse.json();
                        paymentStatus = paymentData.status;
                    }
                }
            }

            // If approved in gateway but not in DB, update DB
            if (paymentStatus === 'approved') {
                // Update purchase status
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

        } catch (error) {
            console.error('Error checking payment:', error);
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }
    });
