/**
 * LabelGuard — Legal Metrology Applicability Engine
 * Step 4: Determines which verified rules apply based on product category,
 * package attributes, channel, and effective dates.
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * This engine does NOT perform compliance evaluation.
 * It strictly answers: "Which verified rules should be considered?"
 */

import { LegalRule, ApplicabilityInput, ApplicabilityResult, RuleExemptionNotice } from "./types";

export function getApplicableRules(
  allRules: LegalRule[],
  input: ApplicabilityInput
): ApplicabilityResult {
  const referenceDate = input.productDate || input.inspectionDate || new Date().toISOString().slice(0, 10);
  const applicableRules: LegalRule[] = [];
  const exemptedRules: RuleExemptionNotice[] = [];
  const supersededRules: LegalRule[] = [];
  const unverifiedRulesIgnored: LegalRule[] = [];

  const categoryUpper = (input.productCategory || "ALL").toUpperCase();
  const isImported = Boolean(input.isImported);
  const isEcommerce = Boolean(input.isEcommerceListing);

  // Check Rule 26(a) Small Package Exemption
  const isSmallPackage =
    typeof input.netQuantityValue === "number" &&
    input.netQuantityValue <= 10 &&
    (input.netQuantityUnit?.toLowerCase() === "g" || input.netQuantityUnit?.toLowerCase() === "ml");

  const isTobacco =
    categoryUpper.includes("TOBACCO") ||
    categoryUpper.includes("BIDI") ||
    categoryUpper.includes("CIGARETTE") ||
    categoryUpper.includes("KHAINI") ||
    categoryUpper.includes("GUTKHA");

  const isExemptUnderRule26a = isSmallPackage && !isTobacco;

  for (const rule of allRules) {
    // 1. Guard against non-verified statuses
    if (rule.verificationStatus !== "VERIFIED") {
      unverifiedRulesIgnored.push(rule);
      continue;
    }

    // 2. Date-based validity check
    if (rule.effectiveFrom && referenceDate < rule.effectiveFrom) {
      // Not yet in force at the product reference date
      continue;
    }

    if (rule.effectiveTo && referenceDate > rule.effectiveTo) {
      // Rule was superseded before this product's reference date
      supersededRules.push(rule);
      continue;
    }

    // 3. Exemption check (e.g. small package <= 10g under Rule 26(a))
    if (
      isExemptUnderRule26a &&
      rule.applicability.exclusions?.includes("EXEMPT_UNDER_10G_OR_10ML_EXCEPT_TOBACCO")
    ) {
      exemptedRules.push({
        ruleId: rule.id,
        internalRuleId: rule.internalRuleId,
        statutoryReference: rule.statutoryReference,
        reason: "Net quantity is <= 10g or 10ml (exempted under Rule 26(a), non-tobacco).",
        exemptionRuleReference: "Rule 26(a)",
      });
      continue;
    }

    // 4. Import-only applicability check
    if (rule.applicability.importedOnly && !isImported) {
      continue;
    }

    // 5. E-commerce only applicability check
    if (rule.applicability.ecommerceOnly && !isEcommerce) {
      continue;
    }

    // 6. Category matching
    const ruleCategories = rule.applicability.productCategories.map((c) => c.toUpperCase());
    const isCategoryMatch =
      ruleCategories.includes("ALL") ||
      ruleCategories.some((rc) => categoryUpper.includes(rc) || rc.includes(categoryUpper));

    if (!isCategoryMatch) {
      continue;
    }

    // Rule passes all applicability filters
    applicableRules.push(rule);
  }

  return {
    applicableRules,
    exemptedRules,
    supersededRules,
    unverifiedRulesIgnored,
    evaluationDateUsed: referenceDate,
  };
}
