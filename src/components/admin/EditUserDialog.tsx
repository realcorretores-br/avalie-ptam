import { useState, useEffect } from "react";
import { maskCPF, maskRG, maskCNPJ } from "@/lib/masks";
import { normalizeCRECI, normalizeCAU, normalizeCREA, normalizeCNAI } from "@/lib/maskUtils";
import { validateCPF } from "@/lib/validators";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, userId, onSuccess }: EditUserDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    cpf: '',
    rg: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    tipo_avaliador: '',
    creci: '',
    cau: '',
    crea: '',
    cnae: '',
    cnpj: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setFormData({
          nome_completo: data.nome_completo || '',
          email: data.email || '',
          telefone: data.telefone || '',
          cpf: data.cpf || '',
          rg: data.rg || '',
          endereco: data.endereco || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          tipo_avaliador: data.tipo_avaliador || '',
          creci: data.creci || '',
          cau: data.cau || '',
          crea: data.crea || '',
          cnae: data.cnae || '',
          cnpj: data.cnpj || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Erro ao carregar perfil do usuário');
      }
    };

    if (open && userId) {
      fetchUserProfile();
    }
  }, [open, userId]);

  const handleSave = async () => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      toast.error('CPF inválido. Verifique o número digitado.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          cpf: formData.cpf,
          rg: formData.rg,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          tipo_avaliador: formData.tipo_avaliador,
          creci: formData.creci,
          cau: formData.cau,
          crea: formData.crea,
          cnae: formData.cnae,
          cnpj: formData.cnpj,
        })
        .eq('id', userId);

      if (error) throw error;

      await logAction('edit_user_profile', { userId, changes: formData });
      toast.success('Perfil atualizado com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (não editável)</Label>
              <Input id="email" value={formData.email} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipo_avaliador">Tipo de Avaliador</Label>
            <Select value={formData.tipo_avaliador} onValueChange={(value) => setFormData({ ...formData, tipo_avaliador: value })}>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="creci">CRECI</Label>
              <Input
                id="creci"
                value={formData.creci}
                onChange={(e) => setFormData({ ...formData, creci: normalizeCRECI(e.target.value) })}
                maxLength={7}
              />
            </div>
            <div>
              <Label htmlFor="cau">CAU</Label>
              <Input
                id="cau"
                value={formData.cau}
                onChange={(e) => setFormData({ ...formData, cau: normalizeCAU(e.target.value) })}
                maxLength={8}
              />
            </div>
            <div>
              <Label htmlFor="crea">CREA</Label>
              <Input
                id="crea"
                value={formData.crea}
                onChange={(e) => setFormData({ ...formData, crea: normalizeCREA(e.target.value) })}
                maxLength={11}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnae">CNAE</Label>
              <Input
                id="cnae"
                value={formData.cnae}
                onChange={(e) => setFormData({ ...formData, cnae: normalizeCNAI(e.target.value) })}
                maxLength={6}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                maxLength={18}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};