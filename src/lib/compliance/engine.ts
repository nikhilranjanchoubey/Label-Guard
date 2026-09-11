/**
 * LabelGuard — Deterministic Legal Compliance Engine
 * Step 5: Evaluates structured declaration facts against verified legal rules.
 * 
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. Gemini / LLMs MUST NOT directly determine legal compliance.
 * 2. Only VERIFIED rules from the legal rule library may produce compliance determinations.
 * 3. All uncertainty (low OCR confidence, ambiguous extraction, conflicts, missing calibration)
 *    MUST return REVIEW. Never convert uncertainty to PASS or FAIL.
 */

import {
  ComplianceEvaluationInput,
  ComplianceResult,
  RuleEvaluation,
  ComplianceSummary,
  OverallComplianceStatus,
  EvidenceReference,
} from "./types";
import { legalRuleRepository } from "../legal/repository";
import { LegalRule } from "../legal/types";
import { DeclarationField, DeclarationFieldType } from "../declarations/types";

const ENGINE_VERSION = "LabelGuard-Deterministic-Engine-v1.0";
const CONFIDENCE_AUDIT_THRESHOLD = 0.70;

export class DeterministicComplianceEngine {
  /**
   * Main entry point to evaluate extracted declarations against authoritative rules.
   */
  public evaluate(input: ComplianceEvaluationInput): ComplianceResult {
    const inspectionId = input.inspectionId || `INS-${Date.now()}`;
    const evaluationTimestamp = new Date().toISOString();
    const productMeta = input.metadata || {
      category: input.declarationResult.category || "General Commodity",
    };


    // 2. Derive net quantity values if present in extracted declarations
    const netQtyField = input.declarationResult.fields.find((f) => f.fieldType === "NET_QUANTITY");
    const netQuantityValue =
      productMeta.netQuantityValue !== undefined
        ? productMeta.netQuantityValue
        : this.parseNetQuantityValue(netQtyField?.rawText || netQtyField?.normalizedValue);
    const netQuantityUnit =
      productMeta.netQuantityUnit ||
      this.parseNetQuantityUnit(netQtyField?.rawText || netQtyField?.normalizedValue);

    // 3. Execute Step 4 Applicability Engine
    const applicabilityResult = legalRuleRepository.getApplicableRules({
      productCategory: productMeta.category,
      packageType: productMeta.packageType,
      isImported: productMeta.isImported,
      isEcommerceListing: productMeta.isEcommerceListing,
      productDate: productMeta.productDate,
      inspectionDate: input.inspectionDate || evaluationTimestamp.slice(0, 10),
      netQuantityValue,
      netQuantityUnit,
    });

    const applicableRules = applicabilityResult.applicableRules;
    const ruleEvaluations: RuleEvaluation[] = [];

    // 4. Evaluate each applicable VERIFIED rule deterministically
    for (const rule of applicableRules) {
      const evaluation = this.evaluateSingleRule(rule, input, {
        ...productMeta,
        netQuantityValue,
        netQuantityUnit,
      });
      ruleEvaluations.push(evaluation);
    }

    // 5. Derive deterministic Compliance Summary
    const summary = this.computeSummary(ruleEvaluations);

    // 6. Generate audit hash
    const auditHash = this.generateAuditHash(inspectionId, applicableRules, ruleEvaluations);

    const productName =
      input.productName ||
      input.declarationResult.fields.find((f) => f.fieldType === "PRODUCT_NAME")?.normalizedValue ||
      "Packaged Commodity Inspection Sample";

    return {
      id: `COMP-${Date.now()}`,
      inspectionId,
      productId: input.productId || input.declarationResult.productId,
      productName,
      brand: input.brand || input.declarationResult.fields.find((f) => f.fieldType === "BRAND")?.normalizedValue,
      metadata: {
        ...productMeta,
        netQuantityValue,
        netQuantityUnit,
      },
      evaluationTimestamp,
      engineVersion: ENGINE_VERSION,
      rulesEvaluated: ruleEvaluations,
      summary,
      exemptions: applicabilityResult.exemptedRules,
      unverifiedRulesIgnored: applicabilityResult.unverifiedRulesIgnored.map((r) => ({
        internalRuleId: r.internalRuleId,
        status: r.verificationStatus,
      })),
      auditHash,
      isDemo: Boolean(input.declarationResult.isDemo),
      disclaimer:
        "LabelGuard provides automated compliance assistance based on configured legal rules. Final enforcement decisions require authorized human verification.",
    };
  }

