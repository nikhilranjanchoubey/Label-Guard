/**
 * LabelGuard — Legal Metrology Rule Validation Script
 * Executes strict structural, statutory, source, and integrity checks.
 * Run via: npm run rules:validate
 */

import { validateRuleLibrary } from "../../src/lib/legal/validation";
import { VERIFIED_RULES_DATA } from "../../src/lib/legal/data/verifiedRules";

console.log("==================================================================");
console.log("  LabelGuard Legal Metrology Rule Library — Verification Suite    ");
console.log("==================================================================");

const report = validateRuleLibrary(VERIFIED_RULES_DATA);

console.log(`Total Rules Checked   : ${report.totalRulesChecked}`);
console.log(`Verified Rules (Valid): ${report.verifiedRulesCount}`);
console.log(`Needs Review Rules    : ${report.needsReviewCount}`);
console.log(`Superseded Rules      : ${report.supersededCount}`);
console.log(`Draft Rules           : ${report.draftCount}`);
console.log("------------------------------------------------------------------");

if (report.warnings.length > 0) {
  console.log(`\n[!] Warnings (${report.warnings.length}):`);
  report.warnings.forEach((w, idx) => {
    console.log(`  ${idx + 1}. [${w.internalRuleId || w.ruleId}] ${w.field}: ${w.message}`);
  });
}

if (!report.isValid) {
  console.error(`\n[X] Validation FAILED with ${report.errors.length} errors:`);
  report.errors.forEach((e, idx) => {
    console.error(`  ${idx + 1}. [${e.internalRuleId || e.ruleId}] ${e.field}: ${e.message}`);
  });
  console.log("==================================================================");
  process.exit(1);
}

console.log("\n[✓] ALL LEGAL RULES PASSED AUTHORITATIVE SOURCE VALIDATION!");
console.log("==================================================================");
process.exit(0);
