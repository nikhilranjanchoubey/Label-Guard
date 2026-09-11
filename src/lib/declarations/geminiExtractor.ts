/**
 * LabelGuard — Gemini Semantic Declaration Extraction Layer
 * Strictly structures facts from OCR tokens without making compliance decisions.
 */

import { GoogleGenAI } from "@google/genai";
import { OCRDocument, ExtractionResult } from "@/lib/ocr/types";
import {
  DeclarationExtractionResult,
  DeclarationField,
  DeclarationFieldType,
  DeclarationLanguage,
  DeclarationStatus,
  BoundingBoxPercent,
} from "./types";
import { extractDeclarationsFallback } from "./fallbackExtractor";

const SYSTEM_INSTRUCTION = `You are the specialized semantic extraction engine for LabelGuard, an AI-assisted packaged commodity inspection platform.
Your task is to analyze detected OCR text items with their bounding boxes and extract structured commodity declarations.

CRITICAL INSTRUCTIONS & CONSTRAINTS:
1. STRICT BOUNDARY: DO NOT assess statutory compliance. DO NOT determine PASS/FAIL or violations. DO NOT invent legal rules. Your ONLY role is to extract factual declarations present on the packaging.
2. EVIDENCE FIDELITY: Only extract declarations directly supported by the provided OCR items. NEVER hallucinate or guess missing values.
3. ABSENT FIELDS: If a declaration field is not found in the OCR evidence, set its status to "NOT_DETECTED", rawText to "", and normalizedValue to null.
4. AMBIGUITY HANDLING: If a field is visually ambiguous (for example, letter 'O' vs digit '0' in 'MRP 5O.00'), mark status as "AMBIGUOUS", provide the verbatim rawText, and provide a possibleInterpretation.
5. BILINGUAL PRESERVATION: The label may contain English, Hindi (Devanagari script), or both. DO NOT translate original packaging text. Store rawText exactly as printed. In normalizedValue, clean up numbers/standard units while preserving language context.
6. SOURCE LINKAGE: For every detected field, you MUST link the sourceOcrItemIds (the IDs of the OCR items where this text was found).

OUTPUT FORMAT:
Return a valid JSON object matching this schema:
{
  "category": string (e.g. "Packaged Food", "Edible Oil", "Personal Care", "Beverage", "Household Product", "Other"),
  "categoryConfidence": number (0.0 to 1.0),
  "fields": [
    {
      "fieldType": string (one of: PRODUCT_NAME, BRAND, CATEGORY, VARIANT, MANUFACTURER_NAME, MANUFACTURER_ADDRESS, PACKER_NAME, PACKER_ADDRESS, IMPORTER_NAME, IMPORTER_ADDRESS, COUNTRY_OF_ORIGIN, NET_QUANTITY, QUANTITY_UNIT, MRP, PRICE_TEXT, TAX_WORDING, MANUFACTURE_DATE, PACKING_DATE, IMPORT_DATE, BEST_BEFORE, USE_BY, EXPIRY_DATE, CONSUMER_CARE_PHONE, CONSUMER_CARE_EMAIL, CONSUMER_CARE_WEBSITE, CONSUMER_CARE_ADDRESS, BATCH_NUMBER, LOT_NUMBER, BARCODE, OTHER_DECLARATION),
      "rawText": string (verbatim snippet from OCR),
      "normalizedValue": string or null,
      "language": "en" | "hi" | "mixed" | "unknown",
      "confidence": number (0.0 to 1.0 extraction certainty),
      "status": "DETECTED" | "NOT_DETECTED" | "AMBIGUOUS",
      "possibleInterpretation": string or null,
      "sourceOcrItemIds": string[]
    }
  ],
  "warnings": string[]
}`;

