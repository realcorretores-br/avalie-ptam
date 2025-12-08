import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Plus, Minus } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";

interface AddReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddReportsDialog = ({ open, onOpenChange, onSuccess }: AddReportsDialogProps) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [pixImage, setPixImage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [pricePerReport, setPricePerReport] = useState(34.99);
  const total = quantity * pricePerReport;

  useEffect(() => {
    const fetchPrice = async () => {
      const { data } = await supabase
        .from('plans')
        .select('preco')
        .eq('tipo', 'avulso')
        .maybeSingle();

      if (data) {
        setPricePerReport(data.preco);
      }
    };

    if (open) {
      fetchPrice();
    }
  }, [open]);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= 100) {
      setQuantity(value);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (quantity < 1) {
      toast.error("Quantidade mínima é 1 relatório");
      return;
    }

    setLoading(true);
    try {
      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('additional_reports_purchases')
        .insert({
          user_id: user.id,
          quantidade: quantity,
          preco_unitario: pricePerReport,
          preco_total: total,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create payment via edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-additional-reports-payment',
        {
          body: {
            purchaseId: purchase.id,
            userId: user.id,
            quantity,
            totalPrice: total,
          }
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.error) {
        throw new Error(paymentData.error);
      }

      if (paymentData?.pix_code) {
        setPaymentUrl("");
        setPixCode(paymentData.pix_code);
        setPixImage(paymentData.pix_image);
        setShowPaymentModal(true);
      } else if (paymentData?.init_point) {
        setPixCode("");
        setPixImage("");
        setPaymentUrl(paymentData.init_point);
        setShowPaymentModal(true);
        toast.success("Redirecionando para pagamento...");
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (error: any) {
      console.error('Error creating purchase:', error);
      let errorMessage = error.message || "Erro ao processar compra";

      // Improve generic Edge Function error message
      if (errorMessage.includes("Edge Function returned a non-2xx status code")) {
        errorMessage = "Erro de comunicação com o servidor de pagamento. Por favor, tente novamente.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentModalClose = (open: boolean) => {
    setShowPaymentModal(open);
    if (!open) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Créditos Avulsos</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade de Relatórios</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 100}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Máximo: 100 relatórios por compra
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço unitário:</span>
                <span className="font-medium">R$ {pricePerReport.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantidade:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Continuar para Pagamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPaymentModal && (paymentUrl || pixCode) && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={handlePaymentModalClose}
          paymentUrl={paymentUrl}
          pixCode={pixCode}
          pixImage={pixImage}
        />
      )}
    </>
  );
};

