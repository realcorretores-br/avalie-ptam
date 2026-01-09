<<<<<<< HEAD
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
=======
import { createContext, useContext, useEffect, useState } from 'react';
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  cpf?: string;
  rg?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep: string;
  estrangeiro?: boolean;
  passaporte?: string;
  pais_origem?: string;
  tipo_avaliador?: string;
  creci?: string;
  cau?: string;
  crea?: string;
  cnae?: string;
  cnpj?: string;
  data_cadastro?: string;
  bloqueado_ate?: string;
  created_at?: string;
  updated_at?: string;
  theme_color?: string;
  role?: 'user' | 'admin' | 'editor' | 'moderator';
  creditos_pendentes?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

<<<<<<< HEAD
  const fetchProfile = useCallback(async (userId: string) => {
=======
  const fetchProfile = async (userId: string) => {
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('🔍 Profile fetched:', data);

        // Fallback: If role is missing (due to RLS), try to fetch via secure RPC
        let role = (data as any).role;
        if (!role) {
          console.log('⚠️ Role missing, attempting RPC fetch...');
          const { data: rpcRole } = await (supabase.rpc as any)('get_my_role');
          if (rpcRole) {
            console.log('✅ Role fetched via RPC:', rpcRole);
            role = rpcRole;
          }
        }

        // Check if user is blocked
        if (data.bloqueado_ate && new Date(data.bloqueado_ate) > new Date()) {
          console.log('⛔ User is blocked until:', data.bloqueado_ate);
          await supabase.auth.signOut();
          toast.error("Sua conta está suspensa. Entre em contato com o suporte.");
          setUser(null);
          setSession(null);
          setProfile(null);
          navigate('/login');
          return;
        }

        const profileWithRole = { ...data, role };
        console.log('👑 Final User Role:', role);
        setProfile(profileWithRole as Profile);
      }
    } catch (error) {
      console.error('Exception fetching profile:', error);
    }
<<<<<<< HEAD
  }, [navigate]);
=======
  };
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Small delay to ensure DB trigger has created profile if it's a new user
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 500);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
<<<<<<< HEAD
  }, [fetchProfile]);
=======
  }, []);
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

<<<<<<< HEAD
// eslint-disable-next-line react-refresh/only-export-components
=======
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
