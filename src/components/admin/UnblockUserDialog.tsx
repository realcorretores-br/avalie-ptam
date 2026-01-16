import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";

interface UnblockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export function UnblockUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: UnblockUserDialogProps) {
  const { logAction } = useAdminLog();

  const handleUnblock = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bloqueado_ate: null })
        .eq("id", userId);

      if (error) throw error;

      await logAction("unblock_user", { userId, userName });

      toast.success("Usuário desbloqueado com sucesso");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      toast.error("Erro ao desbloquear usuário");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desbloquear Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja desbloquear {userName}? O usuário poderá acessar
            o sistema normalmente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnblock}>
            Desbloquear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}