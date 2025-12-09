import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatePlanDialog } from "@/components/admin/CreatePlanDialog";
import { EditBenefitsDialog } from "@/components/admin/EditBenefitsDialog";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Edit } from "lucide-react";

const PlanUpdateSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  preco: z.number().positive("Preço deve ser maior que zero").max(999999, "Preço deve ser menor que 1.000.000"),
  relatorios_incluidos: z.number().int("Relatórios deve ser um número inteiro").positive("Relatórios deve ser maior que zero").max(10000, "Relatórios deve ser menor que 10.000"),
  descricao: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

const ContentUpdateSchema = z.object({
  value: z.string().trim().max(2000, "Conteúdo deve ter no máximo 2000 caracteres"),
});
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

interface Plan {
  id: string;
  nome: string;
  tipo: 'avulso' | 'mensal_basico' | 'mensal_pro' | 'personalizado';
  preco: number;
  relatorios_incluidos: number;
  descricao: string;
  ativo: boolean;
  beneficios?: string[];
}

const AdminCMS = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const [landingContent, setLandingContent] = useState<Record<string, any>>({});
  const [editingBenefits, setEditingBenefits] = useState<{ planId: string; planName: string; benefits: string[] } | null>(null);



  const hasFetched = useRef(false);

  useEffect(() => {
    if (isAdmin && !hasFetched.current) {
      fetchPlans();
      fetchLandingContent();
      hasFetched.current = true;
    }
  }, [isAdmin]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('preco', { ascending: true });

      if (error) throw error;

      // Normalize null values to empty strings to prevent React warnings
      const normalizedData = (data as any[])?.map(plan => ({
        ...plan,
        descricao: plan.descricao ?? '',
        beneficios: plan.beneficios ?? [],
        preco: plan.preco ?? 0,
        relatorios_incluidos: plan.relatorios_incluidos ?? 0
      })) || [];

      setPlans(normalizedData);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const fetchLandingContent = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_content')
        .select('*');

      if (error) throw error;

      const contentMap: Record<string, any> = {};
      data?.forEach((item: any) => {
        contentMap[item.section] = item;
      });
      setLandingContent(contentMap);
    } catch (error) {
      console.error('Error fetching landing content:', error);
    }
  };

  const handleUpdatePlan = async (planId: string, updates: Partial<Plan>) => {
    setLoading(true);
    console.log('🔍 handleUpdatePlan called with:', { planId, updates });

    try {
      // Find the current plan to get existing values
      const currentPlan = plans.find(p => p.id === planId);
      if (!currentPlan) {
        toast.error('Plano não encontrado');
        setLoading(false);
        return;
      }

      console.log('📋 Current plan:', currentPlan);

      // Merge updates with current values for validation
      const dataToValidate = {
        nome: updates.nome ?? currentPlan.nome,
        preco: updates.preco ?? currentPlan.preco,
        relatorios_incluidos: updates.relatorios_incluidos ?? currentPlan.relatorios_incluidos,
        descricao: updates.descricao !== undefined ? updates.descricao : currentPlan.descricao,
      };

      console.log('✅ Data to validate:', dataToValidate);

      // Validate the complete data
      const validationResult = PlanUpdateSchema.safeParse(dataToValidate);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        console.error('❌ Validation failed:', validationResult.error);
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      console.log('✅ Validation passed, updating database...');

      // Update with validated data (use dataToValidate, not updates!)
      const { data: updatedData, error } = await supabase
        .from('plans')
        .update(dataToValidate)
        .eq('id', planId)
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Database updated successfully:', updatedData);

      await logAction('update_plan', { planId, updates });
      toast.success('Plano atualizado com sucesso!');

      console.log('🔄 Fetching plans...');
      await fetchPlans();
      console.log('✅ Plans fetched');
    } catch (error) {
      console.error('❌ Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      await logAction('delete_plan', { planId });
      toast.success('Plano removido com sucesso!');
      setDeletingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao remover plano');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLandingContent = async (section: string, field: string, value: string) => {
    setLoading(true);
    try {
      // Validate input
      const validationResult = ContentUpdateSchema.safeParse({ value });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const validatedValue = validationResult.data.value;
      const content = landingContent[section];

      if (content) {
        const { error } = await supabase
          .from('landing_content')
          .update({ [field]: validatedValue })
          .eq('section', section);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('landing_content')
          .insert({ section, [field]: validatedValue });

        if (error) throw error;
      }

      await logAction('update_landing_content', { section, field });
      toast.success('Conteúdo atualizado com sucesso!');
      fetchLandingContent();
    } catch (error) {
      console.error('Error updating landing content:', error);
      toast.error('Erro ao atualizar conteúdo');
    } finally {
      setLoading(false);
    }
  };



  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CMS Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de assinatura
          </p>
        </div>

        <div className="space-y-8">
          {/* Single Credit Management Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Gestão de Crédito Avulso</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure o preço base para compra de relatórios avulsos</p>
              </div>
            </div>

            {plans.find(p => p.tipo === 'avulso') ? (
              <div className="max-w-sm">
                {plans.filter(p => p.tipo === 'avulso').map(plan => (
                  <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-all">
                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Input
                            value={plan.nome}
                            onChange={(e) =>
                              setPlans(plans.map(p =>
                                p.id === plan.id ? { ...p, nome: e.target.value } : p
                              ))
                            }
                            className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Nome do Plano"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            id={`active-${plan.id}`}
                            checked={plan.ativo}
                            onCheckedChange={async (checked) => {
                              await handleUpdatePlan(plan.id, { ativo: checked as boolean });
                            }}
                          />
                          <Label
                            htmlFor={`active-${plan.id}`}
                            className={`text-xs px-2 py-1 rounded-full cursor-pointer ${plan.ativo
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {plan.ativo ? 'Ativo' : 'Inativo'}
                          </Label>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={plan.preco}
                            onChange={(e) =>
                              setPlans(plans.map(p =>
                                p.id === plan.id ? { ...p, preco: parseFloat(e.target.value) || 0 } : p
                              ))
                            }
                            className="text-3xl font-bold border-0 px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>

                      {/* Reports Count */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Relatórios incluídos</span>
                          <Input
                            type="number"
                            min="1"
                            value={plan.relatorios_incluidos}
                            onChange={(e) =>
                              setPlans(plans.map(p =>
                                p.id === plan.id ? { ...p, relatorios_incluidos: parseInt(e.target.value) || 1 } : p
                              ))
                            }
                            className="w-20 h-8 text-right font-medium"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tipo: {plan.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <Textarea
                          value={plan.descricao || ''}
                          onChange={(e) =>
                            setPlans(plans.map(p =>
                              p.id === plan.id ? { ...p, descricao: e.target.value } : p
                            ))
                          }
                          placeholder="Descrição do plano..."
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 space-y-2">
                      <Button
                        onClick={async () => {
                          await handleUpdatePlan(plan.id, {
                            nome: plan.nome,
                            preco: plan.preco,
                            relatorios_incluidos: plan.relatorios_incluidos,
                            descricao: plan.descricao,
                          });
                        }}
                        disabled={loading}
                        className="w-full"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setDeletingPlan(plan.id)}
                        disabled={loading}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 max-w-sm">
                <div className="p-3 rounded-full bg-muted">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Configuração não encontrada</h3>
                  <p className="text-muted-foreground">O plano de crédito avulso ainda não foi inicializado.</p>
                </div>
                <Button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await supabase.from('plans').insert({
                        nome: 'Crédito Avulso',
                        tipo: 'avulso',
                        preco: 34.99,
                        relatorios_incluidos: 1,
                        descricao: 'Crédito para 1 relatório avulso',
                        ativo: true
                      });
                      if (error) throw error;
                      toast.success('Configuração inicializada!');
                      await fetchPlans();
                    } catch (e) {
                      console.error(e);
                      toast.error('Erro ao inicializar');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Inicializar Crédito Avulso
                </Button>
              </Card>
            )}
          </div>

          {/* Subscription Plans Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
                <p className="text-sm text-muted-foreground mt-1">Gerencie os planos de assinatura disponíveis</p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Plano
              </Button>
            </div>

            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.filter(p => p.tipo !== 'avulso').map((plan) => (
                <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-all">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Input
                          value={plan.nome}
                          onChange={(e) =>
                            setPlans(plans.map(p =>
                              p.id === plan.id ? { ...p, nome: e.target.value } : p
                            ))
                          }
                          className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Nome do Plano"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          id={`active-${plan.id}`}
                          checked={plan.ativo}
                          onCheckedChange={async (checked) => {
                            await handleUpdatePlan(plan.id, { ativo: checked as boolean });
                          }}
                        />
                        <Label
                          htmlFor={`active-${plan.id}`}
                          className={`text-xs px-2 py-1 rounded-full cursor-pointer ${plan.ativo
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {plan.ativo ? 'Ativo' : 'Inativo'}
                        </Label>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={plan.preco}
                          onChange={(e) =>
                            setPlans(plans.map(p =>
                              p.id === plan.id ? { ...p, preco: parseFloat(e.target.value) || 0 } : p
                            ))
                          }
                          className="text-3xl font-bold border-0 px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>

                    {/* Reports Count */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Relatórios incluídos</span>
                        <Input
                          type="number"
                          min="1"
                          value={plan.relatorios_incluidos}
                          onChange={(e) =>
                            setPlans(plans.map(p =>
                              p.id === plan.id ? { ...p, relatorios_incluidos: parseInt(e.target.value) || 1 } : p
                            ))
                          }
                          className="w-20 h-8 text-right font-medium"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tipo: {plan.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <Textarea
                        value={plan.descricao || ''}
                        onChange={(e) =>
                          setPlans(plans.map(p =>
                            p.id === plan.id ? { ...p, descricao: e.target.value } : p
                          ))
                        }
                        placeholder="Descrição do plano..."
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 space-y-2">
                    <Button
                      onClick={async () => {
                        await handleUpdatePlan(plan.id, {
                          nome: plan.nome,
                          preco: plan.preco,
                          relatorios_incluidos: plan.relatorios_incluidos,
                          descricao: plan.descricao,
                        });
                      }}
                      disabled={loading}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeletingPlan(plan.id)}
                      disabled={loading}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreatePlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchPlans}
      />

      {editingBenefits && (
        <EditBenefitsDialog
          open={!!editingBenefits}
          onOpenChange={(open) => !open && setEditingBenefits(null)}
          planId={editingBenefits.planId}
          planName={editingBenefits.planName}
          currentBenefits={editingBenefits.benefits}
          onSuccess={fetchPlans}
        />
      )}

      {/* Delete Plan Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este plano? Esta ação não pode ser desfeita.
              Usuários com este plano ativo precisarão ser migrados para outro plano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPlan && handleDeletePlan(deletingPlan)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCMS;