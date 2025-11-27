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
  data_inicio: string;
  relatorios_disponiveis: number;
  auto_renew: boolean;
  payment_method_id: string | null;
  profiles: {
    nome_completo: string;
    email: string;
  } | null;
  plans: {
    nome: string;
    tipo: string;
    relatorios_incluidos: number;
  } | null;
}

interface SupabaseSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  data_expiracao: string;
  data_inicio: string;
  relatorios_disponiveis: number;
  auto_renew: boolean;
  payment_method_id: string | null;
  profiles: {
    nome_completo: string;
    email: string;
  }[];
  plans: {
    nome: string;
    tipo: string;
    relatorios_incluidos: number;
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

    console.log('Starting expired subscription renewal check...');

    const now = new Date();

    // Get expired active subscriptions (only mensal plans should auto-renew)
    const { data: expiredSubscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        data_expiracao,
        data_inicio,
        relatorios_disponiveis,
        auto_renew,
        profiles (
          nome_completo,
          email
        ),
        plans (
          nome,
          tipo,
          relatorios_incluidos
        )
      `)
      .eq('status', 'active')
      .lt('data_expiracao', now.toISOString());

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions`);

    const renewed = [];
    const expired = [];

    for (const rawSub of (expiredSubscriptions as SupabaseSubscription[]) || []) {
      // Convert array relations to single objects
      const sub: Subscription = {
        ...rawSub,
        profiles: rawSub.profiles?.[0] || null,
        plans: rawSub.plans?.[0] || null,
      };

      // Skip 'avulso' plans - they never expire
      if (sub.plans?.tipo === 'avulso') {
        console.log(`Skipping avulso plan subscription ${sub.id}`);
        continue;
      }

      // Only auto-renew mensal (monthly) plans if auto_renew is enabled
      if ((sub.plans?.tipo === 'mensal_basico' || sub.plans?.tipo === 'mensal_pro') && sub.auto_renew) {
        console.log(`Processing auto-renewal for subscription ${sub.id}`);
        
        // Chamar edge function para processar pagamento com método de pagamento salvo
        const { data: paymentResult, error: paymentError } = await supabase.functions.invoke(
          'process-subscription-payment',
          {
            body: {
              subscription_id: sub.id,
              plan_id: sub.plan_id,
              payment_method_id: sub.payment_method_id // Use saved payment method for automatic billing
            }
          }
        );

        if (paymentError) {
          console.error(`Payment processing failed for subscription ${sub.id}:`, paymentError);
          // Marcar como expirado se o pagamento falhar
          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', sub.id);
          
          expired.push(sub);
          continue;
        }

        console.log(`Payment initiated for subscription ${sub.id}:`, paymentResult);

        // Calculate new expiry date (1 month from original expiry)
        const oldExpiry = new Date(sub.data_expiracao);
        const newExpiry = new Date(oldExpiry);
        newExpiry.setMonth(oldExpiry.getMonth() + 1);

        // Update subscription with new dates and reset reports
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            data_inicio: oldExpiry.toISOString(),
            data_expiracao: newExpiry.toISOString(),
            relatorios_disponiveis: sub.plans?.relatorios_incluidos || 0,
            relatorios_usados: 0,
            status: 'active',
          })
          .eq('id', sub.id);

        if (updateError) {
          console.error(`Error renewing subscription ${sub.id}:`, updateError);
          continue;
        }

        // Send notification about renewal
        await supabase
          .from('notifications')
          .insert({
            user_id: sub.user_id,
            title: 'Assinatura Renovada Automaticamente',
            message: `Sua assinatura do plano ${sub.plans?.nome} foi renovada automaticamente até ${newExpiry.toLocaleDateString('pt-BR')}. Seus relatórios foram resetados para ${sub.plans?.relatorios_incluidos}.`,
            read: false,
            is_mass: false,
          });

        renewed.push(sub.id);
        console.log(`Renewed subscription ${sub.id} until ${newExpiry.toISOString()}`);

      } else {
        // For non-monthly plans, plans with auto_renew disabled, or expired plans, mark as expired
        const { error: expireError } = await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
          })
          .eq('id', sub.id);

        if (expireError) {
          console.error(`Error expiring subscription ${sub.id}:`, expireError);
          continue;
        }

        // Send notification about expiration
        const expirationReason = !sub.auto_renew && (sub.plans?.tipo === 'mensal_basico' || sub.plans?.tipo === 'mensal_pro')
          ? 'com renovação automática desativada'
          : '';

        await supabase
          .from('notifications')
          .insert({
            user_id: sub.user_id,
            title: 'Assinatura Expirada',
            message: `Sua assinatura do plano ${sub.plans?.nome} ${expirationReason} expirou. Renove sua assinatura para continuar gerando relatórios.`,
            read: false,
            is_mass: false,
          });

        expired.push(sub.id);
        console.log(`Expired subscription ${sub.id}${!sub.auto_renew ? ' (auto-renew disabled)' : ''}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: expiredSubscriptions?.length || 0,
        renewed: renewed.length,
        expired: expired.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in renew-expired-subscriptions:', error);
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
