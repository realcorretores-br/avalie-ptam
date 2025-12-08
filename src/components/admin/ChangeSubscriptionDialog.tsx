import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";

interface Plan {
  id: string;
  nome: string;
  tipo: string;
  preco: number;
  relatorios_incluidos: number;
}

interface ChangeSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentSubscription: {
    id: string;
    plan_id: string;
    relatorios_usados: number;
    relatorios_disponiveis: number;
  } | null;
  onSuccess: () => void;
}

export function ChangeSubscriptionDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentSubscription,
  onSuccess,
}: ChangeSubscriptionDialogProps) {
  const { logAction } = useAdminLog();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPlans();
      setSelectedPlanId("");
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("ativo", true)
        .order("preco", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Erro ao carregar planos");
    }
  };

  const handleChange = async () => {
    if (!selectedPlanId) {
      toast.error("Selecione um plano");
      return;
    }

    setLoading(true);
    try {
      const newPlan = plans.find((p) => p.id === selectedPlanId);
      if (!newPlan) throw new Error("Plano não encontrado");

      if (currentSubscription) {
        const saldoNaoUtilizado = Math.max(
          0,
          currentSubscription.relatorios_disponiveis - currentSubscription.relatorios_usados
        );

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            plan_id: selectedPlanId,
            relatorios_disponiveis: newPlan.relatorios_incluidos,
            relatorios_usados: 0,
            saldo_acumulado: saldoNaoUtilizado,
            plano_anterior_id: currentSubscription.plan_id,
            data_saldo_expira: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSubscription.id);

        if (updateError) throw updateError;
      } else {
        const dataExpiracao = newPlan.tipo === "avulso" 
          ? null 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_id: selectedPlanId,
            status: "active",
            relatorios_disponiveis: newPlan.relatorios_incluidos,
            relatorios_usados: 0,
            data_inicio: new Date().toISOString(),
            data_expiracao: dataExpiracao,
          });

        if (insertError) throw insertError;
      }

      await logAction("change_subscription", {
        userId,
        userName,
        newPlanId: selectedPlanId,
        newPlanName: newPlan.nome,
      });

      toast.success("Plano alterado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error changing subscription:", error);
      toast.error("Erro ao alterar plano");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Plano - {userName}</DialogTitle>
          <DialogDescription>
            Selecione o novo plano para este usuário. Relatórios não utilizados serão mantidos como saldo acumulado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentSubscription && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium">Plano Atual:</p>
              <p>Relatórios disponíveis: {currentSubscription.relatorios_disponiveis}</p>
              <p>Relatórios usados: {currentSubscription.relatorios_usados}</p>
              <p>Saldo não utilizado: {Math.max(0, currentSubscription.relatorios_disponiveis - currentSubscription.relatorios_usados)}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="plan">Novo Plano</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem 
                    key={plan.id} 
                    value={plan.id}
                    disabled={plan.id === currentSubscription?.plan_id}
                  >
                    {plan.nome} - R$ {plan.preco.toFixed(2)} ({plan.relatorios_incluidos} relatórios)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleChange} disabled={loading}>
            {loading ? "Alterando..." : "Alterar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
