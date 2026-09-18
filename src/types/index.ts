export type UserRole = "ADMIN" | "OFFICER" | "INSPECTOR" | "REVIEWER";

export interface UserProfile {
  id: string;
  name: string;
  badgeNumber: string;
  designation: string;
  department: string;
  jurisdiction: string;
  role: UserRole;
  avatarUrl?: string;
}

export type ComplianceStatus = "COMPLIANT" | "NEEDS_REVIEW" | "NON_COMPLIANT";

export type FieldStatus =
  | "COMPLIANT"
  | "WARNING"
  | "NON_COMPLIANT"
  | "NOT_DETECTED"
  | "LOW_CONFIDENCE"
  | "MANUAL_REVIEW";

export interface BoundingBox {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export interface DeclarationFinding {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  extractedValue: string;
  status: FieldStatus;
  confidence: number; // 0.0 - 1.0
  evidenceSnippet: string;
  ruleReference: string;
  ruleCitation: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  bbox?: BoundingBox;
  fontSizeMm?: number;
  expectedMinFontSizeMm?: number;
  remarks?: string;
  officerAction?: "PENDING" | "ACCEPTED" | "REJECTED" | "MANUAL_VERIFIED";
}

export interface InspectionImage {
  id: string;
  url: string;
  label: "Front Panel" | "Back Panel" | "Side Panel" | "Top / Bottom";
  width: number;
  height: number;
  isPrimary?: boolean;
}

export interface InspectionRecord {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  batchLotNumber: string;
  officerId: string;
  officerName: string;
  jurisdiction: string;
  inspectionDate: string;
  status: ComplianceStatus;
  coverageScore: number; // 0 - 100 %
  ocrConfidenceAvg: number; // 0 - 100 %
  images: InspectionImage[];
  findings: DeclarationFinding[];
  officerNotes: string;
  ruleSetVersion: string;
  digitalSignatureHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackagedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  manufacturer: string;
  address: string;
  netQuantity: string;
  mrp: string;
  mfgPackingDate: string;
  consumerCare: string;
  imageUrl: string;
  lastInspectedDate: string;
  lastStatus: ComplianceStatus;
  inspectionCount: number;
}

export interface LegalRule {
  id: string;
  ruleCode: string;
  ruleNumber: string;
  title: string;
  description: string;
  category:
    | "Mandatory Declarations"
    | "Net Quantity"
    | "MRP & Pricing"
    | "Manufacturer & Origin"
    | "Dates & Shelf Life"
    | "Consumer Care"
    | "Readability & Font Size"
    | "Unit Sale Price";
  severity: "HIGH" | "MEDIUM" | "LOW";
  mandatory: boolean;
  legalAct: string;
  sectionOrRule: string;
  prescribedRequirement: string;
  version: string;
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: string;
  inspectionId: string;
  timestamp: string;
  officerId: string;
  officerName: string;
  action: string;
  details: string;
}
