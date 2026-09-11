import { NextRequest, NextResponse } from "next/server";
import { buildInspectionReportData } from "@/lib/reports/generator";
import { generateReportHtml } from "@/lib/reports/htmlTemplate";
import { defaultReportRenderer } from "@/lib/reports/renderer";
import { ReportLanguageMode } from "@/lib/reports/types";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // Body is optional
  }

  const languageMode: ReportLanguageMode = (body?.languageMode as ReportLanguageMode) || "bilingual";
  const inspectionId: string | undefined = typeof body?.inspectionId === "string" ? body.inspectionId : undefined;

  try {
    // 1. Gather genuine inspection dataset
    const reportData = buildInspectionReportData(inspectionId);

    // 2. Generate high-fidelity print-optimized A4 HTML markup
    const markup = generateReportHtml(reportData, languageMode);

    // 3. Render HTML to PDF using renderer abstraction
    const isRendererAvailable = await defaultReportRenderer.isAvailable();
    if (!isRendererAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Local headless PDF engine is unavailable on this host.",
          errorHi: "स्थानीय पीडीएफ इंजन उपलब्ध नहीं है। कृपया ब्राउज़र प्रिंट का उपयोग करें।",
          canUseBrowserPrint: true,
        },
        { status: 503 }
      );
    }

    const pdfBuffer = await defaultReportRenderer.renderHtmlToPdf(markup);

    const filename = `LabelGuard_Inspection_${reportData.executiveSummary.inspectionId}_${languageMode}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[API/Reports/PDF] Error generating inspection PDF:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: `PDF generation failed: ${errorMsg}`,
        errorHi: "पीडीएफ तैयार करने में त्रुटि हुई। कृपया ब्राउज़र प्रिंट का उपयोग करें।",
        canUseBrowserPrint: true,
      },
      { status: 500 }
    );
  }
}
