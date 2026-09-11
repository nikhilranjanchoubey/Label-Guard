/**
 * LabelGuard — Audit Trail & Role-Based Access Control Models
 * Step 6: Immutable, tamper-evident audit logging for human-in-the-loop verification.
 */

export type UserRole = "OFFICER" | "SUPERVISOR" | "ADMIN";

export interface AuditUser {
  id: string;
  name: string;
  role: UserRole;
  badgeNumber?: string;
  station?: string;
}

export type AuditAction =
  | "SCAN_CREATED"
  | "OCR_COMPLETED"
  | "DECLARATIONS_EXTRACTED"
  | "RULES_SELECTED"
  | "COMPLIANCE_EVALUATED"
  | "EVIDENCE_VIEWED"
  | "OFFICER_VERIFIED"
  | "VALUE_CORRECTED"
  | "RESULT_CHANGED"
  | "SUPERVISOR_SIGNOFF"
  | "REPORT_GENERATED";

export interface AuditEntity {
  type: "INSPECTION" | "DECLARATION_FIELD" | "RULE_EVALUATION" | "OFFICER_VERIFICATION" | "REPORT";
  id: string;
  name?: string;
}

export interface AuditEvent {
  eventId: string;
  inspectionId: string;
  timestamp: string;
  user: AuditUser;
  action: AuditAction;
  entity: AuditEntity;
  previousState?: unknown;
  newState?: unknown;
  reason?: string;
  metadata?: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

export interface AuditTrail {
  inspectionId: string;
  events: AuditEvent[];
  genesisHash: string;
  currentHash: string;
  isTamperEvident: boolean;
  totalEvents: number;
  lastUpdated: string;
}
