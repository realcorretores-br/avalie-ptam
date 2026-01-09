import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAdminLog = () => {
  const { user } = useAuth();

  const logAction = async (action: string, details?: any) => {
    if (!user) return;

    try {
      await supabase.from('admin_logs').insert({
        user_id: user.id,
        action,
        details,
        ip_address: null, // Could be fetched from a service if needed
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  return { logAction };
};
