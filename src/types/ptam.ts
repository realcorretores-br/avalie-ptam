export interface ComplementaryImage {
  id: string;
  url: string;
  annotatedUrl?: string;
}

export interface PTAMData {
  // 1. Solicitante
  solicitanteNome: string;
  solicitanteNacionalidade: string;
  solicitanteEstadoCivil: string;
  solicitanteProfissao: string;
  solicitanteRG: string;
  solicitanteCPF: string;
  solicitanteEndereco: string;
  solicitanteCidade: string;
  solicitanteUF: string;
  solicitanteEstrangeiro?: boolean;
  solicitantePassaporte?: string;
  solicitantePaisOrigem?: string;
  solicitanteEnderecoInternacional?: string;

  // 2. Avaliador
  avaliadorNome: string;
  avaliadorEmail: string;
  avaliadorTelefone: string;
  avaliadorCPF: string;
  avaliadorCNPJ?: string;
  avaliadorCNAI?: string;
  avaliadorCRECI?: string;
  avaliadorCAU?: string;
  avaliadorCREA?: string;
  avaliadorDataCadastro?: string;
  avaliadorBloqueadoAte?: string;
  avaliadorComissao?: string;

  // 3. Finalidade
  finalidade: string;
  finalidadeOutro?: string;

  // 4. Objeto
  matricula?: string;
  iptuNumero?: string;
  iptuInscricao?: string;

  // 5. Vistoria
  dataVistoria: string;
  situacaoImovel: string;

  // 6. Localização
  cep: string;
  enderecoImovel: string;
  numeroImovel: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: string;
  longitude: string;
  descricaoLocalizacao: string;
  localizacaoImagem?: string;
  localizacaoImagemAnotada?: string;

  // 7. Do Imóvel
  tipoTransacao: string;
  tipoTransacaoOutro?: string;
  tipoImovel: string;
  tipoImovelOutro?: string;
  descricaoImovel: string;
  quartos: string;
  banheiros: string;
  suites: string;
  vagas: string;
  anoConstrucao?: string;
  areaTotal: string;
  areaConstruida: string;
  medidas: string;
  imovelImagemPrincipal?: string;
  imovelImagemPrincipalAnotada?: string;
  imovelImagensComplementares?: ComplementaryImage[];

  // 8. Situação Documental
  situacaoDocumental: string;

  // 9. Fatores que influenciam no preço
  fatoresValorizacao: string[];
  fatoresDepreciacao: string[];

  // 10. Metodologia
  metodologiaDescricao: string;

  // 10.1 Valores dos Métodos
  valorComparativo: string;
  aluguelComparativo: string;
  valorEvolutivo: string;
  aluguelEvolutivo: string;
  valorCapitalizacao: string;
  aluguelCapitalizacao: string;
  valorMedio: string;
  aluguelMedio: string;

  // 11. Conclusão
  valorFinal: string;
  valorFinalExtenso: string;
  percentualVariacao: string;

  // 12. Valor de Liquidação
  percentualLiquidacao: string;
  valorLiquidacao: string;
  valorLiquidacaoExtenso: string;

  // 13. Justificativa
  grauFundamentacao: string;
  justificativaDetalhada: string;

  // 14. Considerações Finais
  consideracoesFinais: string;
  dataParecer: string;
  cidadeParecer: string;
}

export const defaultPTAMData: Partial<PTAMData> = {
  solicitanteNacionalidade: "brasileiro",
  situacaoDocumental: "O imóvel está devidamente registrado em nome do solicitante.",
  percentualVariacao: "10",
  percentualLiquidacao: "100",
  grauFundamentacao: "Forte",
  metodologiaDescricao: "Esse parecer é baseado nas Normas Brasileiras - ABNT NBR 14.653.",
  tipoTransacao: "venda",
  tipoImovel: "apartamento",
};
