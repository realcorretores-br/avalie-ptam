import { useEffect } from "react";
import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyDateMask } from "@/lib/utils";

interface VistoriaProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Vistoria = ({ data, updateData }: VistoriaProps) => {
  // Pré-preencher com data corrente se estiver vazio
  useEffect(() => {
    if (!data.dataVistoria) {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      updateData({ dataVistoria: formattedDate });
    }

    // Sanitize situacaoImovel: if it's not a valid option, reset it to empty
    const validSituacoes = ['ocupado', 'locado', 'vago', 'em reforma', 'em construção'];
    if (data.situacaoImovel && !validSituacoes.includes(data.situacaoImovel)) {
      updateData({ situacaoImovel: '' });
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Detalhes sobre a visita técnica realizada no imóvel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataVistoria">
            Data da Vistoria <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dataVistoria"
            type="text"
            value={data.dataVistoria || ""}
            onChange={(e) => {
              const masked = applyDateMask(e.target.value);
              updateData({ dataVistoria: masked });
            }}
            placeholder="DD/MM/YYYY"
            maxLength={10}
          />
          <p className="text-xs text-muted-foreground">
            Formato: DD/MM/YYYY (exemplo: 07/05/2025)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="situacaoImovel">Situação do Imóvel</Label>
          <Select value={data.situacaoImovel} onValueChange={(value) => updateData({ situacaoImovel: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ocupado">Ocupado pelo proprietário</SelectItem>
              <SelectItem value="locado">Locado</SelectItem>
              <SelectItem value="vago">Vago</SelectItem>
              <SelectItem value="em reforma">Em reforma</SelectItem>
              <SelectItem value="em construção">Em construção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
