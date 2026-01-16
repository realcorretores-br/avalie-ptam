import { PTAMData } from "@/types/ptam";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MetodologiaProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Metodologia = ({ data, updateData }: MetodologiaProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Descreva os métodos de avaliação utilizados conforme ABNT NBR 14.653.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metodologiaDescricao">
          Descrição da Metodologia <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="metodologiaDescricao"
          value={data.metodologiaDescricao || ""}
          onChange={(e) => updateData({ metodologiaDescricao: e.target.value })}
          placeholder="Descreva os métodos aplicados: Comparativo Direto, Evolutivo, Capitalização da Renda..."
          rows={8}
        />
        <p className="text-sm text-muted-foreground">
          Inclua: Método Comparativo Direto por Homogeneização, Método Evolutivo e Método de Capitalização da Renda (se aplicável)
        </p>
      </div>
    </div>
  );
};
