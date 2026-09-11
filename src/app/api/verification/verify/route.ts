import { NextRequest, NextResponse } from "next/server";
import { officerVerificationService } from "@/lib/verification/service";
import { VerificationSubmissionInput } from "@/lib/verification/types";
import { RuleEvaluation } from "@/lib/compliance/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body.input as VerificationSubmissionInput;
    const automatedEvaluation = body.automatedEvaluation as RuleEvaluation;

    if (!input || !automatedEvaluation) {
      return NextResponse.json(
        { error: "Missing verification input or automated evaluation payload." },
        { status: 400 }
      );
    }

    const result = officerVerificationService.recordVerification(input, automatedEvaluation);

    return NextResponse.json({
      success: true,
      verification: result.verification,
      auditEvent: result.auditEvent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal verification error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
