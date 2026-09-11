import { NextRequest, NextResponse } from "next/server";
import { complianceEngine } from "@/lib/compliance/engine";
import { ComplianceEvaluationInput } from "@/lib/compliance/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ComplianceEvaluationInput;

    if (!body || !body.declarationResult) {
      return NextResponse.json(
        {
          error: "Invalid request payload. 'declarationResult' is required for statutory compliance evaluation.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.declarationResult.fields)) {
      return NextResponse.json(
        {
          error: "Malformed 'declarationResult'. 'fields' array must be present.",
        },
        { status: 400 }
      );
    }

    // Server-side deterministic compliance evaluation
    const result = complianceEngine.evaluate(body);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("[ComplianceEvaluateAPI] Server error:", err);
    return NextResponse.json(
      {
        error: "Internal server error while executing compliance evaluation engine.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
