import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
    User,
    CreditCard,
    Receipt,
    Pencil,
    LogOut,
    LayoutDashboard,
    PlusCircle,
    FileText,
    Shield,
    AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { AddReportsDialog } from "@/components/user/AddReportsDialog";
import { Button } from "@/components/ui/button";
import { CreditDisplay } from "@/components/CreditDisplay";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
    className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const { isAdmin } = useRole();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab');
    const [showAddReportsDialog, setShowAddReportsDialog] = useState(false);
    const [pendingErrorsCount, setPendingErrorsCount] = useState(0);

    // Attempt to refresh profile if it's missing but user is logged in
    useEffect(() => {
        if (user && !profile) {
            refreshProfile();
        }
    }, [user, profile, refreshProfile]);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchPendingErrors = async () => {
            const { count } = await supabase
                .from('error_reports')
                .select('*', { count: 'exact', head: true })
                .neq('status', 'resolvido');

            setPendingErrorsCount(count || 0);
        };

        fetchPendingErrors();

        const channel = supabase
            .channel('sidebar-error-reports')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'error_reports'
                },
                () => {
                    fetchPendingErrors();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAdmin]);

    const isActive = (path: string, tab?: string) => {
        if (tab) {
            return location.pathname === path && currentTab === tab;
        }
        return location.pathname === path && !currentTab;
    };

    const profileItems = [
        {
            label: "Perfil",
            icon: User,
            path: "/dashboard/perfil",
            tab: "perfil"
        },
        {
            label: "Assinatura",
            icon: CreditCard,
            path: "/dashboard/perfil",
            tab: "assinatura"
        },
        {
            label: "Histórico de Pagamento",
            icon: Receipt,
            path: "/dashboard/perfil",
            tab: "pagamentos"
        },
        {
            label: "Anotações",
            icon: Pencil,
            path: "/dashboard/perfil",
            tab: "anotacoes"
        }
    ];

    return (
        <div className={cn("h-screen w-64 border-r bg-background flex-col fixed left-0 top-0 z-50 hidden md:flex", className)}>
            {/* User Info */}
            <div className="p-6 flex flex-col items-center border-b text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3 overflow-hidden">
                    {(profile as any)?.logo_url ? (
                        <img
                            src={(profile as any).logo_url}
                            alt="Logo"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <h3 className="font-semibold truncate w-full">
                    {profile?.nome_completo || "Usuário"}
                </h3>
                <p className="text-sm text-muted-foreground truncate w-full">
                    {profile?.email || user?.email}
                </p>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* User Menu (Always Visible) */}
                <div className="space-y-1">
                    <Link
                        to="/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive("/dashboard")
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        to="/dashboard/nova-avaliacao"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive("/dashboard/nova-avaliacao")
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Nova Avaliação
                    </Link>
                    <Link
                        to="/dashboard/avaliacoes"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive("/dashboard/avaliacoes")
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <FileText className="h-4 w-4" />
                        Minhas Avaliações
                    </Link>
                </div>

                {/* Profile Section */}
                <div className="space-y-1">
                    <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Meu Perfil
                    </h4>
                    {profileItems.map((item) => (
                        <Link
                            key={item.label}
                            to={`${item.path}?tab=${item.tab}`}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive(item.path, item.tab)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Admin Menu */}
                {isAdmin && (
                    <div className="space-y-1">
                        <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Funções Administrativas
                        </h4>
                        <Link
                            to="/dashboard/admin"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive("/dashboard/admin")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Shield className="h-4 w-4" />
                            Painel Admin
                        </Link>
                        <Link
                            to="/dashboard/conteudo"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive("/dashboard/conteudo")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Pencil className="h-4 w-4" />
                            Gerenciar Conteúdos
                        </Link>
                        <Link
                            to="/dashboard/admin/cms"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive("/dashboard/admin/cms")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Receipt className="h-4 w-4" />
                            CMS Planos
                        </Link>
                        <Link
                            to="/dashboard/admin/gateways"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive("/dashboard/admin/gateways")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <CreditCard className="h-4 w-4" />
                            Gateway de Pagamento
                        </Link>
                        <Link
                            to="/dashboard/admin/templates"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive("/dashboard/admin/templates")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            Template de Avaliação
                        </Link>
                        <Link
                            to="/dashboard/admin/erros"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive("/dashboard/admin/erros")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            Erros Reportados
                            {pendingErrorsCount > 0 && (
                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                                    {pendingErrorsCount}
                                </span>
                            )}
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-4">
                <CreditDisplay hideReportsLine />

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setShowAddReportsDialog(true)}
                >
                    <PlusCircle className="h-4 w-4" />
                    Adicionar créditos avulso
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={signOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                </Button>
            </div>
            <AddReportsDialog
                open={showAddReportsDialog}
                onOpenChange={setShowAddReportsDialog}
                onSuccess={() => {
                    refreshProfile();
                }}
            />
        </div>
    );
};
