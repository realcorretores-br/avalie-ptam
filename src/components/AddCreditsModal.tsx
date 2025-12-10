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
    unitPrice?: number; // Optional, can fetch if not provided
}

export function AddCreditsModal({ open, onOpenChange, unitPrice: initialUnitPrice }: AddCreditsModalProps) {
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
            const { data, error } = await supabase.functions.invoke('create-payment', {
                body: {
                    userId: user.id,
                    quantity: quantity,
                    planId: null // Let endpoint find default avulso
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            if (data.init_point) {
                // Redirect to MP
                window.location.href = data.init_point;
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
                            <p className="text-sm text-muted-foreground">R$ {price.toFixed(2)} / unidade</p>
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
                        <span className="text-xl font-bold text-primary">R$ {(quantity * price).toFixed(2)}</span>
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
