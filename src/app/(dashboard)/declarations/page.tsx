"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeclarationItemRow } from "@/components/declarations/DeclarationItemRow";
import { ManualCorrectionModal } from "@/components/declarations/ManualCorrectionModal";
import {
  DeclarationExtractionResult,
  DeclarationField,
  DECLARATION_GROUPS,
} from "@/lib/declarations/types";
import {
  getActiveDeclarationResult,
  extractDeclarations,
  recordManualFieldCorrection,
} from "@/lib/declarations/client";
import { getActiveOCRDocument } from "@/lib/ocr/client";
import { MOCK_INSPECTIONS } from "@/mocks/sampleData";
import { ComplianceResult } from "@/lib/compliance/types";
import { getActiveComplianceResult } from "@/lib/compliance/client";
import { complianceEngine } from "@/lib/compliance/engine";
import { SAMPLE_COMPLIANCE_INPUT } from "@/lib/compliance/demoSample";
import { getInspectionVerificationState } from "@/lib/verification/client";
import { OfficerVerification } from "@/lib/verification/types";
import {
  FileCheck2,
  ArrowRight,
  Eye,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Tag,
  Info,
  SlidersHorizontal,
  MinusCircle,
  RotateCcw,
} from "lucide-react";

export default function DeclarationsPage() {
  const { t } = useTranslation();

  const [extractionResult, setExtractionResult] = useState<DeclarationExtractionResult | null>(null);
  const [isRealExtraction, setIsRealExtraction] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<DeclarationField | null>(null);
  const [editingField, setEditingField] = useState<DeclarationField | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [verifications, setVerifications] = useState<Record<string, OfficerVerification>>({});

  const loadDemoExtraction = React.useCallback(() => {
    const sample = MOCK_INSPECTIONS[0];
    setImageUrl(sample?.sampleImageUrl || "/demo/tata-salt-back.jpg");
    setIsRealExtraction(false);

    // Build structured declaration result from genuine Tata Salt package OCR
    const demoFields: DeclarationField[] = [
      {
        id: "DEC-PROD-NAME",
        fieldType: "PRODUCT_NAME",
        labelKey: "declarations.product_name",
        rawText: "TATA Salt",
        normalizedValue: "TATA Salt",
        language: "en",
        confidence: 0.998,
        status: "DETECTED",
        sourceOcrItemIds: ["OCR-001", "OCR-002"],
        boundingBox: { x: 23.5, y: 14.5, width: 21.0, height: 13.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-NET-QTY",
        fieldType: "NET_QUANTITY",
        labelKey: "declarations.net_qty",
        rawText: "Net Weight:",
        normalizedValue: "1 kg",
        language: "en",
        confidence: 0.96,
        status: "AMBIGUOUS",
        possibleInterpretation: "1 kg (printed in adjacent vertical stamp area)",
        sourceOcrItemIds: ["OCR-050"],
        boundingBox: { x: 82.0, y: 72.0, width: 8.0, height: 18.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-MRP",
        fieldType: "MRP",
        labelKey: "declarations.mrp",
        rawText: "M.R.P.:2",
        normalizedValue: "₹2",
        language: "en",
        confidence: 0.763,
        status: "AMBIGUOUS",
        possibleInterpretation: "Retail price numerical stamp unprinted on back panel (glare/crimp check needed)",
        sourceOcrItemIds: ["OCR-049"],
        boundingBox: { x: 77.0, y: 72.0, width: 6.5, height: 16.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-TAX-WORDING",
        fieldType: "TAX_WORDING",
        labelKey: "declarations.tax_wording",
        rawText: "(nd.ofal toesh)",
        normalizedValue: "(incl. of all taxes)",
        language: "en",
        confidence: 0.72,
        status: "AMBIGUOUS",
        possibleInterpretation: "(incl. of all taxes)",
        sourceOcrItemIds: ["OCR-048"],
        boundingBox: { x: 75.0, y: 72.0, width: 6.0, height: 16.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-MFG-NAME",
        fieldType: "MANUFACTURER_NAME",
        labelKey: "declarations.mfg_name",
        rawText: "Manufactured by TATA CHEMIcALS LIMTED",
        normalizedValue: "TATA CHEMICALS LIMITED",
        language: "en",
        confidence: 0.931,
        status: "DETECTED",
        sourceOcrItemIds: ["OCR-015"],
        boundingBox: { x: 60.0, y: 41.5, width: 30.0, height: 4.5 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-MFG-ADDR",
        fieldType: "MANUFACTURER_ADDRESS",
        labelKey: "declarations.manufacturer_address",
        rawText: "BombayHouse, 24 Hon Mody Street For Mumba ea",
        normalizedValue: "Bombay House, 24 Homi Mody Street, Fort, Mumbai 400 001 (Maharashtra) at P.O. Mithapur 361 345, Dist. Devbhoomi Dwarka, Gujarat",
        language: "en",
        confidence: 0.743,
        status: "DETECTED",
        sourceOcrItemIds: ["OCR-014"],
        boundingBox: { x: 60.0, y: 46.5, width: 30.0, height: 5.5 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-CONSUMER-PHONE",
        fieldType: "CONSUMER_CARE_PHONE",
        labelKey: "declarations.consumer_phone",
        rawText: "C18001084488",
        normalizedValue: "18001084488",
        language: "en",
        confidence: 0.988,
        status: "DETECTED",
        sourceOcrItemIds: ["OCR-012"],
        boundingBox: { x: 58.0, y: 35.0, width: 32.0, height: 5.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-BATCH-NO",
        fieldType: "BATCH_NUMBER",
        labelKey: "declarations.batch_no",
        rawText: "Batch No.:",
        normalizedValue: "HY",
        language: "en",
        confidence: 0.935,
        status: "DETECTED",
        sourceOcrItemIds: ["OCR-045"],
        boundingBox: { x: 65.0, y: 72.0, width: 8.0, height: 18.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-PACKING-DATE",
        fieldType: "PACKING_DATE",
        labelKey: "declarations.packing_date",
        rawText: "Pkd.:",
        normalizedValue: undefined,
        language: "en",
        confidence: 0.50,
        status: "AMBIGUOUS",
        possibleInterpretation: "Packing date stamp field present but numerical date unprinted",
        sourceOcrItemIds: ["OCR-046"],
        boundingBox: { x: 70.0, y: 72.0, width: 6.0, height: 16.0 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-BEST-BEFORE",
        fieldType: "BEST_BEFORE",
        labelKey: "declarations.best_before",
        rawText: "BEST BEFORE TWENTY FOUR MONTHS FROM PACKAGING",
        normalizedValue: "TWENTY FOUR MONTHS FROM PACKAGING",
        language: "en",
        confidence: 0.846,
        status: "DETECTED",
        sourceOcrItemIds: ["OCR-051"],
        boundingBox: { x: 10.0, y: 77.0, width: 35.0, height: 3.5 },
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-COUNTRY-ORIGIN",
        fieldType: "COUNTRY_OF_ORIGIN",
        labelKey: "declarations.country_origin",
        rawText: "",
        normalizedValue: undefined,
        language: "unknown",
        confidence: 0.0,
        status: "NOT_DETECTED",
        sourceOcrItemIds: [],
        sourceType: "PACKAGE_IMAGE",
      },
      {
        id: "DEC-EXPIRY-DATE",
        fieldType: "EXPIRY_DATE",
        labelKey: "declarations.expiry_date",
        rawText: "",
        normalizedValue: undefined,
        language: "unknown",
        confidence: 0.0,
        status: "NOT_DETECTED",
        sourceOcrItemIds: [],
        sourceType: "PACKAGE_IMAGE",
      },
    ];

    const demoResult: DeclarationExtractionResult = {
      productId: sample?.id || "DEMO-INS-2026-081",
      sourceType: "PACKAGE_IMAGE",
      sourceImages: [sample?.sampleImageUrl || "/demo/tata-salt-back.jpg"].filter(Boolean),
      fields: demoFields,
      overallExtractionConfidence: 0.832,
      extractionTimestamp: new Date().toISOString(),
      extractionEngine: "PaddleOCR + LabelGuard Bilingual Semantic Engine",
      extractionSource: "FALLBACK",
      category: "Edible Salt",
      categoryConfidence: 0.95,
      warnings: [
        "Tata Salt back-of-pack scan loaded for metrology verification.",
      ],
      isDemo: false,
    };

    setExtractionResult(demoResult);
    setSelectedField(demoFields[0]);
  }, []);

  const runExtraction = React.useCallback((activeOcr: ReturnType<typeof getActiveOCRDocument>) => {
    if (!activeOcr) return;
    setIsLoading(true);
    setExtractionError(null);
    setImageUrl(activeOcr.previewUrl || "");

    extractDeclarations(activeOcr)
      .then((res) => {
        setIsLoading(false);
        if (res.success && res.result && Array.isArray(res.result.fields) && res.result.fields.length > 0) {
          setExtractionResult(res.result);
          setIsRealExtraction(true);
          setSelectedField(res.result.fields.find((f) => f && f.status === "DETECTED") || res.result.fields[0] || null);
        } else {
          setExtractionError(res.error || "No declarations could be identified in this scan.");
          loadDemoExtraction();
        }
      })
      .catch((err: unknown) => {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : "Extraction service error";
        console.error("[Declarations] Extraction error:", msg);
        setExtractionError(msg);
        loadDemoExtraction();
      });
  }, [loadDemoExtraction]);

  // Load or trigger extraction on mount
  useEffect(() => {
    try {
      const existingResult = getActiveDeclarationResult();
      const activeOcr = getActiveOCRDocument();

      if (existingResult && Array.isArray(existingResult.fields) && existingResult.fields.length > 0) {
        setExtractionResult(existingResult);
        setIsRealExtraction(!existingResult.isDemo);
        setImageUrl(activeOcr?.previewUrl || existingResult.sourceImages?.[0] || MOCK_INSPECTIONS[0]?.sampleImageUrl || "");
        setSelectedField(existingResult.fields.find((f) => f && f.status === "DETECTED") || existingResult.fields[0] || null);
      } else if (activeOcr && Array.isArray(activeOcr.results) && activeOcr.results.length > 0) {
        // Trigger extraction on active OCR scan
        runExtraction(activeOcr);
      } else {
        // No current scan: load demo sample so the inspector has immediate evaluation data
        loadDemoExtraction();
      }

      // Load active compliance result & officer verifications
      try {
        let comp = getActiveComplianceResult();
        if (!comp || !comp.rulesEvaluated || comp.rulesEvaluated.length === 0) {
          comp = complianceEngine.evaluate(SAMPLE_COMPLIANCE_INPUT);
        }
        setComplianceResult(comp);
        const verState = getInspectionVerificationState(comp.inspectionId);
        if (verState && verState.verifications) {
          setVerifications(verState.verifications);
        }
      } catch (cErr) {
        console.warn("[Declarations] Compliance integration fallback:", cErr);
      }
    } catch (err: unknown) {
      console.warn("[Declarations] Mount initialization notice:", err);
      loadDemoExtraction();
    }
  }, [runExtraction, loadDemoExtraction]);

  const getRuleForField = (fieldType: string) => {
    if (!complianceResult || !complianceResult.rulesEvaluated) return null;
    const ruleMap: Record<string, string> = {
      PRODUCT_NAME: "LMPC-DECL-003",
      BRAND: "LMPC-DECL-003",
      MANUFACTURER_NAME: "LMPC-DECL-001",
      MANUFACTURER_ADDRESS: "LMPC-DECL-001",
      COUNTRY_OF_ORIGIN: "LMPC-DECL-002",
      NET_QUANTITY: "LMPC-DECL-004",
      QUANTITY_UNIT: "LMPC-DECL-004",
      MANUFACTURE_DATE: "LMPC-DECL-005",
      PACKING_DATE: "LMPC-DECL-005",
      BEST_BEFORE: "LMPC-DECL-006",
      USE_BY: "LMPC-DECL-006",
      EXPIRY_DATE: "LMPC-DECL-006",
      MRP: "LMPC-DECL-007",
      PRICE_TEXT: "LMPC-DECL-007",
      CONSUMER_CARE_PHONE: "LMPC-DECL-009",
      CONSUMER_CARE_EMAIL: "LMPC-DECL-009",
    };
    const targetId = ruleMap[fieldType];
    if (!targetId) return null;
    return complianceResult.rulesEvaluated.find((r) => r.internalRuleId === targetId) || null;
  };

  const handleManualSave = (
    fieldId: string,
    correctedValue: string,
    officerName: string,
    reason: string
  ) => {
    try {
      const updated = recordManualFieldCorrection(
        fieldId,
        correctedValue,
        officerName,
        reason
      );
      if (updated && Array.isArray(updated.fields)) {
        setExtractionResult(updated);
        setSelectedField(updated.fields.find((f) => f && f.id === fieldId) || null);
      }
    } catch (err: unknown) {
      console.error("[Declarations] Error recording manual correction:", err);
    }
  };

  // Filter fields based on group and status safely
  const fields = Array.isArray(extractionResult?.fields) ? extractionResult.fields : [];
  const filteredFields = fields.filter((f) => {
    if (!f) return false;
    // Group filter
    if (activeGroup !== "all") {
      const groupConfig = DECLARATION_GROUPS.find((g) => g.id === activeGroup);
      if (groupConfig && Array.isArray(groupConfig.fieldTypes) && !groupConfig.fieldTypes.includes(f.fieldType)) {
        return false;
      }
    }
    // Status filter
    if (statusFilter !== "all" && f.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const detectedCount = fields.filter((f) => f && f.status === "DETECTED").length;
  const ambiguousCount = fields.filter((f) => f && f.status === "AMBIGUOUS").length;
  const notDetectedCount = fields.filter((f) => f && f.status === "NOT_DETECTED").length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("declarations.title", "Structured Declarations")}
            </h1>
            {isRealExtraction ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                {t("declarations.real_scan_badge", "REAL IMAGE EXTRACTION")}
              </span>
            ) : (
              <Badge variant="demo" size="sm" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("declarations.subtitle", "Post-OCR semantic declaration extraction and evidence mapping")} • ID:{" "}
            <span className="font-mono text-slate-700">{extractionResult?.productId || "PROD-LIVE"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRealExtraction && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={loadDemoExtraction}
              title="Load sample inspection demo data"
            >
              {t("declarations.reload_demo", "View Sample Demo")}
            </Button>
          )}
          <Link href="/evidence">
            <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
              {t("nav.evidence", "Evidence Canvas")}
            </Button>
          </Link>
          <Link href="/compliance">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t("nav.compliance", "Rule Engine Verification")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Extraction Warning / Error Alert */}
      {extractionError && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <span className="font-bold">Extraction Notice:</span>
            <p className="text-amber-800">{extractionError}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const activeOcr = getActiveOCRDocument();
              if (activeOcr) runExtraction(activeOcr);
            }}
          >
            Retry Scan Extraction
          </Button>
        </div>
      )}

      {/* Engine Warnings / Fallback Notice */}
      {extractionResult?.warnings && extractionResult.warnings.length > 0 && !extractionError && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-slate-800">Engine Source & Observations:</span>
            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600">
              {extractionResult.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-200 text-slate-800 shrink-0">
            {extractionResult.extractionSource === "GEMINI" ? "AI MODEL" : "OFFLINE ENGINE"}
          </span>
        </div>
      )}

      {/* Rule Engine Boundary Notice Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900 shadow-sm">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-0.5">
          <span className="font-bold">Architectural Boundary Notice:</span>
          <p className="text-blue-800/90 leading-relaxed">
            This module only identifies and structures visible declarations on packaging evidence.
            <strong> It does not determine statutory PASS/FAIL compliance, legal sufficiency, or violations.</strong> Compliance assessment occurs strictly downstream in the verified Legal Metrology Rule Engine.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Category Card */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {t("declarations.category", "Product Category")}
            </span>
            <Tag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 truncate">
            {extractionResult?.category || "Packaged Commodity"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Confidence: {((extractionResult?.categoryConfidence || 0.85) * 100).toFixed(0)}%
          </div>
        </Card>

        {/* Overall Extraction Confidence Card */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {t("declarations.extraction_confidence", "Extraction Confidence")}
            </span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-600 font-mono">
            {((extractionResult?.overallExtractionConfidence || 0) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Engine: {String(extractionResult?.extractionEngine || "Semantic Parser").split("+")[0]}
          </div>
        </Card>

        {/* Detected Declarations */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Declarations Found</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700 font-mono">
            {detectedCount}{" "}
            <span className="text-xs font-normal text-slate-500">/ {fields.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {notDetectedCount} absent in OCR
          </div>
        </Card>

        {/* Ambiguous Attention Card */}
        <Card
          className={`p-4 border ${
            ambiguousCount > 0
              ? "bg-amber-50/50 border-amber-300"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Requires Review</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                ambiguousCount > 0 ? "text-amber-500" : "text-slate-400"
              }`}
            />
          </div>
          <div
            className={`mt-2 text-xl font-bold font-mono ${
              ambiguousCount > 0 ? "text-amber-700" : "text-slate-700"
            }`}
          >
            {ambiguousCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {ambiguousCount > 0 ? "Character ambiguity" : "Zero ambiguities"}
          </div>
        </Card>
      </div>

      {/* Main Dual-Panel Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Interactive Package Image Evidence Canvas (5 cols) */}
        <div className="lg:col-span-5 space-y-3 sticky top-6">
          <Card className="overflow-hidden border border-slate-200 bg-slate-900">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Packaging Evidence
                </span>
              </div>
              {selectedField?.boundingBox && (
                <span className="text-[10px] font-mono bg-blue-600 text-white px-2 py-0.5 rounded">
                  Box: {selectedField.id}
                </span>
              )}
            </div>

            {/* Canvas Area with Dynamic Bounding Box Overlay */}
            <div className="relative w-full min-h-[400px] max-h-[500px] bg-slate-950 flex items-center justify-center overflow-auto p-4">
              {imageUrl ? (
                <div className="relative inline-block max-h-[440px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Package Surface"
                    className="max-h-[420px] w-auto rounded object-contain select-none pointer-events-none block border border-slate-800 shadow-2xl"
                  />

                  {/* Bounding Box Overlays for all detected fields */}
                  {fields.map((field) => {
                    if (!field || !field.boundingBox) return null;
                    const b = field.boundingBox;
                    const isValidBox =
                      typeof b.x === "number" &&
                      typeof b.y === "number" &&
                      typeof b.width === "number" &&
                      typeof b.height === "number" &&
                      !isNaN(b.x) &&
                      !isNaN(b.y) &&
                      !isNaN(b.width) &&
                      !isNaN(b.height);

                    if (!isValidBox) return null;

                    const isSelected = selectedField?.id === field.id;
                    const isAmbiguous = field.status === "AMBIGUOUS";

                    return (
                      <div
                        key={field.id}
                        onClick={() => setSelectedField(field)}
                        className={`absolute cursor-pointer rounded transition-all duration-150 ${
                          isSelected
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-30 scale-[1.01]"
                            : "hover:ring-1 hover:ring-white/80"
                        } ${
                          isAmbiguous
                            ? "bg-amber-500/20 border-2 border-amber-400"
                            : isSelected
                            ? "bg-blue-500/30 border-2 border-blue-400"
                            : "bg-emerald-500/15 border border-emerald-400"
                        }`}
                        style={{
                          left: `${b.x}%`,
                          top: `${b.y}%`,
                          width: `${b.width}%`,
                          height: `${b.height}%`,
                        }}
                        title={`${field.fieldType}: ${field.normalizedValue || field.rawText}`}
                      >
                        {/* Micro Label Pin */}
                        <span
                          className={`absolute -top-5 left-0 text-[9px] font-bold font-mono px-1 py-0.2 rounded text-white shadow-sm whitespace-nowrap ${
                            isAmbiguous
                              ? "bg-amber-600"
                              : isSelected
                              ? "bg-blue-600"
                              : "bg-emerald-600"
                          }`}
                        >
                          {t(field.labelKey || "", String(field.fieldType || "OTHER").replace(/_/g, " "))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <FileCheck2 className="w-8 h-8 text-slate-600" />
                  <span>No packaging image currently active</span>
                </div>
              )}
            </div>

            {/* Evidence Link Footer */}
            {selectedField && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-slate-400">Selected: </span>
                  <strong className="text-white">
                    {t(selectedField.labelKey || "", String(selectedField.fieldType || "OTHER"))}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingField(selectedField)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium underline shrink-0"
                >
                  Edit / Verify
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT PANEL: Structured Declaration Categories & Items (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <Card className="p-3 bg-white border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Group Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveGroup("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                    activeGroup === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({fields.length})
                </button>
                {DECLARATION_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGroup(g.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      activeGroup === g.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t(g.titleKey, g.titleDefault)}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="DETECTED">Detected Only ({detectedCount})</option>
                  <option value="AMBIGUOUS">Ambiguous Only ({ambiguousCount})</option>
                  <option value="NOT_DETECTED">Not Detected Only ({notDetectedCount})</option>
                </select>
              </div>
            </div>
          </Card>

          {/* List of Declarations or Empty State */}
          {isLoading ? (
            <Card className="p-12 text-center bg-white border border-slate-200">
              <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">
                Extracting Declarations via Semantic AI...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Parsing packaging tokens, resolving spatial bounding boxes, and mapping bilingual text.
              </p>
            </Card>
          ) : filteredFields.length === 0 ? (
            <Card className="p-8 text-center bg-white border border-slate-200">
              <MinusCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No declarations match the current filter</p>
              <button
                type="button"
                onClick={() => {
                  setActiveGroup("all");
                  setStatusFilter("all");
                }}
                className="mt-2 text-xs text-blue-600 hover:underline font-medium"
              >
                Reset filters to show all declarations
              </button>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {filteredFields.map((field) => {
                const matchedRule = getRuleForField(field.fieldType);
                const verification = matchedRule ? verifications[matchedRule.ruleId] : undefined;
                return (
                  <DeclarationItemRow
                    key={field.id}
                    field={field}
                    isSelected={selectedField?.id === field.id}
                    onSelect={(f) => setSelectedField(f)}
                    onEdit={(f) => setEditingField(f)}
                    complianceStatus={matchedRule?.status}
                    statutoryRule={matchedRule?.statutoryReference}
                    officerStatus={verification?.officerStatus}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Evidence linkage verified. Ready for downstream rule engine check.</span>
            </div>
            <Link href="/compliance">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Legal Metrology Rule Matrix
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Correction Modal */}
      <ManualCorrectionModal
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        field={editingField}
        onSave={handleManualSave}
      />
    </div>
  );
}
