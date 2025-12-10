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

    const initializeMercadoPago = async () => {
        setSaving(true);
        try {
            // First check if it exists (race condition check)
            const { data: existing } = await supabase
                .from('payment_gateways')
                .select('*')
                .eq('name', 'mercadopago')
                .maybeSingle();

            if (existing) {
                toast.info("Configuração já existe. Atualizando lista...");
                await fetchGateways();
                return;
            }

            const { error } = await supabase
                .from('payment_gateways')
                .insert({
                    name: 'mercadopago',
                    display_name: 'Mercado Pago',
                    is_active: true,
                    config: {
                        public_key: 'APP_USR-1a1eaee9-9823-4462-8792-0d46fd19517b',
                        access_token: 'APP_USR-4196436067933490-102406-f5fbb599bd45ccd66aad2fe22e8829dd-287066595',
                        client_id: '4196436067933490',
                        client_secret: 'GwBQ1ZyHhtnRAyiJTy3KFw6FWEqreW7h'
                    }
                });

            if (error) throw error;
            toast.success("Mercado Pago inicializado com sucesso!");

            // Check and ensure 'avulso' plan exists for buttons to appear
            const { data: existingPlan } = await supabase
                .from('plans')
                .select('*')
                .eq('tipo', 'avulso')
                .maybeSingle();

            if (!existingPlan) {
                const { error: planError } = await supabase
                    .from('plans')
                    .insert({
                        tipo: 'avulso',
                        nome: 'Crédito Avulso',
                        descricao: 'Pague apenas pelo que usar',
                        preco: 29.90, // Default price
                        relatorios_incluidos: 1,
                        ativo: true
                    });
                if (planError) {
                    console.error('Error creating default plan:', planError);
                    toast.error('Erro ao criar plano avulso padrão');
                } else {
                    toast.success("Plano 'Avulso' criado com sucesso!");
                }
            }

            await fetchGateways();
        } catch (error) {
            console.error('Error initializing gateway:', error);
            toast.error('Erro ao inicializar configurações');
        } finally {
            setSaving(false);
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
                            Nenhum gateway encontrado.
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <Button variant="outline" onClick={fetchGateways} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Recarregar
                                </Button>
                                <Separator className="w-[100px]" />
                                <Button
                                    onClick={initializeMercadoPago}
                                    disabled={saving}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Inicializar Mercado Pago
                                </Button>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    Se a migração falhou, clique acima para criar a configuração inicial do Mercado Pago no banco de dados.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPaymentGateways;
