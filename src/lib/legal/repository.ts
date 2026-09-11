/**
 * LabelGuard — Verified Legal Rule Repository
 * Step 4: Storage abstraction and query interface for verified Legal Metrology rules.
 */

import { LegalRule, RuleFilters, ApplicabilityInput, ApplicabilityResult } from "./types";
import { VERIFIED_RULES_DATA } from "./data/verifiedRules";
import { getApplicableRules as evaluateApplicability } from "./applicability";

export class LegalRuleRepository {
  private rules: LegalRule[];

  constructor(seedRules: LegalRule[] = VERIFIED_RULES_DATA) {
    this.rules = seedRules;
  }

  getAllRules(): LegalRule[] {
    return [...this.rules];
  }

  getVerifiedRules(): LegalRule[] {
    return this.rules.filter((r) => r.verificationStatus === "VERIFIED");
  }

  getRuleById(id: string): LegalRule | undefined {
    return this.rules.find((r) => r.id === id || r.internalRuleId.toLowerCase() === id.toLowerCase());
  }

  getRuleByStatutoryRef(statutoryRef: string): LegalRule | undefined {
    return this.rules.find(
      (r) => r.statutoryReference.toLowerCase().trim() === statutoryRef.toLowerCase().trim()
    );
  }

  searchRules(filters: RuleFilters = {}): LegalRule[] {
    const { query, category, status, amendment, effectiveDate } = filters;
    const q = query ? query.toLowerCase().trim() : "";

    return this.rules.filter((rule) => {
      // 1. Status Filter
      if (status && status !== "ALL") {
        if (rule.verificationStatus !== status) return false;
      }

      // 2. Category Filter
      if (category && category !== "ALL") {
        if (rule.category !== category) return false;
      }

      // 3. Amendment Filter
      if (amendment && amendment !== "ALL") {
        const matchesAmendment = rule.amendmentHistory.some(
          (a) =>
            a.notificationNumber.toLowerCase().includes(amendment.toLowerCase()) ||
            a.amendmentTitle.toLowerCase().includes(amendment.toLowerCase())
        );
        if (!matchesAmendment) return false;
      }

      // 4. Effective Date Filter
      if (effectiveDate) {
        if (rule.effectiveFrom && rule.effectiveFrom > effectiveDate) return false;
        if (rule.effectiveTo && rule.effectiveTo < effectiveDate) return false;
      }

      // 5. Query Search
      if (q) {
        const inId = rule.internalRuleId.toLowerCase().includes(q);
        const inRef = rule.statutoryReference.toLowerCase().includes(q);
        const inTitle = rule.title.toLowerCase().includes(q) || (rule.titleHi && rule.titleHi.includes(q));
        const inReq = rule.requirement.toLowerCase().includes(q);
        const inSource = rule.source.documentTitle.toLowerCase().includes(q);
        if (!inId && !inRef && !inTitle && !inReq && !inSource) return false;
      }

      return true;
    });
  }

  getApplicableRules(input: ApplicabilityInput): ApplicabilityResult {
    return evaluateApplicability(this.rules, input);
  }

  getCategories(): string[] {
    const set = new Set<string>();
    this.rules.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }

  getStatistics() {
    const total = this.rules.length;
    const verified = this.rules.filter((r) => r.verificationStatus === "VERIFIED").length;
    const needsReview = this.rules.filter((r) => r.verificationStatus === "NEEDS_REVIEW").length;
    const superseded = this.rules.filter((r) => r.verificationStatus === "SUPERSEDED").length;
    const draft = this.rules.filter((r) => r.verificationStatus === "DRAFT").length;
    const allAmendments = new Set<string>();
    this.rules.forEach((r) => r.amendmentHistory.forEach((a) => allAmendments.add(a.notificationNumber)));

    return {
      total,
      verified,
      needsReview,
      superseded,
      draft,
      amendmentsCount: allAmendments.size,
      lastVerifiedCorpusDate: "2026-09-11",
    };
  }
}

export const legalRuleRepository = new LegalRuleRepository();
