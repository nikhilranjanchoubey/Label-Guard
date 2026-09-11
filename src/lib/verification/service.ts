/**
 * LabelGuard — Human Officer Verification Service
 * Step 6: Enforces non-silent modifications, role-based access, and immutable audit recording.
 */

import { RuleEvaluation } from "../compliance/types";
import { auditTrailService } from "../audit/trail";
import { AuditEvent, UserRole } from "../audit/types";
import {
  OfficerVerification,
  VerificationSubmissionInput,
  ValueCorrectionInput,
  SupervisorSignoffInput,
  SupervisorSignoffRecord,
  InspectionVerificationState,
  InspectionVerificationSummary,
} from "./types";

const VERIFICATION_STORAGE_PREFIX = "labelguard_officer_verifications_";

export class OfficerVerificationService {
  private stateStore: Map<string, InspectionVerificationState> = new Map();

  /**
   * Get current verification state for an inspection.
   */
  public getState(inspectionId: string): InspectionVerificationState {
    let state = this.stateStore.get(inspectionId);
    if (!state && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem(`${VERIFICATION_STORAGE_PREFIX}${inspectionId}`);
        if (raw) {
          state = JSON.parse(raw);
          if (state && state.verifications) {
            this.stateStore.set(inspectionId, state);
          }
        }
      } catch (e) {
        console.warn("[VerificationService] Failed reading session storage:", e);
      }
    }

    if (!state) {
      state = {
        inspectionId,
        verifications: {},
        lastUpdated: new Date().toISOString(),
      };
      this.stateStore.set(inspectionId, state);
    }

