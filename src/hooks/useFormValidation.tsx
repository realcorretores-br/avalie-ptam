import { PTAMData } from "@/types/ptam";

// Definir campos obrigatórios por seção
const requiredFieldsBySection: { [key: number]: (keyof PTAMData)[] } = {
  0: ['solicitanteNome', 'solicitanteCPF'], // Solicitante (Removed address fields)
  1: ['avaliadorNome', 'avaliadorEmail', 'avaliadorTelefone'], // Avaliador
  2: ['finalidade'], // Finalidade
  3: [], // Objeto (sem obrigatoriedade)
  4: ['dataVistoria', 'situacaoImovel'], // Vistoria
  5: ['cep', 'enderecoImovel', 'cidade', 'estado'], // Localização
  6: ['areaTotal', 'areaConstruida', 'tipoImovel', 'descricaoImovel'], // Do Imóvel (Added basic fields)
  7: ['situacaoDocumental'], // Situação Documental
  8: [], // Fatores (arrays podem estar vazios)
  9: ['metodologiaDescricao'], // Metodologia
  10: ['valorMedio'], // Valores
  11: ['valorFinal', 'valorFinalExtenso', 'percentualVariacao'], // Conclusão
  12: ['percentualLiquidacao', 'valorLiquidacao', 'valorLiquidacaoExtenso'], // Liquidação
  13: ['justificativaDetalhada'], // Justificativa
  14: ['cidadeParecer', 'dataParecer'], // Considerações Finais (obrigatório)
};

export const useFormValidation = () => {
  const validateSection = (sectionIndex: number, formData: PTAMData) => {
    const requiredFields = requiredFieldsBySection[sectionIndex] || [];
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  return { validateSection };
};
