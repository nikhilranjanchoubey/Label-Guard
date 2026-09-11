import { PlaceholderRule, RuleEngine, RuleEvaluationResult } from "./types";
import { ExtractedDeclaration } from "../compliance/types";

/**
 * Placeholder Rule Library
 * NOTE: Statutory Legal Metrology rule numbers, sections, and penalty clauses
 * are intentionally omitted until verified legal rules are integrated.
 * All IDs are internal placeholders.
 */
export const PLACEHOLDER_RULES: PlaceholderRule[] = [
  {
    id: "RULE-PLC-MRP-01",
    category: "Pricing & Currency",
    name: "Maximum Retail Price (MRP) Inclusion & Format",
    fieldKey: "mrp",
    severity: "CRITICAL",
    isPlaceholder: true,
    description: "Placeholder rule architecture for verifying retail price inclusion and standardized currency notation.",
  },
  {
    id: "RULE-PLC-NETWT-02",
    category: "Quantity & Metric Units",
    name: "Net Quantity Standard Metric Specification",
    fieldKey: "netQuantity",
    severity: "CRITICAL",
    isPlaceholder: true,
    description: "Placeholder rule architecture for checking declaration of net quantity in standard metric units.",
  },
  {
    id: "RULE-PLC-MFG-03",
    category: "Dates & Shelf Life",
    name: "Manufacturing or Packing Month/Year Declaration",
    fieldKey: "mfgDate",
    severity: "MAJOR",
    isPlaceholder: true,
    description: "Placeholder rule architecture for checking presence of legible month and year of packaging.",
  },
  {
    id: "RULE-PLC-ORIGIN-04",
    category: "Manufacturer & Traceability",
    name: "Manufacturer Identity & Full Address",
    fieldKey: "manufacturer",
    severity: "MAJOR",
    isPlaceholder: true,
    description: "Placeholder rule architecture for verifying registered name and full geographic address of manufacturer.",
  },
  {
    id: "RULE-PLC-CARE-05",
    category: "Consumer Redressal",
    name: "Consumer Grievance Helpline & Contact Channel",
    fieldKey: "consumerCare",
    severity: "MAJOR",
    isPlaceholder: true,
    description: "Placeholder rule architecture for validating presence of operational consumer contact information.",
  },
  {
    id: "RULE-PLC-USP-06",
    category: "Pricing & Currency",
    name: "Unit Sale Price (USP) Calculation Specification",
    fieldKey: "unitSalePrice",
    severity: "MINOR",
    isPlaceholder: true,
    description: "Placeholder rule architecture for assessing per-unit price representation where required.",
  },
];

export class DefaultRuleEngine implements RuleEngine {
  private rules: Map<string, PlaceholderRule>;

  constructor(rules: PlaceholderRule[] = PLACEHOLDER_RULES) {
    this.rules = new Map(rules.map((r) => [r.id, r]));
  }

  getRuleById(ruleId: string): PlaceholderRule | undefined {
    return this.rules.get(ruleId);
  }

  listRules(): PlaceholderRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluates an extracted field against placeholder compliance logic.
   * Statutory rules will replace this deterministic mock when officially verified.
   */
  evaluateDeclaration(declaration: ExtractedDeclaration): RuleEvaluationResult {
    const rule = this.rules.get(declaration.applicableRuleId);
    
    // Extensible stub: relies on initial extraction flag for demo mode
    return {
      ruleId: declaration.applicableRuleId,
      fieldKey: declaration.key,
      status: declaration.complianceStatus,
      notes: rule ? `Evaluated under architecture placeholder [${rule.id}]` : "No rule mapped",
    };
  }
}

export const ruleEngine = new DefaultRuleEngine();
