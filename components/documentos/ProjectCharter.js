import { useState, useEffect, useRef } from "react";
import CharterFormat from "./CharterFormat";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ProjectCharter = () => {
    const pdfRef = useRef(null);

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("exported-content.pdf");
  };

    return (
        <div className="centered-container">
            <button onClick={generatePDF} className="p-2 bg-blue-500 text-white rounded-md">
        Baixar PDF
      </button>

            <div ref={pdfRef}>
            <CharterFormat/>
            </div>
            
        </div>
    )
}

export default ProjectCharter;