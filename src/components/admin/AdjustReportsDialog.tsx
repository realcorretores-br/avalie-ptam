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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";

interface AdjustReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentSubscription: {
    id: string;
    relatorios_disponiveis: number;
    relatorios_usados: number;
  } | null;
  onSuccess: () => void;
}

export function AdjustReportsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentSubscription,
  onSuccess,
}: AdjustReportsDialogProps) {
  const { logAction } = useAdminLog();
  const [newDisponivel, setNewDisponivel] = useState<number>(0);
  const [newUsados, setNewUsados] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && currentSubscription) {
      setNewDisponivel(currentSubscription.relatorios_disponiveis);
      setNewUsados(currentSubscription.relatorios_usados);
    }
  }, [open, currentSubscription]);

  const handleAdjust = async () => {
    if (!currentSubscription) {
      toast.error("Usuário não possui assinatura ativa");
      return;
    }

    if (newDisponivel < 0 || newUsados < 0) {
      toast.error("Valores não podem ser negativos");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          relatorios_disponiveis: newDisponivel,
          relatorios_usados: newUsados,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id);

      if (error) throw error;

      await logAction("adjust_reports", {
        userId,
        userName,
        oldDisponivel: currentSubscription.relatorios_disponiveis,
        newDisponivel,
        oldUsados: currentSubscription.relatorios_usados,
        newUsados,
      });

      toast.success("Relatórios ajustados com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adjusting reports:", error);
      toast.error("Erro ao ajustar relatórios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Relatórios - {userName}</DialogTitle>
          <DialogDescription>
            Defina manualmente a quantidade de relatórios disponíveis e usados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disponivel">Relatórios Disponíveis</Label>
            <Input
              id="disponivel"
              type="number"
              min="0"
              value={newDisponivel}
              onChange={(e) => setNewDisponivel(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usados">Relatórios Usados</Label>
            <Input
              id="usados"
              type="number"
              min="0"
              value={newUsados}
              onChange={(e) => setNewUsados(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="p-3 bg-muted rounded-md text-sm space-y-1">
            <p className="font-medium">Saldo disponível para uso:</p>
            <p className="text-lg font-bold">
              {Math.max(0, newDisponivel - newUsados)} relatórios
            </p>
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
          <Button onClick={handleAdjust} disabled={loading}>
            {loading ? "Ajustando..." : "Ajustar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
