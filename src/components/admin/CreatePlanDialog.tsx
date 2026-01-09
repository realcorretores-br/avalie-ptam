<<<<<<< HEAD
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { z } from "zod";

const PlanSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  preco: z.number().positive("Preço deve ser maior que zero").max(999999, "Preço deve ser menor que 1.000.000"),
  relatorios: z.number().int("Relatórios deve ser um número inteiro").positive("Relatórios deve ser maior que zero").max(10000, "Relatórios deve ser menor que 10.000"),
  descricao: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreatePlanDialog = ({ open, onOpenChange, onSuccess }: CreatePlanDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<'avulso' | 'mensal_basico' | 'mensal_pro' | 'personalizado'>('mensal_basico');
  const [preco, setPreco] = useState("");
  const [relatorios, setRelatorios] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Validate input
      const validationResult = PlanSchema.safeParse({
        nome,
        preco: parseFloat(preco.replace(',', '.')),
        relatorios: parseInt(relatorios),
        descricao: descricao || undefined,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const validatedData = validationResult.data;

      const { error } = await supabase
        .from('plans')
        .insert({
          nome: validatedData.nome,
          tipo,
          preco: validatedData.preco,
          relatorios_incluidos: validatedData.relatorios,
          descricao: validatedData.descricao,
          ativo: true
        });

      if (error) throw error;

      await logAction('create_plan', { nome: validatedData.nome, tipo, preco: validatedData.preco, relatorios: validatedData.relatorios });
      toast.success('Plano criado com sucesso!');

      // Reset form
      setNome("");
      setTipo('mensal_basico');
      setPreco("");
      setRelatorios("");
      setDescricao("");

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="create-plan-description">
        <DialogHeader>
          <DialogTitle>Criar Novo Plano</DialogTitle>
          <p id="create-plan-description" className="text-sm text-muted-foreground">
            Preencha os dados abaixo para criar um novo plano de assinatura.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Plano *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Plano Pro"
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avulso">Avulso</SelectItem>
                <SelectItem value="mensal_basico">Mensal Básico</SelectItem>
                <SelectItem value="mensal_pro">Mensal Pro</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="text"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="relatorios">Relatórios Incluídos *</Label>
            <Input
              id="relatorios"
              type="number"
              value={relatorios}
              onChange={(e) => setRelatorios(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as características do plano"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
=======
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { z } from "zod";

const PlanSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  preco: z.number().positive("Preço deve ser maior que zero").max(999999, "Preço deve ser menor que 1.000.000"),
  relatorios: z.number().int("Relatórios deve ser um número inteiro").positive("Relatórios deve ser maior que zero").max(10000, "Relatórios deve ser menor que 10.000"),
  descricao: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreatePlanDialog = ({ open, onOpenChange, onSuccess }: CreatePlanDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<'avulso' | 'mensal_basico' | 'mensal_pro' | 'personalizado'>('mensal_basico');
  const [preco, setPreco] = useState("");
  const [relatorios, setRelatorios] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Validate input
      const validationResult = PlanSchema.safeParse({
        nome,
        preco: parseFloat(preco.replace(',', '.')),
        relatorios: parseInt(relatorios),
        descricao: descricao || undefined,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const validatedData = validationResult.data;

      const { error } = await supabase
        .from('plans')
        .insert({
          nome: validatedData.nome,
          tipo,
          preco: validatedData.preco,
          relatorios_incluidos: validatedData.relatorios,
          descricao: validatedData.descricao,
          ativo: true
        });

      if (error) throw error;

      await logAction('create_plan', { nome: validatedData.nome, tipo, preco: validatedData.preco, relatorios: validatedData.relatorios });
      toast.success('Plano criado com sucesso!');

      // Reset form
      setNome("");
      setTipo('mensal_basico');
      setPreco("");
      setRelatorios("");
      setDescricao("");

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="create-plan-description">
        <DialogHeader>
          <DialogTitle>Criar Novo Plano</DialogTitle>
          <p id="create-plan-description" className="text-sm text-muted-foreground">
            Preencha os dados abaixo para criar um novo plano de assinatura.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Plano *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Plano Pro"
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avulso">Avulso</SelectItem>
                <SelectItem value="mensal_basico">Mensal Básico</SelectItem>
                <SelectItem value="mensal_pro">Mensal Pro</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="text"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="relatorios">Relatórios Incluídos *</Label>
            <Input
              id="relatorios"
              type="number"
              value={relatorios}
              onChange={(e) => setRelatorios(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as características do plano"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
