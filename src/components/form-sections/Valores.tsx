import { PTAMData } from "@/types/ptam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo } from "react";
import { DescriptionPopup } from "./calculators/DescriptionPopup";
import { ComparativeCalculator } from "./calculators/ComparativeCalculator";
import { CUBCalculator } from "./calculators/CUBCalculator";
import { CapitalizationCalculator } from "./calculators/CapitalizationCalculator";
import { CapitalizationComparativeCalculator } from "./calculators/CapitalizationComparativeCalculator";
import { StateSelector } from "./calculators/StateSelector";
import { applyCurrencyMask, currencyToNumber, formatCurrency } from "@/lib/utils";

interface ValoresProps {
  data: PTAMData;
  updateData: (data: Partial<PTAMData>) => void;
}

export const Valores = ({ data, updateData }: ValoresProps) => {
  // Gerar descrição para venda
  const descricaoVenda = useMemo(() => {
    const parts: string[] = [];
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    if (data.tipoImovel) {
      const imovelMap: Record<string, string> = {
        'apartamento': 'Apartamento',
        'casa': 'Casa',
        'casaCondominio': 'Casa de condomínio',
        'sobrado': 'Sobrado',
        'sobradoCondominio': 'Sobrado em condomínio',
        'outro': data.tipoImovelOutro || 'Imóvel'
      };
      parts.push("Imóvel tipo " + (imovelMap[data.tipoImovel] || data.tipoImovel));
    }
<<<<<<< HEAD

    parts.push("à venda");

=======
    
    parts.push("à venda");
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    const details: string[] = [];
    if (data.quartos) details.push(`${data.quartos} quartos`);
    if (data.banheiros) details.push(`${data.banheiros} banheiros`);
    if (data.suites) details.push(`${data.suites} suítes`);
    if (data.vagas) details.push(`${data.vagas} vagas na garagem`);
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    return parts.join(" ") + (details.length ? ", " + details.join(", ") : "") + ".";
  }, [data.tipoImovel, data.tipoImovelOutro, data.quartos, data.banheiros, data.suites, data.vagas]);

  // Gerar descrição para locação
  const descricaoLocacao = useMemo(() => {
    const parts: string[] = [];
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    if (data.tipoImovel) {
      const imovelMap: Record<string, string> = {
        'apartamento': 'Apartamento',
        'casa': 'Casa',
        'casaCondominio': 'Casa de condomínio',
        'sobrado': 'Sobrado',
        'sobradoCondominio': 'Sobrado em condomínio',
        'outro': data.tipoImovelOutro || 'Imóvel'
      };
      parts.push("Imóvel tipo " + (imovelMap[data.tipoImovel] || data.tipoImovel));
    }
<<<<<<< HEAD

    parts.push("para locação");

=======
    
    parts.push("para locação");
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    const details: string[] = [];
    if (data.quartos) details.push(`${data.quartos} quartos`);
    if (data.banheiros) details.push(`${data.banheiros} banheiros`);
    if (data.suites) details.push(`${data.suites} suítes`);
    if (data.vagas) details.push(`${data.vagas} vagas na garagem`);
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    return parts.join(" ") + (details.length ? ", " + details.join(", ") : "") + ".";
  }, [data.tipoImovel, data.tipoImovelOutro, data.quartos, data.banheiros, data.suites, data.vagas]);

  // Calcular valor médio automaticamente
  useEffect(() => {
    const v1 = currencyToNumber(data.valorComparativo || "0");
    const v2 = currencyToNumber(data.valorEvolutivo || "0");
    const v3 = currencyToNumber(data.valorCapitalizacao || "0");
<<<<<<< HEAD

=======
    
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
    const a1 = currencyToNumber(data.aluguelComparativo || "0");
    const a2 = currencyToNumber(data.aluguelEvolutivo || "0");
    const a3 = currencyToNumber(data.aluguelCapitalizacao || "0");

    // Calcular média de venda apenas com valores preenchidos
    const valoresVenda = [v1, v2, v3].filter(v => v > 0);
    if (valoresVenda.length > 0) {
      const media = valoresVenda.reduce((a, b) => a + b, 0) / valoresVenda.length;
      updateData({ valorMedio: formatCurrency(media).replace(/^R\$\s*/, "") });
    } else {
      updateData({ valorMedio: "" });
    }

    // Calcular média de aluguel apenas com valores preenchidos
    const valoresAluguel = [a1, a2, a3].filter(a => a > 0);
    if (valoresAluguel.length > 0) {
      const media = valoresAluguel.reduce((a, b) => a + b, 0) / valoresAluguel.length;
      updateData({ aluguelMedio: formatCurrency(media).replace(/^R\$\s*/, "") });
    } else {
      updateData({ aluguelMedio: "" });
    }
<<<<<<< HEAD
  }, [data.valorComparativo, data.valorEvolutivo, data.valorCapitalizacao,
  data.aluguelComparativo, data.aluguelEvolutivo, data.aluguelCapitalizacao, updateData]);
=======
  }, [data.valorComparativo, data.valorEvolutivo, data.valorCapitalizacao, 
      data.aluguelComparativo, data.aluguelEvolutivo, data.aluguelCapitalizacao]);
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          Informe os valores obtidos pelos três métodos de avaliação. Os valores médios serão calculados automaticamente.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Método Comparativo Direto por Homogeneização por Fatores</h3>
            <div className="flex gap-2">
              <DescriptionPopup description={descricaoVenda} />
