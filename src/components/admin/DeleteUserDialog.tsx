import { useState } from "react";
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

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const { logAction } = useAdminLog();

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Get current session to pass token explicitly as fallback
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessão inválida ou expirada. Por favor, faça login novamente.");
      }

      // Call Edge Function to delete user from Auth and DB
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: {
          user_id: userId,
          access_token: session.access_token
        }
      });

      if (error) throw error;

      if (data && !data.success) {
        console.error("Delete User Failed - Debug Info:", data);
        throw new Error(data.error || "Erro desconhecido na função");
      }

      await logAction("delete_user", { userId, userName });

      toast.success("Usuário deletado com sucesso");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Erro: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar permanentemente {userName}? Esta ação
            não pode ser desfeita e todos os dados do usuário serão removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}