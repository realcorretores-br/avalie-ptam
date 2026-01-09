import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AvaliadorProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Avaliador = ({ data, updateData }: AvaliadorProps) => {
  const { profile } = useAuth();
  const [showCNAI, setShowCNAI] = useState(!!data.avaliadorCNAI);
  const [showCRECI, setShowCRECI] = useState(!!data.avaliadorCRECI);
  const [showCAU, setShowCAU] = useState(!!data.avaliadorCAU);
  const [showCREA, setShowCREA] = useState(!!data.avaliadorCREA);

  // Pré-preencher dados do perfil na primeira vez
  useEffect(() => {
    if (profile && !data.avaliadorNome) {
      updateData({
        avaliadorNome: profile.nome_completo || '',
        avaliadorEmail: profile.email || '',
        avaliadorTelefone: profile.telefone || '',
        avaliadorCPF: profile.cpf || '',
        avaliadorCNPJ: profile.cnpj || '',
        avaliadorCNAI: profile.cnae || undefined, // Note: Profile still uses cnae, mapping to cnai
        avaliadorCRECI: profile.creci || undefined,
        avaliadorCAU: profile.cau || undefined,
        avaliadorCREA: profile.crea || undefined,
      });

      // Configurar checkboxes com base nos dados do perfil
      if (profile.cnae) setShowCNAI(true);
      if (profile.creci) setShowCRECI(true);
      if (profile.cau) setShowCAU(true);
      if (profile.crea) setShowCREA(true);
    }
  }, [profile, data.avaliadorNome, updateData]);


  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Informações do profissional responsável pela avaliação técnica do imóvel.
          Os dados principais estão pré-preenchidos com as informações do seu cadastro e não podem ser editados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="avaliadorNome">
            Nome Completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="avaliadorNome"
            value={data.avaliadorNome || ""}
            onChange={(e) => updateData({ avaliadorNome: e.target.value })}
            placeholder="Ex: Anderson Oliveira"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avaliadorEmail">
            E-mail <span className="text-destructive">*</span>
          </Label>
          <Input
            id="avaliadorEmail"
            type="email"
            value={data.avaliadorEmail || ""}
            onChange={(e) => updateData({ avaliadorEmail: e.target.value })}
            placeholder="Ex: corretor@email.com"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avaliadorTelefone">
            Telefone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="avaliadorTelefone"
            value={data.avaliadorTelefone || ""}
            onChange={(e) => updateData({ avaliadorTelefone: e.target.value })}
            placeholder="Ex: (51) 99999-9999"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avaliadorCPF">
            CPF <span className="text-destructive">*</span>
          </Label>
          <Input
            id="avaliadorCPF"
            value={data.avaliadorCPF || ""}
            onChange={(e) => updateData({ avaliadorCPF: e.target.value })}
            placeholder="Ex: 123.456.789-00"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avaliadorCNPJ">CNPJ (opcional)</Label>
          <Input
            id="avaliadorCNPJ"
            value={data.avaliadorCNPJ || ""}
            onChange={(e) => updateData({ avaliadorCNPJ: e.target.value })}
            placeholder="Ex: 12.345.678/0001-90"
            disabled
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCNAI"
              checked={showCNAI}
              onCheckedChange={(checked) => {
                setShowCNAI(checked as boolean);
                if (!checked) updateData({ avaliadorCNAI: undefined });
              }}
              disabled
            />
            <Label htmlFor="showCNAI" className="cursor-pointer">
              Adicionar CNAI
            </Label>
          </div>

          {showCNAI && (
            <div className="space-y-2">
              <Label htmlFor="avaliadorCNAI">CNAI</Label>
              <Input
                id="avaliadorCNAI"
                value={data.avaliadorCNAI || ""}
                onChange={(e) => updateData({ avaliadorCNAI: e.target.value })}
                placeholder="Ex: 12345"
                disabled
              />
            </div>
          )}
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCRECI"
              checked={showCRECI}
              onCheckedChange={(checked) => {
                setShowCRECI(checked as boolean);
                if (!checked) updateData({ avaliadorCRECI: undefined });
              }}
              disabled
            />
            <Label htmlFor="showCRECI" className="cursor-pointer">
              Adicionar CRECI (Corretor)
            </Label>
          </div>

          {showCRECI && (
            <div className="space-y-2">
              <Label htmlFor="avaliadorCRECI">CRECI</Label>
              <Input
                id="avaliadorCRECI"
                value={data.avaliadorCRECI || ""}
                onChange={(e) => updateData({ avaliadorCRECI: e.target.value })}
                placeholder="Ex: 12345"
                disabled
              />
            </div>
          )}
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCAU"
              checked={showCAU}
              onCheckedChange={(checked) => {
                setShowCAU(checked as boolean);
                if (!checked) updateData({ avaliadorCAU: undefined });
              }}
              disabled
            />
            <Label htmlFor="showCAU" className="cursor-pointer">
              Adicionar CAU (Arquiteto)
            </Label>
          </div>

          {showCAU && (
            <div className="space-y-2">
              <Label htmlFor="avaliadorCAU">CAU</Label>
              <Input
                id="avaliadorCAU"
                value={data.avaliadorCAU || ""}
                onChange={(e) => updateData({ avaliadorCAU: e.target.value })}
                placeholder="Ex: A123456"
                disabled
              />
            </div>
          )}
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCREA"
              checked={showCREA}
              onCheckedChange={(checked) => {
                setShowCREA(checked as boolean);
                if (!checked) updateData({ avaliadorCREA: undefined });
              }}
              disabled
            />
            <Label htmlFor="showCREA" className="cursor-pointer">
              Adicionar CREA (Engenheiro)
            </Label>
          </div>

          {showCREA && (
            <div className="space-y-2">
              <Label htmlFor="avaliadorCREA">CREA</Label>
              <Input
                id="avaliadorCREA"
                value={data.avaliadorCREA || ""}
                onChange={(e) => updateData({ avaliadorCREA: e.target.value })}
                placeholder="Ex: 123456/RS"
                disabled
              />
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="avaliadorComissao">Área de Comissão</Label>
          <Input
            id="avaliadorComissao"
            value={data.avaliadorComissao || ""}
            onChange={(e) => updateData({ avaliadorComissao: e.target.value })}
            placeholder="Ex: R$ 5.000,00 ou 3%"
          />
          <p className="text-sm text-muted-foreground">
            Valor ou percentual da comissão referente à avaliação
          </p>
        </div>
      </div>
    </div>
  );
};
