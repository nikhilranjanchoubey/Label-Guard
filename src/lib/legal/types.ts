/**
 * LabelGuard — Verified Legal Metrology Rule Library Data Models
 * Step 4: Strongly typed legal rule representation backed by authoritative sources.
 * 
 * IMPORTANT:
 * 1. Internal Rule IDs (e.g. LMPC-DECL-001) are distinct from Statutory References (e.g. Rule 6(1)(a)).
 * 2. Only VERIFIED rules may be used by future compliance engines.
 * 3. NEEDS_REVIEW and DRAFT rules must never generate compliance decisions.
 */

export type RuleVerificationStatus = "VERIFIED" | "NEEDS_REVIEW" | "SUPERSEDED" | "DRAFT";

export type RuleSeverity = "CRITICAL" | "MAJOR" | "MINOR" | "INFORMATIONAL";

export type ConditionOperator =
  | "PRESENT"
  | "ABSENT"
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "CONTAINS"
  | "REGEX"
  | "DATE_BEFORE"
  | "DATE_AFTER"
  | "CUSTOM";

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  expectedValue?: unknown;
  parameters?: Record<string, unknown>;
  description?: string;
}

export type EvidenceType =
  | "BOUNDING_BOX"
  | "NORMALIZED_TEXT"
  | "NUMERIC_VALUE"
  | "DATE_FORMAT"
  | "URL_OR_PHONE"
  | "IMAGE_REGION"
  | "CERTIFICATE_OR_MARK";

export interface EvidenceRequirement {
  evidenceType: EvidenceType;
  description: string;
  required: boolean;
  fieldKey?: string;
}

export interface OfficialSourceReference {
  documentTitle: string;
  officialUrl: string;
  section?: string;
  ruleNumber: string;
  subRule?: string;
  clause?: string;
  proviso?: string;
  pageNumber?: number;
  gazetteNotification?: string;
  notificationDate?: string;
  isConsolidatedBook?: boolean;
}

export interface AmendmentReference {
  amendmentTitle: string;
  notificationNumber: string;
  notificationDate: string;
  effectiveDate: string;
  affectedRule: string;
  changeSummary: string;
  sourceUrl: string;
}

export interface RuleApplicability {
  productCategories: string[]; // e.g. ["ALL", "FOOD", "COSMETICS", "ELECTRONICS", "AGRICULTURAL_PRODUCE"]
  packageTypes?: string[]; // e.g. ["RETAIL", "WHOLESALE", "PROMOTIONAL_GROUP", "DECEPTIVE_SHAPE"]
  exclusions?: string[]; // e.g. ["NET_WEIGHT_UNDER_10G", "RESTAURANT_FAST_FOOD", "DRUGS_DPCO"]
  minNetQuantity?: { value: number; unit: string };
  maxNetQuantity?: { value: number; unit: string };
  importedOnly?: boolean;
  ecommerceOnly?: boolean;
}

export interface LegalRule {
  id: string; // Unique UUID
  internalRuleId: string; // LabelGuard stable identifier, e.g. "LMPC-DECL-001"
  statutoryReference: string; // Official reference, e.g. "Rule 6(1)(a)"
  title: string;
  titleHi?: string; // Hindi title for localized interface
  requirement: string; // Short authoritative source-supported requirement summary
  statutoryTextExcerpt?: string; // Exact excerpt from the official publication
  interpretationNote?: string; // Clearly labeled LabelGuard technical explanation
  category: string; // e.g. "MANUFACTURER_ORIGIN", "NET_QUANTITY", "PRICING", "DATES", "CONSUMER_CARE", "DISPLAY_SPECIFICATION", "EXEMPTION"
  severity: RuleSeverity;
  
  applicability: RuleApplicability;
  conditions: RuleCondition[];
  evidenceRequirements: EvidenceRequirement[];
  
  source: OfficialSourceReference;
  amendmentHistory: AmendmentReference[];
  
  effectiveFrom: string; // ISO date format YYYY-MM-DD
  effectiveTo?: string; // Optional end date if superseded
  
  status: RuleVerificationStatus;
  verificationStatus: RuleVerificationStatus;
  lastVerifiedAt: string; // ISO date format
  verifiedBy: string; // Identifier of legal verification lead / system
}

export interface ApplicabilityInput {
  productCategory: string; // e.g. "Packaged Food", "Cosmetics", "General Commodity", "Electronics"
  packageType?: string; // e.g. "Retail Pack", "Promotional Group Pack"
  netQuantityValue?: number; // e.g. 5
  netQuantityUnit?: string; // e.g. "g", "ml", "kg", "l"
  isImported?: boolean;
  isEcommerceListing?: boolean;
  productDate?: string; // YYYY-MM-DD or YYYY-MM (Manufacture/Packing date)
  inspectionDate?: string; // YYYY-MM-DD (Defaults to today)
}

export interface RuleExemptionNotice {
  ruleId: string;
  internalRuleId: string;
  statutoryReference: string;
  reason: string;
  exemptionRuleReference: string;
}

export interface ApplicabilityResult {
  applicableRules: LegalRule[];
  exemptedRules: RuleExemptionNotice[];
  supersededRules: LegalRule[];
  unverifiedRulesIgnored: LegalRule[];
  evaluationDateUsed: string;
}

export interface RuleFilters {
  query?: string;
  category?: string;
  status?: RuleVerificationStatus | "ALL";
  amendment?: string;
  effectiveDate?: string;
}
