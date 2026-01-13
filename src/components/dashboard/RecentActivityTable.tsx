import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Download, Trash2, FileText, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
import { exportToPDF } from "@/lib/exportUtils";
import { PTAMPreview } from "@/components/PTAMPreview";
import { PTAMData } from "@/types/ptam";

interface Activity {
    id: string;
    endereco_imovel: string;
    tipo_imovel: string;
    created_at: string;
    status: string;
    form_data: any;
    valor_final?: number;
    finalidade?: string;
}

export function RecentActivityTable() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchActivities = async () => {
            const { data } = await supabase
                .from('avaliacoes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(6); // Limit to 6 for a nice grid

            if (data) {
                setActivities(data);
            }
            setLoading(false);
        };

        fetchActivities();
    }, [user]);

    const handleExport = async (activity: Activity) => {
        try {
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 210mm; opacity: 0; pointer-events: none; z-index: -1000; background: #ffffff;';
            document.body.appendChild(tempContainer);

            const root = document.createElement('div');
            root.id = 'temp-preview-' + Date.now();
            tempContainer.appendChild(root);

            const { createRoot } = await import('react-dom/client');
            const reactRoot = createRoot(root);

            await new Promise<void>((resolve) => {
                reactRoot.render(<PTAMPreview data={activity.form_data as unknown as PTAMData} />);
                setTimeout(resolve, 1200);
            });

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
                        img.style.visibility = 'hidden';
                    }
                })
            );

            toast.loading('Gerando PDF...');
            await exportToPDF([root as HTMLElement], `relatorio_${activity.id}.pdf`);

            reactRoot.unmount();
            document.body.removeChild(tempContainer);

            toast.dismiss();
            toast.success('PDF baixado com sucesso!');
        } catch (error) {
            toast.dismiss();
            toast.error('Erro ao gerar PDF.');
            console.error(error);
        }
    };

    const handleDeleteClick = (id: string) => {
        setActivityToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!activityToDelete) return;
        try {
            const { error } = await supabase
                .from('avaliacoes')
                .delete()
                .eq('id', activityToDelete);

            if (error) throw error;

            setActivities(activities.filter(a => a.id !== activityToDelete));
            toast.success('Avaliação excluída com sucesso!');
        } catch (error) {
            toast.error('Erro ao excluir avaliação');
        } finally {
            setDeleteDialogOpen(false);
            setActivityToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 h-[250px]"><Skeleton className="h-full w-full" /></Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Atividades Recentes</h2>
                    <p className="text-sm text-gray-500">Seus últimos relatórios e rascunhos</p>
                </div>
                <Button
                    variant="ghost"
                    className="gap-2 text-primary hover:text-primary/90"
                    onClick={() => navigate('/dashboard/avaliacoes')}
                >
                    Ver Todas <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            {activities.length === 0 ? (
                <Card className="p-12 text-center bg-gray-50/50 border-dashed">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade recente</h3>
                    <p className="text-gray-500 mb-6">Comece criando sua primeira avaliação de imóvel.</p>
                    <Button onClick={() => navigate('/dashboard/nova-avaliacao')}>Criar Nova Avaliação</Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activities.map((avaliacao) => (
                        <Card key={avaliacao.id} className="p-6 hover:shadow-lg transition-shadow relative group bg-white">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteClick(avaliacao.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1 pr-8 line-clamp-1" title={avaliacao.endereco_imovel}>
                                        {avaliacao.endereco_imovel || 'Endereço não informado'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {avaliacao.tipo_imovel || 'Tipo não informado'}
                                    </p>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-600">
                                        <span className="font-medium text-gray-900">Finalidade:</span>{' '}
                                        {avaliacao.finalidade || 'Não informada'}
                                    </p>
                                    {avaliacao.valor_final && (
                                        <p className="text-gray-600">
                                            <span className="font-medium text-gray-900">Valor:</span>{' '}
                                            R$ {avaliacao.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 pt-1">
                                        <Badge variant={avaliacao.status === 'finalizado' ? 'default' : 'secondary'} className={avaliacao.status === 'finalizado' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                            {avaliacao.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {avaliacao.status === 'rascunho' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigate('/dashboard/nova-avaliacao', {
                                                state: { editData: avaliacao.form_data, avaliacaoId: avaliacao.id }
                                            })}
                                            className="flex-1 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-2" />
                                            Continuar
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate(`/dashboard/avaliacoes/${avaliacao.id}`)}
                                                className="flex-1"
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-2" />
                                                Ver
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleExport(avaliacao)}
                                                className="flex-1"
                                            >
                                                <Download className="h-3.5 w-3.5 mr-2" />
                                                PDF
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

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
}
