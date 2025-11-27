import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { applyCurrencyMask, currencyToNumber } from "@/lib/utils";

interface CUBCalculatorProps {
  onImport: (value: string) => void;
  areaConstruida: string;
}

export const CUBCalculator = ({ onImport, areaConstruida }: CUBCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [cub, setCub] = useState("");
  const [area, setArea] = useState("");
  const [landPrice, setLandPrice] = useState("");
  const [result, setResult] = useState<string>("");

  // Atualizar área quando areaConstruida mudar
  useEffect(() => {
    if (areaConstruida) {
      setArea(areaConstruida);
    }
  }, [areaConstruida]);

  const handleCalculate = () => {
    if (!cub || !area || !landPrice) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const cubValue = currencyToNumber(cub);
    const areaValue = parseFloat(area.replace(/[^\d]/g, ""));
    const landValue = currencyToNumber(landPrice);

    const total = (cubValue * areaValue) + landValue;
    setResult(applyCurrencyMask(String(total * 100)));
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
      description: "Valor do Método Evolutivo importado com sucesso.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Calculadora CUB">
          <Calculator className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calculadora CUB (Método Evolutivo)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cub">CUB (R$)</Label>
            <Input
              id="cub"
              placeholder="Ex: 2.500,00"
              value={cub}
              onChange={(e) => setCub(applyCurrencyMask(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Metragem (m²)</Label>
            <Input
              id="area"
              placeholder="Ex: 120"
              value={area}
              onChange={(e) => setArea(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landPrice">Preço do Terreno (R$)</Label>
            <Input
              id="landPrice"
              placeholder="Ex: 100.000,00"
              value={landPrice}
              onChange={(e) => setLandPrice(applyCurrencyMask(e.target.value))}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calcular
          </Button>

          {result && (
            <div className="rounded-lg bg-secondary/10 p-4">
              <Label>Valor Total</Label>
              <div className="mt-2 rounded-md bg-muted p-3 font-mono text-lg font-semibold">
                R$ {result}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Fórmula: (CUB × m²) + Preço do Terreno
              </p>
            </div>
          )}

          <Button onClick={handleImport} className="w-full" disabled={!result}>
            Importar para Método Evolutivo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
