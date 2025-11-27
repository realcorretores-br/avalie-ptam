import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentUrl?: string;
  pixCode?: string;
  pixImage?: string;
}

export const PaymentModal = ({ open, onOpenChange, paymentUrl, pixCode, pixImage }: PaymentModalProps) => {
  const [loading, setLoading] = useState(true);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!open || !user) return;

    // Poll for payment status every 3 seconds
    const checkPaymentStatus = async () => {
      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('payment_status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        const { data: purchase } = await supabase
          .from('additional_reports_purchases')
          .select('payment_status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subscription?.payment_status === 'approved' || purchase?.payment_status === 'approved') {
          setPaymentApproved(true);
          toast.success('Pagamento aprovado! Redirecionando...');

          // Wait 2 seconds before redirecting
          setTimeout(() => {
            onOpenChange(false);
            navigate('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkPaymentStatus, 3000);

    return () => clearInterval(interval);
  }, [open, user, navigate, onOpenChange]);

  const copyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast.success("Código PIX copiado!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">


        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {paymentApproved && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold">Pagamento Aprovado!</h3>
                <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
              </div>
            </div>
          )}

          {!paymentApproved && pixImage && pixCode ? (
            <div className="flex flex-col items-center space-y-6 p-6 w-full h-full overflow-y-auto">
              <h3 className="text-lg font-medium">Escaneie o QR Code para pagar</h3>
              <div className="border-4 border-primary/10 rounded-lg p-2">
                <img src={pixImage} alt="QR Code PIX" className="w-64 h-64 object-contain" />
              </div>
              <div className="w-full max-w-md space-y-2">
                <p className="text-sm text-center text-muted-foreground">Ou copie o código abaixo:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixCode}
                    readOnly
                    className="flex-1 p-2 border rounded bg-muted text-sm"
                  />
                  <button
                    onClick={copyPixCode}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>
            </div>
          ) : (
            !paymentApproved && paymentUrl && (
              <div className="w-full h-full flex flex-col">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-muted-foreground">Carregando checkout...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={paymentUrl}
                  className="w-full flex-1 border-0 rounded"
                  onLoad={() => setLoading(false)}
                  title="Checkout Pagamento"
                />
              </div>
            )
          )}

          {/* Manual Check Button - Always visible if not approved */}
          {!paymentApproved && (
            <div className="p-4 w-full border-t bg-background">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    // Get the latest purchase ID
                    const { data: purchase } = await supabase
                      .from('additional_reports_purchases')
                      .select('id')
                      .eq('user_id', user?.id)
                      .order('created_at', { ascending: false })
                      .limit(1)
                      .single();

                    if (purchase) {
                      const { data, error } = await supabase.functions.invoke('create-additional-reports-payment', {
                        body: {
                          action: 'check_status',
                          purchaseId: purchase.id
                        }
                      });

                      if (error) throw error;

                      if (data.status === 'approved') {
                        setPaymentApproved(true);
                        toast.success('Pagamento confirmado!');
                        setTimeout(() => {
                          onOpenChange(false);
                          navigate('/dashboard?payment=success');
                        }, 1500);
                      } else {
                        toast.info('Pagamento ainda não identificado. Tente novamente em alguns instantes.');
                      }
                    }
                  } catch (error) {
                    console.error('Error checking payment:', error);
                    toast.error('Erro ao verificar pagamento');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-2 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Já realizei o pagamento
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};