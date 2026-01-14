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

import { isValidCPF, isValidFullName } from "@/lib/utils";

export const useFormValidation = () => {
  const validateSection = (sectionIndex: number, formData: PTAMData) => {
    const requiredFields = requiredFieldsBySection[sectionIndex] || [];
    const missingFields: string[] = [];
    let errorMessage: string | null = null;

    // 1. Check for empty required fields
    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        errorMessage: 'Por favor, preencha todos os campos obrigatórios.'
      };
    }

    // 2. Strict Validations for Section 0 (Solicitante)
    if (sectionIndex === 0) {
      // Validate Name (Full Name)
      if (!isValidFullName(formData.solicitanteNome)) {
        return {
          isValid: false,
          missingFields: ['solicitanteNome'],
          errorMessage: 'Por favor, informe o Nome Completo (Nome e Sobrenome).'
        };
      }

      // Validate CPF (only if not foreigner)
      if (!formData.solicitanteEstrangeiro) {
        if (!isValidCPF(formData.solicitanteCPF)) {
          return {
            isValid: false,
            missingFields: ['solicitanteCPF'],
            errorMessage: 'O CPF informado é inválido.'
          };
        }
      }
    }

    return {
      isValid: true,
      missingFields: [],
      errorMessage: null
    };
  };

  return { validateSection };
};
