import { ComplianceStatus, ExtractedDeclaration } from "../compliance/types";

export type RuleSeverity = "CRITICAL" | "MAJOR" | "MINOR";

export interface PlaceholderRule {
  id: string; // Internal placeholder ID, e.g. "RULE-PLC-001"
  category: "Pricing & Currency" | "Quantity & Metric Units" | "Manufacturer & Traceability" | "Dates & Shelf Life" | "Consumer Redressal";
  name: string;
  fieldKey: string;
  severity: RuleSeverity;
  isPlaceholder: true; // Explicitly designates as a placeholder until verified statutory rules are integrated
  description: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  fieldKey: string;
  status: ComplianceStatus;
  notes: string;
}

export interface RuleEngine {
  evaluateDeclaration: (declaration: ExtractedDeclaration) => RuleEvaluationResult;
  getRuleById: (ruleId: string) => PlaceholderRule | undefined;
  listRules: () => PlaceholderRule[];
}
