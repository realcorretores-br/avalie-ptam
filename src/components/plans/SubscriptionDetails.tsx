import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentHistory {
    id: string;
    created_at: string;
    status: string;
    preco_total?: number;
    plans?: {
        nome: string;
        preco: number;
    };
    pdf_url?: string; // Hypothetical PDF URL
}

export function SubscriptionDetails() {
    const { user } = useAuth();
    const { subscription } = useSubscription();
    const [payments, setPayments] = useState<PaymentHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPaymentHistory = useCallback(async () => {
        if (!user) return;
        try {
            // Reusing logic from Perfil.tsx roughly
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                  id,
                  created_at,
                  status,
                  plans ( nome, preco )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                setPayments(data as any);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPaymentHistory();
    }, [fetchPaymentHistory]);

    if (!user) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-50 border-green-200';
            case 'approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'expired': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Pacote</h2>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Billing Info Card */}
                <Card className="bg-white shadow-sm border-gray-200">
                    <CardHeader className="pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-base font-semibold text-gray-700">Resumo da Conta</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Pacote Atual</span>
                            <span className="font-semibold text-gray-900">
                                {subscription?.plans?.nome || "Nenhum Pacote Ativo"}
                            </span>
                        </div>

                        {subscription?.status === 'active' && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Validade dos Créditos</span>
                                <span className="font-semibold text-gray-900">
                                    {subscription.data_expiracao
                                        ? format(new Date(subscription.data_expiracao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                        : 'Vitalício'
                                    }
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Método de Pagamento</span>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span>MercadoPago</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-gray-500">Status</span>
                            {subscription ? (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${getStatusColor(subscription.status)}`}>
                                    {subscription.status === 'active' ? 'Ativo' : subscription.status}
                                </span>
                            ) : (
                                <span className="text-xs font-bold px-2 py-0.5 rounded uppercase border text-gray-500 bg-gray-50">Inativo</span>
                            )}
                        </div>

                        <Button
                            className="w-full mt-2"
                            onClick={() => window.location.href = '/dashboard/planos'}
                        >
                            Comprar Mais Créditos
                        </Button>
                    </CardContent>
                </Card>

                {/* Invoice History Card */}
                <Card className="bg-white shadow-sm border-gray-200">
                    <CardHeader className="pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-base font-semibold text-gray-700">Histórico de Faturas</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {loading ? (
                            <div className="py-8 text-center text-gray-400">Carregando...</div>
                        ) : payments.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">Nenhuma fatura encontrada.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                <div className="grid grid-cols-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <span>Data</span>
                                    <span>Valor</span>
                                    <span className="text-center">Status</span>
                                    <span className="text-right">PDF</span>
                                </div>
                                {payments.map((payment) => (
                                    <div key={payment.id} className="grid grid-cols-4 py-4 items-center text-sm">
                                        <span className="text-gray-700">
                                            {format(new Date(payment.created_at), "dd MMM yyyy", { locale: ptBR })}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            R$ {payment.plans?.preco?.toFixed(2) || '0.00'}
                                        </span>
                                        <div className="flex justify-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(payment.status)}`}>
                                                {payment.status === 'approved' ? 'Pago' : payment.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" disabled title="Download indisponível">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-100 mt-2">
                            <Button variant="outline" className="w-full" onClick={() => { }}>
                                Ver Todas as Faturas
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
