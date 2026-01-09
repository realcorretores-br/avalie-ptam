import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";


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

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Contact link for manual purchase since automated payments are disabled
    const message = `Olá, tenho interesse no plano ${plan.nome}. Poderia me ajudar?`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`; // Replace with actual support number if known, otherwise generic or toast

    // Since we are removing payments, we can just redirect to WhatsApp or show a toast
    toast.info("Para contratar este plano, entre em contato com nosso suporte.", {
      action: {
        label: "Falar no WhatsApp",
        onClick: () => window.open(whatsappUrl, '_blank')
      }
    });
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
            Falar com Consultor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelecaoPlano;
