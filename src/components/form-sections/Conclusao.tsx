import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { numberToWords } from "@/lib/numberToWords";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface ConclusaoProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Conclusao = ({ data, updateData }: ConclusaoProps) => {
  // Preencher valor final automaticamente com o valor médio
  useEffect(() => {
    if (data.valorMedio && !data.valorFinal) {
      updateData({ valorFinal: data.valorMedio });
    }
  }, [data.valorMedio, data.valorFinal, updateData]);

  const handleConvertToWords = () => {
    if (!data.valorFinal) {
      toast({
        title: "Erro",
        description: "Preencha o valor final antes de converter para extenso.",
        variant: "destructive",
      });
      return;
    }

    const extenso = numberToWords(data.valorFinal);
    updateData({ valorFinalExtenso: extenso });

    toast({
      title: "Convertido!",
      description: "Valor convertido para extenso com sucesso.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Defina o valor final de mercado do imóvel e o percentual de variação admitida.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="valorFinal">
            Valor Final de Mercado (R$) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="valorFinal"
            value={data.valorFinal || ""}
            onChange={(e) => updateData({ valorFinal: e.target.value })}
            placeholder="Ex: 523.000,00"
          />
          <p className="text-sm text-muted-foreground">
            Geralmente próximo ao valor médio calculado
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="percentualVariacao">
            Percentual de Variação (%) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="percentualVariacao"
            type="number"
            value={data.percentualVariacao || ""}
            onChange={(e) => updateData({ percentualVariacao: e.target.value })}
            placeholder="Ex: 10"
          />
          <p className="text-sm text-muted-foreground">
            Normalmente entre 10% e 15%
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="valorFinalExtenso">
              Valor por Extenso <span className="text-destructive">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConvertToWords}
            >
              Preencher Automaticamente
            </Button>
          </div>
          <Input
            id="valorFinalExtenso"
            value={data.valorFinalExtenso || ""}
            onChange={(e) => updateData({ valorFinalExtenso: e.target.value })}
            placeholder="Ex: quinhentos e vinte e três mil reais"
          />
        </div>
      </div>
    </div>
  );
};
