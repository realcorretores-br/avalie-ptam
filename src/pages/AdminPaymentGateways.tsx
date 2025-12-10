import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, RefreshCw, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentGateway {
    id: string;
    name: string;
    is_active: boolean;
    config: {
        public_key?: string;
        access_token?: string;
        client_id?: string;
        client_secret?: string;
        [key: string]: any;
    };
}

const AdminPaymentGateways = () => {
    const [gateways, setGateways] = useState<PaymentGateway[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchGateways();
    }, []);

    const fetchGateways = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_gateways')
                .select('*')
                .order('name');

            if (error) throw error;
            setGateways(data || []);
        } catch (error) {
            console.error('Error fetching gateways:', error);
            toast.error('Erro ao carregar gateways de pagamento');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGateway = async (gatewayIndex: number, field: string, value: any) => {
        const updatedGateways = [...gateways];
        if (field === 'is_active') {
            // Enforce single active gateway logic if needed, or allow multiple.
            // For simplicity, let's allow toggling, but current logic often assumes one active.
            // Let's just update the local state field.
            updatedGateways[gatewayIndex].is_active = value;
        } else {
            updatedGateways[gatewayIndex].config = {
                ...updatedGateways[gatewayIndex].config,
                [field]: value
            };
        }
        setGateways(updatedGateways);
    };

    const handleSave = async (gateway: PaymentGateway) => {
        setSaving(true);
        try {
            // If enabling this gateway, disable others? 
            // Or leave that to manual control. Let's just save.

            const { error } = await supabase
                .from('payment_gateways')
                .update({
                    is_active: gateway.is_active,
                    config: gateway.config,
                    updated_at: new Date().toISOString()
                })
                .eq('id', gateway.id);

            if (error) throw error;
            toast.success(`Configurações de ${gateway.name} salvas com sucesso!`);
        } catch (error) {
            console.error('Error saving gateway:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gateways de Pagamento</h2>
                    <p className="text-muted-foreground">
                        Gerencie as integrações de pagamento do sistema.
                    </p>
                </div>

                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                        Certifique-se de que as credenciais estão corretas antes de ativar um gateway.
                        Credenciais inválidas impedirão que os usuários realizem pagamentos.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                    {gateways.map((gateway, index) => (
                        <Card key={gateway.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="capitalize">{gateway.name}</CardTitle>
                                    <CardDescription>
                                        {gateway.is_active ? 'Gateway Ativo' : 'Gateway Inativo'}
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={gateway.is_active}
                                    onCheckedChange={(checked) => handleUpdateGateway(index, 'is_active', checked)}
                                />
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {gateway.name === 'mercadopago' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Public Key</Label>
                                            <Input
                                                value={gateway.config.public_key || ''}
                                                onChange={(e) => handleUpdateGateway(index, 'public_key', e.target.value)}
                                                type="text"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Access Token</Label>
                                            <Input
                                                value={gateway.config.access_token || ''}
                                                onChange={(e) => handleUpdateGateway(index, 'access_token', e.target.value)}
                                                type="password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Client ID</Label>
                                            <Input
                                                value={gateway.config.client_id || ''}
                                                onChange={(e) => handleUpdateGateway(index, 'client_id', e.target.value)}
                                                type="text"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Client Secret</Label>
                                            <Input
                                                value={gateway.config.client_secret || ''}
                                                onChange={(e) => handleUpdateGateway(index, 'client_secret', e.target.value)}
                                                type="password"
                                            />
                                        </div>
                                    </>
                                )}
                                {/* Fallback for other gateways if added later */}
                                {gateway.name !== 'mercadopago' && (
                                    <div className="p-4 bg-muted rounded-md text-sm text-center">
                                        Configurações específicas para este gateway ainda não implementadas na UI. Indique json direto no banco se necessário.
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={() => handleSave(gateway)} disabled={saving} className="gap-2">
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <Save className="h-4 w-4" />
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {gateways.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum gateway encontrado. Verifique se as migrações foram rodadas.
                            <Button variant="link" onClick={fetchGateways} className="gap-2 mt-2">
                                <RefreshCw className="h-4 w-4" />
                                Tentar Novamente
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPaymentGateways;