    return state;
  }

  /**
   * Persist state to memory and browser session storage.
   */
  private persistState(state: InspectionVerificationState): void {
    state.lastUpdated = new Date().toISOString();
    this.stateStore.set(state.inspectionId, state);

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(
          `${VERIFICATION_STORAGE_PREFIX}${state.inspectionId}`,
          JSON.stringify(state)
        );
      } catch (e) {
        console.warn("[VerificationService] Session storage persistence failed:", e);
      }
    }
  }

  /**
   * Record officer decision on an automated rule evaluation.
   */
  public recordVerification(
    input: VerificationSubmissionInput,
    automatedEvaluation: RuleEvaluation
  ): { verification: OfficerVerification; auditEvent: AuditEvent } {
    // 1. RBAC Validation: Must be an authorized officer, supervisor, or admin
    this.assertAuthorizedRole(input.officer.role, ["OFFICER", "SUPERVISOR", "ADMIN"]);

    // 2. No Silent Modification Rule:
    // If the officer overrides the automated result (e.g. PASS -> REJECTED, FAIL -> CONFIRMED, REVIEW -> CONFIRMED)
    // or provides a new value, a detailed justification reason is mandatory.
    const isOverride =
      (automatedEvaluation.status === "FAIL" && input.officerStatus === "CONFIRMED") ||
      (automatedEvaluation.status === "PASS" && input.officerStatus === "REJECTED") ||
      (automatedEvaluation.status === "REVIEW" && (input.officerStatus === "CONFIRMED" || input.officerStatus === "REJECTED")) ||
      input.officerStatus === "CORRECTED";

    if (isOverride && (!input.reason || input.reason.trim().length < 5)) {
      throw new Error(
        `A substantive justification reason (minimum 5 characters) is mandatory when overriding automated status "${automatedEvaluation.status}" to "${input.officerStatus}".`
      );
    }

    const state = this.getState(input.inspectionId);
    const existing = state.verifications[input.ruleEvaluationId];
    const timestamp = new Date().toISOString();
    const verificationId = existing ? existing.verificationId : `VER-${Date.now()}-${input.internalRuleId}`;

    // 3. Assemble immutable officer verification record
    // CRITICAL: originalAutomatedStatus is preserved from the engine result, never altered!
    const verification: OfficerVerification = {
      verificationId,
      inspectionId: input.inspectionId,
      ruleEvaluationId: input.ruleEvaluationId,
      internalRuleId: input.internalRuleId,
      statutoryReference: automatedEvaluation.statutoryReference,
      requirement: automatedEvaluation.requirement,
      originalAutomatedStatus: automatedEvaluation.status,
      officerStatus: input.officerStatus,
      officer: input.officer,
      timestamp,
      reason: input.reason || (existing ? existing.reason : "Verified conforming by officer"),
      note: input.note,
      evidenceReferences: automatedEvaluation.evidence ? [automatedEvaluation.evidence] : [],
      previousValue: automatedEvaluation.extractedValue,
      newValue: input.newValue || existing?.newValue,
    };

    state.verifications[input.ruleEvaluationId] = verification;
    this.persistState(state);

    // 4. Append to append-only tamper-evident audit trail
    const action = isOverride ? "RESULT_CHANGED" : "OFFICER_VERIFIED";
    const auditEvent = auditTrailService.logEvent(
      input.inspectionId,
      input.officer,
      action,
      {
        type: "OFFICER_VERIFICATION",
        id: verificationId,
        name: `${input.internalRuleId} (${automatedEvaluation.statutoryReference})`,
      },
      {
        previousState: {
          status: existing ? existing.officerStatus : automatedEvaluation.status,
          value: existing ? existing.newValue || existing.previousValue : automatedEvaluation.extractedValue,
        },
        newState: {
          officerStatus: verification.officerStatus,
          originalAutomatedStatus: verification.originalAutomatedStatus,
          newValue: verification.newValue,
        },
        reason: input.reason,
        metadata: {
          internalRuleId: input.internalRuleId,
          statutoryReference: automatedEvaluation.statutoryReference,
          action: input.action,
          isOverride,
        },
      }
    );

    return { verification, auditEvent };
  }

  /**
   * Record officer value correction for a declaration field.
   */
  public recordValueCorrection(input: ValueCorrectionInput): { auditEvent: AuditEvent } {
    this.assertAuthorizedRole(input.officer.role, ["OFFICER", "SUPERVISOR", "ADMIN"]);

    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error("A justification reason is mandatory when correcting an extracted declaration value.");
    }

    const auditEvent = auditTrailService.logEvent(
      input.inspectionId,
      input.officer,
      "VALUE_CORRECTED",
      {
        type: "DECLARATION_FIELD",
        id: input.fieldId,
        name: input.fieldType,
      },
      {
        previousState: { value: input.originalValue },
        newState: { value: input.correctedValue },
        reason: input.reason,
        metadata: {
          fieldId: input.fieldId,
          fieldType: input.fieldType,
        },
      }
    );

    return { auditEvent };
  }

  /**
   * Record supervisor formal sign-off.
   * Strictly restricted to SUPERVISOR or ADMIN roles.
   */
  public recordSupervisorSignoff(input: SupervisorSignoffInput): {
    signoff: SupervisorSignoffRecord;
    auditEvent: AuditEvent;
  } {
    // Only SUPERVISOR or ADMIN can sign off
    this.assertAuthorizedRole(input.supervisor.role, ["SUPERVISOR", "ADMIN"]);

    if (!input.remarks || input.remarks.trim().length < 5) {
      throw new Error("Supervisor remarks are required for formal sign-off.");
    }

    const timestamp = new Date().toISOString();
    const signaturePayload = `${input.inspectionId}|${input.supervisor.id}|${input.approved}|${timestamp}|${input.remarks}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < signaturePayload.length; i++) {
      hash = Math.imul(hash ^ signaturePayload.charCodeAt(i), 0x01000193);
    }
    const signatureHash = `SIG-${(hash >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;

    const signoff: SupervisorSignoffRecord = {
      supervisor: input.supervisor,
      timestamp,
      approved: input.approved,
      remarks: input.remarks,
      signatureHash,
    };

    const state = this.getState(input.inspectionId);
    state.supervisorSignoff = signoff;
    this.persistState(state);

    const auditEvent = auditTrailService.logEvent(
      input.inspectionId,
      input.supervisor,
      "SUPERVISOR_SIGNOFF",
      {
        type: "INSPECTION",
        id: input.inspectionId,
      },
      {
        newState: {
          approved: input.approved,
          remarks: input.remarks,
          signatureHash,
        },
        reason: input.remarks,
        metadata: {
          supervisorName: input.supervisor.name,
          role: input.supervisor.role,
        },
      }
    );

    return { signoff, auditEvent };
  }

  /**
   * Calculate summary metrics of officer verifications for an inspection.
   */
  public getSummary(
    inspectionId: string,
    totalApplicableRules: number
  ): InspectionVerificationSummary {
    const state = this.getState(inspectionId);
    const verifications = Object.values(state.verifications);

    let confirmedCount = 0;
    let correctedCount = 0;
    let requiresReviewCount = 0;
    let rejectedCount = 0;

    for (const v of verifications) {
      switch (v.officerStatus) {
        case "CONFIRMED":
          confirmedCount++;
          break;
        case "CORRECTED":
          correctedCount++;
          break;
        case "REQUIRES_REVIEW":
          requiresReviewCount++;
          break;
        case "REJECTED":
          rejectedCount++;
          break;
      }
    }

    const verifiedTotal = verifications.length;
    const pendingCount = Math.max(0, totalApplicableRules - verifiedTotal);

    let overallOfficerStatus: InspectionVerificationSummary["overallOfficerStatus"] = "PENDING_VERIFICATION";

    if (state.supervisorSignoff && !state.supervisorSignoff.approved) {
      overallOfficerStatus = "FLAGGED_FOR_SUPERVISOR";
    } else if (rejectedCount > 0) {
      overallOfficerStatus = "VERIFIED_NON_COMPLIANT";
    } else if (requiresReviewCount > 0) {
      overallOfficerStatus = "FLAGGED_FOR_SUPERVISOR";
    } else if (verifiedTotal === totalApplicableRules && totalApplicableRules > 0) {
      overallOfficerStatus = "VERIFIED_COMPLIANT";
    } else if (verifiedTotal > 0) {
      overallOfficerStatus = "IN_PROGRESS";
    }

    return {
      inspectionId,
      totalRules: totalApplicableRules,
      confirmedCount,
      correctedCount,
      requiresReviewCount,
      rejectedCount,
      pendingCount,
      overallOfficerStatus,
      supervisorSignoff: state.supervisorSignoff,
      lastUpdated: state.lastUpdated,
    };
  }

  /**
   * Helper to enforce RBAC permissions.
   */
  private assertAuthorizedRole(role: UserRole, allowedRoles: UserRole[]): void {
    if (!allowedRoles.includes(role)) {
      throw new Error(
        `Unauthorized: Role "${role}" lacks permission. Required role: ${allowedRoles.join(" or ")}.`
      );
    }
  }

  /**
   * Clear state for testing.
   */
  public clear(inspectionId?: string): void {
    if (inspectionId) {
      this.stateStore.delete(inspectionId);
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(`${VERIFICATION_STORAGE_PREFIX}${inspectionId}`);
      }
    } else {
      this.stateStore.clear();
    }
  }
}

export const officerVerificationService = new OfficerVerificationService();
