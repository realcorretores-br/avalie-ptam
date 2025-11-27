import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { applyCurrencyMask, currencyToNumber, formatCurrency, applyNumericMask, numericToNumber } from "@/lib/utils";

interface CapitalizationCalculatorProps {
  onImport: (value: string) => void;
  aluguelCapitalizacao: string;
}

export const CapitalizationCalculator = ({ onImport, aluguelCapitalizacao }: CapitalizationCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [result, setResult] = useState<string>("");

  // Atualizar aluguel quando aluguelCapitalizacao mudar
  useEffect(() => {
    if (aluguelCapitalizacao) {
      setMonthlyRent(aluguelCapitalizacao);
    }
  }, [aluguelCapitalizacao]);

  const handleCalculate = () => {
    if (!monthlyRent || !monthlyRate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const rent = currencyToNumber(monthlyRent);
    const rate = numericToNumber(monthlyRate);

    // Fórmula: Valor do imóvel = Aluguel Mensal ÷ (Taxa % ÷ 100)
    // Exemplo: 6.000 ÷ (0,6 ÷ 100) = 6.000 ÷ 0,006 = 1.000.000
    const propertyValue = rent / (rate / 100);

    setResult(formatCurrency(propertyValue).replace("R$ ", ""));
  };

  const handleImport = () => {
    if (!result) {
      toast({
        title: "Erro",
        description: "Calcule o valor antes de importar",
        variant: "destructive",
      });
      return;
    }
    onImport(result);
    setOpen(false);
    toast({
      title: "Importado!",
      description: "Valor da Capitalização importado com sucesso.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Calculadora de Capitalização">
          <Calculator className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calculadora de Capitalização da Renda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Valor de Aluguel Mensal (R$)</Label>
            <Input
              id="monthlyRent"
              placeholder="Ex: 2.500,00"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(applyCurrencyMask(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRate">Taxa de Capitalização Mensal (%)</Label>
            <Input
              id="monthlyRate"
              placeholder="Ex: 0,6"
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(applyNumericMask(e.target.value))}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calcular Valor Presente
          </Button>

          {result && (
            <div className="rounded-lg bg-secondary/10 p-4">
              <Label>Valor Presente do Imóvel</Label>
              <div className="mt-2 rounded-md bg-muted p-3 font-mono text-lg font-semibold">
                {formatCurrency(currencyToNumber(result))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Fórmula: Aluguel Mensal / Taxa Mensal
              </p>
            </div>
          )}

          <Button onClick={handleImport} className="w-full" disabled={!result}>
            Importar para Método de Capitalização
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
