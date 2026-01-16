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

    console.log('Starting pending payment expiration check...');

    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find pending payments older than 3 days
    const { data: expiredPayments, error: fetchError } = await supabase
      .from('additional_reports_purchases')
      .select('id, user_id, quantidade')
      .eq('status', 'pending')
      .lt('created_at', threeDaysAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching expired payments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredPayments?.length || 0} expired pending payments`);

    let expiredCount = 0;

    // Mark each expired payment
    for (const payment of expiredPayments || []) {
      const { error: updateError } = await supabase
        .from('additional_reports_purchases')
        .update({ status: 'expired' })
        .eq('id', payment.id);

      if (updateError) {
        console.error(`Error expiring payment ${payment.id}:`, updateError);
        continue;
      }

      // Send notification to user
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          title: 'Pagamento Expirado',
          message: `O pagamento de ${payment.quantidade} relatório(s) avulso(s) expirou por falta de confirmação.`,
          read: false
        });

      expiredCount++;
      console.log(`Expired pending payment ${payment.id} for user ${payment.user_id}`);
    }

    console.log(`Successfully expired ${expiredCount} pending payments`);

    return new Response(
      JSON.stringify({ 
        success: true,
        expired_count: expiredCount,
        message: `Expired ${expiredCount} pending payments`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in expire-pending-payments function:', error);
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
