import { NextRequest, NextResponse } from "next/server";
import { officerVerificationService } from "@/lib/verification/service";
import { ValueCorrectionInput } from "@/lib/verification/types";

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as ValueCorrectionInput;

    if (!input || !input.fieldId || !input.correctedValue) {
      return NextResponse.json(
        { error: "Missing required value correction parameters." },
        { status: 400 }
      );
    }

    const result = officerVerificationService.recordValueCorrection(input);

    return NextResponse.json({
      success: true,
      auditEvent: result.auditEvent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal correction error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
