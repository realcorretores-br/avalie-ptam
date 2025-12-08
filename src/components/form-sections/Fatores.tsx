import { PTAMData } from "@/types/ptam";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface FatoresProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Fatores = ({ data, updateData }: FatoresProps) => {
  const [novoFatorValor, setNovoFatorValor] = useState("");
  const [novoFatorDeprec, setNovoFatorDeprec] = useState("");

  const adicionarFatorValorizacao = () => {
    if (novoFatorValor.trim()) {
      const fatores = data.fatoresValorizacao || [];
      updateData({ fatoresValorizacao: [...fatores, novoFatorValor.trim()] });
      setNovoFatorValor("");
    }
  };

  const removerFatorValorizacao = (index: number) => {
    const fatores = data.fatoresValorizacao || [];
    updateData({ fatoresValorizacao: fatores.filter((_, i) => i !== index) });
  };

  const adicionarFatorDepreciacao = () => {
    if (novoFatorDeprec.trim()) {
      const fatores = data.fatoresDepreciacao || [];
      updateData({ fatoresDepreciacao: [...fatores, novoFatorDeprec.trim()] });
      setNovoFatorDeprec("");
    }
  };

  const removerFatorDepreciacao = (index: number) => {
    const fatores = data.fatoresDepreciacao || [];
    updateData({ fatoresDepreciacao: fatores.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Liste os fatores que influenciam positiva e negativamente no valor do imóvel.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block text-base font-semibold">
            a) Fatores que Valorizam o Imóvel
          </Label>
          
          <div className="mb-3 flex gap-2">
            <Input
              value={novoFatorValor}
              onChange={(e) => setNovoFatorValor(e.target.value)}
              placeholder="Ex: Localização privilegiada"
              onKeyPress={(e) => e.key === "Enter" && adicionarFatorValorizacao()}
            />
            <Button type="button" onClick={adicionarFatorValorizacao} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {(data.fatoresValorizacao || []).map((fator, index) => (
              <div key={index} className="flex items-center justify-between rounded-md bg-muted p-3">
                <span className="text-sm">{fator}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerFatorValorizacao(index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3 block text-base font-semibold">
            b) Fatores que Depreciam o Imóvel
          </Label>
          
          <div className="mb-3 flex gap-2">
            <Input
              value={novoFatorDeprec}
              onChange={(e) => setNovoFatorDeprec(e.target.value)}
              placeholder="Ex: Idade da construção"
              onKeyPress={(e) => e.key === "Enter" && adicionarFatorDepreciacao()}
            />
            <Button type="button" onClick={adicionarFatorDepreciacao} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {(data.fatoresDepreciacao || []).map((fator, index) => (
              <div key={index} className="flex items-center justify-between rounded-md bg-muted p-3">
                <span className="text-sm">{fator}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerFatorDepreciacao(index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
