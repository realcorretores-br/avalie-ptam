import { useSubscription } from '@/hooks/useSubscription';
import { useRole } from '@/hooks/useRole';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const { isAdmin, loading: roleLoading } = useRole();

  if (subLoading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Administradores têm acesso ilimitado
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/dashboard/planos" replace />;
  }

  return <>{children}</>;
};
