/**
 * LabelGuard — Step 5: Deterministic Compliance Engine Automated Test Suite
 * Tests deterministic conditions, uncertainty handling, conflict resolution,
 * uncalibrated font size handling, statutory exemptions, and audit non-repudiation.
 * Run via: npx tsx scripts/compliance/test-compliance-engine.ts
 */

import { complianceEngine } from "../../src/lib/compliance/engine";
import { SAMPLE_COMPLIANCE_INPUT } from "../../src/lib/compliance/demoSample";
import { ComplianceEvaluationInput } from "../../src/lib/compliance/types";
import { DeclarationField } from "../../src/lib/declarations/types";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failCount++;
  }
}

console.log("==================================================================");
console.log("  LabelGuard Deterministic Compliance Engine — Test Suite (Step 5)");
console.log("==================================================================");

// -------------------------------------------------------------------------
// TEST GROUP 1: Standard Evaluation & Presentation
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 1: Standard Evaluation & Deterministic Status ---");
const sampleResult = complianceEngine.evaluate(SAMPLE_COMPLIANCE_INPUT);

assert(sampleResult.rulesEvaluated.length >= 8, `Evaluated applicable verified rules (found ${sampleResult.rulesEvaluated.length})`);
assert(sampleResult.rulesEvaluated.every((r) => ["PASS", "FAIL", "REVIEW", "NOT_APPLICABLE"].includes(r.status)), "All evaluations use strictly allowed statuses");
assert(sampleResult.auditHash.startsWith("LG-AUDIT-"), `Audit hash generated (${sampleResult.auditHash})`);

const netQtyEval = sampleResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-004");
assert(netQtyEval !== undefined && netQtyEval.status === "PASS", "Net Quantity rule evaluates to PASS on valid declaration");
assert(Boolean(netQtyEval?.evidence?.ocrText.includes("400 g")), "Net Quantity rule binds directly to OCR evidence");

// -------------------------------------------------------------------------
// TEST GROUP 2: Missing Mandatory Declarations (FAIL determination)
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 2: Missing Mandatory Declarations (FAIL Determination) ---");

// Remove manufacturer name and net quantity
const missingFieldsInput: ComplianceEvaluationInput = {
  inspectionId: "TEST-MISSING-FIELDS",
  declarationResult: {
    ...SAMPLE_COMPLIANCE_INPUT.declarationResult,
    fields: SAMPLE_COMPLIANCE_INPUT.declarationResult.fields.filter(
      (f) => f.fieldType !== "MANUFACTURER_NAME" && f.fieldType !== "MANUFACTURER_ADDRESS"
    ),
  },
  metadata: {
    category: "Packaged Food",
  },
};

const missingResult = complianceEngine.evaluate(missingFieldsInput);
const mfgEval = missingResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-001");
assert(mfgEval !== undefined && mfgEval.status === "FAIL", "Missing manufacturer declaration evaluates to FAIL");
assert(missingResult.summary.overallStatus === "NEEDS_ATTENTION", "Overall summary flags NEEDS_ATTENTION when any rule FAILs");

// -------------------------------------------------------------------------
// TEST GROUP 3: Uncertainty Handling — Low OCR Confidence (< 0.70)
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 3: Uncertainty Handling — Low OCR Confidence (< 0.70) ---");

const lowConfidenceInput: ComplianceEvaluationInput = {
  inspectionId: "TEST-LOW-CONF",
  declarationResult: {
    ...SAMPLE_COMPLIANCE_INPUT.declarationResult,
    fields: SAMPLE_COMPLIANCE_INPUT.declarationResult.fields.map((f) => {
      if (f.fieldType === "MRP") {
        return { ...f, confidence: 0.55 }; // below 0.70 threshold
      }
      return f;
    }),
  },
  metadata: { category: "Packaged Food" },
};

const lowConfResult = complianceEngine.evaluate(lowConfidenceInput);
const mrpLowConfEval = lowConfResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-007");
assert(mrpLowConfEval !== undefined && mrpLowConfEval.status === "REVIEW", "Low OCR confidence on MRP returns REVIEW instead of FAIL or PASS");
assert(Boolean(mrpLowConfEval?.reason.includes("below audit threshold")), "Justification identifies low optical confidence");

// -------------------------------------------------------------------------
// TEST GROUP 4: Uncertainty Handling — Ambiguous Field Extraction
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 4: Uncertainty Handling — Ambiguous Field Extraction ---");

const ambiguousFieldInput: ComplianceEvaluationInput = {
  inspectionId: "TEST-AMBIGUOUS",
  declarationResult: {
    ...SAMPLE_COMPLIANCE_INPUT.declarationResult,
    fields: SAMPLE_COMPLIANCE_INPUT.declarationResult.fields.map((f) => {
      if (f.fieldType === "MANUFACTURE_DATE") {
        return { ...f, status: "AMBIGUOUS" as const, rawText: "MFD 0?/202?" };
      }
      return f;
    }),
  },
  metadata: { category: "Packaged Food" },
};

