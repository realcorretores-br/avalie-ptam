import { useState } from "react";
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

interface AddReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentSubscription: {
    id: string;
    relatorios_disponiveis: number;
  } | null;
  onSuccess: () => void;
}

export function AddReportsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentSubscription,
  onSuccess,
}: AddReportsDialogProps) {
  const { logAction } = useAdminLog();
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!currentSubscription) {
      toast.error("Usuário não possui assinatura ativa");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          relatorios_disponiveis: currentSubscription.relatorios_disponiveis + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSubscription.id);

      if (error) throw error;

      await logAction("add_reports", {
        userId,
        userName,
        quantity,
        newTotal: currentSubscription.relatorios_disponiveis + quantity,
      });

      toast.success(`${quantity} relatório(s) adicionado(s) com sucesso!`);
      onSuccess();
      onOpenChange(false);
      setQuantity(1);
    } catch (error: any) {
      console.error("Error adding reports:", error);
      toast.error("Erro ao adicionar relatórios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Relatórios - {userName}</DialogTitle>
          <DialogDescription>
            Adicione relatórios extras à assinatura deste usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentSubscription && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p>Relatórios disponíveis atualmente: <strong>{currentSubscription.relatorios_disponiveis}</strong></p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade de Relatórios</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {currentSubscription && (
            <div className="p-3 bg-primary/10 rounded-md text-sm">
              <p>Novo total após adição: <strong>{currentSubscription.relatorios_disponiveis + quantity}</strong></p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
