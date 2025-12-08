import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, TrendingUp, Download, Send, Edit, UserPlus, UserMinus, Ban, Unlock, Trash2, DollarSign, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { AdjustReportsDialog } from "@/components/admin/AdjustReportsDialog";
import { PromoteToAdminDialog } from "@/components/admin/PromoteToAdminDialog";
import { RemoveAdminDialog } from "@/components/admin/RemoveAdminDialog";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";
import { ChangeSubscriptionDialog } from "@/components/admin/ChangeSubscriptionDialog";
import { AddSubscriptionDialog } from "@/components/admin/AddSubscriptionDialog";
import { BlockUserDialog } from "@/components/admin/BlockUserDialog";
import { UnblockUserDialog } from "@/components/admin/UnblockUserDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { exportToExcel } from "@/lib/excelExport";
import { LineChart, Line, BarChart as RechartsBar, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  nome_completo: string;
  created_at: string;
  cidade: string;
  estado: string;
  data_ultimo_relatorio?: string;
  bloqueado_ate?: string;
  isAdmin?: boolean;
  subscription?: {
    id: string;
    plan_id: string;
    relatorios_disponiveis: number;
    relatorios_usados: number;
  } | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  relatorios_usados: number;
  relatorios_disponiveis: number;
  saldo_acumulado: number;
  data_inicio: string;
  data_expiracao: string;
  data_saldo_expira?: string;
  plano_anterior_id?: string;
  created_at: string;
  profiles: {
    nome_completo: string;
    email: string;
  } | null;
  plans: {
    nome: string;
    preco: number;
    tipo: string;
  } | null;
}

interface Plan {
  id: string;
  nome: string;
  tipo: string;
  preco: number;
  relatorios_incluidos: number;
  ativo: boolean;
}

