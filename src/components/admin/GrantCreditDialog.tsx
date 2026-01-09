<<<<<<< HEAD
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";

interface GrantCreditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

export function GrantCreditDialog({
    open,
    onOpenChange,
    userId,
    userName,
    onSuccess,
}: GrantCreditDialogProps) {
    const [credits, setCredits] = useState("1");
    const [loading, setLoading] = useState(false);
    const { logAction } = useAdminLog();

    const handleGrant = async () => {
        if (!credits || parseInt(credits) <= 0) {
            toast.error("Informe um número válido de créditos");
            return;
        }

        setLoading(true);
        try {
            // Fetch current pending credits first
            const { data: profile, error: fetchError } = await supabase
                .from("profiles")
                .select("creditos_pendentes")
                .eq("id", userId)
                .single();

            if (fetchError) throw fetchError;

            const currentCredits = profile?.creditos_pendentes || 0;
            const newCredits = currentCredits + parseInt(credits);

            const { error } = await supabase
                .from("profiles")
                .update({ creditos_pendentes: newCredits })
                .eq("id", userId);

            if (error) throw error;

            await logAction("grant_credit", {
                userId,
                userName,
                amount: parseInt(credits),
                totalPending: newCredits,
            });

            toast.success(`${credits} crédito(s) concedido(s) com sucesso`);
            onSuccess();
            onOpenChange(false);
            setCredits("1");
        } catch (error: any) {
            console.error("Error granting credits:", error);
            toast.error("Erro ao conceder créditos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Conceder Bônus</DialogTitle>
                    <DialogDescription>
                        Adicionar quantos créditos pendentes para {userName}?
                        <br />
                        <span className="text-xs text-muted-foreground mt-2 block">
                            O usuário poderá resgatar estes créditos no painel dele.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="credits">Quantidade de Créditos</Label>
                        <Input
                            id="credits"
                            type="number"
                            min="1"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                            placeholder="1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleGrant} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? "Concedendo..." : "Conceder Bônus"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
=======
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminLog } from "@/hooks/useAdminLog";

interface GrantCreditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

export function GrantCreditDialog({
    open,
    onOpenChange,
    userId,
    userName,
    onSuccess,
}: GrantCreditDialogProps) {
    const [credits, setCredits] = useState("1");
    const [loading, setLoading] = useState(false);
    const { logAction } = useAdminLog();

    const handleGrant = async () => {
        if (!credits || parseInt(credits) <= 0) {
            toast.error("Informe um número válido de créditos");
            return;
        }

        setLoading(true);
        try {
            // Fetch current pending credits first
            const { data: profile, error: fetchError } = await supabase
                .from("profiles")
                .select("creditos_pendentes")
                .eq("id", userId)
                .single();

            if (fetchError) throw fetchError;

            const currentCredits = profile?.creditos_pendentes || 0;
            const newCredits = currentCredits + parseInt(credits);

            const { error } = await supabase
                .from("profiles")
                .update({ creditos_pendentes: newCredits })
                .eq("id", userId);

            if (error) throw error;

            await logAction("grant_credit", {
                userId,
                userName,
                amount: parseInt(credits),
                totalPending: newCredits,
            });

            toast.success(`${credits} crédito(s) concedido(s) com sucesso`);
            onSuccess();
            onOpenChange(false);
            setCredits("1");
        } catch (error: any) {
            console.error("Error granting credits:", error);
            toast.error("Erro ao conceder créditos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Conceder Bônus</DialogTitle>
                    <DialogDescription>
                        Adicionar quantos créditos pendentes para {userName}?
                        <br />
                        <span className="text-xs text-muted-foreground mt-2 block">
                            O usuário poderá resgatar estes créditos no painel dele.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="credits">Quantidade de Créditos</Label>
                        <Input
                            id="credits"
                            type="number"
                            min="1"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                            placeholder="1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleGrant} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? "Concedendo..." : "Conceder Bônus"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
