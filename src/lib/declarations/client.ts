/**
 * LabelGuard — Client API for Declaration Extraction & Audit Management
 */

import { OCRDocument } from "@/lib/ocr/types";
import {
  DeclarationExtractionResult,
  DeclarationField,
  ManualEditAudit,
  SourceType,
} from "./types";

const DECLARATION_SESSION_KEY = "labelguard_active_declarations";

export interface DeclarationExtractApiResponse {
  success: boolean;
  result?: DeclarationExtractionResult;
  error?: string;
  errorHi?: string;
}

/**
 * Calls backend API to perform semantic extraction on OCRDocument
 */
export async function extractDeclarations(
  ocrDocument: OCRDocument,
  sourceType: SourceType = "PACKAGE_IMAGE"
): Promise<DeclarationExtractApiResponse> {
  try {
    const res = await fetch("/api/declarations/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ocrDocument,
        sourceType,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Declaration extraction failed.",
        errorHi: data.errorHi || "घोषणा निष्कर्षण में त्रुटि हुई।",
      };
    }

    // Persist to session storage for seamless cross-page inspection
    setActiveDeclarationResult(data.result);

    return {
      success: true,
      result: data.result,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: `Network error connecting to declaration extraction service: ${msg}`,
      errorHi: "घोषणा सेवा से संपर्क स्थापित नहीं हो सका।",
    };
  }
}

export function getActiveDeclarationResult(): DeclarationExtractionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DECLARATION_SESSION_KEY);
    if (raw) return JSON.parse(raw) as DeclarationExtractionResult;
  } catch {
    // Ignore
  }
  return null;
}

export function setActiveDeclarationResult(
  result: DeclarationExtractionResult
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DECLARATION_SESSION_KEY, JSON.stringify(result));
  } catch {
    // Ignore
  }
}

/**
 * Performs an inspector-authorized manual field correction and updates audit trail
 */
export function recordManualFieldCorrection(
  fieldId: string,
  newNormalizedValue: string,
  editedBy: string,
  editReason: string
): DeclarationExtractionResult | null {
  const current = getActiveDeclarationResult();
  if (!current) return null;

  const targetIndex = current.fields.findIndex((f) => f.id === fieldId);
  if (targetIndex === -1) return null;

  const targetField = current.fields[targetIndex];
  const original = targetField.normalizedValue || targetField.rawText;

  const auditEntry: ManualEditAudit = {
    originalValue: original,
    editedValue: newNormalizedValue,
    editedBy: editedBy.trim() || "Inspector (Auth)",
    editedAt: new Date().toISOString(),
    editReason: editReason.trim() || "Manual field verification / ambiguity resolution",
  };

  const updatedField: DeclarationField = {
    ...targetField,
    normalizedValue: newNormalizedValue,
    status: "DETECTED", // Resolved
    auditTrail: [...(targetField.auditTrail || []), auditEntry],
  };

  const updatedFields = [...current.fields];
  updatedFields[targetIndex] = updatedField;

  const updatedResult: DeclarationExtractionResult = {
    ...current,
    fields: updatedFields,
  };

  setActiveDeclarationResult(updatedResult);
  return updatedResult;
}
