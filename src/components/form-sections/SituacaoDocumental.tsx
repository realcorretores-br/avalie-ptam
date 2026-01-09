import { PTAMData } from "@/types/ptam";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SituacaoDocumentalProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const SituacaoDocumental = ({ data, updateData }: SituacaoDocumentalProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Informações sobre a situação jurídica e documental do imóvel.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="situacaoDocumental">
          Situação Documental <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="situacaoDocumental"
          value={data.situacaoDocumental || ""}
          onChange={(e) => updateData({ situacaoDocumental: e.target.value })}
          placeholder="Descreva a situação documental do imóvel, registro em nome do proprietário, eventuais ônus ou restrições..."
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Ex: "O imóvel está devidamente registrado em nome do solicitante. A matrícula completa e atualizada está anexada a este parecer."
        </p>
      </div>
    </div>
  );
};