  /**
   * Deterministically evaluates a single verified legal rule against extracted facts.
   */
  private evaluateSingleRule(
    rule: LegalRule,
    input: ComplianceEvaluationInput,
    metadata: ComplianceEvaluationInput["metadata"]
  ): RuleEvaluation {
    const fields = input.declarationResult.fields;
    const relevantFields = this.findRelevantFields(rule, fields);

    // -------------------------------------------------------------------------
    // SPECIAL CASE 1: Font Size / Dimensions (Rule 7 Table-I / LMPC-DECL-013)
    // -------------------------------------------------------------------------
    if (rule.internalRuleId === "LMPC-DECL-013") {
      if (!metadata?.hasPhysicalScaleCalibration) {
        return {
          id: `EV-${rule.internalRuleId}-${Date.now()}`,
          ruleId: rule.id,
          internalRuleId: rule.internalRuleId,
          statutoryReference: rule.statutoryReference,
          requirement: rule.requirement,
          category: rule.category,
          status: "REVIEW",
          reason:
            "Physical scale calibration is unavailable; font-size compliance cannot be reliably determined from image pixels alone.",
          reasonHi:
            "भौतिक पैमाना अंशांकन अनुपलब्ध है; केवल छवि पिक्सेल से फ़ॉन्ट आकार अनुपालन निर्धारित नहीं किया जा सकता।",
          extractedValue: "Pixel-based text detected (Uncalibrated)",
          expectedValue: "Minimum numeral/letter height per Table-I (1.0mm - 6.0mm)",
          evidence: this.buildEvidence(relevantFields[0]),
          confidence: 0.50,
          sourceReference: {
            documentTitle: rule.source.documentTitle,
            ruleNumber: rule.source.ruleNumber,
            officialUrl: rule.source.officialUrl,
            pageNumber: rule.source.pageNumber,
            gazetteNotification: rule.source.gazetteNotification,
          },
          evaluatedAt: new Date().toISOString(),
          ruleVersion: rule.effectiveFrom,
          verificationStatus: rule.verificationStatus,
        };
      }
    }

    // -------------------------------------------------------------------------
    // SPECIAL CASE 2: Individual Alteration Stickers (Rule 6(3) / LMPC-DECL-014)
    // -------------------------------------------------------------------------
    if (rule.internalRuleId === "LMPC-DECL-014") {
      // In digital OCR analysis, stickers without physical adhesive detection are flagged for review or passed if clean
      const hasStickerMention = relevantFields.some(
        (f) => f.rawText.toLowerCase().includes("sticker") || f.rawText.toLowerCase().includes("revised mrp")
      );
      return {
        id: `EV-${rule.internalRuleId}-${Date.now()}`,
        ruleId: rule.id,
        internalRuleId: rule.internalRuleId,
        statutoryReference: rule.statutoryReference,
        requirement: rule.requirement,
        category: rule.category,
        status: hasStickerMention ? "REVIEW" : "PASS",
        reason: hasStickerMention
          ? "Possible secondary sticker wording detected; inspect package to confirm it only revises MRP downwards without covering mandatory details."
          : "No prohibited alteration stickers detected on surface.",
        reasonHi: hasStickerMention
          ? "द्वितीयक स्टिकर का उल्लेख मिला; भौतिक पैकेज का निरीक्षण आवश्यक है।"
          : "पैकेज की सतह पर कोई निषिद्ध परिवर्तन स्टिकर नहीं पाया गया।",
        extractedValue: hasStickerMention ? "Potential sticker wording detected" : "Clean printed surface",
        expectedValue: "Printed directly or only non-covering lower MRP sticker",
        evidence: this.buildEvidence(relevantFields[0]),
        confidence: 0.85,
        sourceReference: {
          documentTitle: rule.source.documentTitle,
          ruleNumber: rule.source.ruleNumber,
          officialUrl: rule.source.officialUrl,
          pageNumber: rule.source.pageNumber,
        },
        evaluatedAt: new Date().toISOString(),
        ruleVersion: rule.effectiveFrom,
        verificationStatus: rule.verificationStatus,
      };
    }

    // -------------------------------------------------------------------------
    // CONFLICT HANDLING: Multiple differing extractions for the SAME primary field
    // -------------------------------------------------------------------------
    const primaryFieldType = this.getPrimaryFieldType(rule);
    const primaryFields = fields.filter(
      (f) => f.fieldType === primaryFieldType && f.status !== "NOT_DETECTED"
    );

    if (primaryFields.length > 1) {
      const distinctValues = Array.from(
        new Set(primaryFields.map((f) => f.normalizedValue || f.rawText).filter(Boolean))
      );
      if (distinctValues.length > 1) {
        return {
          id: `EV-${rule.internalRuleId}-${Date.now()}`,
          ruleId: rule.id,
          internalRuleId: rule.internalRuleId,
          statutoryReference: rule.statutoryReference,
          requirement: rule.requirement,
          category: rule.category,
          status: "REVIEW",
          reason: `Conflicting values detected: [${distinctValues.join(" vs ")}]. Manual reconciliation required.`,
          reasonHi: `परस्पर विरोधी मान पाए गए: [${distinctValues.join(" बनाम ")}]। मानवीय समाधान आवश्यक है।`,
          extractedValue: distinctValues.join(" | "),
          expectedValue: "Unambiguous single declaration",
          evidence: this.buildConflictEvidence(primaryFields),
          confidence: 0.50,
          sourceReference: {
            documentTitle: rule.source.documentTitle,
            ruleNumber: rule.source.ruleNumber,
            officialUrl: rule.source.officialUrl,
            pageNumber: rule.source.pageNumber,
          },
          evaluatedAt: new Date().toISOString(),
          ruleVersion: rule.effectiveFrom,
          verificationStatus: rule.verificationStatus,
        };
      }
    }

    const primaryField = primaryFields[0] || relevantFields[0];

    // -------------------------------------------------------------------------
    // UNCERTAINTY HANDLING: Ambiguous or Low Confidence Extraction
    // -------------------------------------------------------------------------
    if (primaryField && primaryField.status === "AMBIGUOUS") {
      return {
        id: `EV-${rule.internalRuleId}-${Date.now()}`,
        ruleId: rule.id,
        internalRuleId: rule.internalRuleId,
        statutoryReference: rule.statutoryReference,
        requirement: rule.requirement,
        category: rule.category,
        status: "REVIEW",
        reason: `Ambiguous extraction for ${primaryField.fieldType} ('${primaryField.rawText}'). Optical interpretation is uncertain.`,
        reasonHi: `${primaryField.fieldType} के लिए संदिग्ध निष्कर्षण ('${primaryField.rawText}')। मानवीय समीक्षा आवश्यक है।`,
        extractedValue: primaryField.rawText,
        expectedValue: "Legible standard declaration",
        evidence: this.buildEvidence(primaryField),
        confidence: primaryField.confidence,
        sourceReference: {
          documentTitle: rule.source.documentTitle,
          ruleNumber: rule.source.ruleNumber,
          officialUrl: rule.source.officialUrl,
          pageNumber: rule.source.pageNumber,
        },
        evaluatedAt: new Date().toISOString(),
        ruleVersion: rule.effectiveFrom,
        verificationStatus: rule.verificationStatus,
      };
    }

    if (primaryField && primaryField.status === "DETECTED" && primaryField.confidence < CONFIDENCE_AUDIT_THRESHOLD) {
      return {
        id: `EV-${rule.internalRuleId}-${Date.now()}`,
        ruleId: rule.id,
        internalRuleId: rule.internalRuleId,
        statutoryReference: rule.statutoryReference,
        requirement: rule.requirement,
        category: rule.category,
        status: "REVIEW",
        reason: `Extraction confidence (${(primaryField.confidence * 100).toFixed(1)}%) is below audit threshold (${(CONFIDENCE_AUDIT_THRESHOLD * 100)}%). Manual inspection required.`,
        reasonHi: `निष्कर्षण विश्वसनीयता (${(primaryField.confidence * 100).toFixed(1)}%) ऑडिट सीमा से कम है।`,
        extractedValue: primaryField.normalizedValue || primaryField.rawText,
        expectedValue: "High-confidence legible declaration",
        evidence: this.buildEvidence(primaryField),
        confidence: primaryField.confidence,
        sourceReference: {
          documentTitle: rule.source.documentTitle,
          ruleNumber: rule.source.ruleNumber,
          officialUrl: rule.source.officialUrl,
          pageNumber: rule.source.pageNumber,
        },
        evaluatedAt: new Date().toISOString(),
        ruleVersion: rule.effectiveFrom,
        verificationStatus: rule.verificationStatus,
      };
    }

    // -------------------------------------------------------------------------
    // DETERMINISTIC CONDITION EVALUATION
    // -------------------------------------------------------------------------
    const evaluation = this.evaluateConditions(rule, primaryField, fields);

    return {
      id: `EV-${rule.internalRuleId}-${Date.now()}`,
      ruleId: rule.id,
      internalRuleId: rule.internalRuleId,
      statutoryReference: rule.statutoryReference,
      requirement: rule.requirement,
      category: rule.category,
      status: evaluation.status,
      reason: evaluation.reason,
      reasonHi: evaluation.reasonHi,
      extractedValue: primaryField ? (primaryField.normalizedValue || primaryField.rawText) : "NOT DETECTED",
      expectedValue: evaluation.expectedValue || rule.requirement,
      evidence: this.buildEvidence(primaryField),
      confidence: primaryField ? primaryField.confidence : 1.0,
      sourceReference: {
        documentTitle: rule.source.documentTitle,
        ruleNumber: rule.source.ruleNumber,
        officialUrl: rule.source.officialUrl,
        pageNumber: rule.source.pageNumber,
        gazetteNotification: rule.source.gazetteNotification,
      },
      evaluatedAt: new Date().toISOString(),
      ruleVersion: rule.effectiveFrom,
      verificationStatus: rule.verificationStatus,
    };
  }

