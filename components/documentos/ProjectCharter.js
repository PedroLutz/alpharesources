import { useState, useEffect, useRef } from "react";
import CharterFormat from "./CharterFormat";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ProjectCharter = () => {
  const pdfRef = useRef(null);

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    // Cria um canvas com a imagem do conteúdo
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");

    // Cria o PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // Largura da página A4 em milímetros
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 0; // Define a posição inicial da imagem na página
    const pageHeight = 297; // Altura da página A4 em milímetros
    const contentHeight = imgHeight;

    // Adiciona a primeira página
    pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, contentHeight);

    // Verifica se a altura do conteúdo excede a altura de uma página
    while (contentHeight > pageHeight) {
      // Se o conteúdo não couber na página, divide ele e passa para a próxima
      yPosition = -(contentHeight - pageHeight); // Ajusta a posição para a próxima página
      pdf.addPage(); // Adiciona nova página
      pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, contentHeight); // Adiciona o conteúdo na nova página

      break; // Finaliza o loop para garantir que o conteúdo não seja repetido
    }

    // Salva o PDF
    pdf.save("exported-content.pdf");
  };

  return (
    <div className="centered-container">
      <button onClick={generatePDF} className="p-2 bg-blue-500 text-white rounded-md">
        Baixar PDF
      </button>

      <div ref={pdfRef}>
        <CharterFormat />
      </div>
    </div>
  );
};

export default ProjectCharter;
