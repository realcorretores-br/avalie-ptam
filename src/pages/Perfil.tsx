import { useEffect, useState, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'perfil');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['perfil', 'assinatura', 'pagamentos', 'anotacoes'].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [estrangeiro, setEstrangeiro] = useState(profile?.estrangeiro || false);
  const [tipoAvaliador, setTipoAvaliador] = useState(profile?.tipo_avaliador || "");
  const [logoUrl, setLogoUrl] = useState((profile as any)?.logo_url || "");


  const [themeColor, setThemeColor] = useState(profile?.theme_color || "blue");

  useThemeColor();

  useThemeColor();
  const canChangeTheme = true;

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






  const fetchPaymentHistory = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user, fetchPaymentHistory]);



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
                <Coins className="h-4 w-4" />
                Meus Créditos
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
                <Coins className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Meus Créditos</h2>
              </div>

              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{subscription?.plans?.nome || "Sem Créditos"}</h3>
                      <p className="text-muted-foreground">
                        {subscription?.relatorios_disponiveis
                          ? `${(subscription.relatorios_disponiveis - (subscription.relatorios_usados || 0)) + (subscription.creditos_extra || 0)} créditos disponíveis`
                          : 'Adquira um pacote para começar'}
                      </p>
                    </div>
                  </div>

                  {subscription && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Pacote Atual</span>
                        <span className="font-medium">{subscription.plans?.nome || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Saldo Total</span>
                        <span className="font-bold text-lg">
                          {(subscription.relatorios_disponiveis || 0) + (subscription.creditos_extra || 0) - (subscription.relatorios_usados || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full sm:w-auto mt-4"
                  onClick={() => navigate('/dashboard/planos')}
                >
                  Comprar Mais Créditos
                </Button>
              </div>
            </Card>
          )}

          {/* Histórico de Pagamentos Tab */}
          {activeTab === 'pagamentos' && settings.enable_payment_history && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Histórico de Pagamento</h2>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Nenhum pagamento encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentHistory.map((payment) => (
                        <TableRow key={payment.id || payment.payment_id}>
                          <TableCell>
                            {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {payment.type === 'additional_reports'
                              ? `${payment.quantidade} Créditos Avulsos`
                              : payment.plans?.nome || 'Assinatura'}
                          </TableCell>
                          <TableCell>
                            {payment.type === 'additional_reports'
                              ? `R$ ${payment.preco_total?.toFixed(2) || '0.00'}`
                              : `R$ ${payment.plans?.preco?.toFixed(2) || '0.00'}`}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(payment.status)} text-white border-0`}>
                              {getStatusLabel(payment.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* Anotações Tab */}
          {activeTab === 'anotacoes' && settings.enable_notes && (
            <div className="space-y-4">
              <Anotacoes />
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Perfil;
