import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  planDistribution: Array<{ name: string; value: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AdminMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    planDistribution: [],
    userGrowth: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários novos este mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Receita total e deste mês
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, plans(preco)')
        .eq('status', 'active');

      let totalRevenue = 0;
      let revenueThisMonth = 0;

      subscriptions?.forEach((sub: any) => {
        const price = sub.plans?.preco || 0;
        totalRevenue += price;
        
        const subDate = new Date(sub.created_at);
        if (subDate >= startOfMonth) {
          revenueThisMonth += price;
        }
      });

      // Distribuição de planos
      const { data: planData } = await supabase
        .from('subscriptions')
        .select('plan_id, plans(nome)')
        .eq('status', 'active');

      const planCounts: Record<string, number> = {};
      planData?.forEach((sub: any) => {
        const planName = sub.plans?.nome || 'Sem Plano';
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      });

      const planDistribution = Object.entries(planCounts).map(([name, value]) => ({
        name,
        value
      }));

      // Crescimento de usuários (últimos 6 meses)
      const userGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', monthEnd.toISOString());

        userGrowth.push({
          month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
          users: count || 0
        });
      }

      // Receita mensal (últimos 6 meses)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const { data: monthSubs } = await supabase
          .from('subscriptions')
          .select('*, plans(preco)')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
          .eq('status', 'active');

        const revenue = monthSubs?.reduce((sum: number, sub: any) => sum + (sub.plans?.preco || 0), 0) || 0;

        monthlyRevenue.push({
          month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
          revenue
        });
      }

      setMetrics({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalRevenue,
        revenueThisMonth,
        planDistribution,
        userGrowth,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
              <h3 className="text-2xl font-bold">{metrics.totalUsers}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                +{metrics.newUsersThisMonth} este mês
              </p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <h3 className="text-2xl font-bold">R$ {metrics.totalRevenue.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {metrics.revenueThisMonth.toFixed(2)} este mês
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</p>
              <h3 className="text-2xl font-bold">{metrics.planDistribution.reduce((sum, p) => sum + p.value, 0)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Total de planos ativos</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Crescimento de Usuários */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Crescimento de Usuários</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" name="Usuários" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Receita Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Receita (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Distribuição de Planos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Planos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metrics.planDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {metrics.planDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
