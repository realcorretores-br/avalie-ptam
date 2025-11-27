import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
    allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
    const { role, loading } = useRole();

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
