import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

interface ConsideracoesFinaisProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const ConsideracoesFinais = ({ data, updateData }: ConsideracoesFinaisProps) => {
  const defaultText = "Esse parecer reflete os valores praticados atualmente, sem qualquer projeção futura...";

  useEffect(() => {
    if (!data.consideracoesFinais) {
      updateData({ consideracoesFinais: defaultText });
    }
  }, [data.consideracoesFinais, updateData]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Últimas observações importantes sobre o parecer e assinatura.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consideracoesFinais">
          Considerações Finais <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="consideracoesFinais"
          value={data.consideracoesFinais || defaultText}
          onChange={(e) => updateData({ consideracoesFinais: e.target.value })}
          placeholder={defaultText}
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cidadeParecer">
            Cidade <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cidadeParecer"
            value={data.cidadeParecer || ""}
            onChange={(e) => updateData({ cidadeParecer: e.target.value })}
            placeholder="Ex: Porto Alegre"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataParecer">
            Data do Parecer <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dataParecer"
            value={data.dataParecer || ""}
            onChange={(e) => updateData({ dataParecer: e.target.value })}
            placeholder="Ex: 15 de janeiro de 2025"
          />
        </div>
      </div>

      <div className="rounded-lg border-2 border-secondary/30 bg-secondary/5 p-4">
        <p className="text-sm font-medium text-secondary">
          ✓ Os dados do avaliador para assinatura serão preenchidos automaticamente com as informações da Seção 2.
        </p>
      </div>
    </div>
  );
};
