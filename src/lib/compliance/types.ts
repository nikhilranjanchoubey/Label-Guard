import { RuleVerificationStatus, RuleExemptionNotice } from "../legal/types";
import { DeclarationExtractionResult, BoundingBoxPercent } from "../declarations/types";

// Legacy Foundation Types (Used across foundation UI components)
export type ComplianceStatus = 
  | "COMPLIANT" 
  | "REVIEW_REQUIRED" 
  | "VIOLATION" 
  | "PENDING";

export type VerificationStatus = 
  | "UNVERIFIED"
  | "CONFIRMED_COMPLIANT"
  | "FLAGGED_FOR_REVIEW"
  | "CONFIRMED_VIOLATION";

export type DeclarationKey =
  | "mrp"
  | "netQuantity"
  | "mfgDate"
  | "expiryDate"
  | "batchNumber"
  | "manufacturer"
  | "packer"
  | "consumerCare"
  | "countryOfOrigin"
  | "unitSalePrice";

export interface BoundingBox {
  id: string;
  fieldKey: DeclarationKey;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  rawText: string;
  ocrConfidence: number;
  status: ComplianceStatus;
}

export interface ExtractedDeclaration {
  id: string;
  key: DeclarationKey;
  labelKey: string;
  extractedValue: string;
  expectedFormat: string;
  ocrConfidence: number;
  complianceStatus: ComplianceStatus;
  applicableRuleId: string;
  evidenceBoxId?: string;
  verificationStatus: VerificationStatus;
  inspectorNotes?: string;
}

export interface PackageInspection {
  id: string;
  productName: string;
  brand: string;
  barcode: string;
  category: string;
  inspectionDate: string;
  overallStatus: ComplianceStatus;
  overallOcrConfidence: number;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  sampleImageUrl: string;
  declarations: ExtractedDeclaration[];
  boundingBoxes: BoundingBox[];
  auditHash: string;
  isDemo: boolean;
}

// Step 5 Deterministic Engine Types
export type ComplianceEvaluationStatus = "PASS" | "FAIL" | "REVIEW" | "NOT_APPLICABLE";

export type OverallComplianceStatus =
  | "NEEDS_ATTENTION"
  | "REVIEW_REQUIRED"
  | "COMPLIANT_ASSISTANCE_RESULT"
  | "NO_APPLICABLE_RULES";

export interface EvidenceReference {
  imageId?: string;
  surface?: string;
  boundingBox?: BoundingBoxPercent;
  ocrText: string;
  ocrConfidence: number;
  extractionField: string;
  sourceType?: string;
  sourceOcrItemIds?: string[];
  additionalEvidence?: EvidenceReference[]; // For conflicting extractions
}

export interface RuleSourceCitation {
  documentTitle: string;
  ruleNumber: string;
  officialUrl: string;
  pageNumber?: number;
  gazetteNotification?: string;
}

export interface RuleEvaluation {
  id: string; // Unique evaluation entry ID
  ruleId: string; // Rule UUID
  internalRuleId: string; // LabelGuard identifier, e.g. "LMPC-DECL-001"
  statutoryReference: string; // e.g. "Rule 6(1)(a)"
  requirement: string; // Authoritative summary
  category: string;
  status: ComplianceEvaluationStatus;
  reason: string;
  reasonHi?: string;
  extractedValue?: string;
  expectedValue?: string;
  evidence?: EvidenceReference;
  confidence: number; // Aggregate confidence in the evaluation (0.0 to 1.0)
  sourceReference: RuleSourceCitation;
  evaluatedAt: string;
  ruleVersion: string;
  verificationStatus: RuleVerificationStatus;
}

export interface ComplianceSummary {
  totalApplicableRules: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notApplicableCount: number;
  overallStatus: OverallComplianceStatus;
  summaryNarrative: string;
  summaryNarrativeHi: string;
}

export interface ProductMetadataInput {
  category: string; // e.g. "Packaged Food", "Cosmetics", "General Commodity"
  packageType?: string; // e.g. "Retail Pack", "Promotional Pack"
  isImported?: boolean;
  isEcommerceListing?: boolean;
  productDate?: string; // YYYY-MM-DD
  netQuantityValue?: number;
  netQuantityUnit?: string;
  hasPhysicalScaleCalibration?: boolean;
  scaleMmPerPixel?: number;
}

export interface ComplianceEvaluationInput {
  inspectionId: string;
  productId?: string;
  productName?: string;
  brand?: string;
  declarationResult: DeclarationExtractionResult;
  metadata?: ProductMetadataInput;
  inspectionDate?: string;
}

export interface ComplianceResult {
  id: string; // Unique compliance run ID
  inspectionId: string;
  productId: string;
  productName: string;
  brand?: string;
  metadata: ProductMetadataInput;
  evaluationTimestamp: string;
  engineVersion: string;
  rulesEvaluated: RuleEvaluation[];
  summary: ComplianceSummary;
  exemptions: RuleExemptionNotice[];
  unverifiedRulesIgnored: { internalRuleId: string; status: string }[];
  auditHash: string; // Non-repudiation audit hash
  isDemo: boolean;
  disclaimer: string;
}
