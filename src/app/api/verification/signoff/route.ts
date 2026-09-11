import { NextRequest, NextResponse } from "next/server";
import { officerVerificationService } from "@/lib/verification/service";
import { SupervisorSignoffInput } from "@/lib/verification/types";

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as SupervisorSignoffInput;

    if (!input || !input.inspectionId || !input.supervisor) {
      return NextResponse.json(
        { error: "Missing required signoff parameters." },
        { status: 400 }
      );
    }

    const result = officerVerificationService.recordSupervisorSignoff(input);

    return NextResponse.json({
      success: true,
      signoff: result.signoff,
      auditEvent: result.auditEvent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal signoff error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