const ambigResult = complianceEngine.evaluate(ambiguousFieldInput);
const mfdAmbigEval = ambigResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-005");
assert(mfdAmbigEval !== undefined && mfdAmbigEval.status === "REVIEW", "Ambiguous date extraction returns REVIEW");
assert(Boolean(mfdAmbigEval?.reason.includes("Ambiguous extraction")), "Justification specifies ambiguous optical extraction");

// -------------------------------------------------------------------------
// TEST GROUP 5: Uncertainty Handling — Conflicting Declarations
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 5: Uncertainty Handling — Conflicting Declarations ---");

const conflictFields: DeclarationField[] = [
  ...SAMPLE_COMPLIANCE_INPUT.declarationResult.fields,
  {
    id: "FLD-CONFLICT-MRP",
    fieldType: "MRP",
    labelKey: "declarations.fields.mrp",
    rawText: "MRP ₹150.00",
    normalizedValue: "₹150.00",
    language: "en",
    confidence: 0.95,
    status: "DETECTED",
    sourceOcrItemIds: ["OCR-CONFLICT-01"],
    sourceType: "PACKAGE_IMAGE",
  },
];

const conflictInput: ComplianceEvaluationInput = {
  inspectionId: "TEST-CONFLICT-MRP",
  declarationResult: {
    ...SAMPLE_COMPLIANCE_INPUT.declarationResult,
    fields: conflictFields,
  },
  metadata: { category: "Packaged Food" },
};

const conflictResult = complianceEngine.evaluate(conflictInput);
const mrpConflictEval = conflictResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-007");
assert(mrpConflictEval !== undefined && mrpConflictEval.status === "REVIEW", "Conflicting MRP declarations return REVIEW");
assert(Boolean(mrpConflictEval?.reason.includes("Conflicting values detected")), "Justification records both conflicting values");
assert(mrpConflictEval?.evidence?.additionalEvidence !== undefined, "Conflict links additional evidence reference");

// -------------------------------------------------------------------------
// TEST GROUP 6: Font Size Calibration Guard (LMPC-DECL-013)
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 6: Font Size Calibration Guard (Table-I / LMPC-DECL-013) ---");

const uncalibratedInput: ComplianceEvaluationInput = {
  ...SAMPLE_COMPLIANCE_INPUT,
  metadata: {
    category: "Packaged Food",
    hasPhysicalScaleCalibration: false, // Physical scale is absent
  },
};

const uncalibratedResult = complianceEngine.evaluate(uncalibratedInput);
const fontSizeEval = uncalibratedResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-013");
assert(fontSizeEval !== undefined && fontSizeEval.status === "REVIEW", "Uncalibrated font size rule returns REVIEW");
assert(
  Boolean(fontSizeEval?.reason.includes("Physical scale calibration is unavailable")),
  "Reason explicitly clarifies physical scale calibration unavailability"
);

// -------------------------------------------------------------------------
// TEST GROUP 7: Statutory Exemptions (Rule 26(a))
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 7: Statutory Exemptions (Rule 26(a) 10g Package) ---");

const smallSachetInput: ComplianceEvaluationInput = {
  inspectionId: "TEST-SACHET-10G",
  metadata: {
    category: "Packaged Food",
    netQuantityValue: 8,
    netQuantityUnit: "g",
  },
  declarationResult: {
    ...SAMPLE_COMPLIANCE_INPUT.declarationResult,
    fields: [], // No declarations on 8g sachet
  },
};

const sachetResult = complianceEngine.evaluate(smallSachetInput);
assert(sachetResult.exemptions.length > 0, "8g sachet receives statutory exemption notice under Rule 26(a)");
assert(
  !sachetResult.rulesEvaluated.some((r) => r.internalRuleId === "LMPC-DECL-001"),
  "General declarations not enforced against exempted 8g food sachet"
);

// -------------------------------------------------------------------------
// TEST GROUP 8: Prohibition of LLM / Client Overrides
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 8: Server-Side Determinism Guard ---");

// Check that client cannot pass fake "status: PASS" inside declaration results to fool the engine
const hostileInput: ComplianceEvaluationInput = {
  inspectionId: "TEST-HOSTILE",
  declarationResult: {
    ...SAMPLE_COMPLIANCE_INPUT.declarationResult,
    // Field has rawText empty and is NOT_DETECTED, but with fraudulent client properties
    fields: [
      {
        id: "FRAUD-01",
        fieldType: "PRODUCT_NAME",
        labelKey: "product_name",
        rawText: "",
        status: "NOT_DETECTED",
        language: "en",
        confidence: 1.0,
        sourceOcrItemIds: [],
        sourceType: "PACKAGE_IMAGE",
      },
    ],
  },
  metadata: { category: "Packaged Food" },
};

const hostileResult = complianceEngine.evaluate(hostileInput);
const productNameEval = hostileResult.rulesEvaluated.find((r) => r.internalRuleId === "LMPC-DECL-003");
assert(
  productNameEval !== undefined && productNameEval.status === "FAIL",
  "Engine deterministically evaluates NOT_DETECTED mandatory field as FAIL despite high confidence payload"
);

// -------------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`TEST RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log("==================================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("[✓] ALL COMPLIANCE ENGINE DETERMINISTIC TESTS PASSED CLEANLY!\n");
  process.exit(0);
}
