import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RemoveAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export const RemoveAdminDialog = ({ open, onOpenChange, userId, userName, onSuccess }: RemoveAdminDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      // Check if user has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!existingRole) {
        toast.info('Este usuário não é administrador');
        onOpenChange(false);
        return;
      }

      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      await logAction('remove_admin', { userId, userName });
      toast.success(`${userName} removido de administrador!`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Erro ao remover administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover Administrador</DialogTitle>
          <DialogDescription>
            Esta ação removerá os privilégios administrativos do usuário.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{userName}</strong> perderá acesso ao painel administrativo e não poderá mais:
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Editar perfis de usuários</li>
              <li>Ajustar quantidade de relatórios</li>
              <li>Promover outros usuários a admin</li>
              <li>Gerenciar planos e assinaturas</li>
              <li>Enviar notificações</li>
            </ul>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={loading}>
            {loading ? 'Removendo...' : 'Confirmar Remoção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};