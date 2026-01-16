import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Minus, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddCreditsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitPrice?: number;
    onSuccess?: () => void;
}

export function AddCreditsModal({ open, onOpenChange, unitPrice: initialUnitPrice, onSuccess }: AddCreditsModalProps) {
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(initialUnitPrice || 29.90);

    // Fetch 'avulso' plan price if not passed
    useEffect(() => {
        if (open && !initialUnitPrice) {
            const fetchPrice = async () => {
                const { data } = await supabase.from('plans').select('preco').eq('tipo', 'avulso').eq('ativo', true).maybeSingle();
                if (data) setPrice(data.preco);
            };
            fetchPrice();
        }
    }, [open, initialUnitPrice]);

    const handlePurchase = async () => {
        if (!user) return;
        setLoading(true);

        try {
            console.log("Invoking create-payment with:", { userId: user.id, quantity, planId: null });
            const { data, error } = await supabase.functions.invoke('create-payment', {
                body: {
                    userId: user.id,
                    quantity: quantity,
                    planId: null // Let endpoint find default avulso
                }
            });

            console.log("Invoke result:", { data, error });

            if (error) throw error;
            if (data.init_point) {
                console.log("Opening Checkout Modal:", data.init_point);

                // Force open in a new popup window with specific dimensions
                // We rely PURELY on window.open to guarantee a popup experience.
                const width = 1000;
                const height = 700;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;

                window.open(
                    data.init_point,
                    'MercadoPagoCheckout',
                    `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no,location=yes,scrollbars=yes`
                );

                // Listen for success message from popup/iframe
                const handleMessage = (event: MessageEvent) => {
                    if (event.origin !== window.location.origin) return;

                    if (event.data?.type === 'PAYMENT_SUCCESS') {
                        console.log("Payment Success Message Received!");
                        toast.success("Pagamento confirmado com sucesso!");

                        onOpenChange(false); // Close the Shadcn modal
                        if (onSuccess) onSuccess(); // Trigger credit refresh

                        window.removeEventListener('message', handleMessage);
                    } else if (event.data?.type === 'PAYMENT_FAILURE') {
                        toast.error("Pagamento não concluído.");
                        window.removeEventListener('message', handleMessage);
                    }
                };
                window.addEventListener('message', handleMessage);

            } else {
                throw new Error('Nenhum link de pagamento retornado');
            }
        } catch (error: any) {
            console.error('Purchase error:', error);
            toast.error('Erro ao iniciar pagamento: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar Créditos Avulsos</DialogTitle>
                    <DialogDescription>
                        Compre créditos para gerar mais laudos sem assinatura mensal.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <p className="font-medium">Quantidade</p>
                            <p className="text-sm text-muted-foreground">R$ {price.toFixed(2).replace('.', ',')} / unidade</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-lg font-bold">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                        <span className="font-semibold">Total a pagar:</span>
                        <span className="text-xl font-bold text-primary">R$ {(quantity * price).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handlePurchase} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirmar Pagamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
