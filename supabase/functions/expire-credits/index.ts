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

    console.log('Starting credit expiration check...');

    // Find approved credits that have expired (expires_at < now)
    const { data: expiredCredits, error: fetchError } = await supabase
      .from('additional_reports_purchases')
      .select('id, user_id, quantidade, expires_at')
      .eq('status', 'approved')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired credits:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredCredits?.length || 0} expired credits`);

    let expiredCount = 0;

    // Mark each expired credit
    for (const credit of expiredCredits || []) {
      const { error: updateError } = await supabase
        .from('additional_reports_purchases')
        .update({ status: 'expired' })
        .eq('id', credit.id);

      if (updateError) {
        console.error(`Error expiring credit ${credit.id}:`, updateError);
        continue;
      }

      // Send notification to user
      await supabase
        .from('notifications')
        .insert({
          user_id: credit.user_id,
          title: 'Créditos Expirados',
          message: `${credit.quantidade} relatório(s) avulso(s) expiraram por vencimento de prazo.`,
          read: false
        });

      expiredCount++;
      console.log(`Expired credit ${credit.id} for user ${credit.user_id}`);
    }

    console.log(`Successfully expired ${expiredCount} credits`);

    return new Response(
      JSON.stringify({ 
        success: true,
        expired_count: expiredCount,
        message: `Expired ${expiredCount} credits`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in expire-credits function:', error);
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
