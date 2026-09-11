import { NextRequest, NextResponse } from "next/server";
import { OCRDocument } from "@/lib/ocr/types";
import { SourceType } from "@/lib/declarations/types";
import { extractDeclarationsWithGemini } from "@/lib/declarations/geminiExtractor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ocrDocument: OCRDocument = body.ocrDocument;
    const sourceType: SourceType = body.sourceType || "PACKAGE_IMAGE";

    if (!ocrDocument || !Array.isArray(ocrDocument.results)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: OCRDocument with detected results is required.",
          errorHi: "अमान्य अनुरोध: ओसीआर परिणाम आवश्यक हैं।",
        },
        { status: 400 }
      );
    }

    if (ocrDocument.results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No OCR text was detected on this packaging image. Please re-scan with clearer lighting.",
          errorHi: "इस पैकेजिंग छवि पर कोई ओसीआर टेक्स्ट नहीं मिला। कृपया पुनः स्कैन करें।",
        },
        { status: 422 }
      );
    }

    // Call semantic extraction engine
    const extractionResult = await extractDeclarationsWithGemini(ocrDocument, sourceType);

    return NextResponse.json({
      success: true,
      result: extractionResult,
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
