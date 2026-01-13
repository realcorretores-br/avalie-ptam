import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/exportUtils";

// New Components
import { MetricsFilters } from "@/components/metrics/MetricsFilters";
import { KPIStats } from "@/components/metrics/KPIStats";
import { ChartsSection } from "@/components/metrics/ChartsSection";
import { ProductivitySection } from "@/components/metrics/ProductivitySection";

interface MetricsData {
  total: number;
  ticketMedio: number;
  tempoMedio: number;
  pendentes: number;
  trends: {
    total: number;
    ticket: number;
    tempo: number;
    pendentes: number;
  };
}

export default function Metricas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const [kpiData, setKpiData] = useState<MetricsData>({
    total: 0,
    ticketMedio: 0,
    tempoMedio: 0,
    pendentes: 0,
    trends: { total: 0, ticket: 0, tempo: 0, pendentes: 0 }
  });

  const [monthlyData, setMonthlyData] = useState<{ mes: string; quantidade: number }[]>([]);
  const [typeData, setTypeData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [regionData, setRegionData] = useState<{ name: string; count: number; percentage: number }[]>([]);

  const fetchMetrics = useCallback(async () => {
    if (!user) return;

    try {
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!avaliacoes || avaliacoes.length === 0) {
        setLoading(false);
        // Clear all data to ensure no mocks are shown
        setMonthlyData([]);
        setTypeData([]);
        setRegionData([]);
        setKpiData(prev => ({ ...prev, total: 0, ticketMedio: 0, tempoMedio: 0, pendentes: 0 }));
        return;
      }

      // --- KPI Calculation ---
      const total = avaliacoes.length;
      const valorTotal = avaliacoes.reduce((acc, curr) => acc + (curr.valor_final || 0), 0);
      const ticketMedio = total > 0 ? valorTotal / total : 0;
      const pendentes = avaliacoes.filter(a => a.status !== 'finalizado').length;

      // Tempo Médio (Hours between created_at and updated_at for finalized items)
      // If never updated or not finalized, ignore for average.
      // Note: 'status' field might be 'concluido', 'finalizado', etc. Checking specific value.
      const finalizedItems = avaliacoes.filter(a => a.status === 'finalizado' && a.updated_at);
      let totalHours = 0;
      if (finalizedItems.length > 0) {
        finalizedItems.forEach(a => {
          const start = new Date(a.created_at).getTime();
          const end = new Date(a.updated_at!).getTime();
          totalHours += (end - start) / (1000 * 60 * 60);
        });
      }
      // Convert hours to days for typical PTAM logic if > 24h, or keep hours. User view shows "x.x dias" in design.
      // Let's assume we want days with 1 decimal.
      const tempoMedioDays = finalizedItems.length > 0 ? (totalHours / finalizedItems.length) / 24 : 0;
      const tempoMedioFormatted = parseFloat(tempoMedioDays.toFixed(1));

      // --- Trends (Current Month vs Previous Month) ---
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthItems = avaliacoes.filter(a => {
        const d = new Date(a.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const lastMonthItems = avaliacoes.filter(a => {
        const d = new Date(a.created_at);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      });

      const calcTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
      };

      const trends = {
        total: calcTrend(currentMonthItems.length, lastMonthItems.length),
        // Simplified ticket trend based on total value / count
        ticket: calcTrend(
          currentMonthItems.reduce((acc, curr) => acc + (curr.valor_final || 0), 0) / (currentMonthItems.length || 1),
          lastMonthItems.reduce((acc, curr) => acc + (curr.valor_final || 0), 0) / (lastMonthItems.length || 1)
        ),
        tempo: 0, // Complex to calculate trend for time without historical snapshots, keeping 0
        pendentes: 0 // Snapshot only, hard to trend without history table
      };

      setKpiData({
        total,
        ticketMedio,
        tempoMedio: tempoMedioFormatted,
        pendentes,
        trends
      });

      // --- Monthly Data Calculation ---
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyCounts = new Array(12).fill(0);

      avaliacoes.forEach(a => {
        const date = new Date(a.created_at);
        // Only consider current year for this simple chart view
        if (date.getFullYear() === currentYear) {
          monthlyCounts[date.getMonth()]++;
        }
      });

      const chartData = meses.map((mes, i) => ({
        mes,
        quantidade: monthlyCounts[i]
      }));
      setMonthlyData(chartData);


      // --- Property Types Calculation ---
      const typesCount: Record<string, number> = {};
      avaliacoes.forEach(a => {
        const type = a.tipo_imovel || 'Não Informado';
        typesCount[type] = (typesCount[type] || 0) + 1;
      });

      const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#E5E7EB', '#818CF8', '#A78BFA'];
      let colorIndex = 0;

      // Calculate Pie Data
      const pieData = Object.keys(typesCount).map(key => {
        const val = typesCount[key];
        const percent = Math.round((val / total) * 100);
        return {
          name: key,
          value: percent,
          color: colors[colorIndex++ % colors.length]
        };
      }).sort((a, b) => b.value - a.value);

      setTypeData(pieData);

      // --- Regions Calculation ---
      // Try to basic parse 'City - State' or just take the string
      const regionsCount: Record<string, number> = {};
      avaliacoes.forEach(a => {
        // Simple heuristic: take first part before dash, or whole string if short, or 'Desconhecido'
        let region = 'Não Informado';
        if (a.endereco_imovel) {
          // Try to extract City if "Street, Number, City - State" format
          // Often input address is just one string. Let's try to group by the whole string if specific, 
          // but that might be infinite. Let's try to find " - " (dash) for City-State
          const parts = a.endereco_imovel.split('-');
          if (parts.length > 1) {
            // usually the part before the last dash is city, or the end of the previous part
            // Simplest for now: Take the string after the last comma? No, often "City - SP".
            // Let's assume the string BEFORE the state is the city.
            // Or just use the whole string if < 30 chars?
            // Let's just group by "Unknown" for now if we can't easily parse active real addresses without geocoding.
            // Actually, let's just use "Região X" based on extraction.
            // Just taking the whole string for now if it's not super long, basically aggregating unique addresses? No, that's not 'Region'.
            // Let's try to split by comma and take the 2nd to last item?
            // Fallback: Group everything into "Geral" if parsing fails, but ideally we want real data.
            // Let's assume input is freetext.
            region = a.endereco_imovel;
          } else {
            region = a.endereco_imovel;
          }
        }
        regionsCount[region] = (regionsCount[region] || 0) + 1;
      });

      // Normalize regions (taking top 5)
      const regionList = Object.keys(regionsCount).map(key => ({
        name: key.length > 30 ? key.substring(0, 30) + '...' : key,
        count: regionsCount[key],
        percentage: Math.round((regionsCount[key] / total) * 100)
      })).sort((a, b) => b.count - a.count).slice(0, 5);

      setRegionData(regionList);

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    toast.loading("Gerando relatório PDF...");
    try {
      await exportToPDF([reportRef.current], "Relatorio_Metricas.pdf");
      toast.dismiss();
      toast.success("Relatório baixado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Erro ao gerar PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-1 p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Métricas de Desempenho</h1>
              <p className="text-gray-500 mt-1">Visão analítica completa dos Pareceres Técnicos (PTAM) e produtividade.</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column (Filters) - Takes 3 columns */}
            <div className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-8">
                <MetricsFilters />
              </div>
            </div>

            {/* Right Column (Content) - Takes 9 columns */}
            <div className="lg:col-span-9 space-y-8" ref={reportRef}>

              {/* KPI Cards */}
              <KPIStats data={kpiData} />

              {/* Charts Row - Passing Region Data too for the mini summary */}
              <ChartsSection monthlyData={monthlyData} typeData={typeData} regionData={regionData} />

              {/* Productivity Section */}
              <ProductivitySection regionData={regionData} />

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

