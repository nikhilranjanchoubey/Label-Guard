/**
 * LabelGuard — Step 4 Legal Rule Library Automated Unit & Integration Tests
 * Tests versioning, effective dates, applicability filtering, exemptions,
 * source traceability, and strict exclusion of unverified rules.
 * Run via: npx tsx scripts/legal/test-rules.ts
 */

import { legalRuleRepository } from "../../src/lib/legal/repository";
import { getApplicableRules } from "../../src/lib/legal/applicability";
import { validateRuleLibrary } from "../../src/lib/legal/validation";
import { LegalRule } from "../../src/lib/legal/types";

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
console.log("  LabelGuard Legal Rule Library — Test Suite (Step 4)             ");
console.log("==================================================================");

// -------------------------------------------------------------------------
// TEST 1: Repository Query & Integrity
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 1: Rule Repository Queries & Integrity ---");
const allRules = legalRuleRepository.getAllRules();
assert(allRules.length >= 15, `Repository contains at least 15 rules (found ${allRules.length})`);

const verifiedRules = legalRuleRepository.getVerifiedRules();
assert(verifiedRules.every((r) => r.verificationStatus === "VERIFIED"), "All verified rules have status VERIFIED");

const mrpRule = legalRuleRepository.getRuleById("LMPC-DECL-007");
assert(mrpRule !== undefined && mrpRule.statutoryReference === "Rule 6(1)(e)", "Found Rule 6(1)(e) MRP by internal ID LMPC-DECL-007");

const byRef = legalRuleRepository.getRuleByStatutoryRef("Rule 6(1)(a)");
assert(byRef !== undefined && byRef.internalRuleId === "LMPC-DECL-001", "Found Rule 6(1)(a) by statutory reference");

// -------------------------------------------------------------------------
// TEST 2: Validation Engine & Duplicate Detection
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 2: Validation Engine & Duplicate ID Trapping ---");
const report = validateRuleLibrary(allRules);
assert(report.isValid, "Authoritative library passes validation cleanly");

const duplicateRuleMock: LegalRule = {
  ...mrpRule!,
  id: "duplicate-uuid-test",
  // Reuse same internalRuleId to test duplicate trap
  internalRuleId: "LMPC-DECL-007",
};

const duplicateReport = validateRuleLibrary([...allRules, duplicateRuleMock]);
assert(!duplicateReport.isValid, "Validation engine correctly flags duplicate internalRuleId");
assert(
  duplicateReport.errors.some((e) => e.field === "internalRuleId" && e.message.includes("Duplicate")),
  "Duplicate internalRuleId error message correctly identified"
);

// -------------------------------------------------------------------------
// TEST 3: Effective Date & Amendment Versioning
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 3: Effective Date Logic & Version Selection ---");

// Test Product manufactured before Oct 1, 2022 (when Unit Sale Price Rule 6(11) was not in effect)
const historicalProduct = legalRuleRepository.getApplicableRules({
  productCategory: "Packaged Food",
  productDate: "2021-06-15",
  netQuantityValue: 500,
  netQuantityUnit: "g",
});

assert(
  !historicalProduct.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-008"),
  "Unit Sale Price (Rule 6(11), effective 2022-10-01) is NOT applied to 2021 product"
);

// Test Product manufactured in 2025 (modern)
const modernProduct = legalRuleRepository.getApplicableRules({
  productCategory: "Packaged Food",
  productDate: "2025-05-10",
  netQuantityValue: 500,
  netQuantityUnit: "g",
});

assert(
  modernProduct.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-008"),
  "Unit Sale Price (Rule 6(11)) IS applied to modern 2025 product"
);

// -------------------------------------------------------------------------
// TEST 4: Channel & Import Applicability Filtering
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 4: Channel & Import Applicability ---");

// Domestic non-ecommerce
const domesticPack = legalRuleRepository.getApplicableRules({
  productCategory: "General Commodity",
  isImported: false,
  isEcommerceListing: false,
  productDate: "2025-01-01",
});

assert(
  !domesticPack.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-002"),
  "Country of Origin Rule 6(1)(aa) does NOT apply to domestic package"
);
assert(
  !domesticPack.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-011"),
  "E-Commerce Rule 6(10) does NOT apply to physical package scan"
);

// Imported product
const importedPack = legalRuleRepository.getApplicableRules({
  productCategory: "General Commodity",
  isImported: true,
  isEcommerceListing: false,
  productDate: "2025-01-01",
});

assert(
  importedPack.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-002"),
  "Country of Origin Rule 6(1)(aa) DOES apply to imported product"
);

// E-commerce imported listing in late 2026 (Rule 6(10A) COO filter)
const ecomListing2026 = legalRuleRepository.getApplicableRules({
  productCategory: "Electronics",
  isImported: true,
  isEcommerceListing: true,
  productDate: "2026-08-01",
});

assert(
  ecomListing2026.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-012"),
  "2026 1st Amendment Rule 6(10A) COO filter applies to e-commerce imported listing after 01.07.2026"
);

// -------------------------------------------------------------------------
// TEST 5: Statutory Exemptions (Rule 26(a))
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 5: Statutory Exemptions (Rule 26(a) Small Packages) ---");

// 5g shampoo sachet (Exempt)
const smallSachet = legalRuleRepository.getApplicableRules({
  productCategory: "Cosmetics & Toiletries",
  netQuantityValue: 5,
  netQuantityUnit: "g",
  productDate: "2025-01-01",
});

assert(
  smallSachet.exemptedRules.some((e) => e.internalRuleId === "LMPC-DECL-001"),
  "5g cosmetic sachet receives statutory exemption notice under Rule 26(a)"
);

// 5g tobacco / gutkha packet (Rule 26(a) proviso: Tobacco is explicitly NOT exempt)
const smallTobacco = legalRuleRepository.getApplicableRules({
  productCategory: "Tobacco Products",
  netQuantityValue: 5,
  netQuantityUnit: "g",
  productDate: "2025-01-01",
});

assert(
  !smallTobacco.exemptedRules.some((e) => e.internalRuleId === "LMPC-DECL-001") &&
    smallTobacco.applicableRules.some((r) => r.internalRuleId === "LMPC-DECL-001"),
  "5g tobacco packet is DENIED small-package exemption per GSR 385(E) proviso to Rule 26(a)"
);

// -------------------------------------------------------------------------
// TEST 6: Strict Exclusion of NEEDS_REVIEW and SUPERSEDED from Compliance Sets
// -------------------------------------------------------------------------
console.log("\n--- TEST GROUP 6: Safe Legal Guardrails (No Unverified Rules Used) ---");

const genericInspection = legalRuleRepository.getApplicableRules({
  productCategory: "Packaged Food",
  productDate: "2025-01-01",
});

assert(
  !genericInspection.applicableRules.some((r) => r.verificationStatus === "NEEDS_REVIEW"),
  "NEEDS_REVIEW rules are strictly excluded from applicable compliance set"
);
assert(
  !genericInspection.applicableRules.some((r) => r.verificationStatus === "SUPERSEDED"),
  "SUPERSEDED rules are strictly excluded from active applicable compliance set"
);
assert(
  genericInspection.unverifiedRulesIgnored.some((r) => r.internalRuleId === "LMPC-REV-001"),
  "NEEDS_REVIEW rule (LMPC-REV-001) is safely catalogued in unverifiedRulesIgnored"
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
  console.log("[✓] ALL LEGAL RULE LIBRARY TESTS PASSED PERFECTLY!\n");
  process.exit(0);
}
