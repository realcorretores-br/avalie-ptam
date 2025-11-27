import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  data_expiracao: string;
  profiles: {
    nome_completo: string;
    email: string;
  } | null;
  plans: {
    nome: string;
  } | null;
}

interface SupabaseSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  data_expiracao: string;
  profiles: {
    nome_completo: string;
    email: string;
  }[];
  plans: {
    nome: string;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting subscription expiry check...');

    // Calculate dates for notifications
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Get active subscriptions expiring in 3 or 7 days
    const { data: expiringSubscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        data_expiracao,
        profiles (
          nome_completo,
          email
        ),
        plans (
          nome
        )
      `)
      .eq('status', 'active')
      .gte('data_expiracao', now.toISOString())
      .lte('data_expiracao', sevenDaysFromNow.toISOString());

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions to check`);

    const notifications = [];

    for (const rawSub of (expiringSubscriptions as SupabaseSubscription[]) || []) {
      // Convert array relations to single objects
      const sub: Subscription = {
        ...rawSub,
        profiles: rawSub.profiles?.[0] || null,
        plans: rawSub.plans?.[0] || null,
      };

      const expiryDate = new Date(sub.data_expiracao);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`Subscription ${sub.id} expires in ${daysUntilExpiry} days`);

      // Only notify on 7 days and 3 days before expiry
      if (daysUntilExpiry === 7 || daysUntilExpiry === 3) {
        // Check if notification was already sent for this period
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', sub.user_id)
          .eq('title', `Assinatura expira em ${daysUntilExpiry} dias`)
          .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (!existingNotification) {
          const message = daysUntilExpiry === 7
            ? `Sua assinatura do plano ${sub.plans?.nome} expira em 7 dias (${expiryDate.toLocaleDateString('pt-BR')}). Renove para continuar utilizando os serviços.`
            : `Atenção! Sua assinatura do plano ${sub.plans?.nome} expira em 3 dias (${expiryDate.toLocaleDateString('pt-BR')}). Não perca o acesso aos seus relatórios!`;

          notifications.push({
            user_id: sub.user_id,
            title: `Assinatura expira em ${daysUntilExpiry} dias`,
            message: message,
            read: false,
            is_mass: false,
          });

          console.log(`Created notification for user ${sub.user_id} (${daysUntilExpiry} days)`);
        } else {
          console.log(`Notification already sent for user ${sub.user_id} (${daysUntilExpiry} days)`);
        }
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
        throw notifError;
      }

      console.log(`Successfully created ${notifications.length} notifications`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: expiringSubscriptions?.length || 0,
        notified: notifications.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in check-subscription-expiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
