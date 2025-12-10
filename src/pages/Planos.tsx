import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Building2, ArrowLeft, Star, Zap, Shield, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  preco: number;
  relatorios_incluidos: number;
  beneficios?: string[];
}

const Planos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContact = () => {
    toast.info("Entre em contato com nosso time comercial", {
      action: {
        label: "WhatsApp",
        onClick: () => window.open("https://wa.me/5511999999999", "_blank")
      }
    });
  };

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('ativo', true)
        .order('preco', { ascending: true });

      if (data) setPlans(data as any);
    };

    fetchPlans();
  }, []);

  const getPlanIcon = (tipo: string) => {
    switch (tipo) {
      case 'avulso': return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'mensal_basico': return <Shield className="h-6 w-6 text-blue-500" />;
      case 'mensal_pro': return <Crown className="h-6 w-6 text-purple-500" />;
      default: return <Star className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              PTAM
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      <div className="container py-12 space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexibilidade total: pague por uso ou assine mensalmente para ter mais benefícios.
          </p>
        </div>

        {/* Créditos Avulsos */}
        {plans.filter(p => p.tipo === 'avulso').length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <Badge variant="outline" className="text-lg px-4 py-1 border-primary/50 text-primary">
                Sem mensalidade
              </Badge>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex justify-center">
              {plans.filter(p => p.tipo === 'avulso').map((plan) => (
                <Card key={plan.id} className="max-w-3xl w-full overflow-hidden border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="grid md:grid-cols-2">
                    <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col justify-center items-center text-center space-y-4">
                      <div className="p-4 rounded-full bg-background shadow-sm">
                        {getPlanIcon(plan.tipo)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{plan.nome}</h3>
                        <p className="text-muted-foreground">{plan.descricao}</p>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">R$ {plan.preco}</span>
                          <span className="text-muted-foreground">/unidade</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Compre quantos créditos precisar. Sem validade.
                        </p>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>Acesso completo ao gerador</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>Exportação em PDF/Word</span>
                        </li>
                      </ul>
                      <Button
                        size="lg"
                        onClick={handleContact}
                        className="w-full shadow-md hover:scale-[1.02] transition-transform"
                      >
                        Falar com Consultor
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Assinaturas */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <Badge variant="outline" className="text-lg px-4 py-1">
              Assinaturas Mensais
            </Badge>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.filter(p => p.tipo !== 'avulso').map((plan) => {
              const isHighlight = plan.tipo === 'mensal_pro';
              const isSelected = selectedPlan === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-all duration-300 hover:-translate-y-1 ${isHighlight
                    ? 'border-primary shadow-xl scale-105 z-10'
                    : 'hover:shadow-lg border-muted'
                    } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {isHighlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Recomendado
                    </div>
                  )}

                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getPlanIcon(plan.tipo)}
                    </div>
                    <CardTitle className="text-2xl">{plan.nome}</CardTitle>
                    <CardDescription className="min-h-[40px]">{plan.descricao}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-6">
                    <div>
                      <span className="text-4xl font-bold">R$ {plan.preco}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{plan.relatorios_incluidos} avaliações/mês</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Suporte prioritário</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Atualizações automáticas</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant={isHighlight ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact();
                      }}
                    >
                      Falar com Consultor
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planos;
