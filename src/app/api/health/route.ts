import { NextResponse } from "next/server";

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET() {
  let ocrHealthy = false;
  let ocrDetails = "Unreachable";
  let ocrEngine = "PaddleOCR + OpenCV";

  try {
    const res = await fetch(`${OCR_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      ocrHealthy = true;
      ocrDetails = data.service || "Connected";
      ocrEngine = data.engine || ocrEngine;
    }
  } catch (err: unknown) {
    ocrHealthy = false;
    ocrDetails = err instanceof Error ? err.message : "Service unavailable";
  }

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  return NextResponse.json({
    status: ocrHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: "v0.1.0-SIH2026",
    ruleLibraryVersion: "LMPC Act 2009 / Rules 2011 (as amended 2026) - 17 Verified Rules",
    services: {
      ocrMicroservice: {
        status: ocrHealthy ? "ONLINE" : "OFFLINE",
        url: OCR_SERVICE_URL,
        engine: ocrEngine,
        details: ocrDetails,
      },
      geminiAi: {
        status: geminiConfigured ? "CONFIGURED" : "NOT_CONFIGURED",
        provider: "Gemini 2.5 Flash Multimodal (Fallback to Rule Heuristics)",
      },
      complianceEngine: {
        status: "ONLINE",
        architecture: "Deterministic Rule-Based (LMPC 2011)",
        verifiedRuleCount: 17,
      },
      verificationAuditTrail: {
        status: "ONLINE",
        storage: "Local In-Memory / IndexedDB Field Cache",
      },
    },
  });
}
