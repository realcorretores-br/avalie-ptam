import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export const useRealtimeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Subscription change:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'active') {
            toast.success('Pagamento aprovado! Seu plano foi ativado.', {
              description: 'Você já pode começar a criar avaliações.',
              duration: 5000,
            });
            
            // Redirecionar para o dashboard após 2 segundos
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
