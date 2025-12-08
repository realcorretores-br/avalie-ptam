import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { useCEP } from "@/hooks/useCEP";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmacaoCadastro } from "@/components/ConfirmacaoCadastro";
import { z } from "zod";

const CadastroSchema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100, 'Senha muito longa'),
  confirmarSenha: z.string(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional().or(z.literal('')),
  rg: z.string().optional(),
  passaporte: z.string().max(50, 'Passaporte muito longo').optional().or(z.literal('')),
  paisOrigem: z.string().max(100, 'País de origem muito longo').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido').max(20, 'Telefone muito longo'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  endereco: z.string().trim().min(3, 'Endereço deve ter no mínimo 3 caracteres').max(300, 'Endereço muito longo'),
  numero: z.string().max(10, 'Número muito longo').optional().or(z.literal('')),
  complemento: z.string().max(100, 'Complemento muito longo').optional().or(z.literal('')),
  bairro: z.string().trim().min(2, 'Bairro deve ter no mínimo 2 caracteres').max(100, 'Bairro muito longo'),
  cidade: z.string().trim().min(2, 'Cidade deve ter no mínimo 2 caracteres').max(100, 'Cidade muito longa'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').toUpperCase(),
  creci: z.string().max(50, 'CRECI muito longo').optional().or(z.literal('')),
  cau: z.string().max(50, 'CAU muito longo').optional().or(z.literal('')),
  crea: z.string().max(50, 'CREA muito longo').optional().or(z.literal('')),
  cnai: z.string().max(20, 'CNAI muito longo').optional().or(z.literal('')),
  cnpj: z.string().max(18, 'CNPJ muito longo').optional().or(z.literal('')),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

const Cadastro = () => {
  const [loading, setLoading] = useState(false);
  const [estrangeiro, setEstrangeiro] = useState(false);
  const [tipoAvaliador, setTipoAvaliador] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    rg: "",
    passaporte: "",
    paisOrigem: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    creci: "",
    cau: "",
    crea: "",
    cnai: "",
    cnpj: "",
  });

  const { fetchCEP, loading: cepLoading } = useCEP();

  const handleCEPChange = async (cep: string) => {
    setFormData(prev => ({ ...prev, cep }));

    if (cep.replace(/\D/g, '').length === 8) {
      const endereco = await fetchCEP(cep);
      if (endereco) {
        setFormData(prev => ({
          ...prev,
          endereco: endereco.logradouro || '',
          bairro: endereco.bairro || '',
          cidade: endereco.localidade || '',
          estado: endereco.uf || '',
        }));
      }
    }
  };

  const aplicarMascaraCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const aplicarMascaraRG = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{1})\d+?$/, '$1');
  };

  const aplicarMascaraTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const aplicarMascaraCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const aplicarMascaraCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validationResult = CadastroSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    // Validações de documentos baseadas em estrangeiro
    if (!estrangeiro && (!formData.cpf || !formData.rg)) {
      toast.error('CPF e RG são obrigatórios');
      return;
    }

    if (estrangeiro && !formData.passaporte) {
      toast.error('Passaporte é obrigatório para estrangeiros');
      return;
    }

    if (!tipoAvaliador) {
      toast.error('Selecione o tipo de avaliador');
      return;
    }

    // Mostrar popup de confirmação
    setShowConfirmDialog(true);
  };

  const handleConfirmCadastro = async () => {
    setLoading(true);

    try {
      // Validate input again before submission
      const validationResult = CadastroSchema.safeParse(formData);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      // Validações de documentos
      if (!estrangeiro && (!formData.cpf || !formData.rg)) {
        toast.error('CPF e RG são obrigatórios');
        setLoading(false);
        return;
      }

      if (estrangeiro && !formData.passaporte) {
        toast.error('Passaporte é obrigatório para estrangeiros');
        setLoading(false);
        return;
      }

      const validatedData = validationResult.data;

      // Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: validatedData.nomeCompleto,
            telefone: validatedData.telefone,
            endereco: validatedData.endereco,
            cidade: validatedData.cidade,
            estado: validatedData.estado,
            cep: validatedData.cep,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar usuário');
        setLoading(false);
        return;
      }

      // Atualizar profile com dados completos
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome_completo: validatedData.nomeCompleto,
          cpf: estrangeiro ? null : validatedData.cpf,
          rg: estrangeiro ? null : validatedData.rg,
          telefone: validatedData.telefone,
          email: validatedData.email,
          estrangeiro,
          passaporte: estrangeiro ? validatedData.passaporte : null,
          pais_origem: estrangeiro ? validatedData.paisOrigem : null,
          endereco: validatedData.endereco,
          numero: validatedData.numero,
          complemento: validatedData.complemento,
          bairro: validatedData.bairro,
          cidade: validatedData.cidade,
          estado: validatedData.estado,
          cep: validatedData.cep,
          tipo_avaliador: tipoAvaliador,
          creci: tipoAvaliador === 'corretor' ? validatedData.creci : null,
          cau: tipoAvaliador === 'arquiteto' ? validatedData.cau : null,
          crea: tipoAvaliador === 'engenheiro' ? validatedData.crea : null,
          cnae: validatedData.cnai || null,
          cnpj: validatedData.cnpj || null,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Erro ao atualizar profile:', profileError);
      }

      toast.success('Cadastro realizado com sucesso!');
      await refreshProfile();
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao realizar cadastro');
      console.error(error);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 p-4 py-12">
      <Card className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">PTAM</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Criar Conta</h1>
        <p className="text-center text-muted-foreground mb-6">
          Preencha seus dados para começar
        </p>

        <form onSubmit={handleCadastro} className="space-y-6">
          {/* Google Auth Button */}


          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={(e) => setFormData(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="estrangeiro"
                checked={estrangeiro}
                onCheckedChange={(checked) => setEstrangeiro(checked as boolean)}
              />
              <Label htmlFor="estrangeiro" className="cursor-pointer">Estrangeiro</Label>
            </div>

            {!estrangeiro ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: aplicarMascaraCPF(e.target.value) }))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG *</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData(prev => ({ ...prev, rg: aplicarMascaraRG(e.target.value) }))}
                    placeholder="00.000.000-0"
                    maxLength={12}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: aplicarMascaraTelefone(e.target.value) }))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="passaporte">Passaporte *</Label>
                  <Input
                    id="passaporte"
                    value={formData.passaporte}
                    onChange={(e) => setFormData(prev => ({ ...prev, passaporte: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paisOrigem">País de Origem *</Label>
                  <Input
                    id="paisOrigem"
                    value={formData.paisOrigem}
                    onChange={(e) => setFormData(prev => ({ ...prev, paisOrigem: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Endereço</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleCEPChange(aplicarMascaraCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={cepLoading}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                  maxLength={2}
                  placeholder="SP"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dados Profissionais</h2>

            <div className="space-y-2">
              <Label htmlFor="tipoAvaliador">Tipo de Avaliador *</Label>
              <Select value={tipoAvaliador} onValueChange={setTipoAvaliador} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corretor">Corretor</SelectItem>
                  <SelectItem value="arquiteto">Arquiteto</SelectItem>
                  <SelectItem value="engenheiro">Engenheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoAvaliador === 'corretor' && (
              <div className="space-y-2">
                <Label htmlFor="creci">CRECI *</Label>
                <Input
                  id="creci"
                  value={formData.creci}
                  onChange={(e) => setFormData(prev => ({ ...prev, creci: e.target.value }))}
                  required
                />
              </div>
            )}

            {tipoAvaliador === 'arquiteto' && (
              <div className="space-y-2">
                <Label htmlFor="cau">CAU *</Label>
                <Input
                  id="cau"
                  value={formData.cau}
                  onChange={(e) => setFormData(prev => ({ ...prev, cau: e.target.value }))}
                  required
                />
              </div>
            )}

            {tipoAvaliador === 'engenheiro' && (
              <div className="space-y-2">
                <Label htmlFor="crea">CREA *</Label>
                <Input
                  id="crea"
                  value={formData.crea}
                  onChange={(e) => setFormData(prev => ({ ...prev, crea: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnai">CNAI (Opcional)</Label>
                <Input
                  id="cnai"
                  value={formData.cnai}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnai: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: aplicarMascaraCNPJ(e.target.value) }))}
                  maxLength={18}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para o início
          </Link>
        </div>
      </Card>

      <ConfirmacaoCadastro
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        formData={formData}
        estrangeiro={estrangeiro}
        tipoAvaliador={tipoAvaliador}
        onConfirm={handleConfirmCadastro}
        loading={loading}
      />
    </div>
  );
};

export default Cadastro;
