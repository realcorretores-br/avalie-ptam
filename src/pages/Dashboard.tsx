import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import {
  FileText,
  Video,
  AlertTriangle,
  Plus,
  TrendingUp,
  File,
  CreditCard,
  Shield,
  Edit,
  Settings,
  Gift
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddReportsDialog } from "@/components/user/AddReportsDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { subscription, hasActiveSubscription, loading: subLoading, refetch: refetchSubscription } = useSubscription();
  const { isAdmin } = useRole();
  const [showAddReportsDialog, setShowAddReportsDialog] = useState(false);

  // Enable realtime notifications
  useRealtimeNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isAdmin) {
      navigate('/dashboard/admin');
    }
  }, [user, isAdmin, navigate]);

  // Handle payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus) {
      if (paymentStatus === 'success') {
        toast.success('Créditos adicionados com sucesso! Você já pode utilizar todos os recursos do sistema.');
        refetchSubscription();

        // Remove query param without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else if (paymentStatus === 'failure') {
        toast.error('O pagamento falhou ou foi cancelado.');
      } else if (paymentStatus === 'pending') {
        toast.info('Pagamento em processamento. Aguarde a confirmação.');
      }
    }
  }, [refetchSubscription]);

  const handleCreateNew = () => {
    if (!hasActiveSubscription && !isAdmin) {
      toast.error('Assine um plano para criar avaliações');
      return;
    }
    if (!isAdmin && subscription && subscription.relatorios_usados >= subscription.relatorios_disponiveis) {
      toast.error('Você não tem créditos disponíveis. Adicione mais créditos para criar uma nova avaliação.');
      return;
    }
    navigate('/dashboard/nova-avaliacao');
  };

  // Determine welcome title
  const welcomeTitle = hasActiveSubscription && subscription?.plans?.nome
    ? `Boas vindas ao ${subscription.plans.nome}`
    : "Boas vindas ao PTAM";

  // Determine background color style
  // If profile has a theme color, we could use it, but for now we'll stick to the primary class
  // or inline style if available. The request says "A cor de fundo desse card é a mesma cor do sistema".
  // We will use bg-primary which follows the system theme.

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Section: Welcome Card + Subscription Card */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Welcome Card (Takes up 2 columns on desktop) */}
          <Card className="md:col-span-2 relative overflow-hidden bg-primary text-primary-foreground border-none p-8 flex flex-col justify-center min-h-[240px]">
            {/* Background Icon Watermark */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
              <File className="h-64 w-64" />
            </div>

            <div className="relative z-10 space-y-4 max-w-lg">
              <div>
                <h1 className="text-3xl font-bold leading-tight">
                  {welcomeTitle}
                </h1>
                <h2 className="text-2xl font-semibold opacity-90 mt-1">
                  {profile?.nome_completo || "Usuário"}
                </h2>
              </div>

              <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
                Crie laudos técnicos profissionais em conformidade com a NBR 14.653 de forma rápida e intuitiva.
              </p>

              <Button
                onClick={handleCreateNew}
                variant="secondary"
                size="lg"
                className="font-semibold gap-2 mt-2"
              >
                <Plus className="h-5 w-5" />
                Nova Avaliação
              </Button>
            </div>
          </Card>

          {/* Subscription/Status Card (Takes up 1 column) */}
          <Card className="p-6 flex flex-col justify-between bg-card border-border min-h-[240px]">
            {subLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Relatórios Disponíveis
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {isAdmin ? "∞" : subscription ? (subscription.relatorios_disponiveis - subscription.relatorios_usados) : 0}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          de {isAdmin ? "∞" : subscription?.relatorios_disponiveis || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!isAdmin && subscription && (
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${Math.min(((subscription.relatorios_usados / subscription.relatorios_disponiveis) * 100), 100)}%`
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/dashboard/perfil?tab=assinatura')}
                  >
                    <CreditCard className="h-4 w-4" />
                    Minha assinatura
                  </Button>

                  {!isAdmin && (
                    <Button
                      className="w-full justify-start gap-2"
                      onClick={() => setShowAddReportsDialog(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Créditos Avulsos
                    </Button>
                  )}

                  {/* Bonus Redemption */}
                  {!isAdmin && (profile as any)?.creditos_pendentes > 0 && (
                    <Button
                      className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={async () => {
                        try {
                          const loadingToast = toast.loading('Resgatando bônus...');
                          const pending = (profile as any).creditos_pendentes;

                          // 1. Create Purchase Record
                          const { error: purchaseError } = await supabase
                            .from('additional_reports_purchases')
                            .insert({
                              user_id: user?.id,
                              preco_total: 0, // Bonus has no cost
                              quantidade: pending,
                              payment_status: 'approved',
                              payment_id: `bonus_${Date.now()}`
                            } as any);

                          if (purchaseError) throw purchaseError;

                          // 2. Decrement Pending Credits
                          const { error: updateError } = await supabase
                            .from('profiles')
                            .update({ creditos_pendentes: 0 } as any)
                            .eq('id', user?.id);

                          if (updateError) throw updateError;

                          toast.dismiss(loadingToast);
                          toast.success(`${pending} crédito(s) resgatado(s) com sucesso!`);

                          // Force refresh
                          window.location.reload();
                        } catch (error) {
                          console.error(error);
                          toast.error('Erro ao resgatar bônus');
                        }
                      }}
                    >
                      <Gift className="h-4 w-4" />
                      Resgatar {((profile as any)?.creditos_pendentes || 0)} Bônus
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Action Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">

          {/* Avaliações Salvas */}
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border"
            onClick={() => navigate('/dashboard/avaliacoes')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Avaliações Salvas</h3>
                <p className="text-sm text-muted-foreground">
                  Ver histórico de laudos criados
                </p>
              </div>
            </div>
          </Card>

          {/* Métricas */}
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border"
            onClick={() => navigate('/dashboard/metricas')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Métricas</h3>
                <p className="text-sm text-muted-foreground">
                  Ver estatísticas e desempenho
                </p>
              </div>
            </div>
          </Card>

          {/* Vídeos Tutoriais */}
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border"
            onClick={() => navigate('/dashboard/tutoriais')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                <Video className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Vídeos Tutoriais</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda a usar a plataforma
                </p>
              </div>
            </div>
          </Card>

          {/* Reportar Erro */}
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border"
            onClick={() => navigate('/dashboard/reportar-erro')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Reportar Erro</h3>
                <p className="text-sm text-muted-foreground">
                  Relatar problemas ou bugs
                </p>
              </div>
            </div>
          </Card>

          {/* Admin Cards (Only visible to admins) */}
          {isAdmin && (
            <>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-primary/20" onClick={() => navigate('/dashboard/admin')}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Painel Admin</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerenciar usuários e planos
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-primary/20" onClick={() => navigate('/dashboard/conteudo')}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Edit className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Gerenciar Conteúdo</h3>
                    <p className="text-sm text-muted-foreground">
                      Editar landing page e vídeos
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-primary/20" onClick={() => navigate('/dashboard/admin/cms')}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">CMS Planos</h3>
                    <p className="text-sm text-muted-foreground">
                      Editar planos e preços
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

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
