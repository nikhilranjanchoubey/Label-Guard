/**
 * LabelGuard — Client-Side Verification Helper
 * Step 6: Bridges UI components to verification service, audit trail, and user role management.
 */

import { RuleEvaluation } from "../compliance/types";
import { AuditTrail, AuditUser, UserRole } from "../audit/types";
import { auditTrailService } from "../audit/trail";
import { officerVerificationService } from "./service";
import {
  OfficerVerification,
  VerificationSubmissionInput,
  ValueCorrectionInput,
  SupervisorSignoffInput,
  SupervisorSignoffRecord,
  InspectionVerificationState,
  InspectionVerificationSummary,
} from "./types";

const ACTIVE_USER_ROLE_KEY = "labelguard_active_user_role";

export const DEFAULT_OFFICER_USER: AuditUser = {
  id: "OFF-DL-4082",
  name: "Rajesh Sharma",
  role: "OFFICER",
  badgeNumber: "DL-METRO-4082",
  station: "Delhi Metrology Zone - I",
};

export const DEFAULT_SUPERVISOR_USER: AuditUser = {
  id: "SUP-DL-1004",
  name: "Dr. Ananya Verma",
  role: "SUPERVISOR",
  badgeNumber: "DL-SUP-1004",
  station: "Regional Metrology Headquarters - North",
};

export const DEFAULT_ADMIN_USER: AuditUser = {
  id: "ADM-HQ-001",
  name: "S. K. Mukherjee",
  role: "ADMIN",
  badgeNumber: "IND-HQ-001",
  station: "Ministry Directorate (Metrology Division)",
};

/**
 * Get currently simulated active user and role.
 */
export function getActiveUser(): AuditUser {
  if (typeof window !== "undefined" && window.sessionStorage) {
    const storedRole = window.sessionStorage.getItem(ACTIVE_USER_ROLE_KEY) as UserRole | null;
    if (storedRole === "SUPERVISOR") return DEFAULT_SUPERVISOR_USER;
    if (storedRole === "ADMIN") return DEFAULT_ADMIN_USER;
  }
  return DEFAULT_OFFICER_USER;
}

/**
 * Switch active role (for demonstration and RBAC testing).
 */
export function setActiveUserRole(role: UserRole): AuditUser {
  if (typeof window !== "undefined" && window.sessionStorage) {
    window.sessionStorage.setItem(ACTIVE_USER_ROLE_KEY, role);
  }
  if (role === "SUPERVISOR") return DEFAULT_SUPERVISOR_USER;
  if (role === "ADMIN") return DEFAULT_ADMIN_USER;
  return DEFAULT_OFFICER_USER;
}

/**
 * Submit officer verification record for a statutory rule.
 */
export async function submitVerification(
  input: VerificationSubmissionInput,
  automatedEvaluation: RuleEvaluation
): Promise<{ success: boolean; verification?: OfficerVerification; error?: string }> {
  try {
    // Attempt server API call first
    const response = await fetch("/api/verification/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, automatedEvaluation }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, verification: data.verification };
    }
  } catch {
    // Fall back to local verification service if offline / SSR / client-only
  }

  try {
    const result = officerVerificationService.recordVerification(input, automatedEvaluation);
    return { success: true, verification: result.verification };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Submit manual declaration value correction.
 */
export async function submitValueCorrection(
  input: ValueCorrectionInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/verification/correct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      return { success: true };
    }
  } catch {
    // Fall back to local service
  }

  try {
    officerVerificationService.recordValueCorrection(input);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Submit supervisor sign-off.
 */
export async function submitSupervisorSignoff(
  input: SupervisorSignoffInput
): Promise<{ success: boolean; signoff?: SupervisorSignoffRecord; error?: string }> {
  try {
    const response = await fetch("/api/verification/signoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, signoff: data.signoff };
    }
  } catch {
    // Fall back to local service
  }

  try {
    const result = officerVerificationService.recordSupervisorSignoff(input);
    return { success: true, signoff: result.signoff };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Get complete verification state for an inspection.
 */
export function getInspectionVerificationState(inspectionId: string): InspectionVerificationState {
  return officerVerificationService.getState(inspectionId);
}

/**
 * Get summary of officer verifications for an inspection.
 */
export function getVerificationSummary(
  inspectionId: string,
  totalRules: number
): InspectionVerificationSummary {
  return officerVerificationService.getSummary(inspectionId, totalRules);
}

/**
 * Get append-only audit trail for an inspection.
 */
export async function fetchAuditTrail(inspectionId: string): Promise<AuditTrail> {
  try {
    const res = await fetch(`/api/audit/trail?inspectionId=${encodeURIComponent(inspectionId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.trail) return data.trail;
    }
  } catch {
    // Fallback to local service
  }
  return auditTrailService.getAuditTrail(inspectionId);
}
