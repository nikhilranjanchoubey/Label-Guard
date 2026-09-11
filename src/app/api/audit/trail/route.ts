import { NextRequest, NextResponse } from "next/server";
import { auditTrailService } from "@/lib/audit/trail";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const inspectionId = searchParams.get("inspectionId");

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Query parameter 'inspectionId' is required." },
        { status: 400 }
      );
    }

    const trail = auditTrailService.getAuditTrail(inspectionId);

    return NextResponse.json({
      success: true,
      trail,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal audit route error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
