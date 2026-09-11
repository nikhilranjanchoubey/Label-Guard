import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Universal Client-Side Multi-Page PDF Exporter for LabelGuard Reports
 * Captures each statutory page individually to guarantee zero cut-off text or severed table rows.
 * Produces an exact 5-page official statutory dossier.
 */
export async function downloadInspectionReportAsPdf(
  elementId: string = "labelguard-report-document",
  filename: string = "LabelGuard_Inspection_Report.pdf"
): Promise<void> {
  const rootElement = document.getElementById(elementId);
  if (!rootElement) {
    throw new Error(`Report element with ID #${elementId} was not found in the DOM.`);
  }

  // Ensure all images (e.g. packaging evidence) are fully loaded before rasterizing
  const images = Array.from(rootElement.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "visible";

  try {
    const pages = Array.from(rootElement.querySelectorAll<HTMLElement>(".labelguard-report-page"));

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210; // A4 standard width in mm
    const pageHeight = 297; // A4 standard height in mm

    if (pages.length > 0) {
      // Discrete Multi-Page Mode: Capture each of the 5 pages cleanly onto its own A4 sheet
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];

        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }

        const canvas = await html2canvas(pageEl, {
          scale: 2, // 2x DPI for crisp Devanagari text, numbers, and barcodes
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 1100,
          scrollX: 0,
          scrollY: 0,
        });

        // Calculate fit with 6mm statutory margins
        const marginX = 6;
        const marginY = 6;
        const usableWidth = pageWidth - marginX * 2;
        const usableHeight = pageHeight - marginY * 2;

        const canvasRatio = canvas.width / canvas.height;
        let renderWidth = usableWidth;
        let renderHeight = usableWidth / canvasRatio;

        if (renderHeight > usableHeight) {
          renderHeight = usableHeight;
          renderWidth = usableHeight * canvasRatio;
        }

        // Center horizontally within margins, align from top margin
        const offsetX = marginX + (usableWidth - renderWidth) / 2;
        const offsetY = marginY;

        pdf.addImage(canvas, "JPEG", offsetX, offsetY, renderWidth, renderHeight, undefined, "FAST");
      }
    } else {
      // Fallback: Continuous canvas capture if no page markers
      const canvas = await html2canvas(rootElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1100,
      });

      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position -= pageHeight;
        pdf.addPage("a4", "portrait");
        pdf.addImage(canvas, "JPEG", 0, position, pageWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }
    }

    // Save directly to user device
    pdf.save(filename);
  } finally {
    document.body.style.overflow = prevOverflow;
  }
}
