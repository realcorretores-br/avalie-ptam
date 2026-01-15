import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditPlanDialogProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserUpdated: () => void;
}

export function EditPlanDialog({ user, open, onOpenChange, onUserUpdated }: EditPlanDialogProps) {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");

    useEffect(() => {
        if (open) {
            fetchPlans();
            // Initialize with user's current plan if known (User object needs to pass planId or we fetch)
            // For now defaulting to empty or logic needs to match user.plan to an ID
        }
    }, [open]);

    const fetchPlans = async () => {
        const { data } = await supabase.from("plans").select("id, nome").eq("ativo", true);
        if (data) setPlans(data);
    };

    const handleSubmit = async () => {
        if (!selectedPlanId) return;

        try {
            setLoading(true);

            // Check if user has a subscription
            const { data: subs, error: fetchError } = await supabase
                .from("subscriptions")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (subs) {
                // Update existing
                const { error } = await supabase
                    .from("subscriptions")
                    .update({ plan_id: selectedPlanId, updated_at: new Date().toISOString() })
                    .eq("id", subs.id);
                if (error) throw error;
            } else {
                // Create new active subscription (simplified)
                const { error } = await supabase
                    .from("subscriptions")
                    .insert({
                        user_id: user.id,
                        plan_id: selectedPlanId,
                        status: 'active',
                        relatorios_disponiveis: 0, // Should likely depend on plan defaults, leaving 0 for admin to set or auto-trigger?
                        // For simplicity, just setting plan. Logic for granting credits/reports should ideally be backend.
                    });
                if (error) throw error;
            }

            toast.success("Plano atualizado com sucesso!");
            onUserUpdated();
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erro ao atualizar plano: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Alterar Plano</DialogTitle>
                    <DialogDescription>
                        Selecione o novo plano para o usuário {user?.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Plao</Label>
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedPlanId}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