<<<<<<< HEAD
              <ComparativeCalculator
                onImport={(value) => updateData({ valorComparativo: value })}
=======
              <ComparativeCalculator 
                onImport={(value) => updateData({ valorComparativo: value })} 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                areaConstruida={data.areaConstruida || ""}
                transactionType="venda"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valorComparativo">Valor de Venda (R$)</Label>
              <Input
                id="valorComparativo"
                value={data.valorComparativo || ""}
                onChange={(e) => updateData({ valorComparativo: applyCurrencyMask(e.target.value) })}
                placeholder="Ex: 550.000,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aluguelComparativo">Valor de Aluguel (R$)</Label>
              <Input
                id="aluguelComparativo"
                value={data.aluguelComparativo || ""}
                onChange={(e) => updateData({ aluguelComparativo: applyCurrencyMask(e.target.value) })}
                placeholder="Ex: 1.500,00"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Método Evolutivo</h3>
            <div className="flex gap-2">
              <StateSelector />
              <CUBCalculator
<<<<<<< HEAD
                onImport={(value) => updateData({ valorEvolutivo: value })}
=======
                onImport={(value) => updateData({ valorEvolutivo: value })} 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                areaConstruida={data.areaConstruida || ""}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valorEvolutivo">Valor de Venda (R$)</Label>
              <Input
                id="valorEvolutivo"
                value={data.valorEvolutivo || ""}
                onChange={(e) => updateData({ valorEvolutivo: applyCurrencyMask(e.target.value) })}
                placeholder="Ex: 500.000,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aluguelEvolutivo">Valor de Aluguel (R$)</Label>
              <Input
                id="aluguelEvolutivo"
                value={data.aluguelEvolutivo || ""}
                onChange={(e) => updateData({ aluguelEvolutivo: applyCurrencyMask(e.target.value) })}
                placeholder="Ex: 1.200,00"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Método Capitalização da Renda</h3>
            <div className="flex gap-2">
              <DescriptionPopup description={descricaoLocacao} />
<<<<<<< HEAD
              <CapitalizationComparativeCalculator
                onImport={(value) => updateData({ aluguelCapitalizacao: value })}
                areaConstruida={data.areaConstruida || ""}
              />
              <CapitalizationCalculator
                onImport={(value) => updateData({ valorCapitalizacao: value })}
=======
              <CapitalizationComparativeCalculator 
                onImport={(value) => updateData({ aluguelCapitalizacao: value })} 
                areaConstruida={data.areaConstruida || ""}
              />
              <CapitalizationCalculator 
                onImport={(value) => updateData({ valorCapitalizacao: value })} 
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
                aluguelCapitalizacao={data.aluguelCapitalizacao || ""}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valorCapitalizacao">Valor de Venda (R$)</Label>
              <Input
                id="valorCapitalizacao"
                value={data.valorCapitalizacao || ""}
                onChange={(e) => updateData({ valorCapitalizacao: applyCurrencyMask(e.target.value) })}
                placeholder="Ex: 520.000,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aluguelCapitalizacao">Valor de Aluguel (R$)</Label>
              <Input
                id="aluguelCapitalizacao"
                value={data.aluguelCapitalizacao || ""}
                onChange={(e) => updateData({ aluguelCapitalizacao: applyCurrencyMask(e.target.value) })}
                placeholder="Ex: 1.300,00"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-secondary/10 p-4">
          <h3 className="mb-4 font-semibold text-secondary">Valores Médios (calculados automaticamente)</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Valor Médio de Venda</Label>
              <div className="rounded-md bg-muted p-3 font-mono text-lg font-semibold">
                R$ {data.valorMedio || "0,00"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor Médio de Aluguel</Label>
              <div className="rounded-md bg-muted p-3 font-mono text-lg font-semibold">
                R$ {data.aluguelMedio || "0,00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
