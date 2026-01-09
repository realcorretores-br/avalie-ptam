import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Download, ArrowLeft, Trash2, Eye, AlertCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { PTAMPreview } from "@/components/PTAMPreview";
import { exportToPDF } from "@/lib/exportUtils";
import { PTAMData } from "@/types/ptam";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Avaliacao {
  id: string;
  endereco_imovel: string;
  tipo_imovel: string;
  finalidade: string;
  valor_final: number;
  status: string;
  created_at: string;
  form_data: any;
}

const AvaliacoesSalvas = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avaliacaoToDelete, setAvaliacaoToDelete] = useState<string | null>(null);

  // Check if user effectively has a recurring plan (Avulso doesn't count as "Active Plan" for UX messages)
  const hasRecurringPlan = subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (subscription.plans as any)?.tipo !== 'avulso';

  // Determinar limite de visualizações baseado no plano
  const getVisualizationLimit = () => {
    // Admin tem acesso ilimitado
    if (isAdmin) return Infinity;

    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      return 0;
    }

    // Avulso plans should not have visualization limits (pay-per-use)
    if ((subscription.plans as any)?.tipo === 'avulso') {
      return Infinity;
    }

    // Se tivermos a informação direta do plano, usamos ela
    if ((subscription.plans as any)?.relatorios_incluidos) {
      return (subscription.plans as any).relatorios_incluidos;
    }

    const reportCount = subscription.relatorios_disponiveis || 0;

    // Fallback logic
    if (reportCount <= 5) return 1;
    if (reportCount <= 10) return 3;
    return 25;
  };

  const visualizationLimit = getVisualizationLimit();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAvaliacoes = async () => {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAvaliacoes(data);
      }
      setLoading(false);
    };

    fetchAvaliacoes();
  }, [user, navigate]);

  const handleExport = async (avaliacao: Avaliacao) => {
    try {
      // Container invisível, porém acoplado ao DOM (garante CSS aplicado)
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 210mm; opacity: 0; pointer-events: none; z-index: -1000; background: #ffffff;';
      document.body.appendChild(tempContainer);

      const root = document.createElement('div');
      root.id = 'temp-preview-' + Date.now();
      tempContainer.appendChild(root);

      const { createRoot } = await import('react-dom/client');
      const reactRoot = createRoot(root);

      // Renderizar e aguardar tempo adequado para renderização completa
      await new Promise<void>((resolve) => {
        reactRoot.render(<PTAMPreview data={avaliacao.form_data as unknown as PTAMData} />);
        setTimeout(resolve, 1200);
      });

      // Inliner de imagens para evitar erros de CORS/tainted canvas
      const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.getAttribute('src');
          if (!src || src.startsWith('data:')) return;
          try {
            const res = await fetch(src, { mode: 'cors' });
            const blob = await res.blob();
            const dataUrl: string = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            img.setAttribute('src', dataUrl);
            await new Promise<void>((resolve) => {
              if (img.complete) resolve(); else img.onload = () => resolve();
            });
          } catch (e) {
            console.warn('Imagem externa não pôde ser embutida. Ocultando para exportação.', e);
            img.style.visibility = 'hidden';
          }
        })
      );

      toast.loading('Gerando PDF...');
      await exportToPDF([root as HTMLElement], `relatorio_${avaliacao.id}.pdf`);

      // Limpar
      reactRoot.unmount();
      document.body.removeChild(tempContainer);

      toast.dismiss();
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao gerar PDF. Tente novamente.');
      console.error('Erro detalhado ao exportar PDF:', error);
    }
  };

  const handleDeleteClick = (avaliacaoId: string) => {
    setAvaliacaoToDelete(avaliacaoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!avaliacaoToDelete) return;

    try {
      const { error } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', avaliacaoToDelete);

      if (error) throw error;

      setAvaliacoes(avaliacoes.filter(a => a.id !== avaliacaoToDelete));
      toast.success('Avaliação excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir avaliação');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setAvaliacaoToDelete(null);
    }
  };

  // Filter and Sort
  let filteredAvaliacoes = avaliacoes;

  // Restriction: Users without a recurring plan cannot see Drafts
  if (!isAdmin && !hasRecurringPlan) {
    filteredAvaliacoes = filteredAvaliacoes.filter(a => a.status !== 'rascunho');
  }

  const visibleAvaliacoes = isAdmin ? filteredAvaliacoes : filteredAvaliacoes.slice(0, visualizationLimit);
  const hasMore = !isAdmin && filteredAvaliacoes.length > visualizationLimit;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* Header removed */}

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Avaliações Salvas</h1>

          {!isAdmin && !subscriptionLoading && (
            <div className="mb-8">
              {!hasRecurringPlan ? (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="ml-2 font-medium">
                    Você não possui um plano ativo.
                    <Link to="/dashboard/planos" className="underline ml-1">Assine um plano</Link>
                    para salvar rascunhos e visualizar mais relatórios.
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-muted-foreground">
                  Seu plano ({subscription?.plans?.nome || 'Ativo'}) permite visualizar até <strong>{visualizationLimit}</strong> relatórios
                </p>
              )}
            </div>
          )}

          {isAdmin && (
            <p className="text-muted-foreground mb-8">
              Acesso administrativo: visualização ilimitada
            </p>
          )}

          {/* Filters and Sorting removed */}

          {hasMore && (
            <Alert className="mb-6 border-primary bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertDescription className="ml-2">
                <strong>Limite do plano atingido:</strong> Você possui {avaliacoes.length} relatórios,
                mas seu plano permite visualizar apenas {visualizationLimit}.
                Faça upgrade do seu plano para visualizar todos os relatórios.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : visibleAvaliacoes.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Comece criando sua primeira avaliação
              </p>
              <Link to="/dashboard/nova-avaliacao">
                <Button>Nova Avaliação</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleAvaliacoes.map((avaliacao) => (
                <Card key={avaliacao.id} className="p-6 hover:shadow-lg transition-shadow relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(avaliacao.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 pr-8">
                        {avaliacao.endereco_imovel || 'Endereço não informado'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {avaliacao.tipo_imovel || 'Tipo não informado'}
                      </p>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Finalidade:</span>{' '}
                        {avaliacao.finalidade || 'Não informada'}
                      </p>
                      {avaliacao.valor_final && (
                        <p>
                          <span className="font-medium">Valor:</span>{' '}
                          R$ {avaliacao.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge variant={avaliacao.status === 'finalizado' ? 'default' : 'secondary'}>
                          {avaliacao.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(avaliacao.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {avaliacao.status === 'rascunho' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/dashboard/nova-avaliacao', {
                            state: { editData: avaliacao.form_data, avaliacaoId: avaliacao.id }
                          })}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Continuar Edição
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dashboard/avaliacoes/${avaliacao.id}`)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleExport(avaliacao)}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AvaliacoesSalvas;
