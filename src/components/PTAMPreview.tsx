import { PTAMData } from "@/types/ptam";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { A4Page } from "./A4Page";
import { PrintSettings } from "@/types/print";
import { useOrganizedPhotos } from "@/hooks/useOrganizedPhotos";

interface PTAMPreviewProps {
  data: PTAMData;
  printSettings?: PrintSettings;
}

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const PTAMPreview = ({ data, printSettings }: PTAMPreviewProps) => {
  const { profile } = useAuth();
  const logoUrl = (profile as any)?.logo_url;

  // Organize photos logic
  const { organizedImages, loading } = useOrganizedPhotos(data.imovelImagensComplementares);
  const portraitPhotos = organizedImages.filter(img => img.orientation === 'portrait');
  const landscapePhotos = organizedImages.filter(img => img.orientation === 'landscape');

  // Chunking for pagination
  // Vertical: 9 per page (3 cols x 3 rows) to maximize density
  const portraitChunks = chunkArray(portraitPhotos, 9);

  // Horizontal processing for "flow" merging
  let landscapeChunks = chunkArray(landscapePhotos, 12);
  let mergedHorizontals: typeof landscapePhotos = [];

  // Logic: If last Vertical page has space (<= 6 photos) AND first Horizontal chunk is small (<= 6 photos)
  // Merge them onto the Vertical page to ensure continuous flow.
  if (portraitChunks.length > 0 && portraitChunks[portraitChunks.length - 1].length <= 6 && landscapeChunks.length > 0) {
    if (landscapeChunks[0].length <= 6) {
      mergedHorizontals = landscapeChunks[0];
      landscapeChunks = landscapeChunks.slice(1); // Remove from list so it doesn't render twice
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Organizando fotos para o relatório...</div>;
  }

  // Determine where to render text content
  const totalVerticalPages = portraitChunks.length;
  const totalHorizontalPages = landscapeChunks.length; // Remaining chunks (after merge slice)

  // Logic for text placement:
  // 1. If we still have landscape pages, try to put text there.
  const shouldRenderTextInLandscape = totalHorizontalPages > 0 && landscapeChunks[totalHorizontalPages - 1].length <= 6;

  // 2. If NO landscape pages remain (either none existed or all merged), try vertical page.
  // BUT only if we didn't just fill it with merged horizontals.
  const shouldRenderTextInPortrait = totalHorizontalPages === 0 &&
    totalVerticalPages > 0 &&
    portraitChunks[totalVerticalPages - 1].length <= 6 &&
    mergedHorizontals.length === 0;

  const renderSections8And9 = () => (
    <div className="space-y-10 mt-8">
      <section className="print-break-inside-avoid">
        <h2 className="text-lg font-bold mb-1">8. Situação documental</h2>
        <p className="leading-normal">{data.situacaoDocumental}</p>
      </section>

      <section className="print-break-inside-avoid">
        <h2 className="text-lg font-bold mb-1">9. Fatores Influenciantes</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-1 font-semibold text-green-700">Fatores Valorizantes:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.fatoresValorizacao?.map((fator, index) => (
                <li key={index}>{fator}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-red-700">Fatores Depreciantes:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.fatoresDepreciacao?.map((fator, index) => (
                <li key={index}>{fator}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div id="ptam-preview-content" className="flex flex-col items-center bg-muted/30 print:bg-white print:block">
      <style>{`
        @media print {
          html, body, #root {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            width: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 12pt;
          }
          #ptam-preview-content {
            display: block !important;
            position: relative !important;
            width: 210mm !important;
            margin: 0 auto !important;
            left: auto !important;
            top: auto !important;
            overflow: visible !important;
          }
          .a4-page {
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            border: none !important;
            width: 210mm !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            break-inside: auto;
            display: block !important;
          }
          ::-webkit-scrollbar {
            display: none;
          }
          .print-break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
          }
        }
      `}</style>

      {/* PÁGINA 1: CAPA */}
      <A4Page className="a4-page-content flex flex-col items-center justify-center text-center" printSettings={printSettings}>
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {logoUrl && (
            <div className="mb-6">
              <img src={logoUrl} alt="Logo" className="h-32 w-auto object-contain" />
            </div>
          )}
          <div className="space-y-5">
            <h1 className="text-4xl font-bold tracking-tight">PARECER TÉCNICO DE AVALIAÇÃO MERCADOLÓGICA</h1>
            <h2 className="text-3xl font-bold text-muted-foreground">(PTAM)</h2>
            <div className="w-32 h-1 bg-primary mx-auto my-6"></div>
            <p className="text-xl text-muted-foreground">Conforme a ABNT NBR 14.653</p>
            <p className="text-lg text-muted-foreground">(Avaliação de Bens Imóveis)</p>
          </div>
        </div>
        <div className="mt-auto pb-10">
          <p className="text-lg font-medium text-muted-foreground">{data.cidadeParecer}, {data.dataParecer}</p>
        </div>
      </A4Page>

      {/* PÁGINA 2: DADOS INICIAIS */}
      <A4Page className="a4-page-content space-y-10 text-left" printSettings={printSettings}>
        <section className="print-break-inside-avoid">
          <h2 className="text-lg font-bold mb-1">1. Solicitante</h2>
          <p className="leading-normal">
            {data.solicitanteNome}, {data.solicitanteNacionalidade}, {data.solicitanteEstadoCivil}, {data.solicitanteProfissao},
            portador da CI/RG n.º {data.solicitanteRG} e inscrito no CPF nº {data.solicitanteCPF}, residente e
            domiciliado na {data.solicitanteEndereco} na cidade de {data.solicitanteCidade} – {data.solicitanteUF}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">2. Avaliador</h2>
          <p className="leading-normal">
            Essa avaliação foi realizada por {data.avaliadorNome}, inscrito no CPF n.º {data.avaliadorCPF}.
            {data.avaliadorCNPJ && ` CNPJ: ${data.avaliadorCNPJ}.`}
            {data.avaliadorCRECI && ` CRECI: ${data.avaliadorCRECI}.`}
            {data.avaliadorCNAI && ` CNAI: ${data.avaliadorCNAI}.`}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">3. Finalidade</h2>
          <p className="leading-normal">
            Este parecer técnico tem como finalidade a estimativa do valor de mercado do imóvel para fins de {data.finalidade}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">4. Objeto</h2>
          <p className="leading-normal">
            {data.matricula ? `Matrícula nº ${data.matricula}` : ''}
            {data.iptuNumero && !data.matricula ? `IPTU nº ${data.iptuNumero}${data.iptuInscricao ? `, Inscrição ${data.iptuInscricao}` : ''}` : ''}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">5. Vistoria</h2>
          <p className="leading-normal">
            Foi realizada uma visita ao imóvel no dia {data.dataVistoria?.includes('/') ? data.dataVistoria : formatDateToDDMMYYYY(data.dataVistoria || '')}, quando foi constatada a real situação e
            condições. O imóvel está {data.situacaoImovel}.
          </p>
        </section>

        <section className="print-break-inside-avoid">
          <h2 className="text-lg font-bold mb-1">6. Localização e Infraestrutura</h2>
          <p className="leading-normal mb-1">
            Imóvel localizado em {data.enderecoImovel}, n.º {data.numeroImovel}.
          </p>
          <p className="leading-normal mb-1">
            Latitude {data.latitude} - Longitude {data.longitude}
          </p>
          <p className="leading-normal">{data.descricaoLocalizacao}</p>
          {(data.localizacaoImagemAnotada || data.localizacaoImagem) && (
            <div className="mt-3 flex justify-center print-break-inside-avoid">
              <div className="max-h-[300px] overflow-hidden rounded-lg border">
                <img src={data.localizacaoImagemAnotada || data.localizacaoImagem} alt="Localização do imóvel" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </section>
      </A4Page>

      {/* PÁGINA 3: DETALHES DO IMÓVEL + FACHADA PRINCIPAL */}
      <A4Page className="a4-page-content space-y-10 text-left" printSettings={printSettings}>
        <section>
          <h2 className="text-lg font-bold mb-1">7. Do Imóvel</h2>
          <p className="leading-normal mb-1">{data.descricaoImovel}</p>
          <p className="leading-normal font-medium">
            Área total: {data.areaTotal}m² | Área construída: {data.areaConstruida}m²
          </p>
          {data.medidas && <p className="leading-normal mt-1 text-sm text-muted-foreground">Medidas: {data.medidas}</p>}

          {(data.imovelImagemPrincipalAnotada || data.imovelImagemPrincipal) && (
            <div className="mt-2 print-break-inside-avoid">
              <div className="rounded-lg border overflow-hidden h-[450px] w-full flex items-center justify-center bg-accent/20">
                <img
                  src={data.imovelImagemPrincipalAnotada || data.imovelImagemPrincipal}
                  alt="Fachada Principal"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-sm text-center text-muted-foreground mt-1 font-medium">Fachada Principal</p>
            </div>
          )}
        </section>
      </A4Page>

      {/* REMOVIDO PÁGINA DEDICADA DA FACHADA PARA EVITAR ESPAÇO EM BRANCO - AGORA ELA ESTÁ ACIMA */}
      {/* {(data.imovelImagemPrincipalAnotada || data.imovelImagemPrincipal) && ( ... ) } */}

      {/* PÁGINAS DINÂMICAS DE FOTOS VERTICAIS */}
      {portraitChunks.map((pagePhotos, pageIndex) => {
        const isLastPortraitPage = pageIndex === portraitChunks.length - 1;

        return (
          <A4Page key={`photo-portrait-${pageIndex}`} className="a4-page-content" printSettings={printSettings}>
            <h2 className="mb-3 text-xl font-bold border-b pb-1">
              Anexo Fotográfico - Fotos Verticais {portraitChunks.length > 1 ? `(${pageIndex + 1}/${portraitChunks.length})` : ''}
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {pagePhotos.map((img, imgIndex) => (
                <div key={img.id || imgIndex} className="flex flex-col items-center break-inside-avoid page-break-inside-avoid">
                  <div className="w-full h-[250px] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                    <img
                      src={img.annotatedUrl || img.url}
                      alt={`Foto V ${pageIndex * 9 + imgIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SE TIVER MERGED HORIZONTALS, RENDERIZA AQUI MESMO */}
            {isLastPortraitPage && mergedHorizontals.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h2 className="mb-3 text-xl font-bold border-b pb-1">
                  Anexo Fotográfico - Fotos Horizontais (1/{chunkArray(landscapePhotos, 12).length + 1})
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {mergedHorizontals.map((img, imgIndex) => (
                    <div key={img.id || imgIndex} className="flex flex-col items-center break-inside-avoid page-break-inside-avoid">
                      <div className="w-full h-[180px] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                        <img
                          src={img.annotatedUrl || img.url}
                          alt={`Foto H Merged ${imgIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SE NÃO TIVER FOTOS HORIZONTAIS, E TIVER ESPAÇO AQUI, RENDERIZA TEXTO */}
            {isLastPortraitPage && shouldRenderTextInPortrait && renderSections8And9()}
          </A4Page>
        );
      })}

      {/* PÁGINAS DINÂMICAS DE FOTOS HORIZONTAIS */}
      {/* PÁGINAS DINÂMICAS DE FOTOS HORIZONTAIS */}
      {landscapeChunks.map((pagePhotos, pageIndex) => {
        const isLastPage = pageIndex === landscapeChunks.length - 1;

        return (
          <A4Page key={`photo-landscape-${pageIndex}`} className="a4-page-content" printSettings={printSettings}>
            <h2 className="mb-3 text-xl font-bold border-b pb-1">
              Anexo Fotográfico - Fotos Horizontais {landscapeChunks.length > 1 ? `(${pageIndex + 1}/${landscapeChunks.length})` :
                (mergedHorizontals.length > 0 ? '(2/2)' : '')}
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {pagePhotos.map((img, imgIndex) => (
                <div key={img.id || imgIndex} className="flex flex-col items-center break-inside-avoid page-break-inside-avoid">
                  <div className="w-full h-[180px] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                    <img
                      src={img.annotatedUrl || img.url}
                      alt={`Foto H ${pageIndex * 12 + imgIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SE TIVER ESPAÇO,RENDERIZA SEÇÕES 8 E 9 AQUI */}
            {isLastPage && shouldRenderTextInLandscape && renderSections8And9()}
          </A4Page>
        );
      })}

      {/* Se NÃO renderizou nas fotos (ou não tinha fotos horizontais), renderiza página dedicada para 8 e 9 */}
      {!shouldRenderTextInLandscape && !shouldRenderTextInPortrait && (
        <A4Page className="a4-page-content space-y-5 text-left" printSettings={printSettings}>
          {renderSections8And9()}
        </A4Page>
      )}

      {/* Se NÃO renderizou nas fotos (ou não tinha fotos horizontais), renderiza página dedicada para 8 e 9 */}
      {/* Lógica simplificada: Se landscapeChunks estiver vazio OU a última página estava cheia (>6 fotos), precisa de uma page dedicada ?? */}
      {/* Na verdade, vamos renderizar condicionalmente se NÃO tiver sido renderizado acima */}
      {(!landscapeChunks.length || (landscapeChunks.length > 0 && landscapeChunks[landscapeChunks.length - 1].length > 6)) && (
        <A4Page className="a4-page-content space-y-8 text-left" printSettings={printSettings}>
          <section className="print-break-inside-avoid">
            <h2 className="text-lg font-bold mb-1">8. Situação documental</h2>
            <p className="leading-normal">{data.situacaoDocumental}</p>
          </section>
          <section className="print-break-inside-avoid">
            <h2 className="text-lg font-bold mb-1">9. Fatores Influenciantes</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-1 font-semibold text-green-700">Fatores Valorizantes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {data.fatoresValorizacao?.map((fator, index) => (
                    <li key={index}>{fator}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-red-700">Fatores Depreciantes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {data.fatoresDepreciacao?.map((fator, index) => (
                    <li key={index}>{fator}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </A4Page>
      )}


      {/* PÁGINA: METODOLOGIA E VALORES (Condensado 10, 11 e 12) */}
      <A4Page className="a4-page-content space-y-10 text-left" printSettings={printSettings}>
        <section>
          <h2 className="text-lg font-bold mb-1">10. Metodologia</h2>
          <p className="leading-normal">{data.metodologiaDescricao}</p>
        </section>

        <section className="print-break-inside-avoid">
          <h2 className="text-lg font-bold mb-1">11. Quadro Resumo de Valores</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b p-3 text-left font-semibold">MÉTODOS UTILIZADOS</th>
                  <th className="border-b p-3 text-right font-semibold">R$ VENDA</th>
                  <th className="border-b p-3 text-right font-semibold">R$ ALUGUEL</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3">Método Comparativo Direto</td>
                  <td className="p-3 text-right font-mono">{data.valorComparativo}</td>
                  <td className="p-3 text-right font-mono">{data.aluguelComparativo}</td>
                </tr>
                <tr>
                  <td className="p-3">Método Evolutivo</td>
                  <td className="p-3 text-right font-mono">{data.valorEvolutivo}</td>
                  <td className="p-3 text-right font-mono">{data.aluguelEvolutivo}</td>
                </tr>
                <tr>
                  <td className="p-3">Método Capitalização da Renda</td>
                  <td className="p-3 text-right font-mono">{data.valorCapitalizacao}</td>
                  <td className="p-3 text-right font-mono">{data.aluguelCapitalizacao}</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="p-3">VALOR MÉDIO CONSIDERADO</td>
                  <td className="p-3 text-right font-mono text-lg">{data.valorMedio}</td>
                  <td className="p-3 text-right font-mono text-lg">{data.aluguelMedio}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-break-inside-avoid">
          <h2 className="text-lg font-bold mb-1">12. Conclusão de Valor</h2>
          <div className="bg-gray-50 p-4 rounded-lg border text-center space-y-3">
            <div className="flex justify-center items-center gap-4">
              <p className="text-lg">Valor de Mercado:</p>
              <p className="text-3xl font-bold text-primary">R$ {data.valorFinal}</p>
            </div>
            <p className="italic text-muted-foreground">({data.valorFinalExtenso})</p>
            <p className="text-xs text-muted-foreground mt-1">
              (Admitindo-se variação de ±{data.percentualVariacao}%)
            </p>
          </div>
        </section>
      </A4Page>

      {/* PÁGINA: CONSIDERACÕES FINAIS (Condensado 13, 14, 15) */}
      <A4Page className="a4-page-content space-y-24 text-left flex flex-col" printSettings={printSettings}>
        <section>
          <h2 className="text-lg font-bold mb-1">13. Valor de Liquidação Imediata</h2>
          <p className="leading-normal">
            Considerando {data.percentualLiquidacao}% do valor de mercado, o valor para liquidação imediata é de:
            <span className="font-bold block mt-1">R$ {data.valorLiquidacao} ({data.valorLiquidacaoExtenso})</span>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-1">14. Fundamentação Técnica</h2>
          <p className="leading-normal mb-1">
            <strong>Grau de Fundamentação:</strong> {data.grauFundamentacao}
          </p>
          <p className="leading-normal text-sm text-muted-foreground">{data.justificativaDetalhada}</p>
        </section>

        <section className="flex-1 flex flex-col">
          <h2 className="text-lg font-bold mb-1">15. Considerações Finais</h2>
          <p className="leading-normal mb-6 text-sm">{data.consideracoesFinais}</p>

          <div className="mt-auto space-y-4 pt-4 border-t">
            <p className="text-right font-medium mb-4">
              {data.cidadeParecer}, {data.dataParecer}.
            </p>

            <div className="w-2/3 mx-auto text-center mt-32">
              <div className="h-0.5 bg-black w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-lg">{data.avaliadorNome}</p>
              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-center max-w-lg mx-auto">
                {data.avaliadorCRECI && <p>CRECI: {data.avaliadorCRECI}</p>}
                {data.avaliadorCNAI && <p>CNAI: {data.avaliadorCNAI}</p>}
                <p>CPF: {data.avaliadorCPF}</p>
                <p>{data.avaliadorTelefone}</p>
                <p className="col-span-2">{data.avaliadorEmail}</p>
              </div>
            </div>
          </div>
        </section>
      </A4Page>
    </div >
  );
};