import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { PTAMData } from '@/types/ptam';
import browserImageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<string> => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedFile = await browserImageCompression(file, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    throw error;
  }
};

export const exportToPDF = async (elements: HTMLElement[], filename: string) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      if (i > 0) {
        pdf.addPage();
      }

      // Create a clone to manipulate styles for capture without affecting UI
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.top = '-9999px';
      clone.style.left = '0';
      // Force A4 width match
      clone.style.width = '794px'; // 210mm @ 96 DPI
      // Remove print constraints that might hide overflow
      clone.style.height = 'auto';
      clone.style.minHeight = '1123px'; // 297mm @ 96 DPI
      clone.style.overflow = 'visible';

      document.body.appendChild(clone);

      // Check actual height of content
      const contentHeight = clone.scrollHeight;

      // If content is huge, we might need to scale it down to fit one page
      // Standard A4 pixel height is ~1123px.

      const canvas = await html2canvas(clone, {
        scale: 2, // High res for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Capture full content height
        height: contentHeight,
        windowHeight: contentHeight
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 0.8);

      // Calculate aspect ratio to fit in PDF (210x297)
      // If contentHeight > 1123, we shrink it to fit.
      // If contentHeight <= 1123, we fill page (it might have whitespace at bottom, which is fine)

      // Actually, we want to FILL the A4 page. 
      // If the captured image is TALLER than A4 ratio, we must shrink it to fit height (and have side margins? No, width is fixed A4).
      // Since we forced width to A4 px, the aspect ratio change is purely vertical.

      // If we simply draw image at (0, 0, 210, 297), it will STRETCH if aspect ratio differs.
      // We want to MAINTAIN aspect ratio.

      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      const pageRatio = pdfWidth / pdfHeight;

      let renderWidth = pdfWidth;
      let renderHeight = pdfHeight;
      let xOffset = 0;
      let yOffset = 0;

      if (imgRatio < pageRatio) {
        renderHeight = pdfHeight;
        renderWidth = renderHeight * imgRatio;
        xOffset = (pdfWidth - renderWidth) / 2;
      } else {
        renderWidth = pdfWidth;
        renderHeight = renderWidth / imgRatio;
      }

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight);
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar PDF');
  }
};

