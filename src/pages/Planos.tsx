import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Building2, ArrowLeft } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { AddCreditsModal } from "@/components/AddCreditsModal";

interface Plan {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  preco: number;
  relatorios_incluidos: number;
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
          quantity: quantity // Pass quantity to the backend
        }
      });

      if (error) throw error;

      if (data.init_point) {
        // Abrir modal ao invés de redirecionar
        setPaymentUrl(data.init_point);
        setShowPaymentModal(true);
        setShowCreditsModal(false); // Close credits modal if open
      }
    } catch (error: any) {
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
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

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
