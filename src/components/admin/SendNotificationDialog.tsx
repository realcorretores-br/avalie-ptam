import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, Users, User } from "lucide-react";

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"all" | "single" | "city">("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [users, setUsers] = useState<{ id: string, name: string, email: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (type === 'single') fetchUsers();
      if (type === 'city') fetchCities();
    }
  }, [open, type]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, nome_completo, email').limit(50);
    if (data) {
      setUsers(data.map(u => ({
        id: u.id,
        name: u.nome_completo || 'Sem nome',
        email: u.email || ''
      })));
    }
  };

  const fetchCities = async () => {
    const { data } = await supabase.from('profiles').select('cidade');
    if (data) {
      const uniqueCities = Array.from(new Set(data.map(p => p.cidade).filter(Boolean))).sort();
      setCities(uniqueCities);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Preencha título e mensagem.");
    if (type === 'single' && !selectedUserId) return toast.error("Selecione um usuário.");
    if (type === 'city' && !selectedCity) return toast.error("Selecione uma cidade.");

    try {
      setLoading(true);

      let notificationsToInsert = [];

      if (type === 'all') {
        notificationsToInsert.push({
          title,
          message,
          read: false,
          created_at: new Date().toISOString(),
          is_mass: true,
          user_id: null
        });
      } else if (type === 'single') {
        notificationsToInsert.push({
          title,
          message,
          read: false,
          created_at: new Date().toISOString(),
          is_mass: false,
          user_id: selectedUserId
        });
      } else if (type === 'city') {
        // Fetch all users in the city
        const { data: cityUsers, error: cityError } = await supabase
          .from('profiles')
          .select('id')
          .eq('cidade', selectedCity);

        if (cityError) throw cityError;
        if (!cityUsers || cityUsers.length === 0) {
          toast.error("Nenhum usuário encontrado nesta cidade.");
          setLoading(false);
          return;
        }

        notificationsToInsert = cityUsers.map(u => ({
          title,
          message,
          read: false,
          created_at: new Date().toISOString(),
          is_mass: false,
          user_id: u.id
        }));
      }

      const { error } = await supabase.from("notifications").insert(notificationsToInsert);

      if (error) throw error;

      toast.success("Notificação enviada com sucesso!");
      onOpenChange(false);
      setTitle("");
      setMessage("");
      setSelectedUserId("");
      setSelectedCity("");
      setType("all");

    } catch (error: any) {
      toast.error("Erro ao enviar notificação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Notificação</DialogTitle>
          <DialogDescription>
            Envie alertas, novidades ou avisos para os usuários do sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'all' ? 'default' : 'outline'}
                onClick={() => setType('all')}
                className="flex-1 text-xs px-2"
              >
                <Users className="w-3 h-3 mr-1" /> Todos
              </Button>
              <Button
                type="button"
                variant={type === 'city' ? 'default' : 'outline'}
                onClick={() => setType('city')}
                className="flex-1 text-xs px-2"
              >
                <Users className="w-3 h-3 mr-1" /> Por Cidade
              </Button>
              <Button
                type="button"
                variant={type === 'single' ? 'default' : 'outline'}
                onClick={() => setType('single')}
                className="flex-1 text-xs px-2"
              >
                <User className="w-3 h-3 mr-1" /> Único
              </Button>
            </div>
          </div>

          {type === 'city' && (
            <div className="space-y-2">
              <Label>Selecione a Cidade</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'single' && (
            <div className="space-y-2">
              <Label>Selecione o Usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Manutenção Programada"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}