  /**
   * Matches rule conditions against the primary field and related declaration fields.
   */
  private evaluateConditions(
    rule: LegalRule,
    field?: DeclarationField,
    allFields: DeclarationField[] = []
  ): { status: "PASS" | "FAIL" | "REVIEW"; reason: string; reasonHi: string; expectedValue?: string } {
    // If no field found and conditions expect PRESENT
    const expectsPresent = rule.conditions.some((c) => c.operator === "PRESENT");
    if (!field || field.status === "NOT_DETECTED") {
      if (expectsPresent) {
        return {
          status: "FAIL",
          reason: `Mandatory statutory declaration required by ${rule.statutoryReference} was not detected on package surfaces.`,
          reasonHi: `${rule.statutoryReference} के तहत आवश्यक अनिवार्य वैधानिक घोषणा पैकेज पर नहीं पाई गई।`,
          expectedValue: "Mandatory declaration must be present",
        };
      } else {
        return {
          status: "PASS",
          reason: "Statutory condition satisfied.",
          reasonHi: "वैधानिक शर्त पूरी हुई।",
        };
      }
    }

    // Check REGEX conditions (e.g. valid metric unit)
    const regexCondition = rule.conditions.find((c) => c.operator === "REGEX");
    if (regexCondition && regexCondition.parameters?.regex) {
      const targetFieldName = regexCondition.field;
      const targetField = allFields.find((f) => f.fieldType === targetFieldName) || field;
      const pattern = new RegExp(regexCondition.parameters.regex as string, "i");
      let textToTest = targetField.normalizedValue || targetField.rawText;

      // If condition targets quantity unit but evaluating on composite net quantity text, extract unit
      if (regexCondition.field === "QUANTITY_UNIT" && targetField.fieldType === "NET_QUANTITY") {
        const match = textToTest.match(/\b(g|kg|ml|l|L|m|cm|mm|N|U|units|pieces)\b/i);
        if (match) textToTest = match[1];
      }

      if (!pattern.test(textToTest)) {
        return {
          status: "FAIL",
          reason: `Declared value '${textToTest}' does not conform to statutory metric format under ${rule.statutoryReference}.`,
          reasonHi: `घोषित मान '${textToTest}' ${rule.statutoryReference} के विहित मीट्रिक प्रारूप के अनुरूप नहीं है।`,
          expectedValue: `Matching pattern: ${regexCondition.parameters.regex}`,
        };
      }
    }

    // Check MRP rule specifically for inclusive tax phrase (Rule 6(1)(e))
    if (rule.internalRuleId === "LMPC-DECL-007") {
      const raw = field.rawText.toLowerCase();
      const norm = (field.normalizedValue || "").toLowerCase();
      const hasTaxWording =
        raw.includes("tax") ||
        raw.includes("कर") ||
        raw.includes("incl") ||
        norm.includes("incl") ||
        raw.includes("mrp") ||
        norm.includes("mrp");

      if (!hasTaxWording) {
        return {
          status: "FAIL",
          reason: "Retail price detected but statutory 'inclusive of all taxes' wording is missing or illegible under Rule 6(1)(e).",
          reasonHi: "खुदरा मूल्य मिला, परंतु 'सभी करों सहित' वैधानिक शब्दावली नियम 6(1)(e) के तहत अनुपस्थित है।",
          expectedValue: "MRP in INR (inclusive of all taxes)",
        };
      }
    }

    // Default PASS when presence requirement is fulfilled with adequate confidence
    return {
      status: "PASS",
      reason: `Mandatory declaration is present and satisfies ${rule.statutoryReference}.`,
      reasonHi: `अनिवार्य घोषणा उपस्थित है और ${rule.statutoryReference} का अनुपालन करती है।`,
      expectedValue: field.normalizedValue || field.rawText,
    };
  }

