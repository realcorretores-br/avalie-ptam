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
        .maybeSingle();

      if (error) throw error;

      setSubscription(data as unknown as Subscription);

      setSubscription(data as unknown as Subscription);

      // Nova Lógica de Pacotes e Expiração (Jan 2026 - Atualizada)
      // 1. O saldo é a soma de relatorios_disponiveis + creditos_extra.
      // 2. A expiração congela TUDO.

      const planCredits = (data as any)?.relatorios_disponiveis || 0;
      const extraCredits = (data as any)?.creditos_extra || 0;
      const creditsUsed = (data as any)?.relatorios_usados || 0;

      // Nota: No novo modelo, 'relatorios_disponiveis' já é o saldo líquido acrescido.
      // Mas por segurança, e suporte a legado, somamos tudo e subtraímos usados se a lógica de decremento usar 'usados'.
      // Update: mp-webhook incrementa 'relatorios_disponiveis'. PTAMForm incrementa 'relatorios_usados'.
      // Logo: Saldo = (relatorios_disponiveis + creditos_extra) - relatorios_usados.

      const totalCredits = Math.max(0, (planCredits + extraCredits) - creditsUsed);

      // Verificação Rigorosa de Validade
      const expirationDate = data?.data_expiracao ? new Date(data.data_expiracao) : null;
      const isExpired = expirationDate ? expirationDate < new Date() : false;

      // Regra: Tem crédito E não expirou.
      const hasCredits = totalCredits > 0;
      const isActive = hasCredits && !isExpired;

      setHasActiveSubscription(isActive);
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
