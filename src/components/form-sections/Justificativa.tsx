import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JustificativaProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Justificativa = ({ data, updateData }: JustificativaProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Classifique o grau de fundamentação técnica e justifique a avaliação.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="grauFundamentacao">
          Grau de Fundamentação Técnica <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={data.grauFundamentacao || ""} 
          onValueChange={(value) => updateData({ grauFundamentacao: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o grau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fraco">Fraco</SelectItem>
            <SelectItem value="Médio">Médio</SelectItem>
            <SelectItem value="Forte">Forte (recomendado)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="justificativaDetalhada">
          Justificativa Detalhada <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="justificativaDetalhada"
          value={data.justificativaDetalhada || ""}
          onChange={(e) => updateData({ justificativaDetalhada: e.target.value })}
          placeholder="Explique os critérios utilizados, amostragem de mercado, levantamento in loco, cálculos aplicados..."
          rows={8}
        />
        <p className="text-sm text-muted-foreground">
          Inclua informações sobre: amostragem significativa, levantamento in loco, homogeneização por fatores, 
          aplicação de métodos, documentação regular, etc.
        </p>
      </div>
    </div>
  );
};
