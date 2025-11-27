import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Deactivate all gateways
        const { error: error1 } = await supabase
            .from('payment_gateways')
            .update({ is_active: false })
            .neq('id', 0); // Hack to select all rows (assuming id is not 0, or use a condition that is always true like id > -1)

        if (error1) throw error1;

        // 2. Activate Mercado Pago
        const { data, error: error2 } = await supabase
            .from('payment_gateways')
            .update({ is_active: true })
            .eq('name', 'mercadopago')
            .select();

        if (error2) throw error2;

        return new Response(
            JSON.stringify({ message: 'Gateway switched to Mercado Pago', data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
