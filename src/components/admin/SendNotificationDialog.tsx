import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendNotificationDialog = ({ open, onOpenChange }: SendNotificationDialogProps) => {
  const { logAction } = useAdminLog();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'mass' | 'individual'>('mass');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, email')
        .order('nome_completo');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (type === 'individual' && !selectedUser) {
      toast.error('Selecione um usuário');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('send_notification', {
        p_title: formData.title,
        p_message: formData.message,
        p_user_id: type === 'individual' ? selectedUser : null,
        p_is_mass: type === 'mass'
      });

      if (error) throw error;

      if (type === 'mass') {
        await logAction('send_mass_notification', {
          title: formData.title,
          recipientCount: users.length
        });
        toast.success(`Notificação enviada para todos os usuários!`);
      } else {
        const selectedUserName = users.find(u => u.id === selectedUser)?.nome_completo;
        await logAction('send_individual_notification', {
          title: formData.title,
          recipient: selectedUserName
        });
        toast.success('Notificação enviada com sucesso!');
      }

      setFormData({ title: '', message: '' });
      setSelectedUser('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erro ao enviar notificação: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Notificação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tipo de Envio</Label>
            <RadioGroup value={type} onValueChange={(value: any) => setType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mass" id="mass" />
                <Label htmlFor="mass" className="cursor-pointer">
                  Envio em Massa (todos os usuários)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer">
                  Envio Individual
                </Label>
              </div>
            </RadioGroup>
          </div>

          {type === 'individual' && (
            <div>
              <Label htmlFor="user">Selecionar Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nome_completo} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título da notificação"
            />
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Digite a mensagem..."
              rows={5}
            />
          </div>

          {type === 'mass' && (
            <p className="text-sm text-muted-foreground">
              Esta notificação será enviada para {users.length} usuários.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Notificação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};