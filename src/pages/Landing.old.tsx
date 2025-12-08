import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Calculator, TrendingUp, CheckCircle, Building2, LineChart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  preco: number;
  relatorios_incluidos: number | null;
}

const Landing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('ativo', true)
        .order('preco');
      
      if (data) setPlans(data);
    };

    fetchPlans();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">PTAM</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <button onClick={() => scrollToSection('inicio')} className="text-sm font-medium hover:text-primary transition-colors">
              Início
            </button>
            <button onClick={() => scrollToSection('funcionalidades')} className="text-sm font-medium hover:text-primary transition-colors">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection('como-funciona')} className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('planos')} className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </button>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
          </nav>
          <div className="flex gap-2">
            <Link to="/login" className="md:hidden">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm" className="md:text-base md:h-10">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="py-20 md:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Avaliações Imobiliárias com Precisão e Simplicidade
              </h1>
              <p className="text-xl text-muted-foreground">
                Crie laudos automáticos e gerencie suas avaliações com os três métodos oficiais PTAM.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cadastro">
                  <Button size="lg" className="w-full sm:w-auto">
                    Começar Agora
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => scrollToSection('planos')}>
                  Ver Planos
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-8 shadow-2xl">
                <div className="aspect-video rounded-lg bg-background flex items-center justify-center">
                  <Building2 className="h-32 w-32 text-primary/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Funcionalidades</h2>
            <p className="text-xl text-muted-foreground">Tudo que você precisa para avaliações profissionais</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comparativo Direto</h3>
              <p className="text-muted-foreground">
                Compare imóveis similares e obtenha laudos automáticos com base em dados de mercado.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Calculator className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Método Evolutivo</h3>
              <p className="text-muted-foreground">
                Calcule valores com CUB e depreciação Ross-Heidecke de forma precisa e automatizada.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Capitalização da Renda</h3>
              <p className="text-muted-foreground">
                Estime valores de locação e rendimento imobiliário com cálculos profissionais.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground">Simples e rápido em 4 passos</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "Cadastre-se", desc: "Crie sua conta gratuita" },
              { step: "2", title: "Escolha o Plano", desc: "Selecione o melhor para você" },
              { step: "3", title: "Libere o Acesso", desc: "Pagamento seguro e instantâneo" },
              { step: "4", title: "Comece a Avaliar", desc: "Crie laudos profissionais" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-xl text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
          </div>
          <div className="flex justify-center">
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl">
              {plans.slice(0, 3).map((plan) => (
                <Card key={plan.id} className="p-6 flex flex-col">
                  <h3 className="text-2xl font-bold mb-2 text-center">{plan.nome}</h3>
                  <div className="text-3xl font-bold text-primary mb-4 text-center">
                    {plan.preco > 0 ? `R$ ${plan.preco.toFixed(2)}` : 'Sob Consulta'}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 text-center">{plan.descricao}</p>
                  {plan.relatorios_incluidos && (
                    <p className="text-sm font-medium mb-4 text-center">{plan.relatorios_incluidos} relatórios incluídos</p>
                  )}
                  <Link to="/cadastro" className="mt-auto">
                    <Button className="w-full">Assinar Agora</Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefícios e Diferenciais</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Cálculos automáticos conforme normas ABNT NBR 14653",
              "Relatórios gerados em PDF com layout profissional",
              "Três métodos oficiais de avaliação",
              "Cálculos automatizados de CUB, taxas e liquidação",
              "Armazenamento seguro em nuvem",
              "Painel intuitivo e suporte especializado"
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">PTAM</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma completa para avaliação imobiliária profissional.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Links</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground cursor-pointer hover:text-primary">Termos de Uso</p>
                <p className="text-muted-foreground cursor-pointer hover:text-primary">Política de Privacidade</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground cursor-pointer hover:text-primary">Suporte</p>
                <p className="text-muted-foreground cursor-pointer hover:text-primary">Contato</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            Plataforma PTAM © 2025 — Desenvolvido por Grupo 1925
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
