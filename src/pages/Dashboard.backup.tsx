import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Video, Settings, LogOut, Moon, Sun, PlusCircle, AlertCircle, CreditCard, Shield, Edit, TrendingUp, Coins, User, AlertTriangle } from "lucide-react";
import { CreditDisplay } from "@/components/CreditDisplay";
import { useTheme } from "next-themes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotificationBell } from "@/components/NotificationBell";
import { AddReportsDialog } from "@/components/user/AddReportsDialog";
import { toast } from "sonner";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  relatorios_usados: number;
  relatorios_disponiveis: number;
  data_expiracao: string;
  plans: {
    nome: string;
  };
}

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { subscription, hasActiveSubscription } = useSubscription();
  const { isAdmin } = useRole();
  const { theme, setTheme } = useTheme();
  const [showAddReportsDialog, setShowAddReportsDialog] = useState(false);

  // Enable realtime notifications
  useRealtimeNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* Header removed */}

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center gap-4">
            {(profile as any)?.logo_url && (
              <img
                src={(profile as any).logo_url}
                alt="Logo"
                className="h-16 w-16 object-contain rounded-lg border border-border"
              />
            )}
            <h1 className="text-3xl font-bold">
              Bem-vindo, {profile?.nome_completo?.split(' ')[0]}!
            </h1>
          </div>
          <div>

            {/* Credit Display with Buttons */}
            {!isAdmin && (
              <div className="mt-4 space-y-4">
                <CreditDisplay hideReportsLine />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard/perfil#assinatura')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Minha assinatura
                  </Button>
                </div>
              </div>
            )}
            {isAdmin ? (
              <div className="space-y-1 text-muted-foreground">
                <p className="text-lg">
                  <span className="font-medium">Perfil:</span>{' '}
                  <span className="text-primary font-semibold">Administrador</span>
                </p>
                <p>
                  <span className="font-medium">Acesso:</span>{' '}
                  Ilimitado a todas as funcionalidades
                </p>
              </div>
            ) : subscription && (
              <div className="space-y-1 text-muted-foreground">
                <p className="text-lg">
                  <span className="font-medium">Plano Ativo:</span>{' '}
                  {(subscription as any).plans?.nome}
                </p>
                <p>
                  <span className="font-medium">Relatórios:</span>{' '}
                  {subscription.relatorios_disponiveis - subscription.relatorios_usados}/
                  {subscription.relatorios_disponiveis} disponíveis
                </p>
                {(subscription as any).plans?.tipo !== 'avulso' && subscription.data_expiracao && (
                  <p className="text-sm">
                    Renovação:{' '}
                    {new Date(subscription.data_expiracao).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Add Reports Button */}
          {!isAdmin && hasActiveSubscription && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowAddReportsDialog(true)}
                size="lg"
                className="gap-2"
              >
                <Coins className="h-5 w-5" />
                Adicionar Créditos Avulsos
              </Button>
            </div>
          )}

          {/* Subscription Alert */}
          {!hasActiveSubscription && !isAdmin && (
            <Alert className="border-primary bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertDescription className="ml-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Você não possui um plano ativo. Assine agora para começar a criar avaliações.
                  </span>
                  <Button onClick={() => navigate('/dashboard/planos')} size="sm" className="ml-4">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ver Planos
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className={`p-6 transition-shadow ${(hasActiveSubscription || isAdmin) &&
                  (isAdmin || (subscription && subscription.relatorios_usados < subscription.relatorios_disponiveis))
                  ? 'hover:shadow-lg cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }`}
              onClick={() => {
                if (!hasActiveSubscription && !isAdmin) return;
                if (!isAdmin && subscription && subscription.relatorios_usados >= subscription.relatorios_disponiveis) {
                  toast.error('Você não tem créditos disponíveis. Adicione mais créditos para criar uma nova avaliação.');
                  return;
                }
                navigate('/dashboard/nova-avaliacao');
              }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <PlusCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Nova Avaliação</h3>
                  <p className="text-sm text-muted-foreground">
                    {!hasActiveSubscription && !isAdmin
                      ? 'Assine um plano para criar avaliações'
                      : !isAdmin && subscription && subscription.relatorios_usados >= subscription.relatorios_disponiveis
                        ? 'Sem créditos disponíveis. Adicione mais créditos.'
                        : 'Criar novo laudo de avaliação imobiliária'
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/avaliacoes')}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Avaliações Salvas</h3>
                  <p className="text-sm text-muted-foreground">
                    Ver histórico de laudos criados
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/tutoriais')}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Vídeos Tutoriais</h3>
                  <p className="text-sm text-muted-foreground">
                    Aprenda a usar a plataforma
                  </p>
                </div>
              </div>
            </Card>

            {/* Profile Card removed */}

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/metricas')}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Métricas</h3>
                  <p className="text-sm text-muted-foreground">
                    Ver estatísticas e desempenho
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/reportar-erro')}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Reportar Erro</h3>
                  <p className="text-sm text-muted-foreground">
                    Relatar problemas ou bugs
                  </p>
                </div>
              </div>
            </Card>

            {isAdmin && (
              <>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary" onClick={() => navigate('/dashboard/admin')}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Painel Admin</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerenciar usuários e planos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary" onClick={() => navigate('/dashboard/conteudo')}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Edit className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Gerenciar Conteúdo</h3>
                      <p className="text-sm text-muted-foreground">
                        Editar landing page e vídeos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary" onClick={() => navigate('/dashboard/admin/cms')}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Settings className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">CMS Planos</h3>
                      <p className="text-sm text-muted-foreground">
                        Editar planos e preços
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary" onClick={() => navigate('/dashboard/admin/gateways')}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Gateways Pagamento</h3>
                      <p className="text-sm text-muted-foreground">
                        Configurar formas de pagamento
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Add Reports Dialog */}
      <AddReportsDialog
        open={showAddReportsDialog}
        onOpenChange={setShowAddReportsDialog}
        onSuccess={() => {
          // Refresh subscription data or show success message
        }}
      />
    </div>
  );
};

export default Dashboard;
