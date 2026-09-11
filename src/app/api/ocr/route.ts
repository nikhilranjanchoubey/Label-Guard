import { NextRequest, NextResponse } from "next/server";
import { OCRDocument, SurfaceType, ExtractionResult } from "@/lib/ocr/types";

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const surface = (formData.get("surface") as SurfaceType) || "back";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in request." },
        { status: 400 }
      );
    }

    // 1. Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported image format: ${file.type}. Allowed formats are JPEG, PNG, WEBP.`,
          errorHi: "असमर्थित प्रारूप। कृपया केवल JPEG, PNG या WEBP छवियां अपलोड करें।",
        },
        { status: 400 }
      );
    }

    // 2. Validate maximum file size (15MB)
    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: "File size exceeds 15MB limit. Please upload an optimized image.",
          errorHi: "फ़ाइल का आकार 15MB की अधिकतम सीमा से अधिक है।",
        },
        { status: 400 }
      );
    }

    // 3. Prepare payload for FastAPI OCR service
    const serviceFormData = new FormData();
    serviceFormData.append("file", file, file.name);

    let ocrServiceResponse: Response;
    try {
      ocrServiceResponse = await fetch(`${OCR_SERVICE_URL}/ocr/extract`, {
        method: "POST",
        body: serviceFormData,
        signal: AbortSignal.timeout(60000), // 60s timeout
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : "Unknown error";
      console.warn("[API/OCR] OCR Service unreachable at:", OCR_SERVICE_URL, msg);
      return NextResponse.json(
        {
          error: "The OCR extraction microservice is currently unreachable or warming up.",
          errorHi: "ओसीआर निष्कर्षण सेवा वर्तमान में उपलब्ध नहीं है। कृपया पुनः प्रयास करें।",
          serviceUrl: OCR_SERVICE_URL,
        },
        { status: 503 }
      );
    }

    if (!ocrServiceResponse.ok) {
      const errText = await ocrServiceResponse.text();
      return NextResponse.json(
        {
          error: `OCR Engine error (${ocrServiceResponse.status}): ${errText}`,
          errorHi: "ओसीआर इंजन त्रुटि। कृपया पुनः प्रयास करें।",
        },
        { status: ocrServiceResponse.status }
      );
    }

    const ocrData = await ocrServiceResponse.json();

    if (!ocrData.success) {
      return NextResponse.json(
        {
          error: ocrData.error || "OCR extraction failed to recognize text.",
          errorHi: "ओसीआर निष्कर्षण पाठ पहचानने में असमर्थ रहा।",
        },
        { status: 422 }
      );
    }

    // 4. Map to unified OCRDocument
    const imageId = `IMG-${Date.now().toString(36).toUpperCase()}`;

    interface RawItem {
      id?: string;
      text: string;
      confidence: number;
      language: ExtractionResult["language"];
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
        pixelCoords?: number[][];
      };
    }

    const results: ExtractionResult[] = ((ocrData.items || []) as RawItem[]).map((item: RawItem, idx: number) => ({
      id: item.id || `OCR-${String(idx + 1).padStart(3, "0")}`,
      text: item.text,
      confidence: item.confidence,
      language: item.language,
      boundingBox: item.boundingBox,
      sourceImageId: imageId,
      surface,
    }));

    const document: OCRDocument = {
      imageId,
      surface,
      imageWidth: ocrData.imageWidth || 0,
      imageHeight: ocrData.imageHeight || 0,
      processingTimeMs: ocrData.processingTimeMs || 0,
      overallConfidence: ocrData.overallConfidence || 0,
      results,
      languagesDetected: ocrData.languagesDetected || [],
      quality: ocrData.quality,
      isDemo: false,
    };

    return NextResponse.json({ success: true, document });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown internal error";
    console.error("[API/OCR] Unhandled exception:", err);
    return NextResponse.json(
      {
        error: `Internal OCR processing error: ${errorMsg}`,
        errorHi: "आंतरिक प्रसंस्करण त्रुटि।",
      },
      { status: 500 }
    );
  }
}
