/**
 * LabelGuard — Step 6 Automated Test Suite
 * Human-in-the-Loop Verification, Value Correction, RBAC, and Immutable Audit Trail.
 */

import { auditTrailService } from "../../src/lib/audit/trail";
import { officerVerificationService } from "../../src/lib/verification/service";
import { complianceEngine } from "../../src/lib/compliance/engine";
import { SAMPLE_COMPLIANCE_INPUT } from "../../src/lib/compliance/demoSample";
import { AuditUser } from "../../src/lib/audit/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

const OFFICER_USER: AuditUser = {
  id: "OFF-DL-4082",
  name: "Rajesh Sharma",
  role: "OFFICER",
  badgeNumber: "DL-METRO-4082",
  station: "Delhi Metrology Zone - I",
};

const SUPERVISOR_USER: AuditUser = {
  id: "SUP-DL-1004",
  name: "Dr. Ananya Verma",
  role: "SUPERVISOR",
  badgeNumber: "DL-SUP-1004",
  station: "Northern Zone Directorate",
};

async function runTests() {
  console.log("\n==================================================================");
  console.log("  LabelGuard Human Verification & Audit Trail — Test Suite (Step 6)");
  console.log("==================================================================\n");

  const testInspectionId = `INS-TEST-${Date.now()}`;
  officerVerificationService.clear(testInspectionId);
  auditTrailService.clear(testInspectionId);

  // 1. Generate baseline compliance result from engine
  const compResult = complianceEngine.evaluate({
    ...SAMPLE_COMPLIANCE_INPUT,
    inspectionId: testInspectionId,
  });

  const netQtyRule = compResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-004");
  const mrpRule = compResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-007");
  const fontRule = compResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-013");

  if (!netQtyRule || !mrpRule || !fontRule) {
    throw new Error("Missing expected evaluated rules in test fixture");
  }

  // --- TEST GROUP 1: Officer Confirmation & Non-Overwrite Guarantee ---
  console.log("--- TEST GROUP 1: Officer Confirmation & Non-Overwrite Guarantee ---");

  const confResult = officerVerificationService.recordVerification(
    {
      inspectionId: testInspectionId,
      ruleEvaluationId: netQtyRule.ruleId,
      internalRuleId: netQtyRule.internalRuleId,
      action: "CONFIRM",
      officerStatus: "CONFIRMED",
      officer: OFFICER_USER,
      reason: "Net quantity verified on primary package panel with calibrated laboratory balance.",
    },
    netQtyRule
  );

  assert(confResult.verification.officerStatus === "CONFIRMED", "Officer decision recorded as CONFIRMED");
  assert(
    confResult.verification.originalAutomatedStatus === "PASS",
    "Original automated status 'PASS' preserved intact"
  );
  assert(
    confResult.verification.officer.id === OFFICER_USER.id,
    "Verification attributed to active officer ID"
  );
  assert(
    confResult.verification.evidenceReferences.length > 0,
    "Evidence reference preserved in verification record"
  );

  // --- TEST GROUP 2: Value Correction Workflow ---
  console.log("\n--- TEST GROUP 2: Declaration Value Correction Workflow ---");

  const corrResult = officerVerificationService.recordVerification(
    {
      inspectionId: testInspectionId,
      ruleEvaluationId: mrpRule.ruleId,
      internalRuleId: mrpRule.internalRuleId,
      action: "CORRECT",
      officerStatus: "CORRECTED",
      officer: OFFICER_USER,
      reason: "MRP stamp is ₹189.00 instead of optical ₹110.00 due to local promotional overlay.",
      newValue: "₹ 189.00",
    },
    mrpRule
  );

  assert(corrResult.verification.officerStatus === "CORRECTED", "Officer decision recorded as CORRECTED");
  assert(corrResult.verification.previousValue === mrpRule.extractedValue, "Previous extracted value preserved");
  assert(corrResult.verification.newValue === "₹ 189.00", "New corrected value recorded");
  assert(
    corrResult.verification.originalAutomatedStatus === mrpRule.status,
    "Original automated status preserved during correction"
  );

  // --- TEST GROUP 3: Mandatory Justification for Status Override ---
  console.log("\n--- TEST GROUP 3: Mandatory Justification on Override (No Silent Changes) ---");

  let threwWithoutReason = false;
  try {
    officerVerificationService.recordVerification(
      {
        inspectionId: testInspectionId,
        ruleEvaluationId: fontRule.ruleId,
        internalRuleId: fontRule.internalRuleId,
        action: "CONFIRM",
        officerStatus: "CONFIRMED",
        officer: OFFICER_USER,
        reason: "", // Blank reason on override (automated status was REVIEW)
      },
      fontRule
    );
  } catch (err: unknown) {
    threwWithoutReason = true;
  }
  assert(threwWithoutReason, "Overriding automated REVIEW to CONFIRMED without substantive reason is rejected");

  // Record with valid reason
  const validOverride = officerVerificationService.recordVerification(
    {
      inspectionId: testInspectionId,
      ruleEvaluationId: fontRule.ruleId,
      internalRuleId: fontRule.internalRuleId,
      action: "CONFIRM",
      officerStatus: "CONFIRMED",
      officer: OFFICER_USER,
      reason: "Physical numeral height measured at 4.2mm with certified vernier caliper (exceeds 4.0mm Table-I requirement).",
    },
    fontRule
  );
  assert(validOverride.verification.officerStatus === "CONFIRMED", "Valid override with justification succeeds");

  // --- TEST GROUP 4: Append-Only Tamper-Evident Audit Trail ---
  console.log("\n--- TEST GROUP 4: Append-Only Audit Trail & Hash Chaining ---");

  const trail = auditTrailService.getAuditTrail(testInspectionId);
  assert(trail.events.length >= 3, `Audit trail recorded all events (found ${trail.events.length})`);
  assert(trail.isTamperEvident, "Cryptographic hash chain verifies as valid and tamper-evident");

  // Verify hash chaining mathematically
  let chainOk = true;
  for (let i = 1; i < trail.events.length; i++) {
    if (trail.events[i].previousHash !== trail.events[i - 1].hash) {
      chainOk = false;
      break;
    }
  }
  assert(chainOk, "Each audit event strictly chains to the previous event's hash");

  // --- TEST GROUP 5: Tamper Detection Simulation ---
  console.log("\n--- TEST GROUP 5: Tamper Detection Proof ---");

  const tamperedEvents = JSON.parse(JSON.stringify(trail.events));
  tamperedEvents[1].newState.officerStatus = "FORGED_STATUS"; // Malicious modification
  const integrity = auditTrailService.verifyIntegrity(tamperedEvents);
  assert(!integrity.valid, "Integrity verifier successfully detects unauthorized state alteration");
  assert(integrity.brokenAt === 1, "Verifier precisely identifies event index where chain broke");

  // --- TEST GROUP 6: Role-Based Access Control (RBAC) ---
  console.log("\n--- TEST GROUP 6: Role-Based Access Control (RBAC) ---");

  // Ordinary OFFICER attempting supervisor sign-off must fail
  let officerSignoffBlocked = false;
  try {
    officerVerificationService.recordSupervisorSignoff({
      inspectionId: testInspectionId,
      supervisor: OFFICER_USER, // Wrong role!
      approved: true,
      remarks: "Attempting officer signoff",
    });
  } catch {
    officerSignoffBlocked = true;
  }
  assert(officerSignoffBlocked, "Officer role is blocked from executing supervisor sign-off");

  // SUPERVISOR executing sign-off succeeds
  const supSignoff = officerVerificationService.recordSupervisorSignoff({
    inspectionId: testInspectionId,
    supervisor: SUPERVISOR_USER,
    approved: true,
    remarks: "Certified all physical metric marks and officer verifications under Section 18 of LM Act, 2009.",
  });
  assert(supSignoff.signoff.approved === true, "Supervisor sign-off successfully recorded");
  assert(supSignoff.signoff.signatureHash.startsWith("SIG-"), "Cryptographic supervisor signature hash generated");

  // Summary check
  const summary = officerVerificationService.getSummary(testInspectionId, compResult.rulesEvaluated.length);
  assert(summary.confirmedCount >= 2, "Summary correctly counts confirmed rules");
  assert(summary.correctedCount >= 1, "Summary correctly counts corrected rules");
  assert(summary.supervisorSignoff !== undefined, "Summary includes certified supervisor sign-off record");

  console.log("\n==================================================================");
  console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("[✓] ALL STEP 6 VERIFICATION & AUDIT TESTS PASSED CLEANLY!\n");
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
