import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ObjetoProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Objeto = ({ data, updateData }: ObjetoProps) => {
  const [useIPTU, setUseIPTU] = useState(!!data.iptuNumero);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Informe o número da matrícula do imóvel no Cartório de Registro de Imóveis ou a Inscrição Municipal.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="matricula">
            Número da Matrícula
          </Label>
          <Input
            id="matricula"
            value={data.matricula || ""}
            onChange={(e) => updateData({ matricula: e.target.value })}
            placeholder="Ex: 12345 / R-1"
          />
          <p className="text-sm text-muted-foreground">
            A matrícula é o número de registro do imóvel no cartório
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="iptuInscricao">IPTU / ITR</Label>
          <Input
            id="iptuInscricao"
            value={data.iptuInscricao || ""}
            onChange={(e) => updateData({ iptuInscricao: e.target.value })}
            placeholder="Ex: 987.654.321-0"
          />
        </div>
      </div>
    </div>
  );
};
