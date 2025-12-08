import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { maskCPF } from "@/lib/masks";

interface CpfCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CpfCollectionDialog = ({ open, onOpenChange, onSuccess }: CpfCollectionDialogProps) => {
    const { user, refreshProfile } = useAuth();
    const [cpf, setCpf] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;

        if (!cpf || cpf.length < 14) {
            toast.error("CPF inválido");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ cpf: cpf })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            toast.success("CPF salvo com sucesso!");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Erro ao salvar CPF:", error);
            toast.error(`Erro ao salvar CPF: ${error.message || error.details || 'Tente novamente'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Dados Necessários</DialogTitle>
                    <DialogDescription>
                        Para processar o pagamento, precisamos que você informe seu CPF.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-2">
                        <Label htmlFor="cpf-dialog">CPF</Label>
                        <Input
                            id="cpf-dialog"
                            value={cpf}
                            onChange={(e) => setCpf(maskCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            maxLength={14}
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
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            "Salvar e Continuar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
