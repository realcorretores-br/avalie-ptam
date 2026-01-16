import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { applyCurrencyMask, currencyToNumber, formatCurrency } from "@/lib/utils";

interface ComparativeCalculatorProps {
  onImport: (value: string) => void;
  areaConstruida: string;
  transactionType: 'venda' | 'locacao';
}

export const ComparativeCalculator = ({ onImport, areaConstruida, transactionType }: ComparativeCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(Array(3).fill({ price: "", sqm: "" }));
  const [average, setAverage] = useState<string>("");
  const [avgPricePerSqm, setAvgPricePerSqm] = useState<number>(0);

  const addField = () => {
    if (values.length < 10) {
      setValues([...values, { price: "", sqm: "" }]);
    }
  };

  const handleCalculate = () => {
    const validValues = values.filter(v => v.price && v.sqm);

    if (validValues.length < 3) {
      toast({
        title: "Erro",
        description: "É necessário inserir no mínimo três imóveis para gerar a média de preço.",
        variant: "destructive",
      });
      return;
    }

    // Somar todos os preços e todas as áreas
    const totalPrice = validValues.reduce((sum, v) => sum + currencyToNumber(v.price), 0);
    const totalSqm = validValues.reduce((sum, v) => sum + parseFloat(v.sqm.replace(/[^\d]/g, "")), 0);
    
    // Preço médio por m² = Total de preços / Total de m²
    const calculatedAvgPricePerSqm = totalPrice / totalSqm;
    setAvgPricePerSqm(calculatedAvgPricePerSqm);
    
    // Preço final = Preço médio por m² × Área construída
    const area = parseFloat(areaConstruida.replace(/[^\d]/g, ""));
    const finalValue = calculatedAvgPricePerSqm * area;
    
    setAverage(formatCurrency(finalValue).replace(/^R\$\s*/, ""));
  };

  const handleImport = () => {
    if (!average) {
      toast({
        title: "Erro",
        description: "Calcule a média antes de importar",
        variant: "destructive",
      });
      return;
    }
    onImport(average);
    setOpen(false);
    toast({
      title: "Importado!",
      description: "Preço médio importado com sucesso.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Calculadora comparativa">
          <Calculator className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calculadora Comparativa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Adicione no mínimo 3 e no máximo 10 imóveis comparativos.
          </p>
          {values.map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 rounded-lg border p-3">
              <div className="space-y-2">
                <Label>Preço {index + 1} (R$)</Label>
                <Input
                  placeholder="Ex: 500.000,00"
                  value={values[index].price}
                  onChange={(e) => {
                    const newValues = [...values];
                    newValues[index] = { ...newValues[index], price: applyCurrencyMask(e.target.value) };
                    setValues(newValues);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>m² {index + 1}</Label>
                <Input
                  placeholder="Ex: 120"
                  value={values[index].sqm}
                  onChange={(e) => {
                    const newValues = [...values];
                    newValues[index] = { ...newValues[index], sqm: e.target.value.replace(/\D/g, "") };
                    setValues(newValues);
                  }}
                />
              </div>
            </div>
          ))}
          
          {values.length < 10 && (
            <Button onClick={addField} variant="outline" className="w-full">
              + Adicionar Imóvel Comparativo
            </Button>
          )}
          
          <Button onClick={handleCalculate} className="w-full">
            Calcular Média
          </Button>

          {average && (
            <div className="rounded-lg bg-secondary/10 p-4">
              <Label>Preço Médio por m²</Label>
              <div className="mt-2 rounded-md bg-muted p-3 font-mono text-lg font-semibold">
                {formatCurrency(avgPricePerSqm)}
              </div>
              
              <Label className="mt-4 block">Preço Final do Imóvel</Label>
              <div className="mt-2 rounded-md bg-muted p-3 font-mono text-lg font-semibold">
                R$ {average}
              </div>
              {avgPricePerSqm > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Cálculo: {formatCurrency(avgPricePerSqm).replace(/^R\$\s*/, "")}/m² × {parseFloat(areaConstruida.replace(/[^\d]/g, ""))}m² = {average}
                </p>
              )}
            </div>
          )}

          <Button onClick={handleImport} className="w-full" disabled={!average}>
            Importar Preço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
