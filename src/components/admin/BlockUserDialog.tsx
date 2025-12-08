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

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export function BlockUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: BlockUserDialogProps) {
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const { logAction } = useAdminLog();

  const handleBlock = async () => {
    if (!days || parseInt(days) <= 0) {
      toast.error("Informe um número válido de dias");
      return;
    }

    setLoading(true);
    try {
      const blockUntil = new Date();
      blockUntil.setDate(blockUntil.getDate() + parseInt(days));

      const { error } = await supabase
        .from("profiles")
        .update({ bloqueado_ate: blockUntil.toISOString() })
        .eq("id", userId);

      if (error) throw error;

      await logAction("block_user", {
        userId,
        userName,
        days: parseInt(days),
        blockedUntil: blockUntil.toISOString(),
      });

      toast.success(`Usuário bloqueado por ${days} dias`);
      onSuccess();
      onOpenChange(false);
      setDays("30");
    } catch (error: any) {
      console.error("Error blocking user:", error);
      toast.error("Erro ao bloquear usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear Usuário</DialogTitle>
          <DialogDescription>
            Bloquear {userName} por quantos dias?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="days">Número de dias</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="30"
            />
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
          <Button onClick={handleBlock} disabled={loading} variant="destructive">
            {loading ? "Bloqueando..." : "Bloquear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}