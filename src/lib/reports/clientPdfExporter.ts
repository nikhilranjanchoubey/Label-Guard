import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Universal Client-Side Multi-Page PDF Exporter for LabelGuard Reports
 * Generates high-fidelity, multi-page statutory A4 inspection PDF documents directly
 * in the user's browser, eliminating reliance on local server binaries (e.g. Vercel serverless).
 */
export async function downloadInspectionReportAsPdf(
  elementId: string = "labelguard-report-document",
  filename: string = "LabelGuard_Inspection_Report.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Report element with ID #${elementId} was not found in the DOM.`);
  }

  // Clone element or enforce fixed capture dimensions for consistent high-res layout
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "visible";

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI for sharp Devanagari text & barcodes
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1200,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210; // A4 standard width in mm
    const pageHeight = 297; // A4 standard height in mm
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Page 1
    pdf.addImage(canvas, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    // Subsequent pages
    while (heightLeft > 5) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(canvas, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    // Save directly to user device
    pdf.save(filename);
  } finally {
    document.body.style.overflow = prevOverflow;
  }
}
