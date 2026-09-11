/**
 * LabelGuard — Human Officer Verification Models
 * Step 6: Human-in-the-loop audit verification and declaration correction models.
 */

import { ComplianceEvaluationStatus, EvidenceReference } from "../compliance/types";
import { AuditUser } from "../audit/types";

export type OfficerVerificationStatus =
  | "CONFIRMED"
  | "CORRECTED"
  | "REQUIRES_REVIEW"
  | "REJECTED";

export type OfficerAction =
  | "CONFIRM"
  | "CORRECT"
  | "REJECT_EVIDENCE"
  | "MARK_FOR_REVIEW"
  | "ADD_NOTE";

export interface OfficerVerification {
  verificationId: string;
  inspectionId: string;
  ruleEvaluationId: string;
  internalRuleId: string;
  statutoryReference: string;
  requirement: string;
  originalAutomatedStatus: ComplianceEvaluationStatus;
  officerStatus: OfficerVerificationStatus;
  officer: AuditUser;
  timestamp: string;
  reason: string;
  note?: string;
  evidenceReferences: EvidenceReference[];
  previousValue?: string;
  newValue?: string;
}

export interface VerificationSubmissionInput {
  inspectionId: string;
  ruleEvaluationId: string;
  internalRuleId: string;
  action: OfficerAction;
  officerStatus: OfficerVerificationStatus;
  officer: AuditUser;
  reason: string;
  note?: string;
  newValue?: string;
}

export interface ValueCorrectionInput {
  inspectionId: string;
  fieldId: string;
  fieldType: string;
  originalValue: string;
  correctedValue: string;
  officer: AuditUser;
  reason: string;
}

export interface SupervisorSignoffInput {
  inspectionId: string;
  supervisor: AuditUser;
  approved: boolean;
  remarks: string;
}

export interface SupervisorSignoffRecord {
  supervisor: AuditUser;
  timestamp: string;
  approved: boolean;
  remarks: string;
  signatureHash: string;
}

export interface InspectionVerificationState {
  inspectionId: string;
  verifications: Record<string, OfficerVerification>;
  supervisorSignoff?: SupervisorSignoffRecord;
  lastUpdated: string;
}

export interface InspectionVerificationSummary {
  inspectionId: string;
  totalRules: number;
  confirmedCount: number;
  correctedCount: number;
  requiresReviewCount: number;
  rejectedCount: number;
  pendingCount: number;
  overallOfficerStatus:
    | "PENDING_VERIFICATION"
    | "IN_PROGRESS"
    | "VERIFIED_COMPLIANT"
    | "VERIFIED_NON_COMPLIANT"
    | "FLAGGED_FOR_SUPERVISOR";
  supervisorSignoff?: SupervisorSignoffRecord;
  lastUpdated: string;
}
