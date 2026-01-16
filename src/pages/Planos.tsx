import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlanCard } from "@/components/plans/PlanCard";
import { SubscriptionDetails } from "@/components/plans/SubscriptionDetails";
import { Loader2 } from "lucide-react";

const Planos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('ativo', true)
          .order('position', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePurchase = async (pkg: any) => {
    if (!user) {
      toast.error("Faça login para continuar");
      navigate("/login");
      return;
    }

    setLoadingId(pkg.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          userId: user.id,
          quantity: pkg.relatorios_incluidos,
          planId: pkg.id // Pass plan ID for tracking/verification if needed
        }
      });

      if (error) throw error;

      if (data.init_point) {
        const width = 1000;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
          data.init_point,
          'MercadoPagoCheckout',
          `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no,location=yes,scrollbars=yes`
        );

        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type === 'PAYMENT_SUCCESS') {
            toast.success(`Pacote ${pkg.nome} ativado com sucesso!`);
            window.removeEventListener('message', handleMessage);
            navigate('/dashboard');
          }
        };
        window.addEventListener('message', handleMessage);
      } else {
        console.error('Backend response:', data);
        throw new Error(data.error || 'Erro ao gerar link de pagamento');
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Erro ao iniciar pagamento: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">

      <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Pacotes de Créditos
          </h1>
          <p className="text-lg text-gray-500 max-w-3xl">
            Adquira créditos para gerar seus Pareceres Técnicos (PTAM). Cada crédito permite criar uma nova avaliação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16 relative items-start">

          {plans.map((pkg) => {
            const isRecommended = pkg.tipo === 'mensal_pro' || pkg.recommended;
            // Explicitly cast benefits to string array to avoid TS errors if DB returns any
            const features = Array.isArray(pkg.beneficios) ? pkg.beneficios : [];

            return (
              <PlanCard
                key={pkg.id}
                title={pkg.nome}
                price={pkg.preco.toFixed(2).replace('.', ',')}
                period=""
                features={features}
                buttonText="Comprar Créditos"
                description={pkg.descricao || ''}

                highlighted={isRecommended}
                recommended={isRecommended}
                loading={loadingId === pkg.id}
                onClick={() => handlePurchase(pkg)}
              />
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-200 pt-12">
          <SubscriptionDetails />
        </div>

      </div>
    </div>
  );
};

export default Planos;
