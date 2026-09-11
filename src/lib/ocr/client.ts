import { OCRDocument, SurfaceType } from "./types";

const OCR_SESSION_KEY = "labelguard_active_ocr_session";

export async function uploadAndExtractOCR(
  file: File,
  surface: SurfaceType = "back"
): Promise<{ success: boolean; document?: OCRDocument; error?: string; errorHi?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("surface", surface);

  try {
    const res = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "OCR extraction failed.",
        errorHi: data.errorHi || "ओसीआर निष्कर्षण में त्रुटि हुई।",
      };
    }

    // Save active document to session storage for seamless cross-page inspection
    try {
      sessionStorage.setItem(OCR_SESSION_KEY, JSON.stringify(data.document));
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      document: data.document,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: `Network error connecting to OCR service: ${msg}`,
      errorHi: "नेटवर्क त्रुटि: ओसीआर सेवा से संपर्क स्थापित नहीं हो सका।",
    };
  }
}

export function getActiveOCRDocument(): OCRDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OCR_SESSION_KEY);
    if (raw) return JSON.parse(raw) as OCRDocument;
  } catch {
    // Ignore
  }
  return null;
}

export function setActiveOCRDocument(doc: OCRDocument): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(OCR_SESSION_KEY, JSON.stringify(doc));
  } catch {
    // Ignore
  }
}

export function clearActiveOCRDocument(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(OCR_SESSION_KEY);
  } catch {
    // Ignore
  }
}
