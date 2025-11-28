import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useRole } from "./useRole";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  relatorios_usados: number;
  relatorios_disponiveis: number;
  data_expiracao: string;
  plans: {
    nome: string;
    preco: number;
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
            tipo,
            preco
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      // For avulso plans with no expiration date, always consider active
      const isAvulso = (data as any)?.plans?.tipo === 'avulso';
      const hasExpiration = data?.data_expiracao;

      setSubscription(data as any);
      setHasActiveSubscription(!!data && (isAvulso || !hasExpiration || new Date(data.data_expiracao) > new Date()));
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
