import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exporta elemento HTML (incluindo gráficos) para PDF
 * @param elementId - ID do elemento HTML a ser capturado
 * @param filename - Nome do arquivo PDF (sem extensão)
 * @param title - Título do relatório
 * @param subtitle - Subtítulo opcional
 */
export async function exportChartToPDF(
  elementId: string,
  filename: string,
  title: string,
  subtitle?: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento com ID "${elementId}" não encontrado`);
    }

    // Capturar elemento como imagem
    const canvas = await html2canvas(element, {
      scale: 2, // Maior qualidade
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Criar PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dimensões da página A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calcular dimensões da imagem mantendo proporção
    const imgWidth = pageWidth - 20; // Margem de 10mm de cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Adicionar cabeçalho
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, 15, { align: 'center' });

    if (subtitle) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(subtitle, pageWidth / 2, 22, { align: 'center' });
    }

    // Adicionar imagem
    const yPosition = subtitle ? 30 : 25;
    
    if (imgHeight > pageHeight - yPosition - 15) {
      // Se a imagem for muito alta, dividir em múltiplas páginas
      let remainingHeight = imgHeight;
      let currentY = 0;
      let pageNum = 1;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageHeight - yPosition - 15, remainingHeight);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceHeight * canvas.width) / imgWidth;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            (currentY * canvas.width) / imgWidth,
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );

          const sliceImgData = sliceCanvas.toDataURL('image/png');
          pdf.addImage(sliceImgData, 'PNG', 10, yPosition, imgWidth, sliceHeight);
        }

        remainingHeight -= sliceHeight;
        currentY += sliceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          pageNum++;
        }
      }
    } else {
      // Imagem cabe em uma página
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    }

    // Adicionar rodapé
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        10,
        pageHeight - 10
      );
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - 10,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Salvar PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar PDF. Tente novamente.');
  }
}
