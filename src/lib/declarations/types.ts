/**
 * LabelGuard — Structured Declaration Extraction Data Models
 * Step 3: Semantic fact extraction from OCR without legal compliance determination.
 */

export type DeclarationFieldType =
  // Product Identity
  | "PRODUCT_NAME"
  | "BRAND"
  | "CATEGORY"
  | "VARIANT"
  // Manufacturer / Packer / Importer
  | "MANUFACTURER_NAME"
  | "MANUFACTURER_ADDRESS"
  | "PACKER_NAME"
  | "PACKER_ADDRESS"
  | "IMPORTER_NAME"
  | "IMPORTER_ADDRESS"
  | "COUNTRY_OF_ORIGIN"
  // Quantity Information
  | "NET_QUANTITY"
  | "QUANTITY_UNIT"
  // Price Information
  | "MRP"
  | "PRICE_TEXT"
  | "TAX_WORDING"
  // Date Information
  | "MANUFACTURE_DATE"
  | "PACKING_DATE"
  | "IMPORT_DATE"
  | "BEST_BEFORE"
  | "USE_BY"
  | "EXPIRY_DATE"
  // Consumer Information
  | "CONSUMER_CARE_PHONE"
  | "CONSUMER_CARE_EMAIL"
  | "CONSUMER_CARE_WEBSITE"
  | "CONSUMER_CARE_ADDRESS"
  // Tracking & Identifiers
  | "BATCH_NUMBER"
  | "LOT_NUMBER"
  | "BARCODE"
  // Other Visibly Printed Declarations
  | "OTHER_DECLARATION";

export type DeclarationStatus = "DETECTED" | "NOT_DETECTED" | "AMBIGUOUS";

export type DeclarationLanguage = "en" | "hi" | "mixed" | "numeric" | "symbol" | "unknown";

export type SourceType = "PACKAGE_IMAGE" | "PRODUCT_LISTING";

export interface BoundingBoxPercent {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ManualEditAudit {
  originalValue: string;
  editedValue: string;
  editedBy: string;
  editedAt: string;
  editReason: string;
}

export interface DeclarationField {
  id: string;
  fieldType: DeclarationFieldType;
  labelKey: string;
  rawText: string;
  normalizedValue?: string;
  language: DeclarationLanguage;
  confidence: number; // Extraction confidence (0.0 to 1.0)
  status: DeclarationStatus;
  possibleInterpretation?: string;
  sourceImageId?: string;
  sourceOcrItemIds: string[];
  boundingBox?: BoundingBoxPercent;
  sourceType: SourceType;
  auditTrail?: ManualEditAudit[];
}

export interface DeclarationExtractionResult {
  productId: string;
  sourceType: SourceType;
  sourceImages: string[];
  fields: DeclarationField[];
  overallExtractionConfidence: number;
  extractionTimestamp: string;
  extractionEngine: string;
  extractionSource?: "GEMINI" | "FALLBACK";
  category: string;
  categoryConfidence: number;
  warnings: string[];
  isDemo: boolean;
}

export interface DeclarationFieldCategoryGroup {
  id: string;
  titleKey: string;
  titleDefault: string;
  descriptionDefault: string;
  fieldTypes: DeclarationFieldType[];
}

export const DECLARATION_GROUPS: DeclarationFieldCategoryGroup[] = [
  {
    id: "product_identity",
    titleKey: "declarations.group_product",
    titleDefault: "Product Identity",
    descriptionDefault: "Product name, brand, category, and variant",
    fieldTypes: ["PRODUCT_NAME", "BRAND", "CATEGORY", "VARIANT"],
  },
  {
    id: "net_quantity",
    titleKey: "declarations.group_quantity",
    titleDefault: "Net Quantity & Measurements",
    descriptionDefault: "Standard quantity measurement and units",
    fieldTypes: ["NET_QUANTITY", "QUANTITY_UNIT"],
  },
  {
    id: "pricing",
    titleKey: "declarations.group_pricing",
    titleDefault: "Retail Price & Taxes",
    descriptionDefault: "Maximum Retail Price (MRP) and inclusive tax wording",
    fieldTypes: ["MRP", "PRICE_TEXT", "TAX_WORDING"],
  },
  {
    id: "dates",
    titleKey: "declarations.group_dates",
    titleDefault: "Dates & Shelf Life",
    descriptionDefault: "Manufacturing, packing, expiry, and best before dates",
    fieldTypes: [
      "MANUFACTURE_DATE",
      "PACKING_DATE",
      "IMPORT_DATE",
      "BEST_BEFORE",
      "USE_BY",
      "EXPIRY_DATE",
    ],
  },
  {
    id: "origin_entity",
    titleKey: "declarations.group_origin",
    titleDefault: "Manufacturer, Packer & Importer",
    descriptionDefault: "Corporate names, physical addresses, and country of origin",
    fieldTypes: [
      "MANUFACTURER_NAME",
      "MANUFACTURER_ADDRESS",
      "PACKER_NAME",
      "PACKER_ADDRESS",
      "IMPORTER_NAME",
      "IMPORTER_ADDRESS",
      "COUNTRY_OF_ORIGIN",
    ],
  },
  {
    id: "consumer_care",
    titleKey: "declarations.group_consumer",
    titleDefault: "Consumer Care & Grievance",
    descriptionDefault: "Consumer helpline, email, website, and grievance address",
    fieldTypes: [
      "CONSUMER_CARE_PHONE",
      "CONSUMER_CARE_EMAIL",
      "CONSUMER_CARE_WEBSITE",
      "CONSUMER_CARE_ADDRESS",
    ],
  },
  {
    id: "identifiers",
    titleKey: "declarations.group_identifiers",
    titleDefault: "Identifiers & Certifications",
    descriptionDefault: "Batch number, lot number, barcodes, and other declarations",
    fieldTypes: ["BATCH_NUMBER", "LOT_NUMBER", "BARCODE", "OTHER_DECLARATION"],
  },
];
