import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, TrendingUp, Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

// Mock Data
const userGrowthData = [
    { month: 'Jan', users: 10 },
    { month: 'Fev', users: 15 },
    { month: 'Mar', users: 35 },
    { month: 'Abr', users: 48 },
    { month: 'Mai', users: 65 },
    { month: 'Jun', users: 80 },
];

const revenueData = [
    { week: 'Sem 1', revenue: 1200, projected: 1500 },
    { week: 'Sem 2', revenue: 1900, projected: 2200 },
    { week: 'Sem 3', revenue: 3500, projected: 3000 },
    { week: 'Sem 4', revenue: 2100, projected: 2400 },
    { week: 'Sem 5', revenue: 2800, projected: 3100 },
    { week: 'Sem 6', revenue: 3200, projected: 3400 },
    { week: 'Sem 7', revenue: 1500, projected: 1800 },
    { week: 'Sem 8', revenue: 2600, projected: 2900 },
];

const planData = [
    { name: 'Pacote GO', value: 75, color: '#3b82f6' },
    { name: 'Pacote PRO', value: 20, color: '#e5e7eb' },
    { name: 'Pacote START', value: 5, color: '#9ca3af' },
];

export const DashboardOverview = () => {
    const [date, setDate] = useState<Date>();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <Card className="p-4 border-slate-200 shadow-sm bg-white">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Receita</label>
                        <Select defaultValue="mensal">
                            <SelectTrigger className="w-[140px] h-9 text-sm bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mensal">Mensal</SelectItem>
                                <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Relatórios</label>
                        <Select defaultValue="atual">
                            <SelectTrigger className="w-[140px] h-9 text-sm bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="atual">Mês Atual</SelectItem>
                                <SelectItem value="anterior">Mês Anterior</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Categoria</label>
                        <Select defaultValue="todos">
                            <SelectTrigger className="w-[160px] h-9 text-sm bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os Planos</SelectItem>
                                <SelectItem value="ativos">Apenas Ativos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1 flex-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Customizado</label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={`w-full h-9 justify-start text-left font-normal bg-slate-50 border-slate-200 ${!date && "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700">
                                <Filter className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="TOTAL DE USUÁRIOS"
                    value="6"
                    change="+12%"
                    trend="up"
                    chartColor="#3b82f6"
                    data={[10, 15, 25, 20, 30, 45, 40]}
                />
                <KPICard
                    title="ASSINATURAS ATIVAS"
                    value="4"
                    change="+5%"
                    trend="up"
                    chartColor="#8b5cf6"
                    data={[4, 4, 3, 5, 4, 6, 7]}
                />
                <KPICard
                    title="RECEITA TOTAL"
                    value="R$ 0,10"
                    change="-2%"
                    trend="down"
                    chartColor="#10b981"
                    data={[100, 120, 110, 130, 100, 90, 80]}
                />
                <KPICard
                    title="TAXA DE CONVERSÃO"
                    value="0.0%"
                    change="Estável"
                    trend="neutral"
                    chartColor="#f59e0b"
                    data={[0, 0, 0, 0, 0, 0, 0]}
                    isProgress
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* User Growth Chart */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold text-slate-800">Crescimento de Usuários</CardTitle>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <div className="flex gap-0.5">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                </div>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={userGrowthData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            itemStyle={{ color: '#1e293b' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorUsers)"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            dy={10}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Chart */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold text-slate-800">Receita no Período</CardTitle>
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                PROJETADO
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData} barSize={32}>
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                        <Bar dataKey="revenue" radius={[4, 4, 4, 4]}>
                                            {revenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : '#f1f5f9'} />
                                            ))}
                                        </Bar>
                                        <XAxis
                                            dataKey="week"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            dy={10}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Plan Distribution */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-800">Distribuição por Plano</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={planData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {planData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-900">100%</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ATIVOS</span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-4">
                                {planData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-medium text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper Component for KPI Cards
const KPICard = ({ title, value, change, trend, chartColor, data, isProgress }: any) => {
    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-nowrap">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                    </div>
                    <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                            trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                        {trend === 'down' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                </div>

                <div className="h-10 w-full">
                    {isProgress ? (
                        <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: '30%' }} />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.map((v: any, i: any) => ({ i, v }))}>
                                <Line
                                    type="monotone"
                                    dataKey="v"
                                    stroke={chartColor}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
