import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X } from "lucide-react";

interface AddCreditsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitPrice: number;
    onConfirm: (quantity: number) => void;
    loading?: boolean;
}

export const AddCreditsModal = ({
    open,
    onOpenChange,
    unitPrice,
    onConfirm,
    loading = false
}: AddCreditsModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const MAX_QUANTITY = 100;

    useEffect(() => {
        if (open) {
            setQuantity(1);
        }
    }, [open]);

    const handleIncrement = () => {
        if (quantity < MAX_QUANTITY) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            if (val < 1) setQuantity(1);
            else if (val > MAX_QUANTITY) setQuantity(MAX_QUANTITY);
            else setQuantity(val);
        }
    };

    const total = quantity * unitPrice;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">Adicionar Créditos Avulsos</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantidade de Relatórios</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={handleDecrement}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={handleInputChange}
                                    className="text-center h-10 text-lg font-semibold"
                                    min={1}
                                    max={MAX_QUANTITY}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={handleIncrement}
                                disabled={quantity >= MAX_QUANTITY}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Máximo: {MAX_QUANTITY} relatórios por compra
                        </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Preço unitário:</span>
                            <span>R$ {unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Quantidade:</span>
                            <span>{quantity}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-lg">Total:</span>
                            <span className="font-bold text-xl text-primary">
                                R$ {total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => onConfirm(quantity)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? 'Processando...' : 'Continuar para Pagamento'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
