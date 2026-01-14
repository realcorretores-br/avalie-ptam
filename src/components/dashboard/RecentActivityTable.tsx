import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

    useEffect(() => {
        if (!user) return;

        const fetchActivities = async () => {
            const { data } = await supabase
                .from('avaliacoes')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'finalizado')
                .order('created_at', { ascending: false })
                .limit(3);

            if (data) {
                setActivities(data);
            }
            setLoading(false);
        };

        fetchActivities();
    }, [user]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Atividades Recentes</h2>
                    <p className="text-sm text-slate-500 mt-1">Seus últimos parecers emitidos.</p>
                </div>
                <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                    onClick={() => navigate('/dashboard/avaliacoes')}
                >
                    Ver todos os registros
                </Button>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma avaliação concluída</h3>
                    <p className="text-slate-500 mb-6">Suas avaliações finalizadas aparecerão aqui.</p>
                    <Button onClick={() => navigate('/dashboard/nova-avaliacao')} className="bg-blue-600 hover:bg-blue-700">
                        Criar Nova Avaliação
                    </Button>
                </div>
            ) : (
                <div className="w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-8 md:col-span-6">Cliente / Imóvel</div>
                        <div className="col-span-4 md:col-span-3">Data</div>
                        <div className="col-span-4 md:col-span-3 hidden md:block">Status</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-50">
                        {activities.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                                onClick={() => navigate('/dashboard/avaliacoes')}
                            >
                                <div className="col-span-8 md:col-span-6">
                                    <h4 className="font-semibold text-slate-900 truncate" title={item.endereco_imovel}>
                                        {item.endereco_imovel || 'Endereço não informado'}
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {item.tipo_imovel || 'N/A'} • {item.finalidade || 'N/A'}
                                    </p>
                                </div>

                                <div className="col-span-4 md:col-span-3 text-sm text-slate-600">
                                    {new Date(item.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>

                                <div className="col-span-4 md:col-span-3 hidden md:flex">
                                    <Badge
                                        variant="secondary"
                                        className={`
                                            uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full
                                            ${item.status === 'finalizado'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }
                                        `}
                                    >
                                        {item.status === 'finalizado' ? 'Concluído' : 'Em Edição'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

