import { NextRequest, NextResponse } from "next/server";
import { OCRDocument } from "@/lib/ocr/types";
import { SourceType } from "@/lib/declarations/types";
import { extractDeclarationsWithGemini } from "@/lib/declarations/geminiExtractor";
import { extractDeclarationsFallback } from "@/lib/declarations/fallbackExtractor";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Malformed request: valid JSON body is required.",
        errorHi: "अमान्य अनुरोध: मान्य JSON डेटा आवश्यक है।",
      },
      { status: 400 }
    );
  }

  try {
    const ocrDocument: OCRDocument = body?.ocrDocument;
    const sourceType: SourceType = body?.sourceType || "PACKAGE_IMAGE";

    const itemsCandidate = (ocrDocument as unknown as { items?: unknown[] })?.items;
    const rawResults = Array.isArray(ocrDocument?.results)
      ? ocrDocument.results
      : Array.isArray(itemsCandidate)
      ? itemsCandidate
      : null;

    if (!ocrDocument || !rawResults || rawResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No OCR text was detected on this packaging image. Please provide a valid scan.",
          errorHi: "इस पैकेजिंग छवि पर कोई ओसीआर परिणाम नहीं मिला। कृपया स्पष्ट छवि अपलोड करें।",
        },
        { status: 400 }
      );
    }

    if (!ocrDocument.results) {
      ocrDocument.results = rawResults as typeof ocrDocument.results;
    }

    // Call semantic extraction engine with explicit fallback tracking
    let extractionResult;
    let engineSource: "GEMINI" | "FALLBACK" = "GEMINI";

    try {
      extractionResult = await extractDeclarationsWithGemini(ocrDocument, sourceType);
      engineSource = extractionResult.extractionSource || "GEMINI";
    } catch (engineErr: unknown) {
      const msg = engineErr instanceof Error ? engineErr.message : "Engine failure";
      console.warn("[API/Declarations/Extract] Gemini extractor failed, using fallback:", msg);
      try {
        extractionResult = extractDeclarationsFallback(ocrDocument, sourceType);
        engineSource = "FALLBACK";
        extractionResult.extractionSource = "FALLBACK";
        extractionResult.warnings.push(`Extraction fallback used: ${msg}`);
      } catch (fallbackErr: unknown) {
        const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : "Fallback engine failure";
        console.error("[API/Declarations/Extract] Both Gemini and fallback extractors failed:", fbMsg);
        return NextResponse.json(
          {
            success: false,
            error: `Both semantic engines failed: ${msg}; ${fbMsg}`,
            errorHi: "घोषणा निष्कर्षण इंजन विफल रहा। कृपया पुनः प्रयास करें।",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      result: extractionResult,
      extractionSource: engineSource,
      warnings: extractionResult.warnings || [],
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[API/Declarations/Extract] Unhandled exception:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: `Declaration extraction service error: ${errorMsg}`,
        errorHi: "घोषणा निष्कर्षण सेवा में आंतरिक त्रुटि। कृपया पुनः प्रयास करें।",
      },
      { status: 500 }
    );
  }
}
