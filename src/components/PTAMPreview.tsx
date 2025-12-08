import { PTAMData } from "@/types/ptam";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { A4Page } from "./A4Page";

interface PTAMPreviewProps {
  data: PTAMData;
}

export const PTAMPreview = ({ data }: PTAMPreviewProps) => {
  const { profile } = useAuth();
  const logoUrl = (profile as any)?.logo_url;

  return (
    <div id="ptam-preview-content" className="flex flex-col items-center bg-muted/30 print:bg-white">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .a4-page {
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
          }
        }
      `}</style>

      {/* PÁGINA 1: CAPA */}
      <A4Page className="a4-page-content flex flex-col items-center justify-center text-center">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* Logo */}
          {logoUrl && (
            <div className="mb-12">
              <img src={logoUrl} alt="Logo" className="h-32 w-auto object-contain" />
            </div>
          )}

          {/* Título Principal */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">PARECER TÉCNICO DE AVALIAÇÃO MERCADOLÓGICA</h1>
            <h2 className="text-3xl font-bold text-muted-foreground">(PTAM)</h2>
            <div className="w-32 h-1 bg-primary mx-auto my-8"></div>
            <p className="text-xl text-muted-foreground">Conforme a ABNT NBR 14.653</p>
            <p className="text-lg text-muted-foreground">(Avaliação de Bens Imóveis)</p>
          </div>
        </div>

        {/* Data */}
        <div className="mt-auto pb-12">
          <p className="text-lg font-medium text-muted-foreground">{data.cidadeParecer}, {data.dataParecer}</p>
        </div>
      </A4Page>

      {/* PÁGINA 2: DADOS INICIAIS */}
      <A4Page className="a4-page-content space-y-6 text-justify">
        {/* 1. Solicitante */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">1. Solicitante</h2>
          <p className="leading-relaxed">
            {data.solicitanteNome}, {data.solicitanteNacionalidade}, {data.solicitanteEstadoCivil}, {data.solicitanteProfissao},
            portador da CI/RG n.º {data.solicitanteRG} e inscrito no CPF nº {data.solicitanteCPF}, residente e
            domiciliado na {data.solicitanteEndereco} na cidade de {data.solicitanteCidade} – {data.solicitanteUF}.
          </p>
        </section>

        {/* 2. Avaliador */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">2. Avaliador</h2>
          <p className="leading-relaxed">
            Essa avaliação foi realizada por {data.avaliadorNome}, inscrito no CPF n.º {data.avaliadorCPF}.
            {data.avaliadorCNPJ && ` CNPJ: ${data.avaliadorCNPJ}.`}
            {data.avaliadorCRECI && ` CRECI: ${data.avaliadorCRECI}.`}
            {data.avaliadorCNAI && ` CNAI: ${data.avaliadorCNAI}.`}
          </p>
        </section>

        {/* 3. Finalidade */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">3. Finalidade</h2>
          <p className="leading-relaxed">
            Este parecer técnico tem como finalidade a estimativa do valor de mercado do imóvel para fins de {data.finalidade}.
          </p>
        </section>

        {/* 4. Objeto */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">4. Objeto</h2>
          <p className="leading-relaxed">
            {data.matricula ? `Matrícula nº ${data.matricula}` : ''}
            {data.iptuNumero && !data.matricula ? `IPTU nº ${data.iptuNumero}${data.iptuInscricao ? `, Inscrição ${data.iptuInscricao}` : ''}` : ''}
          </p>
        </section>

        {/* 5. Vistoria */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">5. Vistoria</h2>
          <p className="leading-relaxed">
            Foi realizada uma visita ao imóvel no dia {data.dataVistoria?.includes('/') ? data.dataVistoria : formatDateToDDMMYYYY(data.dataVistoria || '')}, quando foi constatada a real situação e
            condições. O imóvel está {data.situacaoImovel}.
          </p>
        </section>

        {/* 6. Localização */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">6. Localização e Infraestrutura</h2>
          <p className="leading-relaxed mb-2">
            Imóvel localizado em {data.enderecoImovel}, n.º {data.numeroImovel}.
          </p>
          <p className="leading-relaxed mb-2">
            Latitude {data.latitude} - Longitude {data.longitude}
          </p>
          <p className="leading-relaxed">{data.descricaoLocalizacao}</p>
          {(data.localizacaoImagemAnotada || data.localizacaoImagem) && (
            <div className="mt-4 flex justify-center">
              <div className="max-h-[300px] overflow-hidden rounded-lg border">
                <img src={data.localizacaoImagemAnotada || data.localizacaoImagem} alt="Localização do imóvel" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </section>
      </A4Page>

      {/* PÁGINA 3: DETALHES DO IMÓVEL */}
      <A4Page className="a4-page-content space-y-6 text-justify">
        {/* 7. Do Imóvel */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">7. Do Imóvel</h2>
          <p className="leading-relaxed mb-2">{data.descricaoImovel}</p>
          <p className="leading-relaxed font-medium">
            Área total: {data.areaTotal}m² | Área construída: {data.areaConstruida}m²
          </p>
          {data.medidas && <p className="leading-relaxed mt-2 text-sm text-muted-foreground">Medidas: {data.medidas}</p>}

          <div className="grid grid-cols-2 gap-4 mt-4">
            {(data.imovelImagemPrincipalAnotada || data.imovelImagemPrincipal) && (
              <div className="col-span-2">
                <div className="rounded-lg border overflow-hidden h-[300px]">
                  <img src={data.imovelImagemPrincipalAnotada || data.imovelImagemPrincipal} alt="Imagem principal" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">Fachada Principal</p>
              </div>
            )}

            {data.imovelImagensComplementares?.map((img, index) => (
              <div key={index}>
                <div className="rounded-lg border overflow-hidden h-[200px]">
                  <img src={img.annotatedUrl || img.url} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Situação Documental */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">8. Situação documental</h2>
          <p className="leading-relaxed">{data.situacaoDocumental}</p>
        </section>

        {/* 9. Fatores */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">9. Fatores Influenciantes</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-2 font-semibold text-green-700">Fatores Valorizantes:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {data.fatoresValorizacao?.map((fator, index) => (
                  <li key={index}>{fator}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-red-700">Fatores Depreciantes:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {data.fatoresDepreciacao?.map((fator, index) => (
                  <li key={index}>{fator}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </A4Page>

      {/* PÁGINA 4: METODOLOGIA E VALORES */}
      <A4Page className="a4-page-content space-y-8 text-justify">
        {/* 10. Metodologia */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">10. Metodologia</h2>
          <p className="leading-relaxed">{data.metodologiaDescricao}</p>
        </section>

        {/* 11. Valores */}
        <section>
          <h2 className="mb-4 text-xl font-bold border-b pb-2">11. Quadro Resumo de Valores</h2>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b p-4 text-left font-semibold">MÉTODOS UTILIZADOS</th>
                  <th className="border-b p-4 text-right font-semibold">R$ VENDA</th>
                  <th className="border-b p-4 text-right font-semibold">R$ ALUGUEL</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4">Método Comparativo Direto</td>
                  <td className="p-4 text-right font-mono">{data.valorComparativo}</td>
                  <td className="p-4 text-right font-mono">{data.aluguelComparativo}</td>
                </tr>
                <tr>
                  <td className="p-4">Método Evolutivo</td>
                  <td className="p-4 text-right font-mono">{data.valorEvolutivo}</td>
                  <td className="p-4 text-right font-mono">{data.aluguelEvolutivo}</td>
                </tr>
                <tr>
                  <td className="p-4">Método Capitalização da Renda</td>
                  <td className="p-4 text-right font-mono">{data.valorCapitalizacao}</td>
                  <td className="p-4 text-right font-mono">{data.aluguelCapitalizacao}</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="p-4">VALOR MÉDIO CONSIDERADO</td>
                  <td className="p-4 text-right font-mono text-lg">{data.valorMedio}</td>
                  <td className="p-4 text-right font-mono text-lg">{data.aluguelMedio}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 12. Conclusão */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">12. Conclusão de Valor</h2>
          <div className="bg-gray-50 p-6 rounded-lg border text-center space-y-4">
            <p className="text-lg">O valor de mercado estimado para o imóvel é de:</p>
            <p className="text-3xl font-bold text-primary">R$ {data.valorFinal}</p>
            <p className="italic text-muted-foreground">({data.valorFinalExtenso})</p>
            <p className="text-sm text-muted-foreground mt-4">
              Admitindo-se uma variação de até {data.percentualVariacao}% para mais ou para menos.
            </p>
          </div>
        </section>
      </A4Page>

      {/* PÁGINA 5: CONSIDERAÇÕES FINAIS */}
      <A4Page className="a4-page-content space-y-6 text-justify flex flex-col">
        {/* 13. Liquidação */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">13. Valor de Liquidação Imediata</h2>
          <p className="leading-relaxed">
            Considerando {data.percentualLiquidacao}% do valor de mercado, o valor para liquidação imediata é de:
            <span className="font-bold block mt-2">R$ {data.valorLiquidacao} ({data.valorLiquidacaoExtenso})</span>
          </p>
        </section>

        {/* 14. Justificativa */}
        <section>
          <h2 className="mb-3 text-xl font-bold border-b pb-2">14. Fundamentação Técnica</h2>
          <p className="leading-relaxed mb-3">
            <strong>Grau de Fundamentação:</strong> {data.grauFundamentacao}
          </p>
          <p className="leading-relaxed text-sm text-muted-foreground">{data.justificativaDetalhada}</p>
        </section>

        {/* 15. Considerações Finais */}
        <section className="flex-1 flex flex-col">
          <h2 className="mb-3 text-xl font-bold border-b pb-2">15. Considerações Finais</h2>
          <p className="leading-relaxed mb-8 text-sm">{data.consideracoesFinais}</p>

          <div className="mt-auto space-y-8">
            <p className="text-right font-medium">
              {data.cidadeParecer}, {data.dataParecer}.
            </p>

            <div className="pt-8 border-t border-gray-300 w-2/3 mx-auto text-center">
              <p className="font-bold text-lg">{data.avaliadorNome}</p>
              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                {data.avaliadorCRECI && <p>CRECI: {data.avaliadorCRECI}</p>}
                {data.avaliadorCNAI && <p>CNAI: {data.avaliadorCNAI}</p>}
                <p>CPF: {data.avaliadorCPF}</p>
                <p>{data.avaliadorEmail} | {data.avaliadorTelefone}</p>
              </div>
            </div>
          </div>
        </section>
      </A4Page>
    </div>
  );
};