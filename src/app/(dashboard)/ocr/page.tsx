"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OCRResultList } from "@/components/ocr/OCRResultList";
import { ImageQualityCard } from "@/components/ocr/ImageQualityCard";
import { StructuredOCRTable, StructuredOCRFieldItem } from "@/components/ocr/StructuredOCRTable";
import { OCRDocument, ExtractionResult } from "@/lib/ocr/types";
import { getActiveOCRDocument } from "@/lib/ocr/client";
import { extractDeclarationsFallback } from "@/lib/declarations/fallbackExtractor";
import { DeclarationFieldType } from "@/lib/declarations/types";
import { MOCK_INSPECTIONS } from "@/mocks/sampleData";
import {
  Binary,
  ArrowRight,
  ShieldAlert,
  Layers,
  ScanLine,
  Table as TableIcon,
  Activity,
  CheckCircle2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function OCRPage() {
  const { t, locale } = useTranslation();

  const [activeDoc, setActiveDoc] = useState<OCRDocument | null>(null);
  const [selectedOcrItem, setSelectedOcrItem] = useState<ExtractionResult | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isRealUpload, setIsRealUpload] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<"structured" | "raw" | "quality">("structured");
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    // 1. Check for active OCR session document
    const stored = getActiveOCRDocument();
    if (stored && Array.isArray(stored.results) && stored.results.length > 0) {
      setActiveDoc(stored);
      setIsRealUpload(!stored.isDemo);
      setSelectedOcrItem(stored.results[0] || null);
    } else {
      // 2. Fallback to genuine Tata Salt demo inspection
      const sample = MOCK_INSPECTIONS[0];
      const demoResults: ExtractionResult[] = (sample.boundingBoxes || []).map((b, idx) => ({
        id: b.id || `OCR-${String(idx + 1).padStart(3, "0")}`,
        text: b.rawText,
        confidence: b.ocrConfidence,
        language: b.rawText.includes("ग्राम") || b.rawText.includes("मात्रा") ? "hi" : "en",
        boundingBox: {
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
        },
        sourceImageId: sample.id,
        surface: "back",
      }));

      const demoDoc: OCRDocument = {
        imageId: sample.id || "IMG-TATA-SALT-001",
        surface: "back",
        imageWidth: 535,
        imageHeight: 671,
        processingTimeMs: 412,
        overallConfidence: sample.overallOcrConfidence || 0.832,
        results: demoResults,
        languagesDetected: ["en", "hi"],
        previewUrl: sample.sampleImageUrl || "/demo/tata-salt-back.jpg",
        isDemo: true,
        quality: {
          resolution: "535x671",
          width: 535,
          height: 671,
          blurScore: 88,
          isBlurry: false,
          brightness: 142,
          contrast: 64,
          orientation: "0° (Upright)",
          ocrReadiness: "Ready",
        },
      };

      setActiveDoc(demoDoc);
      setIsRealUpload(false);
      setSelectedOcrItem(demoResults[0] || null);
    }
  }, []);

  // Compute structured legal metrology commodity fields from OCR document
  const structuredFields = useMemo<StructuredOCRFieldItem[]>(() => {
    if (!activeDoc || !Array.isArray(activeDoc.results)) return [];

    // Run deterministic extraction to map visible OCR tokens to statutory commodity declarations
    const extracted = extractDeclarationsFallback(activeDoc, "PACKAGE_IMAGE");
    const fieldMap = new Map(extracted.fields.map((f) => [f.fieldType, f]));

    // All required metrology fields per Phase 3 specifications
    const definitions: Array<{
      id: string;
      fieldKey: string;
      labelEn: string;
      labelHi: string;
      matchTypes: string[];
    }> = [
      {
        id: "FLD-PROD-NAME",
        fieldKey: "PRODUCT_NAME",
        labelEn: "Product Name",
        labelHi: "उत्पाद का नाम",
        matchTypes: ["PRODUCT_NAME"],
      },
      {
        id: "FLD-BRAND",
        fieldKey: "BRAND",
        labelEn: "Brand",
        labelHi: "ब्रांड",
        matchTypes: ["BRAND"],
      },
      {
        id: "FLD-MFG-NAME",
        fieldKey: "MANUFACTURER_NAME",
        labelEn: "Manufacturer",
        labelHi: "निर्माता",
        matchTypes: ["MANUFACTURER_NAME", "MANUFACTURER_ADDRESS"],
      },
      {
        id: "FLD-PACKER",
        fieldKey: "PACKER_NAME",
        labelEn: "Packer",
        labelHi: "पैकर",
        matchTypes: ["PACKER_NAME", "PACKER_ADDRESS"],
      },
      {
        id: "FLD-IMPORTER",
        fieldKey: "IMPORTER_NAME",
        labelEn: "Importer",
        labelHi: "आयातक",
        matchTypes: ["IMPORTER_NAME", "IMPORTER_ADDRESS"],
      },
      {
        id: "FLD-COO",
        fieldKey: "COUNTRY_OF_ORIGIN",
        labelEn: "Country of Origin",
        labelHi: "मूल देश",
        matchTypes: ["COUNTRY_OF_ORIGIN"],
      },
      {
        id: "FLD-NET-QTY",
        fieldKey: "NET_QUANTITY",
        labelEn: "Net Quantity",
        labelHi: "शुद्ध मात्रा",
        matchTypes: ["NET_QUANTITY", "QUANTITY_UNIT"],
      },
      {
        id: "FLD-MRP",
        fieldKey: "MRP",
        labelEn: "MRP / Retail Sale Price",
        labelHi: "अधिकतम खुदरा मूल्य (MRP)",
        matchTypes: ["MRP", "PRICE_TEXT", "TAX_WORDING"],
      },
      {
        id: "FLD-CARE",
        fieldKey: "CONSUMER_CARE",
        labelEn: "Consumer Care",
        labelHi: "उपभोक्ता सहायता",
        matchTypes: ["CONSUMER_CARE_PHONE", "CONSUMER_CARE_EMAIL", "CONSUMER_CARE_ADDRESS", "CONSUMER_CARE_WEBSITE"],
      },
      {
        id: "FLD-BATCH",
        fieldKey: "BATCH_NUMBER",
        labelEn: "Batch / Lot Number",
        labelHi: "बैच / लॉट संख्या",
        matchTypes: ["BATCH_NUMBER", "LOT_NUMBER"],
      },
      {
        id: "FLD-MFD",
        fieldKey: "MANUFACTURE_DATE",
        labelEn: "Date of Manufacture",
        labelHi: "निर्माण तिथि",
        matchTypes: ["MANUFACTURE_DATE"],
      },
      {
        id: "FLD-PKD",
        fieldKey: "PACKING_DATE",
        labelEn: "Date of Packing",
        labelHi: "पैकिंग तिथि",
        matchTypes: ["PACKING_DATE"],
      },
      {
        id: "FLD-BEST-BEFORE",
        fieldKey: "BEST_BEFORE",
        labelEn: "Best Before / Use By",
        labelHi: "उपभोग अवधि / समाप्ति तिथि",
        matchTypes: ["BEST_BEFORE", "USE_BY", "EXPIRY_DATE"],
      },
      {
        id: "FLD-OTHER",
        fieldKey: "OTHER_DECLARATION",
        labelEn: "Other Detected Declarations",
        labelHi: "अन्य दृश्य लेबल घोषणाएं",
        matchTypes: ["OTHER_DECLARATION", "TAX_WORDING", "PRICE_TEXT"],
      },
    ];

    return definitions.map((def) => {
      // Find matching extracted declaration
      let matchedDecl = undefined;
      for (const mt of def.matchTypes) {
        const found = fieldMap.get(mt as DeclarationFieldType);
        if (found && (found.status === "DETECTED" || found.status === "AMBIGUOUS")) {
          matchedDecl = found;
          break;
        }
      }

      if (!matchedDecl) {
        // Look for any declared field that matches
        for (const mt of def.matchTypes) {
          const found = fieldMap.get(mt as DeclarationFieldType);
          if (found) {
            matchedDecl = found;
            break;
          }
        }
      }

      if (matchedDecl && matchedDecl.status !== "NOT_DETECTED") {
        return {
          id: def.id,
          fieldKey: def.fieldKey,
          labelEn: def.labelEn,
          labelHi: def.labelHi,
          value: matchedDecl.normalizedValue || matchedDecl.rawText,
          confidence: matchedDecl.confidence,
          sourceId: matchedDecl.sourceOcrItemIds?.join(", ") || `SRC-${matchedDecl.id}`,
          surface: activeDoc.surface,
          boundingBox: matchedDecl.boundingBox,
          status: matchedDecl.status,
          notes: matchedDecl.possibleInterpretation,
        };
      }

      return {
        id: def.id,
        fieldKey: def.fieldKey,
        labelEn: def.labelEn,
        labelHi: def.labelHi,
        value: undefined,
        confidence: 0,
        sourceId: undefined,
        surface: activeDoc.surface,
        boundingBox: undefined,
        status: "NOT_DETECTED",
      };
    });
  }, [activeDoc]);

  // Selected bounding box for canvas highlighting - declared before conditional return
  const selectedBox = useMemo(() => {
    if (selectedFieldId) {
      const f = structuredFields.find((item) => item.id === selectedFieldId);
      if (f?.boundingBox) return f.boundingBox;
    }
    if (selectedOcrItem?.boundingBox) {
      return selectedOcrItem.boundingBox;
    }
    return null;
  }, [selectedFieldId, selectedOcrItem, structuredFields]);

  if (!activeDoc) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">Loading Packaging OCR Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("analysis.title", "OCR Extraction Pipeline")}
            </h1>
            {isRealUpload && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                REAL UPLOADED SCAN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("analysis.subtitle", "Optical character extraction and structured packaged commodity declarations")} • ID:{" "}
            <span className="font-mono text-slate-700">{activeDoc.imageId}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/scan">
            <Button variant="outline" size="sm" leftIcon={<ScanLine className="w-4 h-4" />}>
              {locale === "hi" ? "नया स्कैन करें" : "Scan Another Package"}
            </Button>
          </Link>
          <Link href="/declarations">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {locale === "hi" ? "घोषणाओं की समीक्षा" : "Proceed to Declarations"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Detected Tokens</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{activeDoc.results.length} blocks</div>
          <span className="text-[10px] text-slate-400 font-mono">Bilingual segmentations</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Overall OCR Confidence</span>
          <div className="text-xl font-bold text-blue-600 mt-0.5 font-mono">
            {((activeDoc.overallConfidence || 0.83) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Optical character clarity</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Languages Recognized</span>
          <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs">हिन्दी</span>
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">English</span>
          </div>
          <span className="text-[10px] text-slate-400">Preserving original script</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Processing Latency</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
            {activeDoc.processingTimeMs} ms
          </div>
          <span className="text-[10px] text-slate-400">PaddleOCR Microservice</span>
        </div>
      </div>

      {/* Critical Non-Statutory Separation Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Separation of Optical Confidence vs Statutory Validity</strong>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            Confidence badges (High ≥ 90%, Medium 70–89%, Low &lt; 70%) represent optical character clarity.
            They strictly measure image readability and do NOT determine legal compliance under the Legal Metrology Rules, 2011.
          </p>
        </div>
      </div>

      {/* Dual Panel Inspection Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Image Canvas with Interactive Bounding Box Overlays (5 cols) */}
        <div className="lg:col-span-5 space-y-3 sticky top-6">
          <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-sm">
            {/* Canvas Header & Transform Controls */}
            <div className="p-3 bg-slate-900 text-slate-200 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-slate-100">
                  {locale === "hi" ? "पैकेज साक्ष्य दृश्य" : "Package Surface Evidence"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] text-slate-400 w-8 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase ml-1">
                  {activeDoc.surface}
                </span>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative p-3 flex items-center justify-center min-h-[380px] max-h-[500px] overflow-auto bg-slate-950">
              <div
                className="relative inline-block transition-transform duration-150"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeDoc.previewUrl || "/demo/tata-salt-back.jpg"}
                  alt="Scanned product package"
                  className="max-h-[440px] w-auto rounded object-contain border border-slate-800 shadow-2xl block select-none pointer-events-none"
                />

                {/* All Detected Raw OCR Bounding Boxes */}
                {activeDoc.results.map((item) => {
                  const b = item.boundingBox;
                  if (!b || typeof b.x !== "number") return null;

                  const isSelected = selectedOcrItem?.id === item.id;
                  const isHigh = item.confidence >= 0.9;
                  const isMed = item.confidence >= 0.7 && item.confidence < 0.9;

                  let boxStyles = "border border-emerald-500/70 bg-emerald-500/10";
                  if (isMed) boxStyles = "border border-amber-500/70 bg-amber-500/15";
                  else if (!isHigh) boxStyles = "border border-rose-500/70 bg-rose-500/20";

                  if (isSelected) {
                    boxStyles = "border-2 border-white bg-blue-500/30 ring-2 ring-blue-400 z-20";
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedOcrItem(item);
                        // Also find if any structured field corresponds to this
                        const match = structuredFields.find((f) => f.sourceId?.includes(item.id));
                        if (match) setSelectedFieldId(match.id);
                      }}
                      className={`absolute cursor-pointer rounded transition-all duration-150 ${boxStyles}`}
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.width}%`,
                        height: `${b.height}%`,
                      }}
                      title={`${item.id}: ${item.text} (${Math.round(item.confidence * 100)}%)`}
                    />
                  );
                })}

                {/* Selected Structured Field Focus Box */}
                {selectedBox && (
                  <div
                    className="absolute border-2 border-yellow-300 bg-yellow-400/25 ring-2 ring-yellow-400/60 z-30 pointer-events-none animate-pulse rounded"
                    style={{
                      left: `${selectedBox.x}%`,
                      top: `${selectedBox.y}%`,
                      width: `${selectedBox.width}%`,
                      height: `${selectedBox.height}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Selected Element Quick Inspector Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              {selectedOcrItem ? (
                <div className="truncate pr-2">
                  <span className="text-slate-400">Selected Token: </span>
                  <strong className="text-white font-mono">{selectedOcrItem.id}</strong> — &ldquo;{selectedOcrItem.text}&rdquo;
                </div>
              ) : (
                <span className="text-slate-500">Click any box or row to inspect</span>
              )}
              {selectedOcrItem && (
                <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                  {Math.round(selectedOcrItem.confidence * 100)}% Confidence
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: Structured Metrology Declarations Table & Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveViewTab("structured")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeViewTab === "structured"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{locale === "hi" ? "संरचित घोषणाएं (14)" : "Structured Declarations (14)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab("raw")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeViewTab === "raw"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Binary className="w-3.5 h-3.5" />
                <span>{locale === "hi" ? "कच्चे ओसीआर टोकन" : `Raw Tokens (${activeDoc.results.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab("quality")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeViewTab === "quality"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{locale === "hi" ? "छवि गुणवत्ता" : "Image Quality"}</span>
              </button>
            </div>

            <Link href="/declarations">
              <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View Full Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* TAB 1: Structured Legal Metrology Commodity Table */}
          {activeViewTab === "structured" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing all mandatory declarations under <strong>Rule 6(1) of LMPC Rules, 2011</strong>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {structuredFields.filter((f) => f.status === "DETECTED").length} of {structuredFields.length} Detected
                </span>
              </div>

              <StructuredOCRTable
                fields={structuredFields}
                selectedFieldId={selectedFieldId || undefined}
                onSelectField={(field) => {
                  setSelectedFieldId(field.id);
                  if (field.sourceId) {
                    const firstId = field.sourceId.split(",")[0].trim();
                    const item = activeDoc.results.find((r) => r.id === firstId);
                    if (item) setSelectedOcrItem(item);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 2: Raw Detected OCR Tokens Stream */}
          {activeViewTab === "raw" && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-xs text-slate-500">
                Segmented optical tokens identified on packaging surface by bilingual PaddleOCR.
              </div>
              <OCRResultList
                items={activeDoc.results}
                selectedId={selectedOcrItem?.id}
                onSelectItem={(item) => {
                  setSelectedOcrItem(item);
                  const match = structuredFields.find((f) => f.sourceId?.includes(item.id));
                  if (match) setSelectedFieldId(match.id);
                }}
              />
            </div>
          )}

          {/* TAB 3: Image Quality Card */}
          {activeViewTab === "quality" && (
            <div className="space-y-3 animate-fade-in">
              {activeDoc.quality ? (
                <ImageQualityCard metrics={activeDoc.quality} />
              ) : (
                <Card className="p-8 text-center text-xs text-slate-500">
                  Image quality analysis not measured for this image.
                </Card>
              )}
            </div>
          )}

          {/* Bottom Workflow Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>OCR spatial tokens mapped. Ready for semantic declaration extraction.</span>
            </div>
            <Link href="/declarations">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Declaration Analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
