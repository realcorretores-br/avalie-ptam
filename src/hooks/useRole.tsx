import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = 'admin' | 'moderator' | 'user';

export const useRole = () => {
  const { profile, loading: authLoading } = useAuth();

  // Use the role from the profile, defaulting to 'user'
  const userRole = profile?.role || 'user';

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator'; // Future proofing

  return {
    role: userRole,
    isAdmin,
    isModerator,
    loading: authLoading
  };
};
