/**
 * LabelGuard — Professional Inspection Report Data Models
 * Step 7: Legal Metrology Package Compliance Report Specification
 */

import { ComplianceEvaluationStatus } from "@/lib/compliance/types";
import { OfficerVerification, OfficerVerificationStatus } from "@/lib/verification/types";
import { AuditEvent } from "@/lib/audit/types";

export type ReportLanguageMode = "en" | "hi" | "bilingual";

export interface ReportExecutiveSummary {
  reportId: string;
  inspectionId: string;
  generatedAt: string;
  officerName: string;
  officerDesignation: string;
  officerBadge: string;
  inspectionStation: string;
  productName: string;
  brand: string;
  category: string;
  packageType: string;
  overallStatus: "PASS" | "FAIL" | "REVIEW" | "NOT_APPLICABLE";
  totalRulesEvaluated: number;
  rulesPassed: number;
  rulesFailed: number;
  rulesReview: number;
  officerConfirmedCount: number;
  officerCorrectedCount: number;
  isDemo: boolean;
  cryptographicSignature?: string;
}

export interface ReportProductInfo {
  productName: string;
  brand: string;
  manufacturer: string;
  packer: string;
  importer: string;
  countryOfOrigin: string;
  netQuantity: string;
  mrp: string;
  consumerCare: string;
  batchNumber: string;
  mfgDate: string;
  packingDate: string;
  bestBefore: string;
  expiryDate: string;
}

export interface ReportOcrInfo {
  scannedSurfaces: string[];
  totalTokensDetected: number;
  overallConfidence: number;
  processingTimeMs: number;
  languagesDetected: string[];
  qualityMetrics?: {
    resolution: string;
    lighting: string;
    blurIndex: string;
    orientation: string;
    readiness: string;
  };
}

export interface ReportDeclarationRow {
  fieldKey: string;
  labelEn: string;
  labelHi: string;
  extractedValue: string;
  confidence: number;
  sourceId: string;
  status: "DETECTED" | "AMBIGUOUS" | "NOT_DETECTED";
  notes?: string;
}

export interface ReportComplianceRow {
  ruleId: string;
  statutoryReference: string;
  requirementEn: string;
  requirementHi: string;
  observedValue: string;
  automatedResult: ComplianceEvaluationStatus;
  officerResult?: OfficerVerificationStatus;
  officerNotes?: string;
  evidenceRef: string;
  sourceUrl?: string;
}

export interface ReportEvidenceItem {
  id: string;
  surface: string;
  declarationName: string;
  rawOcrText: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  evidenceImageThumbnail?: string;
}

export interface ReportLegalSourceItem {
  internalRuleId: string;
  statutoryReference: string;
  sourceDocument: string;
  sourceSection: string;
  sourceUrl: string;
  effectiveDate: string;
  verificationStatus: string;
}

export interface FullInspectionReportData {
  executiveSummary: ReportExecutiveSummary;
  productInfo: ReportProductInfo;
  ocrInfo: ReportOcrInfo;
  declarations: ReportDeclarationRow[];
  complianceMatrix: ReportComplianceRow[];
  evidenceItems: ReportEvidenceItem[];
  verifications?: OfficerVerification[];
  auditTrail: AuditEvent[];
  legalSources: ReportLegalSourceItem[];
  imageUrl: string;
}
