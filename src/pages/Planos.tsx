import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
=======
import { Card } from "@/components/ui/card";
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
<<<<<<< HEAD
import { Check, Building2, ArrowLeft, Star, Zap, Shield, Crown } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { AddCreditsModal } from "@/components/AddCreditsModal";
import { Badge } from "@/components/ui/badge";
=======
import { Check, Building2, ArrowLeft } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { AddCreditsModal } from "@/components/AddCreditsModal";
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327

interface Plan {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  preco: number;
  relatorios_incluidos: number;
<<<<<<< HEAD
=======
  beneficios?: string[];
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
}

const Planos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('ativo', true)
        .order('preco', { ascending: true });

      if (data) setPlans(data);
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (quantity: number = 1) => {
    if (!selectedPlan || !user) return;

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);

      if (!plan) {
        toast.error('Plano não encontrado');
        return;
      }

      if (plan.tipo === 'personalizado') {
        toast.info('Entre em contato para planos personalizados');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planId: selectedPlan,
          userId: user.id,
<<<<<<< HEAD
          quantity: quantity
=======
          quantity: quantity // Pass quantity to the backend
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
        }
      });

      if (error) throw error;

      if (data.init_point) {
<<<<<<< HEAD
        setPaymentUrl(data.init_point);
        setShowPaymentModal(true);
        setShowCreditsModal(false);
      }
    } catch (error) {
=======
        // Abrir modal ao invés de redirecionar
        setPaymentUrl(data.init_point);
        setShowPaymentModal(true);
        setShowCreditsModal(false); // Close credits modal if open
      }
    } catch (error: any) {
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
      console.error('Payment error:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = (planId: string) => {
    setSelectedPlan(planId);
    setShowCreditsModal(true);
  };

  const getSelectedPlanPrice = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    return plan ? plan.preco : 0;
  };

<<<<<<< HEAD
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
=======
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">PTAM</span>
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

<<<<<<< HEAD
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
                        onClick={() => handleBuyCredits(plan.id)}
                        className="w-full shadow-md hover:scale-[1.02] transition-transform"
                      >
                        Comprar Créditos
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
                        setSelectedPlan(plan.id);
                        handleSelectPlan(1);
                      }}
                    >
                      {loading && selectedPlan === plan.id ? 'Processando...' : 'Assinar Agora'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
=======
      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Selecione o plano ideal para suas necessidades de avaliação imobiliária.
              Todos os planos incluem suporte por email.
            </p>
          </div>

          {/* Créditos Avulsos - Destaque */}
          {plans.filter(p => p.tipo === 'avulso').length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-2xl font-bold text-primary">Crédito Avulso</h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex justify-center">
                {plans.filter(p => p.tipo === 'avulso').map((plan) => (
                  <Card
                    key={plan.id}
                    className={`p-8 max-w-2xl w-full border-primary/50 shadow-lg bg-primary/5 relative overflow-hidden ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                      }`}
                  >
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg text-sm font-bold">
                      Sem mensalidade
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-bold mb-2">{plan.nome}</h3>
                        <p className="text-muted-foreground mb-4">{plan.descricao}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{plan.relatorios_incluidos} avaliações incluídas</span>
                        </div>
                      </div>

                      <div className="text-center md:text-right">
                        <div className="text-4xl font-bold text-primary mb-1">
                          R$ {plan.preco}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Pagamento único</p>
                        <Button
                          size="lg"
                          onClick={() => handleBuyCredits(plan.id)}
                          className="w-full md:w-auto shadow-md"
                        >
                          Comprar Agora
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Planos Mensais */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-border" />
              <h2 className="text-2xl font-bold">Assinaturas Mensais</h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-wrap justify-center gap-8 mb-10">
              {plans.filter(p => p.tipo !== 'avulso').map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const isHighlight = plan.tipo === 'mensal_pro';

                return (
                  <Card
                    key={plan.id}
                    className={`p-6 flex flex-col relative cursor-pointer transition-all w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] min-w-[280px] max-w-[350px] ${isSelected
                      ? 'ring-2 ring-primary shadow-xl scale-105 z-10'
                      : isHighlight
                        ? 'border-primary shadow-lg scale-105 z-10'
                        : 'border-muted hover:border-primary/50 hover:shadow-md'
                      }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isHighlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                        Mais Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.nome}</h3>
                      <p className="text-sm text-muted-foreground min-h-[40px]">{plan.descricao}</p>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold">R$ {plan.preco}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>

                    <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-6 w-fit">
                      <p className="text-xs font-semibold text-primary">
                        {plan.relatorios_incluidos} relatórios incluídos
                      </p>
                    </div>

                    <div className="space-y-3 flex-1 text-left">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{plan.relatorios_incluidos} avaliações por mês</span>
                      </div>

                      {plan.beneficios && plan.beneficios.length > 0 ? (
                        plan.beneficios.map((beneficio, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{beneficio}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Suporte por email</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Atualizações gratuitas</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Acesso a todos os recursos</span>
                          </div>
                          {plan.tipo === 'personalizado' && (
                            <div className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Suporte prioritário</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="text-center">
                        {isSelected ? (
                          <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                            <Check className="h-5 w-5" />
                            Plano Selecionado
                          </div>
                        ) : (
                          <Button variant={isHighlight ? "default" : "outline"} className="w-full">
                            Selecionar Plano
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="text-center space-y-4">
            <Button
              size="lg"
              onClick={() => handleSelectPlan(1)}
              disabled={!selectedPlan || loading}
              className="px-16 py-6 text-lg shadow-lg"
            >
              {loading ? 'Processando...' : 'Continuar para Pagamento'}
            </Button>

            {selectedPlan && !loading && (
              <p className="text-sm text-muted-foreground">
                Uma janela de pagamento será aberta para finalizar a compra
              </p>
            )}
>>>>>>> 2fe6e471d2673a33e58a9ce4b5693283bac90327
          </div>
        </div>
      </div>

      <AddCreditsModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
        unitPrice={getSelectedPlanPrice()}
        onConfirm={(quantity) => handleSelectPlan(quantity)}
        loading={loading}
      />

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        paymentUrl={paymentUrl}
      />
    </div>
  );
};

export default Planos;
