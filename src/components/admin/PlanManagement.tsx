import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, Trash2, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Switch } from "@/components/ui/switch";
import { CreatePlanDialog } from "@/components/admin/CreatePlanDialog";
import { EditBenefitsDialog } from "@/components/admin/EditBenefitsDialog";
import { z } from "zod";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface Plan {
    id: string;
    nome: string;
    tipo: 'avulso' | 'mensal_basico' | 'mensal_pro' | 'personalizado';
    preco: number;
    relatorios_incluidos: number;
    descricao: string;
    ativo: boolean;
    beneficios?: string[];
    position?: number;
}

const PlanUpdateSchema = z.object({
    nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
    preco: z.number().positive("Preço deve ser maior que zero").max(999999, "Preço deve ser menor que 1.000.000"),
    relatorios_incluidos: z.number().int("Relatórios deve ser um número inteiro").positive("Relatórios deve ser maior que zero").max(10000, "Relatórios deve ser menor que 10.000"),
    descricao: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    beneficios: z.array(z.string()).optional(),
});

// Sortable Card Component
const SortablePlanCard = ({
    plan,
    plans,
    setPlans,
    handleUpdatePlan,
    setDeletingPlan,
    loading
}: {
    plan: Plan;
    plans: Plan[];
    setPlans: (plans: Plan[]) => void;
    handleUpdatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;
    setDeletingPlan: (id: string) => void;
    loading: boolean;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: plan.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const handleBenefitChange = (index: number, value: string) => {
        const updatedBeneficios = [...(plan.beneficios || [])];
        updatedBeneficios[index] = value;
        setPlans(plans.map(p => p.id === plan.id ? { ...p, beneficios: updatedBeneficios } : p));
    };

    const currentBenefits = plan.beneficios || [];

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all bg-white ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''}`}
        >
            <div className="p-6 space-y-6">
                {/* Header: Name + Drag Handle + Toggle */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                        <div
                            {...attributes}
                            {...listeners}
                            className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>

                        <div className="space-y-1 flex-1">
                            <Input
                                value={plan.nome}
                                onChange={(e) =>
                                    setPlans(plans.map(p =>
                                        p.id === plan.id ? { ...p, nome: e.target.value } : p
                                    ))
                                }
                                className="font-bold text-lg border-transparent px-0 hover:border-input focus:border-input h-auto p-0 text-slate-900"
                                placeholder="Nome do Pacote"
                            />
                            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${plan.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${plan.ativo ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`} />
                                {plan.ativo ? 'Ativo' : 'Inativo'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center pl-2">
                        <Switch
                            checked={plan.ativo}
                            onCheckedChange={async (checked) => {
                                await handleUpdatePlan(plan.id, { ativo: checked });
                            }}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Valor (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={plan.preco}
                                onChange={(e) =>
                                    setPlans(plans.map(p =>
                                        p.id === plan.id ? { ...p, preco: e.target.value as any } : p
                                    ))
                                }
                                onBlur={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setPlans(plans.map(p =>
                                        p.id === plan.id ? { ...p, preco: isNaN(val) ? 0 : val } : p
                                    ))
                                }}
                                className="bg-slate-50 border-slate-200 h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Qtd. Relatórios</Label>
                            <Input
                                type="number"
                                value={plan.relatorios_incluidos}
                                onChange={(e) =>
                                    setPlans(plans.map(p =>
                                        p.id === plan.id ? { ...p, relatorios_incluidos: parseInt(e.target.value) || 0 } : p
                                    ))
                                }
                                className="bg-slate-50 border-slate-200 h-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Descrição dos Benefícios</Label>

                        <div className="border rounded-md bg-slate-50 p-2 space-y-2">
                            {/* Benefits List Editor */}
                            <ScrollArea className="h-[120px] pr-2">
                                <div className="space-y-2">
                                    {currentBenefits.map((benefit, index) => (
                                        <div key={index} className="flex gap-2 items-center group">
                                            <Input
                                                value={benefit}
                                                onChange={(e) => handleBenefitChange(index, e.target.value)}
                                                className="h-8 bg-white text-sm"
                                                placeholder={`Benefício ${index + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const newBenefits = currentBenefits.filter((_, i) => i !== index);
                                                    setPlans(plans.map(p => p.id === plan.id ? { ...p, beneficios: newBenefits } : p));
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {currentBenefits.length === 0 && (
                                        <p className="text-xs text-center text-slate-400 py-4 italic">Nenhum benefício listado.</p>
                                    )}
                                </div>
                            </ScrollArea>

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                                onClick={() => {
                                    setPlans(plans.map(p => p.id === plan.id ? { ...p, beneficios: [...currentBenefits, ""] } : p));
                                }}
                            >
                                <Plus className="w-3 h-3 mr-1" /> Adicionar Benefício
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Subtítulo (Opcional)</Label>
                        <Input
                            value={plan.descricao}
                            onChange={(e) =>
                                setPlans(plans.map(p =>
                                    p.id === plan.id ? { ...p, descricao: e.target.value } : p
                                ))
                            }
                            className="bg-slate-50 border-slate-200 h-9 text-sm"
                            placeholder="Ex: Ideal para iniciantes"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10"
                        onClick={async () => {
                            // Filter out empty benefits before saving
                            const cleanBenefits = (plan.beneficios || [])
                                .map(b => b.trim())
                                .filter(b => b.length > 0);

                            await handleUpdatePlan(plan.id, {
                                nome: plan.nome,
                                preco: plan.preco,
                                relatorios_incluidos: plan.relatorios_incluidos,
                                descricao: plan.descricao,
                                beneficios: cleanBenefits
                            });
                        }}
                        disabled={loading}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-sm"
                        onClick={() => setDeletingPlan(plan.id)}
                        disabled={loading}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Remover
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export const PlanManagement = () => {
    const { logAction } = useAdminLog();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
    const [editingBenefits, setEditingBenefits] = useState<{ planId: string; planName: string; benefits: string[] } | null>(null);

    const hasFetched = useRef(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!hasFetched.current) {
            fetchPlans();
            hasFetched.current = true;
        }
    }, []);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .order('position', { ascending: true })
                .order('preco', { ascending: true });

            if (error) throw error;

            // Normalize
            const normalizedData = (data as any[])?.map(plan => ({
                ...plan,
                descricao: plan.descricao ?? '',
                beneficios: Array.isArray(plan.beneficios) ? plan.beneficios : [],
                preco: plan.preco ?? 0,
                relatorios_incluidos: plan.relatorios_incluidos ?? 0,
                position: plan.position ?? 0
            })) || [];

            setPlans(normalizedData);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Erro ao carregar planos');
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPlans((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update positions in DB
                // We do this asynchronously to not block UI
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    position: index,
                }));

                (async () => {
                    for (const update of updates) {
                        await supabase.from('plans').update({ position: update.position } as any).eq('id', update.id);
                    }
                })();

                return newItems;
            });
        }
    };

    const handleUpdatePlan = async (planId: string, updates: Partial<Plan>) => {
        setLoading(true);
        try {
            // Find current plan
            const currentPlan = plans.find(p => p.id === planId);
            if (!currentPlan) {
                toast.error('Plano não encontrado');
                setLoading(false);
                return;
            }

            const dataToValidate = {
                nome: updates.nome ?? currentPlan.nome,
                preco: updates.preco ?? currentPlan.preco,
                relatorios_incluidos: updates.relatorios_incluidos ?? currentPlan.relatorios_incluidos,
                descricao: updates.descricao !== undefined ? updates.descricao : currentPlan.descricao,
                beneficios: updates.beneficios ?? currentPlan.beneficios,
            };

            const validationResult = PlanUpdateSchema.safeParse(dataToValidate);

            if (!validationResult.success) {
                toast.error(validationResult.error.errors[0].message);
                setLoading(false);
                return;
            }

            // If updating 'ativo', include it
            const finalUpdates: any = { ...dataToValidate };
            if (updates.ativo !== undefined) finalUpdates.ativo = updates.ativo;

            const { error } = await supabase
                .from('plans')
                .update(finalUpdates)
                .eq('id', planId);

            if (error) throw error;

            await logAction('update_plan', { planId, updates });
            toast.success(updates.ativo !== undefined
                ? `Plano ${updates.ativo ? 'ativado' : 'desativado'} com sucesso!`
                : 'Plano atualizado com sucesso!'
            );

            // Optimiztic update already done via state in inputs, but refresh is good to sync
            await fetchPlans();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao atualizar plano');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        setLoading(true);
        try {
            const { count, error: countError } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_id', planId);
            if (countError) throw countError;
            if (count && count > 0) {
                const { error: subDeleteError } = await supabase.from('subscriptions').delete().eq('plan_id', planId);
                if (subDeleteError) throw new Error('Falha ao remover assinaturas vinculadas.');
            }
            const { error } = await supabase.from('plans').delete().eq('id', planId);
            if (error) throw error;
            await logAction('delete_plan', { planId });
            toast.success('Plano removido com sucesso!');
            setDeletingPlan(null);
            fetchPlans();
        } catch (error: any) {
            console.error('Error deleting plan:', error);
            toast.error(error.message || 'Erro ao remover plano');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Main Plans Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Gestão de Crédito Avulso</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Arraste para reordenar os pacotes. Use o controle para ativar/desativar.
                        </p>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={plans.map(p => p.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {plans.map((plan) => (
                                <SortablePlanCard
                                    key={plan.id}
                                    plan={plan}
                                    plans={plans}
                                    setPlans={setPlans}
                                    handleUpdatePlan={handleUpdatePlan}
                                    setDeletingPlan={setDeletingPlan}
                                    loading={loading}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </section>

            {/* Bottom Section: Additional Packages */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Pacotes de Créditos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Gerencie os pacotes disponíveis para compra avulsa.</p>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                        <Plus className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 text-lg">Nenhum pacote adicional configurado</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Adicione pacotes de créditos extras para que seus usuários possam expandir seus limites sem trocar de plano.
                        </p>
                    </div>
                    <div className="pt-4 flex items-center gap-4">
                        <Button variant="link" className="text-blue-600 font-medium">
                            Configurar agora &rarr;
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-full px-6"
                            onClick={() => setShowCreateDialog(true)}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Criar Novo Plano
                        </Button>
                    </div>
                </div>
            </section>

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
        </div>
    );
};
