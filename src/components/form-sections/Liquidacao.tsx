import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { numberToWords } from "@/lib/numberToWords";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface LiquidacaoProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Liquidacao = ({ data, updateData }: LiquidacaoProps) => {
  // Calcular valor de liquidação automaticamente
  useEffect(() => {
    const valorFinal = parseFloat(data.valorFinal?.replace(/[^\d,]/g, "").replace(",", ".") || "0");
    const percentual = parseFloat(data.percentualLiquidacao || "80");
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    if (valorFinal && percentual) {
      const valorLiq = (valorFinal * (percentual / 100)).toFixed(2);
      updateData({ valorLiquidacao: valorLiq.replace(".", ",") });
    }
<<<<<<< HEAD
  }, [data.valorFinal, data.percentualLiquidacao, updateData]);
=======
  }, [data.valorFinal, data.percentualLiquidacao]);
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  const handleConvertToWords = () => {
    if (!data.valorLiquidacao) {
      toast({
        title: "Erro",
        description: "Aguarde o cálculo do valor de liquidação.",
        variant: "destructive",
      });
      return;
    }

    const extenso = numberToWords(data.valorLiquidacao);
    updateData({ valorLiquidacaoExtenso: extenso });
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    toast({
      title: "Convertido!",
      description: "Valor convertido para extenso com sucesso.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          O valor de liquidação imediata é geralmente 80% do valor de mercado, mas pode variar conforme o caso.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="percentualLiquidacao">
            Percentual de Liquidação (%) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="percentualLiquidacao"
            type="number"
            value={data.percentualLiquidacao || ""}
            onChange={(e) => updateData({ percentualLiquidacao: e.target.value })}
            placeholder="Ex: 80"
          />
          <p className="text-sm text-muted-foreground">
            Normalmente 80% do valor de mercado
          </p>
        </div>

        <div className="space-y-2">
          <Label>Valor de Liquidação (calculado)</Label>
          <div className="rounded-md bg-muted p-3 font-mono text-lg font-semibold">
            R$ {data.valorLiquidacao || "0,00"}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="valorLiquidacaoExtenso">
              Valor de Liquidação por Extenso <span className="text-destructive">*</span>
            </Label>
<<<<<<< HEAD
            <Button
              type="button"
              variant="outline"
=======
            <Button 
              type="button" 
              variant="outline" 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
              size="sm"
              onClick={handleConvertToWords}
            >
              Preencher Automaticamente
            </Button>
          </div>
          <Input
            id="valorLiquidacaoExtenso"
            value={data.valorLiquidacaoExtenso || ""}
            onChange={(e) => updateData({ valorLiquidacaoExtenso: e.target.value })}
            placeholder="Ex: quatrocentos e dezoito mil e quatrocentos reais"
          />
        </div>
      </div>
    </div>
  );
};
