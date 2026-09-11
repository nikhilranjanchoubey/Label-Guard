/**
 * LabelGuard — Client-Side Compliance API Helper
 * Coordinates evaluation API calls, manages active ComplianceResult state in browser storage.
 */

import { ComplianceResult, ComplianceEvaluationInput } from "./types";
import { complianceEngine } from "./engine";

const COMPLIANCE_STORAGE_KEY = "labelguard_active_compliance_result";

export async function evaluateCompliance(
  input: ComplianceEvaluationInput
): Promise<ComplianceResult> {
  try {
    const response = await fetch("/api/compliance/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status} from compliance evaluate API`);
    }

    const result = (await response.json()) as ComplianceResult;
    setActiveComplianceResult(result);
    return result;
  } catch (error) {
    console.warn("[evaluateCompliance] API failed, falling back to deterministic local evaluation:", error);
    // Safe client-side fallback using same deterministic engine
    const localResult = complianceEngine.evaluate(input);
    setActiveComplianceResult(localResult);
    return localResult;
  }
}

export function getActiveComplianceResult(): ComplianceResult | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(COMPLIANCE_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ComplianceResult;
  } catch (e) {
    console.error("[getActiveComplianceResult] Failed to parse sessionStorage:", e);
    return null;
  }
}

export function setActiveComplianceResult(result: ComplianceResult): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.error("[setActiveComplianceResult] Failed to write to sessionStorage:", e);
  }
}

export function clearActiveComplianceResult(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(COMPLIANCE_STORAGE_KEY);
  } catch (e) {
    console.error("[clearActiveComplianceResult] Failed to remove from sessionStorage:", e);
  }
}