export async function extractDeclarationsWithGemini(
  ocrDocument: OCRDocument,
  sourceType: "PACKAGE_IMAGE" | "PRODUCT_LISTING" = "PACKAGE_IMAGE"
): Promise<DeclarationExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.info(
      "[GeminiExtractor] GEMINI_API_KEY not set. Using high-precision bilingual fallback extractor."
    );
    const fallbackResult = extractDeclarationsFallback(ocrDocument, sourceType);
    fallbackResult.warnings.push(
      "Extraction completed using LabelGuard offline bilingual semantic parser (GEMINI_API_KEY environment variable not configured)."
    );
    return fallbackResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // Prepare OCR evidence payload for Gemini
    const ocrSummary = (ocrDocument.results || []).map((item) => ({
      id: item.id,
      text: item.text,
      language: item.language,
      confidence: item.confidence,
      boundingBox: item.boundingBox,
    }));

    const userPrompt = `Analyze the following OCR items detected from a packaged commodity (${ocrDocument.surface} panel).
Extract all structured declarations according to the specified instructions.

OCR ITEMS DETECTED (${ocrSummary.length} items):
${JSON.stringify(ocrSummary, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${userPrompt}` }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // High determinism for factual extraction
      },
    });

    let rawResponse = (response.text || "{}").trim();
    if (rawResponse.startsWith("```json")) {
      rawResponse = rawResponse.substring(7);
    } else if (rawResponse.startsWith("```")) {
      rawResponse = rawResponse.substring(3);
    }
    if (rawResponse.endsWith("```")) {
      rawResponse = rawResponse.substring(0, rawResponse.length - 3);
    }
    const parsedData = JSON.parse(rawResponse.trim());

    // Map item IDs to bounding boxes from original OCR document
    const ocrItemMap = new Map<string, ExtractionResult>();
    (ocrDocument.results || []).forEach((item) => {
      ocrItemMap.set(item.id, item);
    });

    interface GeminiFieldItem {
      fieldType?: string;
      rawText?: string;
      normalizedValue?: string | null;
      language?: string;
      confidence?: number;
      status?: string;
      possibleInterpretation?: string | null;
      sourceOcrItemIds?: string[];
    }

    const fields: DeclarationField[] = ((parsedData.fields || []) as GeminiFieldItem[]).map(
      (f: GeminiFieldItem, idx: number) => {
        const sourceIds: string[] = Array.isArray(f.sourceOcrItemIds)
          ? f.sourceOcrItemIds
          : [];

        // Compute union bounding box if source items exist
        let box: BoundingBoxPercent | undefined = undefined;
        const matchedItems = sourceIds
          .map((id) => ocrItemMap.get(id))
          .filter(Boolean) as ExtractionResult[];

        if (matchedItems.length > 0) {
          const minX = Math.min(...matchedItems.map((m) => m.boundingBox.x));
          const minY = Math.min(...matchedItems.map((m) => m.boundingBox.y));
          const maxX = Math.max(
            ...matchedItems.map((m) => m.boundingBox.x + m.boundingBox.width)
          );
          const maxY = Math.max(
            ...matchedItems.map((m) => m.boundingBox.y + m.boundingBox.height)
          );
          box = {
            x: Math.round(minX * 100) / 100,
            y: Math.round(minY * 100) / 100,
            width: Math.round((maxX - minX) * 100) / 100,
            height: Math.round((maxY - minY) * 100) / 100,
          };
        }

        return {
          id: `DEC-${f.fieldType || idx + 1}`,
          fieldType: (f.fieldType as DeclarationFieldType) || "OTHER_DECLARATION",
          labelKey: `declarations.${(f.fieldType || "other").toLowerCase()}`,
          rawText: f.rawText || "",
          normalizedValue: f.normalizedValue || undefined,
          language: (f.language as DeclarationLanguage) || "unknown",
          confidence: typeof f.confidence === "number" ? f.confidence : 0.85,
          status: (f.status as DeclarationStatus) || "DETECTED",
          possibleInterpretation: f.possibleInterpretation || undefined,
          sourceImageId: ocrDocument.imageId,
          sourceOcrItemIds: sourceIds,
          boundingBox: box,
          sourceType,
        };
      }
    );

    const detectedFields = fields.filter((f) => f.status === "DETECTED");
    const overallConf =
      detectedFields.length > 0
        ? Math.round(
            (detectedFields.reduce((acc, f) => acc + f.confidence, 0) /
              detectedFields.length) *
              100
          ) / 100
        : 0.0;

    return {
      productId: ocrDocument.imageId || `PROD-${Date.now().toString(36).toUpperCase()}`,
      sourceType,
      sourceImages: [ocrDocument.previewUrl || ""].filter(Boolean),
      fields,
      overallExtractionConfidence: overallConf,
      extractionTimestamp: new Date().toISOString(),
      extractionEngine: `Gemini (${modelName}) + Spatial Linking`,
      extractionSource: "GEMINI",
      category: parsedData.category || "Packaged Commodity",
      categoryConfidence: parsedData.categoryConfidence || 0.85,
      warnings: parsedData.warnings || [],
      isDemo: !!ocrDocument.isDemo,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GeminiExtractor] Gemini call failed, falling back to local extractor:", errorMsg);

    const fallbackResult = extractDeclarationsFallback(ocrDocument, sourceType);
    fallbackResult.extractionSource = "FALLBACK";
    fallbackResult.warnings.push(
      `Gemini extraction error: ${errorMsg}. Fallback bilingual extractor utilized.`
    );
    return fallbackResult;
  }
}
