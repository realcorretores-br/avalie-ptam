import { useEffect } from "react";
import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinalidadeProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Finalidade = ({ data, updateData }: FinalidadeProps) => {
  // Sanitize value: if it's not a valid option, reset it to empty to ensure validation works
  useEffect(() => {
    const validOptions = ['venda', 'compra', 'partilha', 'financiamento', 'regularização', 'inventário', 'locação', 'investimento', 'outro'];
    if (data.finalidade && !validOptions.includes(data.finalidade)) {
      updateData({ finalidade: '' });
    }
  }, [data.finalidade]);
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Especifique qual é o objetivo da avaliação do imóvel.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="finalidade">
          Finalidade da Avaliação <span className="text-destructive">*</span>
        </Label>
        <Select value={data.finalidade} onValueChange={(value) => updateData({ finalidade: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a finalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="venda">Venda</SelectItem>
            <SelectItem value="compra">Compra</SelectItem>
            <SelectItem value="partilha">Partilha</SelectItem>
            <SelectItem value="financiamento">Financiamento</SelectItem>
            <SelectItem value="regularização">Regularização</SelectItem>
            <SelectItem value="inventário">Inventário</SelectItem>
            <SelectItem value="locação">Locação</SelectItem>
            <SelectItem value="investimento">Investimento</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.finalidade === "outro" && (
        <div className="space-y-2">
          <Label htmlFor="finalidadeOutro">Especifique a Finalidade</Label>
          <Input
            id="finalidadeOutro"
            value={data.finalidadeOutro || ""}
            onChange={(e) => updateData({ finalidadeOutro: e.target.value })}
            placeholder="Digite a finalidade específica"
          />
        </div>
      )}
    </div>
  );
};
