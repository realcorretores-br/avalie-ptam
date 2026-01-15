import { useState, useEffect } from "react";
import {
    Search,
    Download,
    Filter,
    Calendar,
    Pencil,
    History,
    Ban,
    Loader2,
    MapPin,
    Coins,
    DollarSign,
    MoreVertical,
    Trash2,
    CreditCard,
    Lock,
    Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { EditUserDialog } from "./EditUserDialog";
import { ManageCreditsDialog } from "./ManageCreditsDialog";
import { EditPlanDialog } from "./EditPlanDialog";
import { toast } from "sonner";
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

interface UserData {
    id: string;
    name: string;
    email: string;
    creci: string;
    cnai: string;
    plan: string;
    status: string; // 'active' | 'blocked'
    lastLogin: string;
    avatar: string | null;
    cidade: string;
    estado: string;
    credits: number;
    investment: number;
    telefone: string;
    blocked_until: string | null;
    role: string;
}

export function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isManageCreditsOpen, setIsManageCreditsOpen] = useState(false);
    const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const [isAdminToggleDialogOpen, setIsAdminToggleDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Fetch profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) throw profilesError;

            // Fetch subscriptions for plan data and credits
            const { data: subscriptions, error: subsError } = await supabase
                .from('subscriptions')
                .select('*, plans(nome)')
                .eq('status', 'active');

            if (subsError) console.error("Error fetching subscriptions:", subsError);

            // Fetch investments
            let investmentsMap = new Map();
            try {
                const { data: purchases } = await supabase.from('additional_reports_purchases').select('user_id, preco_total');
                if (purchases) {
                    purchases.forEach(p => {
                        const current = investmentsMap.get(p.user_id) || 0;
                        investmentsMap.set(p.user_id, current + (Number(p.preco_total) || 0));
                    });
                }
            } catch (e) { }

            // Map Sub Data
            const subMap = new Map();
            subscriptions?.forEach(sub => {
                subMap.set(sub.user_id, {
                    planName: sub.plans?.nome || 'Personalizado',
                    reportCredits: sub.relatorios_disponiveis || 0,
                    accumulated: sub.saldo_acumulado || 0
                });
            });

            const formattedUsers: UserData[] = (profiles as any[]).map(profile => {
                const subData = subMap.get(profile.id);
                const planName = subData?.planName || 'Gratuito';
                const investment = investmentsMap.get(profile.id) || 0;

                // Calculate Total Credits
                const wallet = profile.creditos_pendentes || 0;
                const planCreds = subData?.reportCredits || 0;
                const rollover = subData?.accumulated || 0;
                const totalCredits = wallet + planCreds + rollover;

                const isBlocked = profile.bloqueado_ate && new Date(profile.bloqueado_ate) > new Date();

                return {
                    id: profile.id,
                    name: profile.nome_completo || 'Sem Nome',
                    email: profile.email || '',
                    creci: profile.creci || '-',
                    cnai: profile.cnai || '-',
                    plan: planName,
                    status: isBlocked ? 'blocked' : 'active',
                    lastLogin: new Date(profile.updated_at).toLocaleDateString(),
                    avatar: profile.logo_url,
                    cidade: profile.cidade || '',
                    estado: profile.estado || '',
                    credits: totalCredits,
                    investment: investment,
                    telefone: profile.telefone || '',
                    blocked_until: profile.bloqueado_ate,
                    role: profile.role || 'user'
                };
            });

            setUsers(formattedUsers.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Erro ao carregar usuários.");
        } finally {
            setLoading(false);
        }
    };

    const uniqueCities = Array.from(new Set(users.map(u => u.cidade).filter(Boolean))).sort();

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.creci.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPlan = planFilter === 'all' || user.plan.toLowerCase().includes(planFilter);
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        const matchesCity = cityFilter === 'all' || user.cidade === cityFilter;

        return matchesSearch && matchesPlan && matchesStatus && matchesCity;
    });

    const getPlanBadgeStyle = (plan: string) => {
        const p = plan.toUpperCase();
        if (p.includes("ENTERPRISE") || p.includes("PRO")) return "bg-blue-100 text-blue-700 hover:bg-blue-100";
        if (p.includes("PROFESSIONAL") || p.includes("GO")) return "bg-amber-100 text-amber-700 hover:bg-amber-100";
        if (p.includes("BASIC") || p.includes("START")) return "bg-slate-100 text-slate-700 hover:bg-slate-100";
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    };

    const getStatusBadgeStyle = (status: string) => {
        return status === "active"
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
            : "bg-red-100 text-red-700 hover:bg-red-100";
    };

    const getStatusLabel = (status: string) => {
        return status === "active" ? "Ativo" : "Bloqueado";
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            // Calling secure Edge Function
            const { data, error } = await supabase.functions.invoke('delete-user', {
                body: { user_id: selectedUser.id }
            });

            if (error || (data && !data.success)) {
                throw new Error(error?.message || data?.error || "Erro desconhecido");
            }

            toast.success("Usuário excluído permanentemente!");
            fetchUsers();
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error("Erro ao excluir usuário: " + error.message);
            console.error(error);
        }
    };

    const handleToggleBlock = async () => {
        if (!selectedUser) return;
        try {
            const isBlocked = selectedUser.status === 'blocked';
            const newStatus = isBlocked ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString(); // Block for 100 years

            const { error } = await supabase.from('profiles').update({ bloqueado_ate: newStatus }).eq('id', selectedUser.id);

            if (error) throw error;

            toast.success(`Usuário ${isBlocked ? "desbloqueado" : "bloqueado"} com sucesso!`);
            fetchUsers();
            setIsBlockDialogOpen(false);
        } catch (error: any) {
            toast.error("Erro ao alterar status: " + error.message);
        }
    };

    const handleToggleAdmin = async () => {
        if (!selectedUser) return;
        try {
            const isAdmin = selectedUser.role === 'admin';
            const newRole = isAdmin ? 'user' : 'admin';

            const { error } = await supabase.from('profiles').update({ role: newRole } as any).eq('id', selectedUser.id);

            if (error) throw error;

            toast.success(`Usuário ${isAdmin ? "removido de Admin" : "promovido a Admin"} com sucesso!`);
            fetchUsers();
            setIsAdminToggleDialogOpen(false);
        } catch (error: any) {
            toast.error("Erro ao alterar permissão: " + error.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h2>
                    <p className="text-muted-foreground">
                        Administre permissões e visualize a atividade dos consultores.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-[320px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por nome, email ou CRECI..."
                            className="pl-8 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="bg-white">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-[150px] bg-slate-50/50 border-slate-200">
                        <span className="text-muted-foreground mr-2 font-normal">Plano:</span>
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="start">Start</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="gratuito">Gratuito</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-slate-50/50 border-slate-200">
                        <span className="text-muted-foreground mr-2 font-normal">Status:</span>
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-[180px] bg-slate-50/50 border-slate-200">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Cidades</SelectItem>
                        {uniqueCities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="ghost" className="text-slate-500 gap-2 ml-auto" onClick={() => {
                    setPlanFilter("all");
                    setStatusFilter("all");
                    setCityFilter("all");
                    setSearchTerm("");
                }}>
                    <Filter className="w-3 h-3" />
                    Limpar Filtros
                </Button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[250px] text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plano</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cidade/UF</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Créditos</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Investido</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</TableHead>
                                <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarImage src={user.avatar || undefined} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">{user.name}</span>
                                                    {user.role === 'admin' && (
                                                        <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-600 text-[9px] px-1 py-0 h-4 rounded">Admin</Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500">{user.email}</span>
                                                <span className="text-[10px] text-slate-400">{user.creci}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-1">
                                            <Badge variant="secondary" className={`font-semibold rounded-md uppercase text-[10px] show-on-hover ${getPlanBadgeStyle(user.plan)}`}>
                                                {user.plan}
                                            </Badge>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-slate-400" onClick={() => { setSelectedUser(user); setIsEditPlanOpen(true); }}>
                                                Alterar
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {user.cidade ? `${user.cidade}${user.estado ? '/' + user.estado : ''}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        <div className="flex items-center justify-center gap-1.5 bg-slate-100 rounded-full px-2 py-0.5 w-fit mx-auto cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => { setSelectedUser(user); setIsManageCreditsOpen(true); }}>
                                            <Coins className="w-3 h-3 text-amber-500" />
                                            {user.credits}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium text-slate-700">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(user.investment)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium gap-1.5 ${getStatusBadgeStyle(user.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            {getStatusLabel(user.status)}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsEditUserOpen(true); }}>
                                                    <Pencil className="w-4 h-4 mr-2" /> Editar Dados
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsManageCreditsOpen(true); }}>
                                                    <Coins className="w-4 h-4 mr-2" /> Gerenciar Créditos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsEditPlanOpen(true); }}>
                                                    <CreditCard className="w-4 h-4 mr-2" /> Alterar Plano
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsAdminToggleDialogOpen(true); }}>
                                                    {user.role === 'admin' ? (
                                                        <><Lock className="w-4 h-4 mr-2" /> Remover Admin</>
                                                    ) : (
                                                        <><Unlock className="w-4 h-4 mr-2" /> Promover a Admin</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsBlockDialogOpen(true); }}>
                                                    {user.status === 'blocked' ? (
                                                        <><Unlock className="w-4 h-4 mr-2 text-green-600" /> Desbloquear</>
                                                    ) : (
                                                        <><Ban className="w-4 h-4 mr-2 text-amber-600" /> Bloquear</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Conta
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Footer */}
                {!loading && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 bg-slate-50/30">
                        <div className="text-sm text-slate-500">
                            Total de <span className="font-medium text-slate-900">{filteredUsers.length}</span> usuários
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <EditUserDialog
                user={selectedUser}
                open={isEditUserOpen}
                onOpenChange={setIsEditUserOpen}
                onUserUpdated={fetchUsers}
            />

            <ManageCreditsDialog
                user={selectedUser}
                open={isManageCreditsOpen}
                onOpenChange={setIsManageCreditsOpen}
                onUserUpdated={fetchUsers}
            />

            <EditPlanDialog
                user={selectedUser}
                open={isEditPlanOpen}
                onOpenChange={setIsEditPlanOpen}
                onUserUpdated={fetchUsers}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Excluir usuário permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é irreversível. O usuário <span className="font-bold">{selectedUser?.name}</span> será removido do sistema, incluindo login, relatórios salvos e histórico.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Block Confirmation */}
            <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{selectedUser?.status === 'blocked' ? 'Desbloquear Usuário' : 'Bloquear Usuário'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedUser?.status === 'blocked'
                                ? `Deseja realmente desbloquear ${selectedUser?.name}? Ele voltará a ter acesso à plataforma.`
                                : `Deseja bloquear o acesso de ${selectedUser?.name} à plataforma? Ele não conseguirá mais fazer login.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleBlock} className={selectedUser?.status === 'blocked' ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}>
                            {selectedUser?.status === 'blocked' ? 'Confirmar Desbloqueio' : 'Confirmar Bloqueio'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Admin Toggle Confirmation */}
            <AlertDialog open={isAdminToggleDialogOpen} onOpenChange={setIsAdminToggleDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Alterar Permissões de Administrador</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedUser?.role === 'admin'
                                ? `Deseja remover as permissões de administrador de ${selectedUser?.name}?`
                                : `Deseja promover ${selectedUser?.name} a administrador? Ele terá acesso total ao painel.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleAdmin} className="bg-indigo-600 hover:bg-indigo-700">
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
