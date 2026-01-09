import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useRole } from "./useRole";

export interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  relatorios_usados: number;
  relatorios_disponiveis: number;
  creditos_extra: number;
  data_expiracao: string;
  plans: {
    nome: string;
    tipo: string;
  };
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (roleLoading) return;

    // Admins have unlimited access
    if (isAdmin) {
      setHasActiveSubscription(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            nome,
            tipo
          )
        `)
        .eq('user_id', user.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // For avulso plans with no expiration date, always consider active
      const isAvulso = (data as unknown as Subscription)?.plans?.tipo === 'avulso';
      const hasExpiration = data?.data_expiracao;

      setSubscription(data as unknown as Subscription);

      // Allow access if:
      // 1. Is Avulso plan (no expiry)
      // 2. Has valid expiration date (future)
      // 3. OR Has available credits (relatorios_disponiveis OR creditos_extra)
      const hasPlanCredits = (data?.relatorios_disponiveis || 0) > 0;
      const hasExtraCredits = (data?.creditos_extra || 0) > 0;

      setHasActiveSubscription(!!data && (hasPlanCredits || hasExtraCredits || isAvulso || !hasExpiration || new Date(data.data_expiracao) > new Date()));
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, roleLoading]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, hasActiveSubscription, loading, refetch: fetchSubscription };
};