  /**
   * Helper to identify the single primary declaration field type for a given rule.
   */
  private getPrimaryFieldType(rule: LegalRule): DeclarationFieldType {
    switch (rule.internalRuleId) {
      case "LMPC-DECL-001":
        return "MANUFACTURER_NAME";
      case "LMPC-DECL-002":
        return "COUNTRY_OF_ORIGIN";
      case "LMPC-DECL-003":
        return "PRODUCT_NAME";
      case "LMPC-DECL-004":
        return "NET_QUANTITY";
      case "LMPC-DECL-005":
        return "MANUFACTURE_DATE";
      case "LMPC-DECL-006":
        return "EXPIRY_DATE";
      case "LMPC-DECL-007":
        return "MRP";
      case "LMPC-DECL-008":
        return "PRICE_TEXT";
      case "LMPC-DECL-009":
        return "CONSUMER_CARE_PHONE";
      case "LMPC-DECL-010":
        return "OTHER_DECLARATION";
      case "LMPC-DECL-011":
      case "LMPC-DECL-012":
        return "COUNTRY_OF_ORIGIN";
      default:
        return (rule.conditions[0]?.field as DeclarationFieldType) || "OTHER_DECLARATION";
    }
  }

  /**
   * Helper to find relevant declaration fields for a given legal rule.
   */
  private findRelevantFields(rule: LegalRule, fields: DeclarationField[]): DeclarationField[] {
    const targetFieldTypes: DeclarationFieldType[] = [];

    switch (rule.internalRuleId) {
      case "LMPC-DECL-001":
        targetFieldTypes.push("MANUFACTURER_NAME", "MANUFACTURER_ADDRESS", "PACKER_NAME", "IMPORTER_NAME");
        break;
      case "LMPC-DECL-002":
        targetFieldTypes.push("COUNTRY_OF_ORIGIN");
        break;
      case "LMPC-DECL-003":
        targetFieldTypes.push("PRODUCT_NAME");
        break;
      case "LMPC-DECL-004":
        targetFieldTypes.push("NET_QUANTITY", "QUANTITY_UNIT");
        break;
      case "LMPC-DECL-005":
        targetFieldTypes.push("MANUFACTURE_DATE");
        break;
      case "LMPC-DECL-006":
        targetFieldTypes.push("EXPIRY_DATE", "BEST_BEFORE", "USE_BY");
        break;
      case "LMPC-DECL-007":
        targetFieldTypes.push("MRP", "PRICE_TEXT", "TAX_WORDING");
        break;
      case "LMPC-DECL-008":
        targetFieldTypes.push("PRICE_TEXT");
        break;
      case "LMPC-DECL-009":
        targetFieldTypes.push("CONSUMER_CARE_PHONE", "CONSUMER_CARE_EMAIL", "CONSUMER_CARE_ADDRESS");
        break;
      case "LMPC-DECL-010":
        targetFieldTypes.push("OTHER_DECLARATION");
        break;
      case "LMPC-DECL-011":
      case "LMPC-DECL-012":
        targetFieldTypes.push("COUNTRY_OF_ORIGIN", "PRODUCT_NAME", "MRP");
        break;
      default:
        // Check rule condition field name
        rule.conditions.forEach((c) => targetFieldTypes.push(c.field as DeclarationFieldType));
        break;
    }

    return fields.filter(
      (f) => targetFieldTypes.includes(f.fieldType) && f.status !== "NOT_DETECTED"
    );
  }

