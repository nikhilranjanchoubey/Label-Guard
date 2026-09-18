import { DeclarationFinding, FieldStatus, ComplianceStatus } from "@/types";
import rulesData from "@/data/legal/rules.json";

export interface RawExtractionInput {
  manufacturer?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  genericName?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  netQuantity?: { value: string; confidence: number; fontSizeMm?: number; bbox?: { x: number; y: number; width: number; height: number } };
  mrp?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  mfgDate?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  consumerCare?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  unitSalePrice?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  countryOfOrigin?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  bestBefore?: { value: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
}

export interface EngineResult {
  status: ComplianceStatus;
  coverageScore: number;
  ocrConfidenceAvg: number;
  findings: DeclarationFinding[];
  summary: {
    compliantCount: number;
    warningCount: number;
    violationCount: number;
    manualReviewCount: number;
    missingCount: number;
  };
}

export function evaluateCompliance(raw: RawExtractionInput, pdpAreaCm2 = 180): EngineResult {
  const findings: DeclarationFinding[] = [];

  // Helper to find rule
  const getRule = (code: string) => rulesData.find((r) => r.ruleCode === code);

  // 1. Manufacturer / Packer / Importer
  const r1 = getRule("LM-PC-R6-1A")!;
  if (!raw.manufacturer || !raw.manufacturer.value.trim()) {
    findings.push({
      id: "f-mfg-01",
      fieldKey: "manufacturer",
      fieldLabel: "Manufacturer / Packer / Importer Details",
      extractedValue: "Not Detected",
      status: "NOT_DETECTED",
      confidence: 0,
      evidenceSnippet: "No manufacturer or packer declaration identified in scanned label regions.",
      ruleReference: r1.ruleNumber,
      ruleCitation: r1.legalAct,
      severity: "HIGH",
      remarks: "Mandatory declaration under Rule 6(1)(a) is missing from packaging.",
      officerAction: "PENDING",
    });
  } else if (raw.manufacturer.confidence < 0.6) {
    findings.push({
      id: "f-mfg-02",
      fieldKey: "manufacturer",
      fieldLabel: "Manufacturer / Packer / Importer Details",
      extractedValue: raw.manufacturer.value,
      status: "LOW_CONFIDENCE",
      confidence: raw.manufacturer.confidence,
      evidenceSnippet: raw.manufacturer.value,
      ruleReference: r1.ruleNumber,
      ruleCitation: r1.legalAct,
      severity: "MEDIUM",
      bbox: raw.manufacturer.bbox,
      remarks: "OCR confidence is below 60%. Physical verification required.",
      officerAction: "PENDING",
    });
  } else {
    const val = raw.manufacturer.value.toLowerCase();
    const hasPinOrState = /\b\d{6}\b/.test(val) || /india|delhi|mumbai|bengaluru|uttar pradesh|gujarat|maharashtra|tamil nadu/i.test(val);
    const hasQualifier = /mfg|manufactured|packed|marketed|imported|pvt|ltd|regd/i.test(val);

    if (!hasPinOrState || !hasQualifier) {
      findings.push({
        id: "f-mfg-03",
        fieldKey: "manufacturer",
        fieldLabel: "Manufacturer / Packer / Importer Details",
        extractedValue: raw.manufacturer.value,
        status: "WARNING",
        confidence: raw.manufacturer.confidence,
        evidenceSnippet: raw.manufacturer.value,
        ruleReference: r1.ruleNumber,
        ruleCitation: r1.legalAct,
        severity: "MEDIUM",
        bbox: raw.manufacturer.bbox,
        remarks: "Address appears incomplete (missing postal pincode or manufacturer qualification).",
        officerAction: "PENDING",
      });
    } else {
      findings.push({
        id: "f-mfg-04",
        fieldKey: "manufacturer",
        fieldLabel: "Manufacturer / Packer / Importer Details",
        extractedValue: raw.manufacturer.value,
        status: "COMPLIANT",
        confidence: raw.manufacturer.confidence,
        evidenceSnippet: raw.manufacturer.value,
        ruleReference: r1.ruleNumber,
        ruleCitation: r1.legalAct,
        severity: "INFO",
        bbox: raw.manufacturer.bbox,
        remarks: "Complete name, capacity, and physical address detected.",
        officerAction: "PENDING",
      });
    }
  }

  // 2. Generic Name of Commodity
  const r2 = getRule("LM-PC-R6-1B")!;
  if (!raw.genericName || !raw.genericName.value.trim()) {
    findings.push({
      id: "f-gen-01",
      fieldKey: "genericName",
      fieldLabel: "Generic / Common Name of Commodity",
      extractedValue: "Not Detected",
      status: "NOT_DETECTED",
      confidence: 0,
      evidenceSnippet: "Commodity identification name not found on Principal Display Panel.",
      ruleReference: r2.ruleNumber,
      ruleCitation: r2.legalAct,
      severity: "HIGH",
      remarks: "Rule 6(1)(b) mandates clear common or generic commodity name.",
      officerAction: "PENDING",
    });
  } else {
    findings.push({
      id: "f-gen-02",
      fieldKey: "genericName",
      fieldLabel: "Generic / Common Name of Commodity",
      extractedValue: raw.genericName.value,
      status: "COMPLIANT",
      confidence: raw.genericName.confidence,
      evidenceSnippet: raw.genericName.value,
      ruleReference: r2.ruleNumber,
      ruleCitation: r2.legalAct,
      severity: "INFO",
      bbox: raw.genericName.bbox,
      remarks: "Generic commodity name prominently placed.",
      officerAction: "PENDING",
    });
  }

  // 3. Net Quantity & Rule 8 Standard Units
  const r3 = getRule("LM-PC-R6-1C")!;
  const r8 = getRule("LM-PC-R8-UNITS")!;
  const r7 = getRule("LM-PC-R7-FONTS")!;
  const expectedMinFont = pdpAreaCm2 <= 50 ? 1.0 : pdpAreaCm2 <= 100 ? 1.5 : pdpAreaCm2 <= 500 ? 2.5 : pdpAreaCm2 <= 2500 ? 4.0 : 6.0;

  if (!raw.netQuantity || !raw.netQuantity.value.trim()) {
    findings.push({
      id: "f-qty-01",
      fieldKey: "netQuantity",
      fieldLabel: "Net Quantity Declaration",
      extractedValue: "Not Detected",
      status: "NON_COMPLIANT",
      confidence: 0,
      evidenceSnippet: "No net quantity declaration detected.",
      ruleReference: r3.ruleNumber,
      ruleCitation: r3.legalAct,
      severity: "HIGH",
      remarks: "Violation of Rule 6(1)(c). Net quantity is mandatory on principal display panel.",
      officerAction: "PENDING",
    });
  } else {
    const val = raw.netQuantity.value.trim();
    // Check non-standard symbols like "gms", "kilo", "lit", "gm"
    const hasNonStandardUnit = /\b(gms|kilo|lit|lits|gm)\b/i.test(val);
    const hasStandardUnit = /\b(\d+(\.\d+)?)\s*(g|kg|ml|l|m|cm|mm|n)\b/i.test(val);

    const actualFont = raw.netQuantity.fontSizeMm || 2.8;
    const fontTooSmall = actualFont < expectedMinFont;

    if (hasNonStandardUnit) {
      findings.push({
        id: "f-qty-02",
        fieldKey: "netQuantity",
        fieldLabel: "Net Quantity Declaration",
        extractedValue: val,
        status: "NON_COMPLIANT",
        confidence: raw.netQuantity.confidence,
        evidenceSnippet: val,
        ruleReference: r8.ruleNumber,
        ruleCitation: r8.legalAct,
        severity: "HIGH",
        bbox: raw.netQuantity.bbox,
        fontSizeMm: actualFont,
        expectedMinFontSizeMm: expectedMinFont,
        remarks: "Non-standard unit symbol detected (e.g. 'gms' instead of standard 'g'). Violates Rule 8.",
        officerAction: "PENDING",
      });
    } else if (fontTooSmall) {
      findings.push({
        id: "f-qty-03",
        fieldKey: "netQuantity",
        fieldLabel: "Net Quantity Declaration",
        extractedValue: val,
        status: "WARNING",
        confidence: raw.netQuantity.confidence,
        evidenceSnippet: val,
        ruleReference: r7.ruleNumber,
        ruleCitation: r7.legalAct,
        severity: "MEDIUM",
        bbox: raw.netQuantity.bbox,
        fontSizeMm: actualFont,
        expectedMinFontSizeMm: expectedMinFont,
        remarks: `Numeral height is ${actualFont}mm. Rule 7 specifies minimum ${expectedMinFont}mm for PDP area of ${pdpAreaCm2} cm².`,
        officerAction: "PENDING",
      });
    } else if (!hasStandardUnit) {
      findings.push({
        id: "f-qty-04",
        fieldKey: "netQuantity",
        fieldLabel: "Net Quantity Declaration",
        extractedValue: val,
        status: "MANUAL_REVIEW",
        confidence: raw.netQuantity.confidence,
        evidenceSnippet: val,
        ruleReference: r3.ruleNumber,
        ruleCitation: r3.legalAct,
        severity: "MEDIUM",
        bbox: raw.netQuantity.bbox,
        fontSizeMm: actualFont,
        expectedMinFontSizeMm: expectedMinFont,
        remarks: "Ambiguous quantity format detected. Requires officer manual inspection.",
        officerAction: "PENDING",
      });
    } else {
      findings.push({
        id: "f-qty-05",
        fieldKey: "netQuantity",
        fieldLabel: "Net Quantity Declaration",
        extractedValue: val,
        status: "COMPLIANT",
        confidence: raw.netQuantity.confidence,
        evidenceSnippet: val,
        ruleReference: r3.ruleNumber,
        ruleCitation: r3.legalAct,
        severity: "INFO",
        bbox: raw.netQuantity.bbox,
        fontSizeMm: actualFont,
        expectedMinFontSizeMm: expectedMinFont,
        remarks: `Standard metric declaration (${val}) with compliant font height (${actualFont}mm).`,
        officerAction: "PENDING",
      });
    }
  }

  // 4. Maximum Retail Price (MRP)
  const r5 = getRule("LM-PC-R6-1DA")!;
  if (!raw.mrp || !raw.mrp.value.trim()) {
    findings.push({
      id: "f-mrp-01",
      fieldKey: "mrp",
      fieldLabel: "Maximum Retail Price (MRP)",
      extractedValue: "Not Detected",
      status: "NON_COMPLIANT",
      confidence: 0,
      evidenceSnippet: "No MRP declaration found on package.",
      ruleReference: r5.ruleNumber,
      ruleCitation: r5.legalAct,
      severity: "HIGH",
      remarks: "Violation of Rule 6(1)(da). MRP is a mandatory statutory declaration.",
      officerAction: "PENDING",
    });
  } else {
    const val = raw.mrp.value;
    const hasTaxPhrase = /incl\.|inclusive|all taxes/i.test(val);
    const hasRupee = /₹|rs\.?|inr/i.test(val);
    const hasAlteration = /stick|overwrite|strike|dual/i.test(val);

    if (hasAlteration) {
      findings.push({
        id: "f-mrp-02",
        fieldKey: "mrp",
        fieldLabel: "Maximum Retail Price (MRP)",
        extractedValue: val,
        status: "NON_COMPLIANT",
        confidence: raw.mrp.confidence,
        evidenceSnippet: val,
        ruleReference: r5.ruleNumber,
        ruleCitation: r5.legalAct,
        severity: "HIGH",
        bbox: raw.mrp.bbox,
        remarks: "Potential sticker overlay or price alteration detected without manufacturer authorization.",
        officerAction: "PENDING",
      });
    } else if (!hasTaxPhrase) {
      findings.push({
        id: "f-mrp-03",
        fieldKey: "mrp",
        fieldLabel: "Maximum Retail Price (MRP)",
        extractedValue: val,
        status: "WARNING",
        confidence: raw.mrp.confidence,
        evidenceSnippet: val,
        ruleReference: r5.ruleNumber,
        ruleCitation: r5.legalAct,
        severity: "MEDIUM",
        bbox: raw.mrp.bbox,
        remarks: "Declaration lacks explicit 'inclusive of all taxes' or 'incl. of all taxes' wording.",
        officerAction: "PENDING",
      });
    } else if (!hasRupee) {
      findings.push({
        id: "f-mrp-04",
        fieldKey: "mrp",
        fieldLabel: "Maximum Retail Price (MRP)",
        extractedValue: val,
        status: "WARNING",
        confidence: raw.mrp.confidence,
        evidenceSnippet: val,
        ruleReference: r5.ruleNumber,
        ruleCitation: r5.legalAct,
        severity: "LOW",
        bbox: raw.mrp.bbox,
        remarks: "Currency symbol ₹ or Rs. omitted from retail price numeral.",
        officerAction: "PENDING",
      });
    } else {
      findings.push({
        id: "f-mrp-05",
        fieldKey: "mrp",
        fieldLabel: "Maximum Retail Price (MRP)",
        extractedValue: val,
        status: "COMPLIANT",
        confidence: raw.mrp.confidence,
        evidenceSnippet: val,
        ruleReference: r5.ruleNumber,
        ruleCitation: r5.legalAct,
        severity: "INFO",
        bbox: raw.mrp.bbox,
        remarks: "Compliant format with Indian Rupee symbol and 'inclusive of all taxes'.",
        officerAction: "PENDING",
      });
    }
  }

  // 5. Month & Year of Manufacture / Packing
  const r4 = getRule("LM-PC-R6-1D")!;
  if (!raw.mfgDate || !raw.mfgDate.value.trim()) {
    findings.push({
      id: "f-date-01",
      fieldKey: "mfgDate",
      fieldLabel: "Month & Year of Manufacture / Packing",
      extractedValue: "Not Detected",
      status: "NON_COMPLIANT",
      confidence: 0,
      evidenceSnippet: "No manufacturing or packaging date detected.",
      ruleReference: r4.ruleNumber,
      ruleCitation: r4.legalAct,
      severity: "HIGH",
      remarks: "Mandatory under Rule 6(1)(d). Month and year must be clearly stated.",
      officerAction: "PENDING",
    });
  } else if (raw.mfgDate.confidence < 0.65) {
    findings.push({
      id: "f-date-02",
      fieldKey: "mfgDate",
      fieldLabel: "Month & Year of Manufacture / Packing",
      extractedValue: raw.mfgDate.value,
      status: "MANUAL_REVIEW",
      confidence: raw.mfgDate.confidence,
      evidenceSnippet: raw.mfgDate.value,
      ruleReference: r4.ruleNumber,
      ruleCitation: r4.legalAct,
      severity: "MEDIUM",
      bbox: raw.mfgDate.bbox,
      remarks: "Date stamp is faint or smudged. OCR confidence is low; officer visual check required.",
      officerAction: "PENDING",
    });
  } else {
    findings.push({
      id: "f-date-03",
      fieldKey: "mfgDate",
      fieldLabel: "Month & Year of Manufacture / Packing",
      extractedValue: raw.mfgDate.value,
      status: "COMPLIANT",
      confidence: raw.mfgDate.confidence,
      evidenceSnippet: raw.mfgDate.value,
      ruleReference: r4.ruleNumber,
      ruleCitation: r4.legalAct,
      severity: "INFO",
      bbox: raw.mfgDate.bbox,
      remarks: "Clear month and year declaration detected.",
      officerAction: "PENDING",
    });
  }

  // 6. Consumer Care Details (Rule 6(1)(e))
  const r6 = getRule("LM-PC-R6-1E")!;
  if (!raw.consumerCare || !raw.consumerCare.value.trim()) {
    findings.push({
      id: "f-cc-01",
      fieldKey: "consumerCare",
      fieldLabel: "Consumer Care Contact Information",
      extractedValue: "Not Detected",
      status: "NON_COMPLIANT",
      confidence: 0,
      evidenceSnippet: "No consumer complaint or helpline details detected.",
      ruleReference: r6.ruleNumber,
      ruleCitation: r6.legalAct,
      severity: "HIGH",
      remarks: "Rule 6(1)(e) requires name, telephone number and email address for consumer feedback.",
      officerAction: "PENDING",
    });
  } else {
    const val = raw.consumerCare.value;
    const hasPhone = /(?:1800|\+?91|tel|phone|contact|toll free|\d{10})/i.test(val);
    const hasEmail = /@|email|e-mail/i.test(val);

    if (!hasEmail && !hasPhone) {
      findings.push({
        id: "f-cc-02",
        fieldKey: "consumerCare",
        fieldLabel: "Consumer Care Contact Information",
        extractedValue: val,
        status: "NON_COMPLIANT",
        confidence: raw.consumerCare.confidence,
        evidenceSnippet: val,
        ruleReference: r6.ruleNumber,
        ruleCitation: r6.legalAct,
        severity: "HIGH",
        bbox: raw.consumerCare.bbox,
        remarks: "Missing both telephone number and email address. Violates Rule 6(1)(e).",
        officerAction: "PENDING",
      });
    } else if (!hasEmail || !hasPhone) {
      findings.push({
        id: "f-cc-03",
        fieldKey: "consumerCare",
        fieldLabel: "Consumer Care Contact Information",
        extractedValue: val,
        status: "WARNING",
        confidence: raw.consumerCare.confidence,
        evidenceSnippet: val,
        ruleReference: r6.ruleNumber,
        ruleCitation: r6.legalAct,
        severity: "MEDIUM",
        bbox: raw.consumerCare.bbox,
        remarks: !hasEmail ? "Mandatory email address is missing from consumer care panel." : "Mandatory telephone / helpline number is missing.",
        officerAction: "PENDING",
      });
    } else {
      findings.push({
        id: "f-cc-04",
        fieldKey: "consumerCare",
        fieldLabel: "Consumer Care Contact Information",
        extractedValue: val,
        status: "COMPLIANT",
        confidence: raw.consumerCare.confidence,
        evidenceSnippet: val,
        ruleReference: r6.ruleNumber,
        ruleCitation: r6.legalAct,
        severity: "INFO",
        bbox: raw.consumerCare.bbox,
        remarks: "Both telephonic contact / helpline and email address present.",
        officerAction: "PENDING",
      });
    }
  }

  // 7. Unit Sale Price (USP)
  if (raw.unitSalePrice && raw.unitSalePrice.value.trim()) {
    const r10 = getRule("LM-PC-R6-11-USP")!;
    findings.push({
      id: "f-usp-01",
      fieldKey: "unitSalePrice",
      fieldLabel: "Unit Sale Price (USP)",
      extractedValue: raw.unitSalePrice.value,
      status: "COMPLIANT",
      confidence: raw.unitSalePrice.confidence,
      evidenceSnippet: raw.unitSalePrice.value,
      ruleReference: r10.ruleNumber,
      ruleCitation: r10.legalAct,
      severity: "INFO",
      bbox: raw.unitSalePrice.bbox,
      remarks: "Unit sale price declared for transparent comparison.",
      officerAction: "PENDING",
    });
  }

  // 8. Country of Origin (if imported / applicable)
  if (raw.countryOfOrigin && raw.countryOfOrigin.value.trim()) {
    const r11 = getRule("LM-PC-R6-1F")!;
    findings.push({
      id: "f-coo-01",
      fieldKey: "countryOfOrigin",
      fieldLabel: "Country of Origin",
      extractedValue: raw.countryOfOrigin.value,
      status: "COMPLIANT",
      confidence: raw.countryOfOrigin.confidence,
      evidenceSnippet: raw.countryOfOrigin.value,
      ruleReference: r11.ruleNumber,
      ruleCitation: r11.legalAct,
      severity: "INFO",
      bbox: raw.countryOfOrigin.bbox,
      remarks: "Country of origin explicitly declared.",
      officerAction: "PENDING",
    });
  }

  // Compute stats
  let compliantCount = 0;
  let warningCount = 0;
  let violationCount = 0;
  let manualReviewCount = 0;
  let missingCount = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  findings.forEach((f) => {
    if (f.status === "COMPLIANT") compliantCount++;
    else if (f.status === "WARNING") warningCount++;
    else if (f.status === "NON_COMPLIANT") violationCount++;
    else if (f.status === "MANUAL_REVIEW" || f.status === "LOW_CONFIDENCE") manualReviewCount++;
    else if (f.status === "NOT_DETECTED") missingCount++;

    if (f.confidence > 0) {
      confidenceSum += f.confidence;
      confidenceCount++;
    }
  });

  const ocrConfidenceAvg = confidenceCount > 0 ? Math.round((confidenceSum / confidenceCount) * 100) : 0;

  // Coverage score: 6 core mandatory declarations
  const coreTotal = 6;
  const coreCompliant = findings.filter(
    (f) => ["manufacturer", "genericName", "netQuantity", "mrp", "mfgDate", "consumerCare"].includes(f.fieldKey) && f.status === "COMPLIANT"
  ).length;
  const corePartial = findings.filter(
    (f) => ["manufacturer", "genericName", "netQuantity", "mrp", "mfgDate", "consumerCare"].includes(f.fieldKey) && (f.status === "WARNING" || f.status === "MANUAL_REVIEW")
  ).length;

  const coverageScore = Math.min(100, Math.round(((coreCompliant * 1.0 + corePartial * 0.5) / coreTotal) * 100));

  let overallStatus: ComplianceStatus = "COMPLIANT";
  if (violationCount > 0 || missingCount > 0) {
    overallStatus = "NON_COMPLIANT";
  } else if (warningCount > 0 || manualReviewCount > 0) {
    overallStatus = "NEEDS_REVIEW";
  }

  return {
    status: overallStatus,
    coverageScore,
    ocrConfidenceAvg,
    findings,
    summary: {
      compliantCount,
      warningCount,
      violationCount,
      manualReviewCount,
      missingCount,
    },
  };
}
