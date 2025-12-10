import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PaymentModal } from "@/components/PaymentModal";

interface Plan {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  preco: number;
  relatorios_incluidos: number | null;
}

const SelecaoPlano = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [pixCode, setPixCode] = useState<string>('');
  const [pixImage, setPixImage] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/cadastro');
      return;
    }

    const fetchPlans = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('ativo', true)
        .order('preco');

      if (data) setPlans(data);
    };

    fetchPlans();
  }, [user, navigate]);

  const handleSelectPlan = async () => {
    if (!selectedPlan || !user) return;

    setLoading(true);

    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      if (plan.tipo === 'personalizado') {
        toast.info('Entre em contato conosco para planos personalizados');
        setLoading(false);
        return;
      }

      // Criar preferência de pagamento no Mercado Pago via edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planId: selectedPlan,
          userId: user.id,
          returnUrl: window.location.origin + '/dashboard?payment=success'
        }
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error("Erro de comunicação com o servidor.");
      } else if (data?.error) {
        // Erro retornado pela função (ex: CPF faltando)
        toast.error(data.error);
      } else if (data?.pix_code) {
        // AbacatePay Direct PIX
        setPaymentUrl(""); // Clear URL
        setPixCode(data.pix_code);
        setPixImage(data.pix_image);
        setShowPaymentModal(true);
      } else if (data?.init_point) {
        // Mercado Pago Iframe
        setPixCode("");
        setPixImage("");
        setPaymentUrl(data.init_point);
        setShowPaymentModal(true);
      }
    } catch (error: any) {
      console.error('Payment exception:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">PTAM</span>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Escolha seu Plano</h1>
        <p className="text-center text-muted-foreground mb-12">
          Selecione o plano que melhor atende suas necessidades
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {selectedPlan === plan.id && (
                <div className="flex justify-end mb-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.nome}</h3>
              <div className="text-3xl font-bold text-primary mb-4">
                {plan.preco > 0 ? `R$ ${plan.preco.toFixed(2)}` : 'Sob Consulta'}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.descricao}</p>
              {plan.relatorios_incluidos && (
                <p className="text-sm font-medium mb-4">
                  {plan.relatorios_incluidos} relatórios incluídos
                </p>
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSelectPlan}
            disabled={!selectedPlan || loading}
            className="min-w-[200px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar para Pagamento
          </Button>
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        paymentUrl={paymentUrl}
        pixCode={pixCode}
        pixImage={pixImage}
      />
    </div>
  );
};

export default SelecaoPlano;
