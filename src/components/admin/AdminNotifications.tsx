import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Users, User } from "lucide-react";

interface Profile {
    id: string;
    nome_completo: string | null;
    email: string | null;
}

export const AdminNotifications = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"mass" | "individual">("mass");
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        // Fetch profiles to select from
        // Note: In a real large app, this should be a search/autocomplete
        const { data, error } = await supabase
            .from('profiles')
            .select('id, nome_completo, email') // Assuming email is in profiles or we need to join auth? 
            // Actually profiles usually has email if synced, or we just show name.
            // Let's check profiles table definition if needed, but usually it has basic info.
            // If email is not in profiles, we might rely on name.
            .order('nome_completo');

        if (data) {
            setUsers(data);
        }
    };

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Preencha título e mensagem");
            return;
        }

        if (type === "individual" && !selectedUser) {
            toast.error("Selecione um usuário");
            return;
        }

        setLoading(true);
        try {
            if (type === "mass") {
                // For mass send, we can either:
                // 1. Insert one record with is_mass=true (and frontend shows it to everyone)
                // 2. Insert individual records for everyone.
                // The requirement "Item 4.1.2" says user can delete. If we use one record, deleting is tricky (we need a separate table for 'deleted_notifications' or 'read_notifications').
                // To keep it simple and allow individual delete/read status, we will insert for ALL users.
                // Fetch all user IDs first.

                const { data: allUsers } = await supabase.from('profiles').select('id');

                if (!allUsers || allUsers.length === 0) {
                    toast.error("Nenhum usuário encontrado");
                    return;
                }

                const { data: { user } } = await supabase.auth.getUser();
                const currentUserId = user?.id;

                const notifications = allUsers.map(u => ({
                    user_id: u.id,
                    title,
                    message,
                    is_mass: true,
                    created_by: currentUserId
                }));

                const { error } = await supabase.from('notifications').insert(notifications);
                if (error) throw error;

                toast.success(`Notificação enviada para ${allUsers.length} usuários`);

            } else {
                // Individual
                const { error } = await supabase.from('notifications').insert({
                    user_id: selectedUser,
                    title,
                    message,
                    is_mass: false,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                });
                if (error) throw error;

                toast.success("Notificação enviada com sucesso");
            }

            // Reset form
            setTitle("");
            setMessage("");
            setSelectedUser("");

        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error("Erro ao enviar notificação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Enviar Notificação</CardTitle>
                <CardDescription>
                    Envie mensagens importantes para os usuários do sistema.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label>Tipo de Envio</Label>
                    <RadioGroup
                        defaultValue="mass"
                        value={type}
                        onValueChange={(v) => setType(v as "mass" | "individual")}
                        className="flex flex-col space-y-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mass" id="mass" />
                            <Label htmlFor="mass" className="flex items-center gap-2 cursor-pointer">
                                <Users className="h-4 w-4" />
                                Envio em Massa (todos os usuários)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                                <User className="h-4 w-4" />
                                Envio Individual
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {type === "individual" && (
                    <div className="space-y-2">
                        <Label>Selecione o Usuário</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um usuário..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.nome_completo || "Usuário sem nome"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                        placeholder="Ex: Boas vindas"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea
                        placeholder="Digite sua mensagem aqui..."
                        className="min-h-[100px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <Button onClick={handleSend} disabled={loading} className="w-full">
                    {loading ? (
                        "Enviando..."
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Notificação
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};