  /**
   * Creates an EvidenceReference link from an extracted field.
   */
  private buildEvidence(field?: DeclarationField): EvidenceReference | undefined {
    if (!field) return undefined;
    return {
      imageId: field.sourceImageId,
      boundingBox: field.boundingBox,
      ocrText: field.rawText,
      ocrConfidence: field.confidence,
      extractionField: field.fieldType,
      sourceType: field.sourceType,
      sourceOcrItemIds: field.sourceOcrItemIds,
    };
  }

  /**
   * Creates an EvidenceReference containing multiple conflicting citations.
   */
  private buildConflictEvidence(fields: DeclarationField[]): EvidenceReference | undefined {
    if (fields.length === 0) return undefined;
    const primary = this.buildEvidence(fields[0])!;
    primary.additionalEvidence = fields.slice(1).map((f) => this.buildEvidence(f)!);
    return primary;
  }

  /**
   * Computes the summary score and deterministic overall status.
   */
  private computeSummary(evaluations: RuleEvaluation[]): ComplianceSummary {
    const totalApplicableRules = evaluations.length;
    const passCount = evaluations.filter((e) => e.status === "PASS").length;
    const failCount = evaluations.filter((e) => e.status === "FAIL").length;
    const reviewCount = evaluations.filter((e) => e.status === "REVIEW").length;
    const notApplicableCount = evaluations.filter((e) => e.status === "NOT_APPLICABLE").length;

    let overallStatus: OverallComplianceStatus;
    let summaryNarrative: string;
    let summaryNarrativeHi: string;

    if (totalApplicableRules === 0) {
      overallStatus = "NO_APPLICABLE_RULES";
      summaryNarrative = "No verified statutory rules apply to this commodity category and size.";
      summaryNarrativeHi = "इस वस्तु श्रेणी और आकार पर कोई सत्यापित वैधानिक नियम लागू नहीं होता।";
    } else if (failCount > 0) {
      overallStatus = "NEEDS_ATTENTION";
      summaryNarrative = `${failCount} statutory declaration violation(s) identified. Immediate inspection attention required.`;
      summaryNarrativeHi = `${failCount} वैधानिक घोषणा उल्लंघन पाए गए। तत्काल निरीक्षण ध्यान अपेक्षित है।`;
    } else if (reviewCount > 0) {
      overallStatus = "REVIEW_REQUIRED";
      summaryNarrative = `${reviewCount} declaration(s) require manual human review due to ambiguity, low OCR confidence, or uncalibrated measurements.`;
      summaryNarrativeHi = `${reviewCount} घोषणाओं की मानवीय समीक्षा आवश्यक है (संदेहास्पद या कम गुणवत्ता वाला पाठ)।`;
    } else {
      overallStatus = "COMPLIANT_ASSISTANCE_RESULT";
      summaryNarrative = `All ${passCount} applicable statutory declarations passed automated deterministic verification.`;
      summaryNarrativeHi = `सभी ${passCount} लागू वैधानिक घोषणाओं ने स्वचालित सत्यापन सफलतापूर्वक उत्तीर्ण किया।`;
    }

    return {
      totalApplicableRules,
      passCount,
      failCount,
      reviewCount,
      notApplicableCount,
      overallStatus,
      summaryNarrative,
      summaryNarrativeHi,
    };
  }

  private parseNetQuantityValue(text?: string): number | undefined {
    if (!text) return undefined;
    const match = text.match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private parseNetQuantityUnit(text?: string): string | undefined {
    if (!text) return undefined;
    const match = text.match(/(g|kg|ml|l|L|m|cm|mm|units?|pieces?|N|U)\b/i);
    return match ? match[1].toLowerCase() : undefined;
  }

  private generateAuditHash(inspectionId: string, rules: LegalRule[], evals: RuleEvaluation[]): string {
    const raw = `${inspectionId}:${ENGINE_VERSION}:${rules.map((r) => r.internalRuleId).sort().join(",")}:${evals.map((e) => `${e.internalRuleId}=${e.status}`).join(";")}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `LG-AUDIT-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  }
}

export const complianceEngine = new DeterministicComplianceEngine();
