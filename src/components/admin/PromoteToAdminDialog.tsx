import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PromoteToAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export const PromoteToAdminDialog = ({ open, onOpenChange, userId, userName, onSuccess }: PromoteToAdminDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    setLoading(true);
    try {
      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (existingRole) {
        toast.info('Este usuário já é administrador');
        onOpenChange(false);
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;

      await logAction('promote_to_admin', { userId, userName });
      toast.success(`${userName} promovido a administrador!`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Erro ao promover usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promover a Administrador</DialogTitle>
          <DialogDescription>
            Esta ação dará privilégios administrativos completos ao usuário.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{userName}</strong> terá acesso total ao painel administrativo e poderá:
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
          <Button onClick={handlePromote} disabled={loading}>
            {loading ? 'Promovendo...' : 'Confirmar Promoção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};