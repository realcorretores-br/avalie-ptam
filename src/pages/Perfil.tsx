import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ArrowLeft, User, CreditCard, Bell, Receipt, Upload, Loader2, Coins, Pencil } from "lucide-react";
import { Anotacoes } from "@/components/Anotacoes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddReportsDialog } from "@/components/user/AddReportsDialog";
import { ThemeColorPicker } from "@/components/ThemeColorPicker";
import { useThemeColor } from "@/hooks/useThemeColor";
import { maskCPF, maskRG, maskCNPJ } from "@/lib/masks";
import { useSystemSettings } from "@/hooks/useSystemSettings";

interface PaymentHistory {
  id: string;
  created_at: string;
  status: string;
  data_inicio?: string;
  data_expiracao?: string;
  payment_id?: string;
  plans?: {
    nome: string;
    preco: number;
  };
  type?: 'subscription' | 'additional_reports';
  quantidade?: number;
  preco_total?: number;
}

type Tab = 'perfil' | 'assinatura' | 'pagamentos' | 'anotacoes';

const Perfil = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { subscription, refetch: refetchSubscription } = useSubscription();
  const { settings } = useSystemSettings();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [estrangeiro, setEstrangeiro] = useState(profile?.estrangeiro || false);
  const [tipoAvaliador, setTipoAvaliador] = useState(profile?.tipo_avaliador || "");
  const [logoUrl, setLogoUrl] = useState((profile as any)?.logo_url || "");
  const [autoRenew, setAutoRenew] = useState(true);
  const [updatingAutoRenew, setUpdatingAutoRenew] = useState(false);
  const [showAddReportsDialog, setShowAddReportsDialog] = useState(false);
  const [themeColor, setThemeColor] = useState(profile?.theme_color || "blue");

  useThemeColor();

  const isAvulso = (subscription as any)?.plans?.tipo === 'avulso';
  const canChangeTheme = !isAvulso;

  const [formData, setFormData] = useState({
    cpf: profile?.cpf || '',
    rg: profile?.rg || '',
    telefone: profile?.telefone || '',
    passaporte: profile?.passaporte || '',
    paisOrigem: profile?.pais_origem || '',
    endereco: profile?.endereco || '',
    numero: profile?.numero || '',
    complemento: profile?.complemento || '',
    bairro: profile?.bairro || '',
    cidade: profile?.cidade || '',
    estado: profile?.estado || '',
    cep: profile?.cep || '',
    creci: profile?.creci || '',
    cau: profile?.cau || '',
    crea: profile?.crea || '',
    cnae: profile?.cnae || '',
    cnpj: profile?.cnpj || '',
  });

  useEffect(() => {
    if (profile) {
      setEstrangeiro(profile.estrangeiro || false);
      setTipoAvaliador(profile.tipo_avaliador || "");
      setLogoUrl((profile as any).logo_url || "");
      setThemeColor(profile.theme_color || "blue");
      setFormData({
        cpf: profile.cpf || '',
        rg: profile.rg || '',
        telefone: profile.telefone || '',
        passaporte: profile.passaporte || '',
        paisOrigem: profile.pais_origem || '',
        endereco: profile.endereco || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        cep: profile.cep || '',
        creci: profile.creci || '',
        cau: profile.cau || '',
        crea: profile.crea || '',
        cnae: profile.cnae || '',
        cnpj: profile.cnpj || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
      fetchAutoRenewStatus();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && ['perfil', 'assinatura', 'pagamentos', 'anotacoes'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchAutoRenewStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('auto_renew')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAutoRenew(data.auto_renew);
      }
    } catch (error) {
      console.error('Error fetching auto-renew status:', error);
    }
  };

  const handleToggleAutoRenew = async (enabled: boolean) => {
    if (!user || !subscription) return;

    setUpdatingAutoRenew(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ auto_renew: enabled })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      setAutoRenew(enabled);
      toast.success(
        enabled
          ? 'Renovação automática ativada! Sua assinatura será renovada automaticamente.'
          : 'Renovação automática desativada. Lembre-se de renovar manualmente antes do vencimento.'
      );
    } catch (error) {
      console.error('Error updating auto-renew:', error);
      toast.error('Erro ao atualizar configuração de renovação');
    } finally {
      setUpdatingAutoRenew(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!user) return;

    try {
      // Fetch subscription payments
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          created_at,
          status,
          data_inicio,
          data_expiracao,
          payment_id,
          plans (
            nome,
            preco
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch additional reports purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('additional_reports_purchases')
        .select('id, created_at, status, quantidade, preco_total, payment_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;
      if (purchasesError) throw purchasesError;

      // Combine and format both types of payments
      const formattedSubscriptions = (subscriptions || []).map(sub => ({
        ...sub,
        type: 'subscription' as const,
      }));

      const formattedPurchases = (purchases || []).map(purchase => ({
        ...purchase,
        type: 'additional_reports' as const,
      }));

      const combined = [...formattedSubscriptions, ...formattedPurchases].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPaymentHistory(combined as any);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handlePayNow = async (payment: PaymentHistory) => {
    if (!payment.payment_id) {
      toast.error('ID de pagamento não encontrado');
      return;
    }

    try {
      // Buscar o gateway ativo
      const { data: gateway } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .single();

      if (!gateway) {
        toast.error('Nenhum gateway de pagamento configurado');
        return;
      }

      // Redirecionar para o link de pagamento do Mercado Pago
      window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${payment.payment_id}`, '_blank');
    } catch (error) {
      console.error('Error opening payment:', error);
      toast.error('Erro ao abrir pagamento');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload da imagem
      const fileExt = file.name.split('.').pop();
      const filePath = `logos/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('ptam-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('ptam-images')
        .getPublicUrl(filePath);

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setLogoUrl(urlData.publicUrl);
      await refreshProfile();
      toast.success('Logotipo atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Erro ao enviar logotipo');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          cpf: estrangeiro ? null : formData.cpf,
          rg: estrangeiro ? null : formData.rg,
          estrangeiro,
          passaporte: estrangeiro ? formData.passaporte : null,
          pais_origem: estrangeiro ? formData.paisOrigem : null,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          tipo_avaliador: tipoAvaliador || null,
          creci: tipoAvaliador === 'corretor' ? formData.creci : null,
          cau: tipoAvaliador === 'arquiteto' ? formData.cau : null,
          crea: tipoAvaliador === 'engenheiro' ? formData.crea : null,
          cnae: formData.cnae || null,
          cnpj: formData.cnpj || null,
          telefone: formData.telefone || null,
          theme_color: themeColor,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Detailed error logging for debugging
      const errorDetails = `code: ${error.code}, message: ${error.message}, details: ${error.details || ''}, hint: ${error.hint || ''}`;
      console.error('Update Profile Detailed Error:', errorDetails);
      toast.error(`Erro ao atualizar perfil: ${error.message || 'Erro desconhecido'} (${error.code || 'sem código'}). Detalhes: ${error.details || ''}`);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'expired':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'expired':
        return 'Expirado';
      default:
        return 'Cancelado';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header removed as it is now in Sidebar/Layout */}

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie sua conta e preferências
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b overflow-x-auto pb-1">
            {settings.enable_profile && (
              <Button
                variant={activeTab === 'perfil' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('perfil')}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Perfil
              </Button>
            )}
            {settings.enable_subscription && (
              <Button
                variant={activeTab === 'assinatura' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('assinatura')}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Assinatura
              </Button>
            )}
            {settings.enable_payment_history && (
              <Button
                variant={activeTab === 'pagamentos' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('pagamentos')}
                className="gap-2"
              >
                <Receipt className="h-4 w-4" />
                Histórico de Pagamento
              </Button>
            )}
            {settings.enable_notes && (
              <Button
                variant={activeTab === 'anotacoes' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('anotacoes')}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Anotações
              </Button>
            )}
          </div>

          {/* Perfil Tab */}
          {activeTab === 'perfil' && settings.enable_profile && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Dados Pessoais</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo (não editável)</Label>
                  <Input
                    id="nome"
                    value={profile?.nome_completo}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (não editável)</Label>
                  <Input
                    id="email"
                    value={profile?.email}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUpload" className="cursor-pointer">
                    Logotipo
                  </Label>
                  {logoUrl && (
                    <div className="mb-4">
                      <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain border rounded p-2" />
                    </div>
                  )}
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando logotipo...
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: JPG, PNG. O logo será exibido no cabeçalho do documento de avaliação.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Checkbox
                    id="estrangeiro"
                    checked={estrangeiro}
                    onCheckedChange={(checked) => setEstrangeiro(checked as boolean)}
                  />
                  <Label htmlFor="estrangeiro" className="cursor-pointer">Estrangeiro</Label>
                </div>

                {!estrangeiro ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => setFormData(prev => ({ ...prev, cpf: maskCPF(e.target.value) }))}
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={formData.rg}
                        onChange={(e) => setFormData(prev => ({ ...prev, rg: maskRG(e.target.value) }))}
                        maxLength={12}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="passaporte">Passaporte</Label>
                      <Input
                        id="passaporte"
                        value={formData.passaporte}
                        onChange={(e) => setFormData(prev => ({ ...prev, passaporte: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paisOrigem">País de Origem</Label>
                      <Input
                        id="paisOrigem"
                        value={formData.paisOrigem}
                        onChange={(e) => setFormData(prev => ({ ...prev, paisOrigem: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">Endereço</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={formData.complemento}
                        onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                        maxLength={2}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Dados Profissionais</h3>
                  <div>
                    <Label htmlFor="tipoAvaliador">Tipo de Avaliador (não editável)</Label>
                    <Input
                      id="tipoAvaliador"
                      value={
                        tipoAvaliador === 'corretor' ? 'Corretor' :
                          tipoAvaliador === 'arquiteto' ? 'Arquiteto' :
                            tipoAvaliador === 'engenheiro' ? 'Engenheiro' : ''
                      }
                      disabled
                    />
                  </div>

                  {tipoAvaliador === 'corretor' && formData.creci && (
                    <div>
                      <Label htmlFor="creci">CRECI (não editável)</Label>
                      <Input
                        id="creci"
                        value={formData.creci}
                        disabled
                      />
                    </div>
                  )}

                  {tipoAvaliador === 'arquiteto' && formData.cau && (
                    <div>
                      <Label htmlFor="cau">CAU (não editável)</Label>
                      <Input
                        id="cau"
                        value={formData.cau}
                        disabled
                      />
                    </div>
                  )}

                  {tipoAvaliador === 'engenheiro' && formData.crea && (
                    <div>
                      <Label htmlFor="crea">CREA (não editável)</Label>
                      <Input
                        id="crea"
                        value={formData.crea}
                        disabled
                      />
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cnae">CNAI (Opcional)</Label>
                      <Input
                        id="cnae"
                        value={formData.cnae}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnae: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnpj: maskCNPJ(e.target.value) }))}
                        maxLength={18}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {canChangeTheme ? (
                    <ThemeColorPicker
                      value={themeColor}
                      onChange={setThemeColor}
                    />
                  ) : (
                    <div className="space-y-3">
                      <Label>Cor do Sistema</Label>
                      <div className="p-4 border border-border rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          A personalização de cores está disponível apenas para planos mensais e anuais.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </Card>
          )}

          {/* Assinatura Tab */}
          {activeTab === 'assinatura' && settings.enable_subscription && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Assinatura</h2>
              </div>
              {subscription ? (
                <div className="space-y-4">
                  <div>
                    <Label>Plano Atual</Label>
                    <p className="text-lg font-medium">{(subscription as any).plans?.nome}</p>
                  </div>
                  <div>
                    <Label>Relatórios Disponíveis</Label>
                    <p className="text-lg font-medium">
                      {subscription.relatorios_disponiveis - subscription.relatorios_usados} de{' '}
                      {subscription.relatorios_disponiveis}
                    </p>
                  </div>

                  {/* Only show expiration date for non-avulso plans */}
                  {(subscription as any).plans?.tipo !== 'avulso' && subscription.data_expiracao && (
                    <div>
                      <Label>Renovação</Label>
                      <p className="text-lg font-medium">
                        {new Date(subscription.data_expiracao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {/* Auto Renew Toggle - Only show for monthly plans */}
                  {((subscription as any).plans?.tipo === 'mensal_basico' || (subscription as any).plans?.tipo === 'mensal_pro') && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-renew">Renovação Automática</Label>
                          <p className="text-sm text-muted-foreground">
                            {autoRenew
                              ? 'Sua assinatura será renovada automaticamente no vencimento'
                              : 'Você precisará renovar manualmente quando a assinatura expirar'}
                          </p>
                        </div>
                        <Checkbox
                          id="auto-renew"
                          checked={autoRenew}
                          onCheckedChange={handleToggleAutoRenew}
                          disabled={updatingAutoRenew}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => navigate('/dashboard/planos')}>
                      Alterar Plano
                    </Button>
                    <Button
                      onClick={() => setShowAddReportsDialog(true)}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Coins className="h-4 w-4" />
                      Adicionar Créditos Avulsos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Você não possui um plano ativo
                  </p>
                  <Button onClick={() => navigate('/dashboard/planos')}>
                    Ver Planos Disponíveis
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Histórico de Pagamentos Tab */}
          {activeTab === 'pagamentos' && settings.enable_payment_history && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
              </div>
              {paymentHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum pagamento realizado ainda
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {payment.type === 'additional_reports'
                            ? `${payment.quantidade} Relatório${payment.quantidade! > 1 ? 's' : ''} Avulso${payment.quantidade! > 1 ? 's' : ''}`
                            : payment.plans?.nome}
                        </TableCell>
                        <TableCell>
                          R$ {payment.type === 'additional_reports'
                            ? payment.preco_total?.toFixed(2)
                            : payment.plans?.preco.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(payment.status)} text-white border-none`}>
                            {getStatusLabel(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.type === 'additional_reports'
                            ? 'Créditos Avulsos'
                            : `${new Date(payment.data_inicio!).toLocaleDateString('pt-BR')} - ${new Date(payment.data_expiracao!).toLocaleDateString('pt-BR')}`}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && payment.payment_id && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(payment)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Pagar Agora
                            </Button>
                          )}
                          {/* Se estiver expirado ou cancelado, não mostra nada */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* Anotações Tab */}
          {activeTab === 'anotacoes' && settings.enable_notes && (
            <Anotacoes />
          )}

        </div>
      </div>

      {/* Add Reports Dialog */}
      <AddReportsDialog
        open={showAddReportsDialog}
        onOpenChange={setShowAddReportsDialog}
        onSuccess={() => {
          fetchPaymentHistory();
          refetchSubscription();
          refreshProfile();
        }}
      />
    </div>
  );
};

export default Perfil;
