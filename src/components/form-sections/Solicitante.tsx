import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { applyCPFMask, applyRGMask } from "@/lib/utils";

interface SolicitanteProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Solicitante = ({ data, updateData }: SolicitanteProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Preencha os dados da pessoa ou empresa que está solicitando a avaliação do imóvel.
        </p>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="estrangeiro"
          checked={data.solicitanteEstrangeiro || false}
          onCheckedChange={(checked) => updateData({ solicitanteEstrangeiro: checked as boolean })}
        />
        <Label htmlFor="estrangeiro" className="cursor-pointer">
          Estrangeiro
        </Label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="solicitanteNome">
            Nome Completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="solicitanteNome"
            value={data.solicitanteNome || ""}
            onChange={(e) => updateData({ solicitanteNome: e.target.value })}
            placeholder="Ex: João da Silva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="solicitanteNacionalidade">Nacionalidade</Label>
          <Input
            id="solicitanteNacionalidade"
            value={data.solicitanteNacionalidade || ""}
            onChange={(e) => updateData({ solicitanteNacionalidade: e.target.value })}
            placeholder="Ex: brasileiro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="solicitanteEstadoCivil">Estado Civil</Label>
          <Input
            id="solicitanteEstadoCivil"
            value={data.solicitanteEstadoCivil || ""}
            onChange={(e) => updateData({ solicitanteEstadoCivil: e.target.value })}
            placeholder="Ex: casado, solteiro, divorciado"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="solicitanteProfissao">Profissão</Label>
          <Input
            id="solicitanteProfissao"
            value={data.solicitanteProfissao || ""}
            onChange={(e) => updateData({ solicitanteProfissao: e.target.value })}
            placeholder="Ex: empresário, aposentado"
          />
        </div>

        {!data.solicitanteEstrangeiro && (
          <>
            <div className="space-y-2">
              <Label htmlFor="solicitanteRG">
                RG/CI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="solicitanteRG"
                value={data.solicitanteRG || ""}
                onChange={(e) => {
                  const masked = applyRGMask(e.target.value);
                  updateData({ solicitanteRG: masked });
                }}
                placeholder="Ex: 12.345.678-9"
                maxLength={13}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solicitanteCPF">
                CPF <span className="text-destructive">*</span>
              </Label>
              <Input
                id="solicitanteCPF"
                value={data.solicitanteCPF || ""}
                onChange={(e) => {
                  const masked = applyCPFMask(e.target.value);
                  updateData({ solicitanteCPF: masked });
                }}
                placeholder="Ex: 123.456.789-00"
                maxLength={14}
              />
            </div>
          </>
        )}

        {data.solicitanteEstrangeiro && (
          <>
            <div className="space-y-2">
              <Label htmlFor="solicitantePassaporte">
                Número do Passaporte <span className="text-destructive">*</span>
              </Label>
              <Input
                id="solicitantePassaporte"
                value={data.solicitantePassaporte || ""}
                onChange={(e) => updateData({ solicitantePassaporte: e.target.value })}
                placeholder="Ex: AB123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solicitantePaisOrigem">
                País de Origem <span className="text-destructive">*</span>
              </Label>
              <Input
                id="solicitantePaisOrigem"
                value={data.solicitantePaisOrigem || ""}
                onChange={(e) => updateData({ solicitantePaisOrigem: e.target.value })}
                placeholder="Ex: Estados Unidos"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="solicitanteEnderecoInternacional">
                Endereço Internacional <span className="text-destructive">*</span>
              </Label>
              <Input
                id="solicitanteEnderecoInternacional"
                value={data.solicitanteEnderecoInternacional || ""}
                onChange={(e) => updateData({ solicitanteEnderecoInternacional: e.target.value })}
                placeholder="Ex: 123 Main Street, New York, NY 10001, USA"
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};
