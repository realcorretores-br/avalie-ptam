import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { z } from "zod";

const AddSubscriptionSchema = z.object({
  planId: z.string().min(1, "Selecione um plano"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataExpiracao: z.string().min(1, "Data de expiração é obrigatória"),
});

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

interface Plan {
  id: string;
  nome: string;
  preco: number;
  relatorios_incluidos: number;
}

type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export const AddSubscriptionDialog = ({ 
  open, 
  onOpenChange, 
  userId,
  userName,
  onSuccess 
}: AddSubscriptionDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [dataInicio, setDataInicio] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState("");

  useEffect(() => {
    if (open) {
      fetchPlans();
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      setDataInicio(today);
      setDataExpiracao(nextMonthStr);
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('ativo', true)
        .order('preco');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Validate input
      const validationResult = AddSubscriptionSchema.safeParse({
        planId,
        dataInicio,
        dataExpiracao,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      // Check if user already has an active subscription
      const { data: existingSubs, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (checkError) throw checkError;

      if (existingSubs && existingSubs.length > 0) {
        toast.error('Este usuário já possui uma assinatura ativa. Altere a assinatura existente ou cancele-a primeiro.');
        setLoading(false);
        return;
      }

      const selectedPlan = plans.find(p => p.id === planId);
      
      if (!selectedPlan) {
        toast.error('Plano não encontrado');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: status,
          data_inicio: dataInicio,
          data_expiracao: dataExpiracao,
          relatorios_disponiveis: selectedPlan.relatorios_incluidos,
          relatorios_usados: 0,
          auto_renew: true, // Enable auto-renew by default for new subscriptions
        });

      if (error) throw error;

      await logAction('create_subscription', {
        userId,
        userName,
        planId,
        planName: selectedPlan.nome,
        status
      });

      toast.success('Assinatura criada com sucesso!');
      
      // Reset form
      setPlanId("");
      setStatus('active');
      setDataInicio("");
      setDataExpiracao("");
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Erro ao criar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Assinatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Input value={userName} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plano *</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.nome} - R$ {plan.preco.toFixed(2)} ({plan.relatorios_incluidos} relatórios)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as SubscriptionStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataExpiracao">Data de Expiração *</Label>
            <Input
              id="dataExpiracao"
              type="date"
              value={dataExpiracao}
              onChange={(e) => setDataExpiracao(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Assinatura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
