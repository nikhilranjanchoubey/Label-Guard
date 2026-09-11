/**
 * LabelGuard — Rule Library Integrity & Compliance Validation
 * Step 4: Strict validation rules ensuring zero orphaned, unverified, or hallucinatory rules.
 */

import { LegalRule } from "./types";

export interface ValidationError {
  ruleId: string;
  internalRuleId?: string;
  field: string;
  message: string;
  severity: "CRITICAL" | "WARNING";
}

export interface ValidationReport {
  isValid: boolean;
  totalRulesChecked: number;
  verifiedRulesCount: number;
  needsReviewCount: number;
  supersededCount: number;
  draftCount: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateRuleLibrary(rules: LegalRule[]): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const seenInternalIds = new Set<string>();
  const seenUuids = new Set<string>();

  let verifiedCount = 0;
  let needsReviewCount = 0;
  let supersededCount = 0;
  let draftCount = 0;

  for (const rule of rules) {
    const id = rule.id || "UNKNOWN_UUID";
    const internalId = rule.internalRuleId || "UNKNOWN_INTERNAL_ID";

    // 1. UUID uniqueness
    if (seenUuids.has(id)) {
      errors.push({
        ruleId: id,
        internalRuleId: internalId,
        field: "id",
        message: `Duplicate UUID found: ${id}`,
        severity: "CRITICAL",
      });
    }
    seenUuids.add(id);

    // 2. Internal Rule ID uniqueness & format
    if (!rule.internalRuleId || !rule.internalRuleId.startsWith("LMPC-")) {
      errors.push({
        ruleId: id,
        internalRuleId: internalId,
        field: "internalRuleId",
        message: `Invalid internalRuleId format. Expected 'LMPC-...', got '${rule.internalRuleId}'`,
        severity: "CRITICAL",
      });
    } else if (seenInternalIds.has(rule.internalRuleId)) {
      errors.push({
        ruleId: id,
        internalRuleId: internalId,
        field: "internalRuleId",
        message: `Duplicate internalRuleId found: ${rule.internalRuleId}`,
        severity: "CRITICAL",
      });
    }
    seenInternalIds.add(rule.internalRuleId);

    // 3. Statutory Reference Presence
    if (!rule.statutoryReference || rule.statutoryReference.trim().length === 0) {
      errors.push({
        ruleId: id,
        internalRuleId: internalId,
        field: "statutoryReference",
        message: "Statutory reference is mandatory for all legal rules.",
        severity: "CRITICAL",
      });
    }

    // 4. Verification Status Count & Validation
    const validStatuses = ["VERIFIED", "NEEDS_REVIEW", "SUPERSEDED", "DRAFT"];
    if (!validStatuses.includes(rule.verificationStatus)) {
      errors.push({
        ruleId: id,
        internalRuleId: internalId,
        field: "verificationStatus",
        message: `Invalid verificationStatus: '${rule.verificationStatus}'. Must be one of: ${validStatuses.join(", ")}`,
        severity: "CRITICAL",
      });
    }

    if (rule.verificationStatus === "VERIFIED") verifiedCount++;
    else if (rule.verificationStatus === "NEEDS_REVIEW") needsReviewCount++;
    else if (rule.verificationStatus === "SUPERSEDED") supersededCount++;
    else if (rule.verificationStatus === "DRAFT") draftCount++;

    // 5. Source Metadata Checks
    if (!rule.source) {
      errors.push({
        ruleId: id,
        internalRuleId: internalId,
        field: "source",
        message: "Source metadata object is missing.",
        severity: "CRITICAL",
      });
    } else {
      if (!rule.source.documentTitle || rule.source.documentTitle.trim().length === 0) {
        errors.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "source.documentTitle",
          message: "Authoritative source document title is required.",
          severity: "CRITICAL",
        });
      }

      if (!rule.source.officialUrl || !rule.source.officialUrl.startsWith("http")) {
        errors.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "source.officialUrl",
          message: `Source officialUrl must be a valid HTTP/HTTPS URL. Got '${rule.source.officialUrl}'`,
          severity: "CRITICAL",
        });
      }

      if (!rule.source.ruleNumber) {
        errors.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "source.ruleNumber",
          message: "Source rule number is required.",
          severity: "CRITICAL",
        });
      }
    }

    // 6. VERIFIED Rules Special Requirements
    if (rule.verificationStatus === "VERIFIED") {
      if (!rule.effectiveFrom) {
        errors.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "effectiveFrom",
          message: "Verified rules must have a valid effectiveFrom date.",
          severity: "CRITICAL",
        });
      }

      if (!rule.lastVerifiedAt) {
        warnings.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "lastVerifiedAt",
          message: "Verified rule is missing lastVerifiedAt timestamp.",
          severity: "WARNING",
        });
      }

      if (!rule.requirement || rule.requirement.length < 10) {
        errors.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "requirement",
          message: "Requirement summary must be meaningful and source-backed.",
          severity: "CRITICAL",
        });
      }

      // Check conditions
      if (!rule.conditions || rule.conditions.length === 0) {
        warnings.push({
          ruleId: id,
          internalRuleId: internalId,
          field: "conditions",
          message: "Verified rule has 0 deterministic conditions configured.",
          severity: "WARNING",
        });
      }
    }

    // 7. Amendment History Integrity
    if (rule.amendmentHistory && Array.isArray(rule.amendmentHistory)) {
      for (let i = 0; i < rule.amendmentHistory.length; i++) {
        const amend = rule.amendmentHistory[i];
        if (!amend.notificationNumber || !amend.effectiveDate || !amend.sourceUrl) {
          errors.push({
            ruleId: id,
            internalRuleId: internalId,
            field: `amendmentHistory[${i}]`,
            message: `Incomplete amendment reference at index ${i}. Notification, effective date, and sourceUrl are mandatory.`,
            severity: "CRITICAL",
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    totalRulesChecked: rules.length,
    verifiedRulesCount: verifiedCount,
    needsReviewCount: needsReviewCount,
    supersededCount: supersededCount,
    draftCount: draftCount,
    errors,
    warnings,
  };
}
