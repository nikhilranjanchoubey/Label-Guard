import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import { InspectionRecord } from "@/types";

// Extends jsPDF type for autotable
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

export function generateInspectionPDF(record: InspectionRecord): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  }) as JsPDFWithAutoTable;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Accent (Tricolor rule)
  doc.setFillColor(255, 154, 60); // Saffron
  doc.rect(14, 10, pageWidth - 28, 1.2, "F");
  doc.setFillColor(255, 255, 255); // White
  doc.rect(14, 11.2, pageWidth - 28, 1.2, "F");
  doc.setFillColor(20, 156, 74); // India Green
  doc.rect(14, 12.4, pageWidth - 28, 1.2, "F");

  // Official Prototype Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(11, 16, 38);
  doc.text("LABEL GUARD — SIH 2026 PROTOTYPE", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(93, 102, 128);
  doc.text("DEPARTMENT OF CONSUMER AFFAIRS (CONTEXT) · PROBLEM STATEMENT 26034", pageWidth / 2, 24.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(61, 90, 254);
  doc.text("PACKAGED COMMODITY COMPLIANCE INSPECTION REPORT", pageWidth / 2, 30.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Legal Metrology (Packaged Commodities) Rules, 2011 · Optical & Deterministic Rule Adjudication", pageWidth / 2, 35, { align: "center" });

  // Thin separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 37.5, pageWidth - 14, 37.5);

  // Metadata Grid Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 40, pageWidth - 28, 26, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 40, pageWidth - 28, 26, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(11, 16, 38);
  doc.text(`Inspection ID: ${record.id}`, 18, 46);
  doc.text(`Date & Time: ${record.inspectionDate}`, 18, 51.5);
  doc.text(`Inspecting Officer: ${record.officerName} (${record.officerId})`, 18, 57);
  doc.text(`Jurisdiction: ${record.jurisdiction}`, 18, 62.5);

  // Right side of metadata
  doc.text(`Product Name: ${record.productName}`, 110, 46);
  doc.text(`Brand / Category: ${record.brand} | ${record.category}`, 110, 51.5);
  doc.text(`Batch / Lot No: ${record.batchLotNumber}`, 110, 57);

  // Status Badge
  const statusColor =
    record.status === "COMPLIANT"
      ? [20, 156, 74]
      : record.status === "NEEDS_REVIEW"
      ? [245, 158, 11]
      : [220, 38, 38];

  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 55, 57.5, 37, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`STATUS: ${record.status}`, pageWidth - 36.5, 62, { align: "center" });

  // Compliance Metrics Summary
  let currentY = 70.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(11, 16, 38);
  doc.text("1. COMPLIANCE COVERAGE & OCR CONFIDENCE", 14, currentY);

  currentY += 3.5;
  const metricsData = [
    [
      `Requirement Coverage: ${record.coverageScore}%`,
      `Avg OCR Confidence: ${record.ocrConfidenceAvg}%`,
      `Rule Engine Version: ${record.ruleSetVersion}`,
      `Total Checks: ${record.findings.length}`,
    ],
  ];

  (doc as any).autoTable({
    startY: currentY,
    head: [],
    body: metricsData,
    theme: "plain",
    styles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 46 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : currentY + 12;

  // Field-by-Field Declarations Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(11, 16, 38);
  doc.text("2. STATUTORY DECLARATION VALIDATION TABLE (PCR 2011)", 14, currentY);

  currentY += 3;
  const tableRows = record.findings.map((f, idx) => [
    (idx + 1).toString(),
    f.fieldLabel,
    f.extractedValue,
    f.status.replace("_", " "),
    `${Math.round(f.confidence * 100)}%`,
    f.ruleReference,
    f.remarks || "Evaluated against configured PCR rule.",
  ]);

  (doc as any).autoTable({
    startY: currentY,
    head: [["#", "Declaration Field", "Extracted Value", "Status", "Conf.", "Rule Ref.", "Observations & Citations"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [18, 26, 62],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [15, 23, 42],
      valign: "middle",
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 34 },
      2: { cellWidth: 42 },
      3: { cellWidth: 24, fontStyle: "bold" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 20 },
      6: { cellWidth: "auto" },
    },
    didParseCell: function (data: any) {
      if (data.section === "body" && data.column.index === 3) {
        const val = data.cell.raw;
        if (val === "COMPLIANT") {
          data.cell.styles.textColor = [20, 156, 74];
        } else if (val === "WARNING" || val === "LOW CONFIDENCE" || val === "MANUAL REVIEW") {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (val === "NON COMPLIANT" || val === "NOT DETECTED") {
          data.cell.styles.textColor = [220, 38, 38];
        } else {
          data.cell.styles.textColor = [79, 70, 229];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : currentY + 36;

  // Page break check for officer findings & signatures
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 18;
  }

  // Officer Remarks & Review Observations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(11, 16, 38);
  doc.text("3. REVIEWING OFFICER FINDINGS & DIRECTIONS", 14, currentY);

  currentY += 3.5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59);
  const notesLines = doc.splitTextToSize(
    record.officerNotes || "Inspected under configured rules of Legal Metrology (Packaged Commodities) Rules, 2011. Evidence recorded in prototype audit trail.",
    pageWidth - 36
  );
  doc.text(notesLines, 18, currentY + 5.5);

  currentY += 26;

  // Signature Block & Audit Hash
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(11, 16, 38);
  doc.text("Digital Audit Seal (SHA-256):", 14, currentY);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(record.digitalSignatureHash, 14, currentY + 4.5);

  // Officer Signature Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(11, 16, 38);
  doc.text("Reviewing Authority:", pageWidth - 70, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.text(record.officerName, pageWidth - 70, currentY + 4.5);
  doc.text("Demo Enforcement Officer (Zone 1)", pageWidth - 70, currentY + 8.5);

  // Footer Disclaimer & Page Number
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "SIH 2026 Prototype · Problem Statement 26034 · Demonstration report generated by Label Guard. Not an official Govt. certificate.",
      14,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }

  return doc;
}

export function downloadInspectionPDF(record: InspectionRecord) {
  const doc = generateInspectionPDF(record);
  doc.save(`LabelGuard_Report_${record.id}.pdf`);
}

export async function generateAndDownloadDOCX(record: InspectionRecord) {
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: "#", style: "bold" })], width: { size: 5, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ text: "Declaration Field", style: "bold" })], width: { size: 25, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ text: "Extracted Value", style: "bold" })], width: { size: 30, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ text: "Status", style: "bold" })], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ text: "Rule Ref", style: "bold" })], width: { size: 25, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...record.findings.map(
      (f, idx) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: (idx + 1).toString() })] }),
            new TableCell({ children: [new Paragraph({ text: f.fieldLabel })] }),
            new TableCell({ children: [new Paragraph({ text: f.extractedValue })] }),
            new TableCell({ children: [new Paragraph({ text: f.status.replace("_", " ") })] }),
            new TableCell({ children: [new Paragraph({ text: `${f.ruleReference} (${f.remarks || ""})` })] }),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "LABEL GUARD — SIH 2026 PROTOTYPE",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: "Problem Statement 26034 · Department of Consumer Affairs (Context)",
          }),
          new Paragraph({
            text: "PACKAGED COMMODITY COMPLIANCE INSPECTION REPORT",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Inspection ID: ${record.id}\n`, bold: true }),
              new TextRun({ text: `Product Name: ${record.productName}\n` }),
              new TextRun({ text: `Brand: ${record.brand} | Category: ${record.category}\n` }),
              new TextRun({ text: `Batch / Lot: ${record.batchLotNumber}\n` }),
              new TextRun({ text: `Inspection Date: ${record.inspectionDate}\n` }),
              new TextRun({ text: `Reviewing Officer: ${record.officerName} (${record.officerId})\n` }),
              new TextRun({ text: `Compliance Status: ${record.status}\n`, bold: true }),
              new TextRun({ text: `Requirement Coverage: ${record.coverageScore}%\n` }),
            ],
          }),
          new Paragraph({ text: "Declaration Validation Breakdown", heading: HeadingLevel.HEADING_2 }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: "\nReviewing Officer Observations", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: record.officerNotes || "Inspected under configured Legal Metrology (Packaged Commodities) Rules, 2011." }),
          new Paragraph({ text: `\nDigital Seal Hash: ${record.digitalSignatureHash}` }),
          new Paragraph({ text: "\nDisclaimer: SIH 2026 Prototype — Problem Statement 26034. Demonstration document generated by Label Guard. Not an official Government of India certificate." }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `LabelGuard_Report_${record.id}.docx`);
}
