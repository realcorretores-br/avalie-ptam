<<<<<<< HEAD
import { useEffect, useState, useCallback } from "react";
=======
import { useEffect, useState } from "react";
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ArrowLeft, TrendingUp, FileText, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Metrics {
  totalAvaliacoes: number;
  avaliacoesUltimos30Dias: number;
  valorTotalAvaliado: number;
  tempoMedioAvaliacao: number;
  avaliacoesPorMes: { mes: string; quantidade: number }[];
}

const Metricas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({
    totalAvaliacoes: 0,
    avaliacoesUltimos30Dias: 0,
    valorTotalAvaliado: 0,
    tempoMedioAvaliacao: 0,
    avaliacoesPorMes: [],
  });
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD


  const fetchMetrics = useCallback(async () => {
=======
  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    if (!user) return;

    try {
      // Buscar todas as avaliações do usuário
      const { data: avaliacoes, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!avaliacoes) {
        setLoading(false);
        return;
      }

      // Calcular métricas
      const totalAvaliacoes = avaliacoes.length;

      // Avaliações nos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const avaliacoesUltimos30Dias = avaliacoes.filter(
        (av) => new Date(av.created_at!) > thirtyDaysAgo
      ).length;

      // Valor total avaliado
      const valorTotalAvaliado = avaliacoes.reduce(
        (sum, av) => sum + (av.valor_final || 0),
        0
      );

      // Tempo médio de avaliação (estimativa: tempo entre criação e última atualização)
      const temposAvaliacao = avaliacoes
        .filter((av) => av.updated_at && av.created_at)
        .map((av) => {
          const created = new Date(av.created_at!).getTime();
          const updated = new Date(av.updated_at!).getTime();
          return Math.round((updated - created) / (1000 * 60 * 60)); // em horas
        });
      const tempoMedioAvaliacao =
        temposAvaliacao.length > 0
          ? Math.round(
<<<<<<< HEAD
            temposAvaliacao.reduce((a, b) => a + b, 0) / temposAvaliacao.length
          )
=======
              temposAvaliacao.reduce((a, b) => a + b, 0) / temposAvaliacao.length
            )
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
          : 0;

      // Avaliações por mês (últimos 6 meses)
      const avaliacoesPorMes: { mes: string; quantidade: number }[] = [];
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
<<<<<<< HEAD

=======
      
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mesIndex = date.getMonth();
        const ano = date.getFullYear();
<<<<<<< HEAD

=======
        
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
        const quantidade = avaliacoes.filter((av) => {
          const avDate = new Date(av.created_at!);
          return avDate.getMonth() === mesIndex && avDate.getFullYear() === ano;
        }).length;

        avaliacoesPorMes.push({
          mes: `${meses[mesIndex]}/${ano.toString().slice(2)}`,
          quantidade,
        });
      }

      setMetrics({
        totalAvaliacoes,
        avaliacoesUltimos30Dias,
        valorTotalAvaliado,
        tempoMedioAvaliacao,
        avaliacoesPorMes,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user, fetchMetrics]);
=======
  };
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">PTAM</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Métricas e Estatísticas</h1>
            <p className="text-muted-foreground">
              Acompanhe seu desempenho e estatísticas de uso
            </p>
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                  <p className="text-2xl font-bold">{metrics.totalAvaliacoes}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Últimos 30 Dias</p>
                  <p className="text-2xl font-bold">{metrics.avaliacoesUltimos30Dias}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total Avaliado</p>
                  <p className="text-2xl font-bold">
                    R$ {(metrics.valorTotalAvaliado / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">{metrics.tempoMedioAvaliacao}h</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráfico de Avaliações por Mês */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Avaliações por Mês</h2>
            <div className="space-y-4">
              {metrics.avaliacoesPorMes.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-20">{item.mes}</span>
                  <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-primary h-full flex items-center justify-end pr-3 transition-all"
                      style={{
<<<<<<< HEAD
                        width: `${metrics.totalAvaliacoes > 0
                          ? (item.quantidade / metrics.totalAvaliacoes) * 100
                          : 0
                          }%`,
=======
                        width: `${
                          metrics.totalAvaliacoes > 0
                            ? (item.quantidade / metrics.totalAvaliacoes) * 100
                            : 0
                        }%`,
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                        minWidth: item.quantidade > 0 ? '40px' : '0',
                      }}
                    >
                      {item.quantidade > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {item.quantidade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Estatísticas Adicionais */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Tempo Economizado</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium">Tempo economizado com automação</p>
                  <p className="text-sm text-muted-foreground">
                    Estimativa baseada em tempo médio manual de 8 horas por avaliação
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {(metrics.totalAvaliacoes * 6).toFixed(0)}h
                  </p>
                  <p className="text-sm text-muted-foreground">economizadas</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Produtividade</p>
                  <p className="text-sm text-muted-foreground">
                    Redução de {((6 / 8) * 100).toFixed(0)}% no tempo de trabalho
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-secondary">
                    {((metrics.totalAvaliacoes * 6) / 8).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">dias economizados</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Metricas;
