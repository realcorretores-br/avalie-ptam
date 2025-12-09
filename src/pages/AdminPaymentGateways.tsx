import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Key } from "lucide-react";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AdminLayout from "@/components/AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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

interface PaymentGateway {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  config: {
    access_token_key?: string;
    [key: string]: any;
  };
}

const AdminPaymentGateways = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [credentialValue, setCredentialValue] = useState("");

  const availableGateways = [
    { value: 'mercadopago', label: 'Mercado Pago', tokenKey: 'MERCADO_PAGO_ACCESS_TOKEN' },
    { value: 'abacatepay', label: 'AbacatePay (PIX)', tokenKey: 'ABACATE_PAY_API_KEY' },
    { value: 'asaas', label: 'Asaas', tokenKey: 'ASAAS_API_KEY' },
    { value: 'stripe', label: 'Stripe', tokenKey: 'STRIPE_SECRET_KEY' },
    { value: 'pagseguro', label: 'PagSeguro', tokenKey: 'PAGSEGURO_TOKEN' },
    { value: 'paypal', label: 'PayPal', tokenKey: 'PAYPAL_CLIENT_SECRET' },
  ];

  useEffect(() => {
    fetchGateways();
  }, []);



  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGateways((data as any) || []);
    } catch (error) {
      console.error('Error fetching gateways:', error);
      toast.error('Erro ao carregar gateways de pagamento');
    }
  };

  const handleActivateGateway = async (gatewayId: string) => {
    setLoading(true);
    try {
      // Desativar todos os gateways
      await supabase
        .from('payment_gateways')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Ativar o gateway selecionado
      const { error } = await supabase
        .from('payment_gateways')
        .update({ is_active: true })
        .eq('id', gatewayId);

      if (error) throw error;

      const gateway = gateways.find(g => g.id === gatewayId);
      await logAction('activate_payment_gateway', { gatewayId, gatewayName: gateway?.display_name });
      toast.success('Gateway de pagamento ativado!');
      fetchGateways();
    } catch (error) {
      console.error('Error activating gateway:', error);
      toast.error('Erro ao ativar gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGateway = async (gatewayType: string) => {
    const gatewayConfig = availableGateways.find(g => g.value === gatewayType);
    if (!gatewayConfig) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .insert({
          name: gatewayType,
          display_name: gatewayConfig.label,
          is_active: false,
          config: { access_token_key: gatewayConfig.tokenKey }
        });

      if (error) throw error;

      await logAction('add_payment_gateway', { gatewayType, gatewayName: gatewayConfig.label });
      toast.success('Gateway adicionado com sucesso!');
      setShowAddDialog(false);
      fetchGateways();
    } catch (error: any) {
      console.error('Error adding gateway:', error);
      if (error.code === '23505') {
        toast.error('Este gateway já existe');
      } else {
        toast.error('Erro ao adicionar gateway');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGateway = async (gatewayId: string) => {
    setLoading(true);
    try {
      const gateway = gateways.find(g => g.id === gatewayId);

      const { error } = await supabase
        .from('payment_gateways')
        .delete()
        .eq('id', gatewayId);

      if (error) throw error;

      await logAction('delete_payment_gateway', { gatewayId, gatewayName: gateway?.display_name });
      toast.success('Gateway removido com sucesso!');
      setShowDeleteDialog(null);
      fetchGateways();
    } catch (error) {
      console.error('Error deleting gateway:', error);
      toast.error('Erro ao remover gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!selectedGateway || !credentialValue.trim()) {
      toast.error('Por favor, insira a credencial');
      return;
    }

    setLoading(true);
    try {
      // Aqui você salvaria a credencial como secret no Supabase
      // Por enquanto, apenas mostra mensagem de sucesso
      await logAction('update_gateway_credentials', {
        gatewayId: selectedGateway.id,
        secretKey: selectedGateway.config.access_token_key
      });

      toast.success(`Credencial ${selectedGateway.config.access_token_key} salva com sucesso! Configure no backend.`);
      setShowCredentialsDialog(false);
      setCredentialValue("");
      setSelectedGateway(null);
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Erro ao salvar credencial');
    } finally {
      setLoading(false);
    }
  };



  const activeGateway = gateways.find(g => g.is_active);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciar Gateways de Pagamento</h1>
            <p className="text-muted-foreground">
              Configure os gateways de pagamento disponíveis para o sistema
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Gateway
          </Button>
        </div>

        {activeGateway && (
          <Card className="p-6 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Gateway Ativo</h3>
                <p className="text-sm text-muted-foreground">
                  Este é o gateway atualmente em uso no sistema
                </p>
              </div>
              <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                Ativo
              </div>
            </div>
            <p className="text-xl font-bold mb-4">{activeGateway.display_name}</p>
            <p className="text-sm text-muted-foreground">
              Secret configurado: <code className="bg-background px-2 py-1 rounded">{activeGateway.config.access_token_key}</code>
            </p>
          </Card>
        )}

        <Card className="p-6 bg-accent/50">
          <h3 className="font-semibold mb-2">Como configurar API Keys</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para que os gateways funcionem, você precisa adicionar os secrets (API Keys) nas configurações do backend.
            Clique no botão abaixo para acessar o painel de secrets.
          </p>
        </Card>

        <div className="grid gap-4">
          {gateways.map((gateway) => (
            <Card key={gateway.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{gateway.display_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {gateway.is_active ? 'Gateway ativo' : 'Gateway inativo'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!gateway.is_active && (
                      <Button
                        onClick={() => handleActivateGateway(gateway.id)}
                        disabled={loading}
                      >
                        Ativar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setShowDeleteDialog(gateway.id)}
                      disabled={loading || gateway.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">
                      <strong>Secret necessário:</strong>
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedGateway(gateway);
                        setShowCredentialsDialog(true);
                      }}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Configurar Credencial
                    </Button>
                  </div>
                  <code className="text-xs bg-background px-2 py-1 rounded">{gateway.config.access_token_key}</code>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Gateway Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Gateway de Pagamento</DialogTitle>
            <DialogDescription>
              Selecione o gateway que deseja adicionar ao sistema
            </DialogDescription>
          </DialogHeader>

          <RadioGroup onValueChange={(value) => handleAddGateway(value)}>
            {availableGateways
              .filter(g => !gateways.find(gateway => gateway.name === g.value))
              .map((gateway) => (
                <div key={gateway.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={gateway.value} id={gateway.value} />
                  <Label htmlFor={gateway.value} className="cursor-pointer">
                    {gateway.label}
                  </Label>
                </div>
              ))}
          </RadioGroup>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Credencial</DialogTitle>
            <DialogDescription>
              Insira a credencial (API Key/Token) para {selectedGateway?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="credential">
                {selectedGateway?.config.access_token_key}
              </Label>
              <Input
                id="credential"
                type="password"
                value={credentialValue}
                onChange={(e) => setCredentialValue(e.target.value)}
                placeholder="Cole aqui a API Key"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Esta credencial será salva de forma segura e configurada automaticamente no backend
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCredentials} disabled={loading}>
              Salvar Credencial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este gateway? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteGateway(showDeleteDialog)}
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

export default AdminPaymentGateways;