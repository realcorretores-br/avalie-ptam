import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface EditBenefitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planName: string;
  currentBenefits: string[];
  onSuccess: () => void;
}

export function EditBenefitsDialog({
  open,
  onOpenChange,
  planId,
  planName,
  currentBenefits,
  onSuccess,
}: EditBenefitsDialogProps) {
  const [benefits, setBenefits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setBenefits(currentBenefits.length > 0 ? currentBenefits : [""]);
    }
  }, [open, currentBenefits]);

  const handleAddBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleSave = async () => {
    const filteredBenefits = benefits.filter(b => b.trim() !== "");
    
    if (filteredBenefits.length === 0) {
      toast.error("Adicione pelo menos um benefício");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("plans")
        .update({ beneficios: filteredBenefits })
        .eq("id", planId);

      if (error) throw error;

      toast.success("Benefícios atualizados com sucesso");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating benefits:", error);
      toast.error("Erro ao atualizar benefícios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Benefícios - {planName}</DialogTitle>
          <DialogDescription>
            Configure os benefícios que serão exibidos para este plano
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Label htmlFor={`benefit-${index}`}>Benefício {index + 1}</Label>
                <Textarea
                  id={`benefit-${index}`}
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="Descreva o benefício..."
                  rows={2}
                />
              </div>
              {benefits.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBenefit(index)}
                  className="mt-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddBenefit}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Benefício
          </Button>
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
            {loading ? "Salvando..." : "Salvar Benefícios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}