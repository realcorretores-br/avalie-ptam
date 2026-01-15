import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Minus, Wallet, CreditCard, History } from "lucide-react";

interface ManageCreditsDialogProps {
    user: { id: string; name: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserUpdated: () => void;
}

export function ManageCreditsDialog({ user, open, onOpenChange, onUserUpdated }: ManageCreditsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState<"add" | "remove">("add");
    const [amount, setAmount] = useState<number>(0);
    const [reason, setReason] = useState("");

    // Detailed Balances
    const [walletCredits, setWalletCredits] = useState(0); // profiles.creditos_pendentes
    const [planCredits, setPlanCredits] = useState(0); // subscriptions.relatorios_disponiveis
    const [rolloverCredits, setRolloverCredits] = useState(0); // subscriptions.saldo_acumulado

    useEffect(() => {
        if (user && open) {
            fetchDetailedBalances();
        }
    }, [user, open]);

    const fetchDetailedBalances = async () => {
        if (!user?.id) return;

        // Wallet
        const { data: profile } = await supabase.from('profiles').select('creditos_pendentes').eq('id', user.id).single();
        if (profile) setWalletCredits((profile as any).creditos_pendentes || 0);

        // Plan
        const { data: sub } = await supabase.from('subscriptions').select('relatorios_disponiveis, saldo_acumulado').eq('user_id', user.id).eq('status', 'active').single();
        if (sub) {
            setPlanCredits(sub.relatorios_disponiveis || 0);
            setRolloverCredits(sub.saldo_acumulado || 0);
        } else {
            setPlanCredits(0);
            setRolloverCredits(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) return toast.error("A quantidade deve ser maior que zero.");
        if (!user?.id) return;

        try {
            setLoading(true);

            // Update 'creditos_pendentes' (Wallet) as this is appropriate for manual adjustments
            const currentCredits = walletCredits;
            const newCredits = action === "add" ? currentCredits + amount : Math.max(0, currentCredits - amount);

            const { error } = await supabase
                .from("profiles")
                .update({ creditos_pendentes: newCredits } as any)
                .eq("id", user.id);

            if (error) throw error;

            console.log(`Credits ${action}ed for user ${user.id}: ${amount}. Reason: ${reason}`);

            toast.success(`Créditos ${action === "add" ? "adicionados" : "removidos"} com sucesso!`);
            onUserUpdated();
            onOpenChange(false);
            setAmount(0);
            setReason("");

        } catch (error: any) {
            toast.error("Erro ao atualizar créditos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const total = walletCredits + planCredits + rolloverCredits;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Créditos</DialogTitle>
                    <DialogDescription>
                        Visualize e ajuste o saldo de {user?.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Plano Mensal:</span>
                        <span className="font-semibold">{planCredits}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><History className="w-4 h-4" /> Acumulado:</span>
                        <span className="font-semibold">{rolloverCredits}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><Wallet className="w-4 h-4" /> Carteira/Bônus:</span>
                        <span className="font-semibold text-blue-600">{walletCredits}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center text-base mt-2">
                        <span className="font-bold text-slate-800">Total Disponível:</span>
                        <span className="font-bold text-green-600 text-lg">{total}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                        * Ajustes manuais alteram o saldo de Carteira/Bônus.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <RadioGroup value={action} onValueChange={(v) => setAction(v as "add" | "remove")} className="flex gap-4">
                        <div className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:bg-slate-50 transition-colors [&:has(:checked)]:border-blue-500 [&:has(:checked)]:bg-blue-50">
                            <RadioGroupItem value="add" id="add" />
                            <Label htmlFor="add" className="flex items-center gap-2 cursor-pointer w-full">
                                <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
                                    <Plus className="w-4 h-4" />
                                </div>
                                Adicionar
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:bg-slate-50 transition-colors [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50">
                            <RadioGroupItem value="remove" id="remove" />
                            <Label htmlFor="remove" className="flex items-center gap-2 cursor-pointer w-full">
                                <div className="bg-red-100 p-1.5 rounded-full text-red-600">
                                    <Minus className="w-4 h-4" />
                                </div>
                                Remover
                            </Label>
                        </div>
                    </RadioGroup>

                    <div className="space-y-2">
                        <Label>Quantidade (na Carteira)</Label>
                        <Input
                            type="number"
                            min="1"
                            value={amount || ''}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo / Observação</Label>
                        <Textarea
                            placeholder="Justificativa para a alteração..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || amount <= 0} className={action === "remove" ? "bg-red-600 hover:bg-red-700" : ""}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {action === "add" ? "Adicionar Créditos" : "Remover Créditos"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