export const exportToDOCX = async (data: PTAMData, filename: string) => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: 'PARECER TÉCNICO DE AVALIAÇÃO MERCADOLÓGICA (PTAM)',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: 'Conforme a ABNT NBR 14.653 (Avaliação de Bens Imóveis)',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // 1. Solicitante
          new Paragraph({
            text: '1. Solicitante',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `${data.solicitanteNome}, ${data.solicitanteNacionalidade}, ${data.solicitanteEstadoCivil}, ${data.solicitanteProfissao}, portador da CI/RG n.º ${data.solicitanteRG} e inscrito no CPF nº ${data.solicitanteCPF}, residente e domiciliado na ${data.solicitanteEndereco} na cidade de ${data.solicitanteCidade} – ${data.solicitanteUF}.`,
            spacing: { after: 200 }
          }),

          // 2. Avaliador
          new Paragraph({
            text: '2. Avaliador',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Essa avaliação foi realizada por ${data.avaliadorNome}, inscrito no CPF n.º ${data.avaliadorCPF}.${data.avaliadorCNPJ ? ` CNPJ: ${data.avaliadorCNPJ}.` : ''}${data.avaliadorCRECI ? ` CRECI: ${data.avaliadorCRECI}.` : ''}${data.avaliadorCNAI ? ` CNAI: ${data.avaliadorCNAI}.` : ''}`,
            spacing: { after: 200 }
          }),

          // 3. Finalidade
          new Paragraph({
            text: '3. Finalidade',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Este parecer técnico tem como finalidade a estimativa do valor de mercado do imóvel para fins de ${data.finalidade}.`,
            spacing: { after: 200 }
          }),

          // 4. Objeto
          new Paragraph({
            text: '4. Objeto',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: data.matricula ? `Matrícula nº ${data.matricula}` : (data.iptuNumero ? `IPTU nº ${data.iptuNumero}${data.iptuInscricao ? `, Inscrição ${data.iptuInscricao}` : ''}` : ''),
            spacing: { after: 200 }
          }),

          // 5. Vistoria
          new Paragraph({
            text: '5. Vistoria',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Foi realizada uma visita ao imóvel no dia ${data.dataVistoria}, quando foi constatada a real situação e condições. O imóvel está ${data.situacaoImovel}.`,
            spacing: { after: 200 }
          }),

          // 6. Localização
          new Paragraph({
            text: '6. Localização, infraestrutura e característica da região',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Imóvel localizado em ${data.enderecoImovel}, n.º ${data.numeroImovel}.`,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: `Latitude ${data.latitude} - Longitude ${data.longitude}`,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: data.descricaoLocalizacao,
            spacing: { after: 200 }
          }),

          // 7. Do Imóvel
          new Paragraph({
            text: '7. Do Imóvel',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: data.descricaoImovel,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: `Área total: ${data.areaTotal}m² | Área construída: ${data.areaConstruida}m²`,
            spacing: { after: data.medidas ? 100 : 200 }
          }),
          ...(data.medidas ? [new Paragraph({
            text: `Medidas: ${data.medidas}`,
            spacing: { after: 200 }
          })] : []),

          // 8. Situação Documental
          new Paragraph({
            text: '8. Situação documental',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: data.situacaoDocumental,
            spacing: { after: 200 }
          }),

          // 9. Fatores
          new Paragraph({
            text: '9. Fatores que influenciam no preço',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: 'Esse parecer visa mensurar o valor de comercialização do imóvel, ou seja, os valores que o mercado estaria disposto a pagar numa eventual transação.',
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: 'a) Fatores que valorizam o imóvel:', bold: true })],
            spacing: { after: 100 }
          }),
          ...(data.fatoresValorizacao?.map(fator =>
            new Paragraph({
              text: `• ${fator}`,
              spacing: { after: 50 }
            })
          ) || []),
          new Paragraph({
            children: [new TextRun({ text: 'b) Fatores que depreciam o imóvel:', bold: true })],
            spacing: { before: 100, after: 100 }
          }),
          ...(data.fatoresDepreciacao?.map(fator =>
            new Paragraph({
              text: `• ${fator}`,
              spacing: { after: 50 }
            })
          ) || []),

          // 10. Metodologia
          new Paragraph({
            text: '10. Metodologia',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: data.metodologiaDescricao,
            spacing: { after: 200 }
          }),

          // 10.1 Valores - Tabela
          new Paragraph({
            text: '10.1 Quadro Resumo dos Valores Estimados pelos Métodos Aplicados',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'MÉTODOS UTILIZADOS', bold: true })] })],
                    shading: { fill: 'E0E0E0' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'R$ VENDA', bold: true })], alignment: AlignmentType.RIGHT })],
                    shading: { fill: 'E0E0E0' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'R$ ALUGUEL', bold: true })], alignment: AlignmentType.RIGHT })],
                    shading: { fill: 'E0E0E0' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Método Comparativo Direto por Homogeneização por Fatores')] }),
                  new TableCell({ children: [new Paragraph({ text: data.valorComparativo, alignment: AlignmentType.RIGHT })] }),
                  new TableCell({ children: [new Paragraph({ text: data.aluguelComparativo, alignment: AlignmentType.RIGHT })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Método Evolutivo')] }),
                  new TableCell({ children: [new Paragraph({ text: data.valorEvolutivo, alignment: AlignmentType.RIGHT })] }),
                  new TableCell({ children: [new Paragraph({ text: data.aluguelEvolutivo, alignment: AlignmentType.RIGHT })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Método Capitalização da Renda')] }),
                  new TableCell({ children: [new Paragraph({ text: data.valorCapitalizacao, alignment: AlignmentType.RIGHT })] }),
                  new TableCell({ children: [new Paragraph({ text: data.aluguelCapitalizacao, alignment: AlignmentType.RIGHT })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'VALOR MÉDIO CONSIDERADO', bold: true })] })],
                    shading: { fill: 'E0E0E0' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: data.valorMedio, bold: true })], alignment: AlignmentType.RIGHT })],
                    shading: { fill: 'E0E0E0' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: data.aluguelMedio, bold: true })], alignment: AlignmentType.RIGHT })],
                    shading: { fill: 'E0E0E0' }
                  })
                ]
              })
            ]
          }),

          // 11. Conclusão
          new Paragraph({
            text: '11. Conclusão',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Conclui-se que o valor de mercado do imóvel objeto deste parecer técnico de avaliação mercadológica é R$ ${data.valorFinal} (${data.valorFinalExtenso}), admitindo-se uma variação de até ${data.percentualVariacao}% (por cento), para mais ou para menos.`,
            spacing: { after: 200 }
          }),

          // 12. Liquidação
          new Paragraph({
            text: '12. Valor de liquidação imediata',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Para fins de liquidação imediata do imóvel, é considerado o valor de liquidação correspondente a ${data.percentualLiquidacao}% do valor de mercado estimado neste laudo de avaliação. Assim, o valor de liquidação imediata será de R$ ${data.valorLiquidacao} (${data.valorLiquidacaoExtenso}).`,
            spacing: { after: 200 }
          }),

          // 13. Justificativa
          new Paragraph({
            text: '13. Justificativa - Grau de Fundamentação Técnica',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `A presente avaliação apresenta grau de fundamentação classificado como ${data.grauFundamentacao}, conforme critérios estabelecidos na NBR 14.653.`,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: data.justificativaDetalhada,
            spacing: { after: 200 }
          }),

          // 14. Considerações Finais
          new Paragraph({
            text: '14. Considerações Finais',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: data.consideracoesFinais,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `${data.cidadeParecer}, ${data.dataParecer}.`,
            spacing: { after: 400 }
          }),

          // Assinatura
          new Paragraph({
            text: '_______________________________________',
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: data.avaliadorNome, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
          }),
          ...(data.avaliadorCRECI ? [new Paragraph({
            text: `CRECI: ${data.avaliadorCRECI}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
          })] : []),
          ...(data.avaliadorCNAI ? [new Paragraph({
            text: `CNAI: ${data.avaliadorCNAI}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
          })] : []),
          ...(data.avaliadorCNPJ ? [new Paragraph({
            text: `CNPJ: ${data.avaliadorCNPJ}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
          })] : []),
          new Paragraph({
            text: `CPF: ${data.avaliadorCPF}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: `E-mail: ${data.avaliadorEmail}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
          }),
          new Paragraph({
            text: `Contato: ${data.avaliadorTelefone}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
          }),
          ...(data.avaliadorComissao ? [new Paragraph({
            children: [new TextRun({ text: `Comissão do Corretor: ${data.avaliadorComissao}`, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 }
          })] : [])
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error('Erro ao gerar DOCX:', error);
    throw new Error('Falha ao gerar DOCX');
  }
};