interface AdminLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string | null;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [reportsPurchases, setReportsPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [revenueFilter, setRevenueFilter] = useState<'mensal' | 'semanal' | 'diario'>('mensal');
  const [reportFilter, setReportFilter] = useState<'ano' | 'mes_passado' | 'mes_atual' | '7_dias'>('mes_atual');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'usuarios' | 'assinaturas' | 'receita'>('todos');
  const [cidadeFilter, setCidadeFilter] = useState('');

  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [] as { period: string; users: number }[],
    revenue: [] as { period: string; revenue: number }[],
    planDistribution: [] as { name: string; value: number }[],
    metrics: {
      totalUsers: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      conversionRate: 0
    }
  });

  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState({ open: false, userId: '' });
  const [adjustReportsDialog, setAdjustReportsDialog] = useState({ open: false, userId: '', userName: '' });
  const [promoteDialog, setPromoteDialog] = useState({ open: false, userId: '', userName: '' });
  const [removeAdminDialog, setRemoveAdminDialog] = useState({ open: false, userId: '', userName: '' });
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [changeSubscriptionDialog, setChangeSubscriptionDialog] = useState({
    open: false,
    subscriptionId: '',
    userId: '',
    userName: ''
  });
  const [addSubscriptionDialog, setAddSubscriptionDialog] = useState({
    open: false,
    userId: '',
    userName: ''
  });
  const [blockUserDialog, setBlockUserDialog] = useState({ open: false, userId: '', userName: '' });
  const [unblockUserDialog, setUnblockUserDialog] = useState({ open: false, userId: '', userName: '' });
  const [deleteUserDialog, setDeleteUserDialog] = useState({ open: false, userId: '', userName: '' });



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users with additional fields and subscriptions
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id, email, nome_completo, created_at, cidade, estado, data_ultimo_relatorio, bloqueado_ate,
          subscriptions!subscriptions_user_id_fkey (
            id,
            plan_id,
            relatorios_disponiveis,
            relatorios_usados,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Check admin roles and format subscriptions
      const usersWithRoles = await Promise.all(
        (usersData || []).map(async (user: any) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          // Get active subscription
          const activeSub = Array.isArray(user.subscriptions)
            ? user.subscriptions.find((s: any) => s.status === 'active')
            : null;

          return {
            ...user,
            isAdmin: !!roleData,
            subscription: activeSub ? {
              id: activeSub.id,
              plan_id: activeSub.plan_id,
              relatorios_disponiveis: activeSub.relatorios_disponiveis,
              relatorios_usados: activeSub.relatorios_usados,
            } : null
          };
        })
      );

      setUsers(usersWithRoles);

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!subscriptions_user_id_fkey (
            nome_completo,
            email
          ),
          plans (
            nome,
            preco,
            tipo
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;
      setSubscriptions(subsData as any || []);

      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('preco', { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch admin logs
      const { data: logsData, error: logsError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setAdminLogs(logsData || []);

      // Fetch additional reports purchases
      const { data: reportsData, error: reportsError } = await supabase
        .from('additional_reports_purchases')
        .select('*')
        .eq('payment_status', 'approved') // Assuming 'approved' is the status for successful payments
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports purchases:', reportsError);
      }
      setReportsPurchases(reportsData || []);

      calculateAnalytics(usersWithRoles || [], subsData as any || [], reportsData || []);

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error(`Erro ao carregar dados: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const [appliedRange, setAppliedRange] = useState<{ start: string; end: string } | null>(null);

  const handleApplyCustomRange = () => {
    if (customDateStart && customDateEnd) {
      setAppliedRange({ start: customDateStart, end: customDateEnd });
    }
  };

  // Helper to generate periods based on range and granularity
  const generatePeriods = (start: Date, end: Date, granularity: 'mensal' | 'semanal' | 'diario') => {
    const periods: { start: Date; end: Date; label: string }[] = [];
    const current = new Date(start);

    while (current <= end) {
      let pStart = new Date(current);
      let pEnd = new Date(current);
      let label = '';

      if (granularity === 'mensal') {
        pStart.setDate(1);
        pEnd = new Date(pStart.getFullYear(), pStart.getMonth() + 1, 0, 23, 59, 59);
        label = `${pStart.toLocaleString('pt-BR', { month: 'short' })}/${pStart.getFullYear().toString().slice(2)}`;
        current.setMonth(current.getMonth() + 1);
      } else if (granularity === 'semanal') {
        // Adjust to start of week (Sunday) if needed, or just chunks of 7 days
        pEnd.setDate(pStart.getDate() + 6);
        pEnd.setHours(23, 59, 59);
        label = `${pStart.getDate()}/${pStart.getMonth() + 1}`;
        current.setDate(current.getDate() + 7);
      } else { // diario
        pEnd.setHours(23, 59, 59);
        label = `${pStart.getDate()}/${pStart.getMonth() + 1}`;
        current.setDate(current.getDate() + 1);
      }

      // Cap end date
      if (pEnd > end) pEnd = new Date(end);

      periods.push({ start: pStart, end: pEnd, label });
    }
    return periods;
  };

  const calculateAnalytics = (
    currentUsers: User[] = users,
    currentSubs: Subscription[] = subscriptions,
    currentReports: any[] = [],
    customRange: { start: string; end: string } | null = appliedRange
  ) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // 1. Determine Time Range (Priority: Custom > Report > Revenue Default)
    if (customRange) {
      startDate = new Date(customRange.start);
      endDate = new Date(customRange.end);
      endDate.setHours(23, 59, 59);
    } else {
      // Report Filter Priority
      switch (reportFilter) {
        case 'ano':
          startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st
          endDate = now;
          break;
        case 'mes_passado':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case 'mes_atual':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case '7_dias':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }
    }

    // 2. Determine Granularity (Revenue Filter)
    const granularity = revenueFilter;

    // 3. Generate Periods
    const periods = generatePeriods(startDate, endDate, granularity);

    // 4. Filter Data by Range (for Totals)
    const filteredUsers = currentUsers.filter(u => {
      const d = new Date(u.created_at);
      return d >= startDate && d <= endDate;
    });

    // Active Subscriptions: Must be active AND created within the period (or active during? User said "Conta apenas assinaturas ativas dentro do período selecionado")
    // Usually "Active Subscriptions" is a snapshot. But if we filter by period, it implies "New Active Subs" or "Subs active at that time".
    // Given the conversion rate formula (subs converted in period / users active in period), let's stick to "Created in period and currently active" or just "Created in period".
    // If we use "Created in period", it matches the sales view.
    const filteredSubs = currentSubs.filter(s => {
      const d = new Date(s.created_at);
      return d >= startDate && d <= endDate;
    });

    const filteredReports = currentReports.filter(r => {
      const d = new Date(r.created_at);
      return d >= startDate && d <= endDate;
    });

    // 5. Calculate Totals
    const totalUsers = currentUsers.length; // Show total users in DB, not just in period
    const activeSubscriptions = currentSubs.length; // Show total active subs

    const revenueFromSubs = filteredSubs.reduce((sum, s) => sum + (s.plans?.preco || 0), 0);
    const revenueFromReports = filteredReports.reduce((sum, r) => sum + (r.total_price || r.amount || 0), 0);
    const totalRevenue = revenueFromSubs + revenueFromReports;

    // Conversion Rate: (assinaturas convertidas no período) / (usuários ativos no período)
    // Assuming "usuários ativos no período" means "users created in the period" (new users) for a conversion funnel.
    // If it meant "Total Active Users in system", the formula would be different.
    // Based on "Growth" context, it's usually New Subs / New Users.
    const conversionRate = filteredUsers.length > 0 ? ((filteredSubs.length / filteredUsers.length) * 100) : 0;

    // 6. Generate Chart Data
    const userGrowth = periods.map(period => {
      const count = currentUsers.filter(u => {
        const date = new Date(u.created_at);
        return date >= period.start && date <= period.end;
      }).length;
      return { period: period.label, users: count };
    });

    const revenueChart = periods.map(period => {
      const subsAmount = currentSubs
        .filter(s => {
          const date = new Date(s.created_at);
          return date >= period.start && date <= period.end;
        })
        .reduce((sum, s) => sum + (s.plans?.preco || 0), 0);

      const reportsAmount = currentReports
        .filter(r => {
          const date = new Date(r.created_at);
          return date >= period.start && date <= period.end;
        })
        .reduce((sum, r) => sum + (r.total_price || r.amount || 0), 0);

      return { period: period.label, revenue: subsAmount + reportsAmount };
    });

    // 7. Plan Distribution
    const planCounts: Record<string, number> = {};
    filteredSubs.forEach(sub => {
      const name = sub.plans?.nome || 'Desconhecido';
      planCounts[name] = (planCounts[name] || 0) + 1;
    });
    const planDistribution = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

    setAnalyticsData({
      userGrowth,
      revenue: revenueChart,
      planDistribution,
      metrics: { totalUsers, activeSubscriptions, totalRevenue, conversionRate }
    });
  };

  // Update when filters change
  useEffect(() => {
    // Only recalculate if we have data
    if (users.length > 0 || subscriptions.length > 0) {
      calculateAnalytics(users, subscriptions, reportsPurchases, appliedRange);
    }
  }, [revenueFilter, reportFilter, appliedRange, users, subscriptions, reportsPurchases]); // Dependencies

  const handleExportToExcel = () => {
    exportToExcel(users, subscriptions);
    toast.success("Relatório exportado com sucesso");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Ativo", className: "bg-green-100 text-green-700 hover:bg-green-100" },
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
      expired: { label: "Expirado", className: "bg-red-100 text-red-700 hover:bg-red-100" },
      cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
    };

    const config = statusMap[status] || { label: status, className: "" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const isUserBlocked = (bloqueado_ate?: string) => {
    if (!bloqueado_ate) return false;
    return new Date(bloqueado_ate) > new Date();
  };

  const filteredUsers = users.filter(user =>
    !cidadeFilter || user.cidade?.toLowerCase().includes(cidadeFilter.toLowerCase())
  );

  // Helper for Category Visibility
  const showUsers = categoryFilter === 'todos' || categoryFilter === 'usuarios';
  const showSubs = categoryFilter === 'todos' || categoryFilter === 'assinaturas';
  const showRevenue = categoryFilter === 'todos' || categoryFilter === 'receita';

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, assinaturas e conteúdo
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportToExcel} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button onClick={() => setNotificationDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Enviar Notificação
            </Button>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Filtro de Receita (Granularidade)</label>
                  <Select value={revenueFilter} onValueChange={(v: any) => setRevenueFilter(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="diario">Diário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Filtro de Relatórios (Período)</label>
                  <Select value={reportFilter} onValueChange={(v: any) => {
                    setReportFilter(v);
                    setAppliedRange(null); // Reset custom range when report filter changes
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ano">Ano Atual</SelectItem>
                      <SelectItem value="mes_passado">Mês Passado</SelectItem>
                      <SelectItem value="mes_atual">Mês Atual</SelectItem>
                      <SelectItem value="7_dias">Últimos 7 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="usuarios">Usuários</SelectItem>
                      <SelectItem value="assinaturas">Assinaturas</SelectItem>
                      <SelectItem value="receita">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Período Customizado</label>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="date"
                      value={customDateStart}
                      onChange={(e) => setCustomDateStart(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="date"
                      value={customDateEnd}
                      onChange={(e) => setCustomDateEnd(e.target.value)}
                      className="w-full"
                    />
                    <Button size="sm" variant="outline" onClick={handleApplyCustomRange} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {showUsers && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                      <h3 className="text-2xl font-bold mt-2">{analyticsData.metrics.totalUsers}</h3>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </Card>
              )}

              {showSubs && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</p>
                      <h3 className="text-2xl font-bold mt-2">{analyticsData.metrics.activeSubscriptions}</h3>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                </Card>
              )}

              {showRevenue && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                      <h3 className="text-2xl font-bold mt-2">
                        R$ {analyticsData.metrics.totalRevenue.toFixed(2)}
                      </h3>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </Card>
              )}

              {showSubs && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                      <h3 className="text-2xl font-bold mt-2">
                        {analyticsData.metrics.conversionRate.toFixed(1)}%
                      </h3>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </Card>
              )}
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              {showUsers && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Crescimento de Usuários</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" name="Usuários" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {showRevenue && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Receita no Período</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBar data={analyticsData.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Receita (R$)" />
                    </RechartsBar>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>

            {showSubs && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Distribuição por Plano</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.planDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <div className="p-4 border-b">
                <Input
                  placeholder="Filtrar por cidade..."
                  value={cidadeFilter}
                  onChange={(e) => setCidadeFilter(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Último Relatório</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome_completo}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.cidade}, {user.estado}</TableCell>
                      <TableCell>
                        {user.data_ultimo_relatorio
                          ? new Date(user.data_ultimo_relatorio).toLocaleDateString('pt-BR')
                          : 'Nenhum'}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {isUserBlocked(user.bloqueado_ate) ? (
                          <Badge variant="destructive">
                            Bloqueado até {new Date(user.bloqueado_ate!).toLocaleDateString('pt-BR')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-700">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditUserDialog({ open: true, userId: user.id })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>

                          {/* Subscription Actions */}
                          {user.subscription ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Ajustar Relatórios"
                                onClick={() => setAdjustReportsDialog({
                                  open: true,
                                  userId: user.id,
                                  userName: user.nome_completo
                                })}
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Mudar Plano"
                                onClick={() => setChangeSubscriptionDialog({
                                  open: true,
                                  subscriptionId: user.subscription!.id,
                                  userId: user.id,
                                  userName: user.nome_completo
                                })}
                              >
                                <CreditCard className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              title="Adicionar Assinatura"
                              onClick={() => setAddSubscriptionDialog({
                                open: true,
                                userId: user.id,
                                userName: user.nome_completo
                              })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Admin Actions */}
                          <Button
                            size="sm"
                            variant={user.isAdmin ? "destructive" : "default"}
                            title={user.isAdmin ? "Remover Admin" : "Promover a Admin"}
                            onClick={() => {
                              if (user.isAdmin) {
                                setRemoveAdminDialog({
                                  open: true,
                                  userId: user.id,
                                  userName: user.nome_completo
                                });
                              } else {
                                setPromoteDialog({
                                  open: true,
                                  userId: user.id,
                                  userName: user.nome_completo
                                });
                              }
                            }}
                          >
                            {user.isAdmin ? <UserMinus className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Relatórios</TableHead>
                    <TableHead>Saldo Acumulado</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.profiles?.nome_completo || 'N/A'}
                      </TableCell>
                      <TableCell>{sub.plans?.nome || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        {sub.relatorios_usados} / {sub.relatorios_disponiveis}
                      </TableCell>
                      <TableCell>
                        {sub.saldo_acumulado > 0 && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            +{sub.saldo_acumulado}
                            {sub.data_saldo_expira && (
                              <span className="text-xs ml-1">
                                (expira em {new Date(sub.data_saldo_expira).toLocaleDateString('pt-BR')})
                              </span>
                            )}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.data_expiracao
                          ? new Date(sub.data_expiracao).toLocaleDateString('pt-BR')
                          : 'Sem expiração'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAdjustReportsDialog({
                              open: true,
                              userId: sub.user_id,
                              userName: sub.profiles?.nome_completo || ''
                            })}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Ajustar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setChangeSubscriptionDialog({
                              open: true,
                              subscriptionId: sub.id,
                              userId: sub.user_id,
                              userName: sub.profiles?.nome_completo || ''
                            })}
                          >
                            Mudar Plano
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{plan.nome}</h3>
                        <Badge variant={plan.ativo ? "default" : "secondary"}>
                          {plan.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">R$ {plan.preco.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.relatorios_incluidos} relatórios incluídos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {plan.tipo}
                      </p>
                      <p className="text-sm">
                        {subscriptions.filter(s => s.plan_id === plan.id).length} assinantes
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <pre className="text-xs max-w-md overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </TableCell>
                      <TableCell>{log.ip_address || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <EditUserDialog
        open={editUserDialog.open}
        onOpenChange={(open) => setEditUserDialog({ ...editUserDialog, open })}
        userId={editUserDialog.userId}
        onSuccess={fetchData}
      />

      <AdjustReportsDialog
        open={adjustReportsDialog.open}
        onOpenChange={(open) => setAdjustReportsDialog({ ...adjustReportsDialog, open })}
        userId={adjustReportsDialog.userId}
        userName={adjustReportsDialog.userName}
        currentSubscription={users.find(u => u.id === adjustReportsDialog.userId)?.subscription
          ? {
            id: users.find(u => u.id === adjustReportsDialog.userId)!.subscription!.id,
            relatorios_disponiveis: users.find(u => u.id === adjustReportsDialog.userId)!.subscription!.relatorios_disponiveis,
            relatorios_usados: users.find(u => u.id === adjustReportsDialog.userId)!.subscription!.relatorios_usados,
          }
          : null}
        onSuccess={fetchData}
      />

      <PromoteToAdminDialog
        open={promoteDialog.open}
        onOpenChange={(open) => setPromoteDialog({ ...promoteDialog, open })}
        userId={promoteDialog.userId}
        userName={promoteDialog.userName}
        onSuccess={fetchData}
      />

      <RemoveAdminDialog
        open={removeAdminDialog.open}
        onOpenChange={(open) => setRemoveAdminDialog({ ...removeAdminDialog, open })}
        userId={removeAdminDialog.userId}
        userName={removeAdminDialog.userName}
        onSuccess={fetchData}
      />

      <SendNotificationDialog
        open={notificationDialog}
        onOpenChange={setNotificationDialog}
      />

      <ChangeSubscriptionDialog
        open={changeSubscriptionDialog.open}
        onOpenChange={(open) => setChangeSubscriptionDialog({ ...changeSubscriptionDialog, open })}
        userId={changeSubscriptionDialog.userId}
        userName={changeSubscriptionDialog.userName}
        currentSubscription={users.find(u => u.id === changeSubscriptionDialog.userId)?.subscription
          ? {
            id: users.find(u => u.id === changeSubscriptionDialog.userId)!.subscription!.id,
            plan_id: users.find(u => u.id === changeSubscriptionDialog.userId)!.subscription!.plan_id,
            relatorios_usados: users.find(u => u.id === changeSubscriptionDialog.userId)!.subscription!.relatorios_usados,
            relatorios_disponiveis: users.find(u => u.id === changeSubscriptionDialog.userId)!.subscription!.relatorios_disponiveis,
          }
          : null}
        onSuccess={fetchData}
      />

      <AddSubscriptionDialog
        open={addSubscriptionDialog.open}
        onOpenChange={(open) => setAddSubscriptionDialog({ ...addSubscriptionDialog, open })}
        userId={addSubscriptionDialog.userId}
        userName={addSubscriptionDialog.userName}
        onSuccess={fetchData}
      />

      <BlockUserDialog
        open={blockUserDialog.open}
        onOpenChange={(open) => setBlockUserDialog({ ...blockUserDialog, open })}
        userId={blockUserDialog.userId}
        userName={blockUserDialog.userName}
        onSuccess={fetchData}
      />

      <UnblockUserDialog
        open={unblockUserDialog.open}
        onOpenChange={(open) => setUnblockUserDialog({ ...unblockUserDialog, open })}
        userId={unblockUserDialog.userId}
        userName={unblockUserDialog.userName}
        onSuccess={fetchData}
      />

      <DeleteUserDialog
        open={deleteUserDialog.open}
        onOpenChange={(open) => setDeleteUserDialog({ ...deleteUserDialog, open })}
        userId={deleteUserDialog.userId}
        userName={deleteUserDialog.userName}
        onSuccess={fetchData}
      />
    </AdminLayout>
  );
};

export default Admin;