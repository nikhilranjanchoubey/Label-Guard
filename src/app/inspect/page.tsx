"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInspection } from "@/context/InspectionContext";
import { useAuth } from "@/context/AuthContext";
import { evaluateCompliance, RawExtractionInput } from "@/lib/complianceEngine";
import { downloadInspectionPDF, generateAndDownloadDOCX } from "@/lib/reportGenerator";
import { InspectionRecord, FieldStatus, DeclarationFinding } from "@/types";
import {
  UploadCloud,
  Scan,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  QrCode,
  ShieldCheck,
  Check,
  X,
  FileText,
  Layers,
  Cpu,
  UserCheck,
} from "lucide-react";

// Three Canonical Judge Demonstration Cases (Unified Source of Truth)
const samplePresets = [
  {
    id: "atta-sample",
    caseType: "compliant",
    badge: "Case A: Compliant",
    badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    title: "Wheat Atta 5kg (Full PCR 2011 Compliance)",
    productName: "Superior Sharbati Whole Wheat Atta 5kg",
    brand: "Aashirvaad",
    category: "Packaged Staples & Grains",
    batch: "LOT-AT-2026-B4",
    image: "/products/atta/atta-front.jpg",
    pdpArea: 320,
    description: "Demonstrates 100% detection of mandatory declarations, high OCR confidence (>95%), valid metric unit (kg), compliant font height (4.8mm), and valid MRP format.",
    raw: {
      manufacturer: {
        value: "ITC Limited, 37 J.L. Nehru Road, Kolkata - 700071, West Bengal",
        confidence: 0.98,
        bbox: { x: 18, y: 29, width: 22, height: 9 },
      },
      genericName: {
        value: "Whole Wheat Atta (Wholemeal Wheat Flour)",
        confidence: 0.99,
        bbox: { x: 22, y: 47, width: 56, height: 11 },
      },
      netQuantity: {
        value: "5 kg",
        confidence: 0.97,
        fontSizeMm: 4.8,
        bbox: { x: 90, y: 32, width: 8, height: 48 },
      },
      mrp: {
        value: "₹ 285.00 (INCL. OF ALL TAXES)",
        confidence: 0.98,
        bbox: { x: 36, y: 60, width: 28, height: 14 },
      },
      consumerCare: {
        value: "Executive - Consumer Care, ITC Limited, Toll Free: 1800-425-4444 | www.itcportal.com",
        confidence: 0.94,
        bbox: { x: 12, y: 16, width: 76, height: 8 },
      },
    } as RawExtractionInput,
  },
  {
    id: "tea-sample",
    caseType: "review",
    badge: "Case B: Needs Review",
    badgeColor: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    title: "Herbal Green Tea 250g (Low OCR Confidence on Crease)",
    productName: "Tulsi Sweet Rose Herbal Green Tea 250g",
    brand: "Organic India",
    category: "Beverages & Teas",
    batch: "LOT-TEA-2026-09",
    image: "/products/tea/tea-front.jpg",
    pdpArea: 180,
    description: "Demonstrates human-in-the-loop review. Manufacturing date extracted with low OCR confidence (68%) due to packaging fold/crease. Flagged for manual verification.",
    raw: {
      manufacturer: {
        value: "Girnar Food & Beverages Pvt. Ltd., Umbergaon, Gujarat",
        confidence: 0.98,
        bbox: { x: 29, y: 8, width: 38, height: 11 },
      },
      genericName: {
        value: "Herbal Green Tea Infusion (Detox Desi Kahwa)",
        confidence: 0.96,
        bbox: { x: 18, y: 23, width: 64, height: 17 },
      },
      netQuantity: {
        value: "10 Tea Bags - Net Wt. 0.881 oz (25g)",
        confidence: 0.94,
        fontSizeMm: 3.2,
        bbox: { x: 14, y: 91, width: 72, height: 6 },
      },
      mfgDate: {
        value: "01/2026 (Unclear character on fold)",
        confidence: 0.68, // Low confidence threshold
        bbox: { x: 33, y: 86, width: 34, height: 6 },
      },
    } as RawExtractionInput,
  },
  {
    id: "oil-sample",
    caseType: "violation",
    badge: "Case C: Non-Compliant",
    badgeColor: "bg-red-500/15 text-red-700 border-red-500/30",
    title: "Sunflower Oil 1L (Secondary Price Sticker Alteration)",
    productName: "Sunlite Refined Sunflower Oil 1L Pouch",
    brand: "Fortune",
    category: "Edible Oils & Fats",
    batch: "LOT-SFO-2026-44",
    image: "/products/oil/oil-front.jpg",
    pdpArea: 240,
    description: "Demonstrates clear violation detection under Rule 6(1)(da) & Section 36. Retailer pasted secondary yellow sticker of ₹145 over manufacturer printed ₹125 MRP.",
    raw: {
      genericName: {
        value: "Refined Sunflower Oil (Sunlite)",
        confidence: 0.96,
        bbox: { x: 33, y: 52, width: 32, height: 29 },
      },
      mrp: {
        value: "₹ 145.00 (Yellow sticker overlay pasted over original printed ₹125)",
        confidence: 0.89,
        bbox: { x: 34, y: 81, width: 14, height: 7 },
      },
      consumerCare: {
        value: "Consumer Redressal Web Care: fortunefoods.com",
        confidence: 0.94,
        bbox: { x: 4, y: 93, width: 30, height: 6 },
      },
    } as RawExtractionInput,
  },
];

function InspectContent() {
  const searchParams = useSearchParams();
  const caseParam = searchParams.get("case");
  const { addInspection } = useInspection();
  const { user } = useAuth();

  // 4-Stage Progressive Workflow:
  // 1: UPLOAD / CAPTURE
  // 2: OCR & COMPUTER VISION
  // 3: COMPLIANCE REVIEW & EVIDENCE
  // 4: OFFICER REVIEW & REPORT
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);

  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageText, setScanStageText] = useState("Initializing Optical Engine...");

  // Uploaded images state
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; url: string; label: string; file?: File }>
  >([]);

  // Selected sample package (prefill)
  const [selectedSample, setSelectedSample] = useState<string | null>("atta-sample");

  // Inspection metadata
  const [pdpArea, setPdpArea] = useState(320); // cm²
  const [productName, setProductName] = useState("Superior Sharbati Whole Wheat Atta 5kg");
  const [brandName, setBrandName] = useState("Aashirvaad");
  const [batchLot, setBatchLot] = useState("LOT-AT-2026-B4");
  const [category, setCategory] = useState("Packaged Staples & Grains");
  const [officerRemarks, setOfficerRemarks] = useState(
    "All mandatory declarations detected with compliant metric units and font heights."
  );

  // Visualizer Zoom & Selected Field
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Field Filter in Stage 3
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Engine Result
  const [engineResult, setEngineResult] = useState<ReturnType<typeof evaluateCompliance> | null>(null);
  const [createdInspection, setCreatedInspection] = useState<InspectionRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = useCallback((presetId: string) => {
    const p = samplePresets.find((item) => item.id === presetId);
    if (!p) return;
    setSelectedSample(presetId);
    setProductName(p.productName);
    setBrandName(p.brand);
    setCategory(p.category);
    setBatchLot(p.batch);
    setPdpArea(p.pdpArea);
    setUploadedImages([
      {
        id: `img-${presetId}`,
        url: p.image,
        label: "Front Panel (PDP)",
      },
    ]);
  }, []);

  // Auto-select preset from URL query parameter
  useEffect(() => {
    if (caseParam) {
      const match = samplePresets.find((p) => p.caseType === caseParam.toLowerCase());
      if (match) {
        handleSelectPreset(match.id);
      }
    }
  }, [caseParam, handleSelectPreset]);

  // Initialize with default preset if empty
  useEffect(() => {
    if (uploadedImages.length === 0) {
      handleSelectPreset("atta-sample");
    }
  }, [handleSelectPreset, uploadedImages.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImgs: Array<{ id: string; url: string; label: string; file: File }> = [];
    const labels = ["Front Panel (PDP)", "Back Panel (Statutory)", "Side Panel", "Top / Bottom"];

    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      newImgs.push({
        id: `upload-${Date.now()}-${index}`,
        url,
        label: labels[index % labels.length],
        file,
      });
    });

    setUploadedImages((prev) => [...prev, ...newImgs]);
    setSelectedSample(null);
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Execute Inspection Pipeline
  const startInspection = () => {
    if (uploadedImages.length === 0) {
      alert("Please upload at least one product label image or select a Judge Demo Case.");
      return;
    }

    setCurrentStage(2);
    setScanProgress(15);
    setScanStageText("1. Optical Ingestion & Label Deskewing...");

    setTimeout(() => {
      setScanProgress(40);
      setScanStageText("2. Multi-Pass OCR & Token Coordinate Localization...");
    }, 500);

    setTimeout(() => {
      setScanProgress(70);
      setScanStageText("3. Declaration Parsing & Semantic Field Mapping...");
    }, 1100);

    setTimeout(() => {
      setScanProgress(90);
      setScanStageText("4. Deterministic PCR 2011 Rule Adjudication...");
    }, 1600);

    setTimeout(() => {
      setScanProgress(100);
      setScanStageText("Inspection Analysis Complete.");

      // Determine extraction input from preset or standard fallback
      let inputRaw: RawExtractionInput;
      const matchedPreset = samplePresets.find((p) => p.id === selectedSample);

      if (matchedPreset) {
        inputRaw = matchedPreset.raw;
      } else {
        inputRaw = {
          manufacturer: {
            value: "Packer & Manufacturer Pvt. Ltd., Industrial Area, Phase II, New Delhi - 110020",
            confidence: 0.94,
            bbox: { x: 15, y: 70, width: 70, height: 10 },
          },
          genericName: {
            value: productName || "Packaged Grocery Commodity",
            confidence: 0.95,
            bbox: { x: 15, y: 24, width: 70, height: 6 },
          },
          netQuantity: {
            value: "500 g",
            confidence: 0.94,
            fontSizeMm: 3.2,
            bbox: { x: 15, y: 44, width: 32, height: 10 },
          },
          mrp: {
            value: "₹ 110.00 (INCL. OF ALL TAXES)",
            confidence: 0.96,
            bbox: { x: 52, y: 44, width: 34, height: 10 },
          },
          mfgDate: {
            value: "Pkd: 02/2026",
            confidence: 0.91,
            bbox: { x: 15, y: 58, width: 70, height: 6 },
          },
          consumerCare: {
            value: "Customer Care: 1800-200-1122 | feedback@commodity.in",
            confidence: 0.89,
            bbox: { x: 15, y: 84, width: 70, height: 8 },
          },
        };
      }

      const result = evaluateCompliance(inputRaw, pdpArea);
      setEngineResult(result);

      // Create standardized 2026 record
      const inspectionId = `LG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const rec: InspectionRecord = {
        id: inspectionId,
        productId: selectedSample ? `PROD-2026-${selectedSample.slice(0, 3).toUpperCase()}` : `PROD-2026-${Date.now().toString().slice(-3)}`,
        productName: productName || "Inspected Packaged Commodity",
        brand: brandName || "Generic",
        category: category,
        batchLotNumber: batchLot || "LOT-2026-01",
        officerId: user.id,
        officerName: user.name,
        jurisdiction: user.jurisdiction,
        inspectionDate: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        status: result.status,
        coverageScore: result.coverageScore,
        ocrConfidenceAvg: result.ocrConfidenceAvg,
        images: uploadedImages.map((img) => ({
          id: img.id,
          url: img.url,
          label: (img.label as any) || "Front Panel",
          width: 800,
          height: 1000,
          isPrimary: true,
        })),
        findings: result.findings,
        officerNotes: `AI-assisted inspection under Legal Metrology (Packaged Commodities) Rules, 2011. Coverage: ${result.coverageScore}%. ${
          result.status === "COMPLIANT"
            ? "All statutory declarations verified. Complies with metric units and minimum font height."
            : result.status === "NON_COMPLIANT"
            ? "Configured statutory non-compliance detected. Reviewing officer notified."
            : "Review items flagged due to OCR confidence or readability. Manual physical verification recommended."
        }`,
        ruleSetVersion: "PCR-2011-REV-2024.1",
        digitalSignatureHash: `SHA256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCreatedInspection(rec);
      addInspection(rec);
      // Automatically transition to Stage 3: Compliance Review
      setCurrentStage(3);
    }, 2200);
  };

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = uploadedImages[activeImageIndex]?.url || uploadedImages[0]?.url || "/products/atta/atta-front.jpg";

  // Filter findings in Stage 3
  const displayedFindings = engineResult
    ? engineResult.findings.filter((f) => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "COMPLIANT") return f.status === "COMPLIANT";
        if (statusFilter === "REVIEW") return f.status === "LOW_CONFIDENCE" || f.status === "MANUAL_REVIEW" || f.status === "WARNING";
        if (statusFilter === "VIOLATION") return f.status === "NON_COMPLIANT" || f.status === "NOT_DETECTED";
        return true;
      })
    : [];

  const getStatusBadge = (status: FieldStatus) => {
    switch (status) {
      case "COMPLIANT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="size-3" /> PASS
          </span>
        );
      case "WARNING":
      case "LOW_CONFIDENCE":
      case "MANUAL_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
            <AlertTriangle className="size-3" /> REVIEW
          </span>
        );
      case "NON_COMPLIANT":
      case "NOT_DETECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
            <AlertOctagon className="size-3" /> VIOLATION
          </span>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
            <Scan className="size-4" />
            <span>Inspection Studio · SIH Problem Statement 26034</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Packaged Commodity Inspection &amp; Evidence Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            End-to-end evidence inspection: Optical OCR token localization, deterministic PCR 2011 rule engine validation, and officer review.
          </p>
        </div>

        {/* 4-Stage Progressive Workflow Navigation Indicator */}
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-white/80 p-1 shadow-sm overflow-x-auto">
          {[
            { stage: 1, label: "1. Upload / Capture" },
            { stage: 2, label: "2. Optical OCR" },
            { stage: 3, label: "3. Compliance Review" },
            { stage: 4, label: "4. Officer Report" },
          ].map((s) => {
            const isCurrent = currentStage === s.stage;
            const isCompleted = currentStage > s.stage;
            return (
              <button
                key={s.stage}
                onClick={() => {
                  // Only allow jumping back or to completed stages
                  if (engineResult || s.stage <= currentStage) {
                    setCurrentStage(s.stage as any);
                  }
                }}
                disabled={!engineResult && s.stage > currentStage}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                  isCurrent
                    ? "bg-navy-900 text-white shadow-sm"
                    : isCompleted
                    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    : "text-ink-muted/60 cursor-not-allowed"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STAGE 1: UPLOAD / CAPTURE & JUDGE DEMO CASES ================= */}
      {currentStage === 1 && (
        <div className="mt-8 space-y-8">
          {/* Quick-Start Judge Demo Selection Bar */}
          <div className="rounded-3xl border border-navy-500/20 bg-gradient-to-r from-navy-500/5 via-sky-500/5 to-transparent p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
                  <Sparkles className="size-4" />
                  <span>Interactive Judge Demonstration</span>
                </div>
                <h2 className="text-base font-bold text-ink">
                  Select a Canonical Demonstration Case (SIH 26034)
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Instant 1-click loading of pre-calibrated test commodities demonstrating pass, review, and violation states:
                </p>
              </div>
              <span className="rounded-full bg-navy-500/10 px-3 py-1 font-mono text-[11px] font-bold text-navy-500">
                3 Standardized Cases
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {samplePresets.map((preset) => {
                const isSelected = selectedSample === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-navy-500 bg-white shadow-md ring-2 ring-navy-500/20"
                        : "border-line bg-white/70 hover:bg-white hover:border-navy-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                      {isSelected && <Check className="size-4 text-navy-500" />}
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-line p-1">
                        <Image
                          src={preset.image}
                          alt={preset.title}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-ink">{preset.productName}</p>
                        <p className="text-[11px] text-ink-muted">{preset.brand} · {preset.category}</p>
                      </div>
                    </div>

                    <p className="mt-2.5 text-[11px] leading-relaxed text-ink-muted line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Dropzone & Metadata Parameters */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Left: Drag & Drop Dropzone */}
            <div className="glass rounded-4xl p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-ink">Package Image Ingest</h3>
              <p className="text-xs text-ink-muted">
                Support multi-angle scanning: Front Panel (PDP), Back Statutory Panel, Side declarations.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-navy-500/30 bg-navy-500/5 p-8 text-center transition-all duration-300 hover:border-navy-500 hover:bg-navy-500/10"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-navy-500 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <UploadCloud className="size-7" />
                </div>
                <p className="mt-4 text-sm font-bold text-ink">
                  Click to browse or drag &amp; drop package artwork
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Supports PNG, JPG, WEBP, SVG (High resolution recommended)
                </p>
              </div>

              {/* Uploaded Image Cards */}
              {uploadedImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span>Active Package Images ({uploadedImages.length})</span>
                    <button
                      onClick={() => setUploadedImages([])}
                      className="text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {uploadedImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-sm"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50">
                          <Image
                            src={img.url}
                            alt={img.label}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <span className="mt-1.5 truncate text-[11px] font-semibold text-ink">
                          {img.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                          title="Remove"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Commodity Parameters & PDP Geometry */}
            <div className="glass rounded-4xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">Commodity Metadata &amp; Geometry</h3>
                <p className="text-xs text-ink-muted mt-1">
                  Configure PDP area for Table 1 numeral height ratio evaluation.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted">Commodity Trade Name</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Sharbati Whole Wheat Atta 5kg"
                      className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted">Brand / Packer</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. Aashirvaad"
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-muted">Batch / Lot Code</label>
                      <input
                        type="text"
                        value={batchLot}
                        onChange={(e) => setBatchLot(e.target.value)}
                        placeholder="e.g. LOT-2026-B4"
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-muted">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-navy-500"
                    >
                      <option>Packaged Staples &amp; Grains</option>
                      <option>Edible Oils &amp; Fats</option>
                      <option>Spices &amp; Condiments</option>
                      <option>Bakery &amp; Confectionery</option>
                      <option>Beverages &amp; Teas</option>
                      <option>Dairy &amp; Milk Products</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
                      <span>PDP Area (Principal Display Panel):</span>
                      <strong className="text-ink">{pdpArea} cm²</strong>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={600}
                      step={10}
                      value={pdpArea}
                      onChange={(e) => setPdpArea(Number(e.target.value))}
                      className="mt-2 w-full accent-navy-500"
                    />
                    <span className="block text-[11px] text-ink-muted mt-1">
                      Rule 7 Table 1 Minimum Numeral Height:{" "}
                      <strong className="text-navy-500 font-mono">
                        {pdpArea <= 50 ? "1.0 mm" : pdpArea <= 100 ? "1.5 mm" : pdpArea <= 500 ? "2.5 mm" : "4.0 mm"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Optical Pipeline Action Button */}
              <div className="mt-8 pt-4 border-t border-line">
                <button
                  onClick={startInspection}
                  className="btn-ink flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg"
                >
                  <Scan className="size-4.5 text-saffron" />
                  <span>Start Optical &amp; Compliance Pipeline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 2: OCR & COMPUTER VISION PIPELINE ================= */}
      {currentStage === 2 && (
        <div className="mt-12 mx-auto max-w-xl text-center">
          <div className="glass-strong rounded-4xl p-10 shadow-2xl">
            <div className="relative mx-auto size-28 flex items-center justify-center rounded-3xl bg-navy-900 text-white shadow-xl">
              <Scan className="size-14 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/40 animate-ping" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-ink">
              Optical OCR &amp; Vision Analysis
            </h2>
            <p className="mt-1.5 text-xs text-ink-muted">
              {scanStageText}
            </p>

            {/* Progress Bar */}
            <div className="mt-6 w-full rounded-full bg-slate-200/80 p-1">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <span className="mt-2 block font-mono text-xs font-bold text-ink-muted">
              {scanProgress}% COMPLETED
            </span>

            {/* Stage Pipeline Checkpoints */}
            <div className="mt-8 space-y-2 text-left">
              {[
                { label: "1. Image Ingestion & Resolution Standardization", done: scanProgress >= 20 },
                { label: "2. Optical Character Recognition (OCR) Token Extraction", done: scanProgress >= 45 },
                { label: "3. Spatial Bounding Box Coordinate Mapping", done: scanProgress >= 70 },
                { label: "4. Deterministic PCR 2011 Rule Adjudication", done: scanProgress >= 90 },
                { label: "5. Compliance Verdict & Evidence Dossier Compilation", done: scanProgress >= 100 },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-medium">
                  {step.done ? (
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="size-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={step.done ? "text-ink font-semibold" : "text-ink-muted"}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 3: COMPLIANCE REVIEW & EVIDENCE ================= */}
      {currentStage === 3 && engineResult && createdInspection && (
        <div className="mt-8 space-y-8">
          {/* Architectural Separation Banner */}
          <div className="rounded-3xl border border-line bg-white/70 p-4 text-xs text-ink-muted shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 mb-2 font-mono text-[11px]">
              <span className="font-bold text-navy-500">
                PIPELINE ARCHITECTURE: PROBABILISTIC AI vs. DETERMINISTIC LAW
              </span>
              <span className="text-emerald-700 font-bold">
                Rule Engine Adjudication Complete
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-ink text-xs font-medium">
              <span className="rounded-lg bg-navy-500/10 px-2 py-0.5 text-navy-500">1. Image Ingest</span>
              <span>→</span>
              <span className="rounded-lg bg-sky-500/10 px-2 py-0.5 text-sky-700">2. Optical OCR (Probabilistic)</span>
              <span>→</span>
              <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-indigo-700">3. Declaration Parser</span>
              <span>→</span>
              <span className="rounded-lg bg-purple-500/10 px-2 py-0.5 text-purple-700">4. Legal Metrology Rule Engine</span>
              <span>→</span>
              <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-emerald-700 font-bold">5. Compliance Verdict</span>
            </div>
          </div>

          {/* Inspection Summary Strip */}
          <div className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 shadow-md">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-bold text-navy-500">{createdInspection.id}</span>
                <span className="text-ink/30">·</span>
                <span className="text-ink-muted">{createdInspection.inspectionDate}</span>
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink">
                {createdInspection.productName}
              </h2>
              <p className="text-xs text-ink-muted font-medium">
                {createdInspection.brand} · {createdInspection.category} · Batch Lot: {createdInspection.batchLotNumber}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`rounded-2xl px-5 py-2.5 text-center ${
                  createdInspection.status === "COMPLIANT"
                    ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                    : createdInspection.status === "NON_COMPLIANT"
                    ? "bg-red-500/15 text-red-700 border border-red-500/30"
                    : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                }`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider">
                  Compliance Status
                </span>
                <span className="block text-lg font-black tracking-tight">
                  {createdInspection.status.replace("_", " ")}
                </span>
              </div>

              <button
                onClick={() => setCurrentStage(4)}
                className="btn-ink flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-md"
              >
                <span>Proceed to Officer Review &amp; Report</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Main Inspection Grid: Left = Visualizer with Bounding Boxes, Right = Declarations Table */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            {/* Left: Interactive Computer Vision Evidence Visualizer */}
            <div className="glass flex flex-col rounded-4xl p-6">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h3 className="text-sm font-bold text-ink">Visual Evidence &amp; Spatial Bounding Boxes</h3>
                  <p className="text-[11px] text-ink-muted">
                    Click any declaration on right to pinpoint bounding coordinates
                  </p>
                </div>
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 rounded-full border border-line bg-white/70 p-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                    className="rounded-full p-1 text-ink-muted hover:bg-white hover:text-ink"
                    title="Zoom in"
                  >
                    <ZoomIn className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                    className="rounded-full p-1 text-ink-muted hover:bg-white hover:text-ink"
                    title="Zoom out"
                  >
                    <ZoomOut className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="rounded-full p-1 text-ink-muted hover:bg-white hover:text-ink"
                    title="Reset zoom"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Panel Selector (if multiple images uploaded/available) */}
              {uploadedImages.length > 1 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-full bg-slate-100 p-1 border border-line">
                  {uploadedImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
                        activeImageIndex === idx ? "bg-navy-900 text-white shadow-sm" : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {img.label || `Panel ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Viewer Stage */}
              <div className="relative mt-4 flex min-h-[460px] max-h-[520px] w-full items-center justify-center overflow-hidden rounded-3xl bg-slate-100/60 p-4 border border-line">
                <div
                  className="relative inline-block transition-transform duration-200 select-none"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage}
                    alt={productName}
                    className="block max-h-[460px] w-auto max-w-full rounded-2xl object-contain shadow-md mx-auto"
                  />

                  {/* Render Spatial Bounding Boxes locked 1:1 to image */}
                  <div className="absolute inset-0 pointer-events-none">
                    {engineResult.findings.map((f) => {
                      if (!f.bbox) return null;
                      const isSelected = selectedFieldId === f.id;
                      const borderClass =
                        f.status === "COMPLIANT"
                          ? "border-emerald-500 bg-emerald-500/20"
                          : f.status === "NON_COMPLIANT" || f.status === "NOT_DETECTED"
                          ? "border-red-500 bg-red-500/25 animate-pulse"
                          : "border-amber-500 bg-amber-500/25";

                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFieldId(f.id)}
                          style={{
                            left: `${f.bbox.x}%`,
                            top: `${f.bbox.y}%`,
                            width: `${f.bbox.width}%`,
                            height: `${f.bbox.height}%`,
                          }}
                          className={`absolute pointer-events-auto cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200 ${borderClass} ${
                            isSelected ? "ring-4 ring-navy-500 ring-offset-2 z-30" : "z-10 hover:scale-105"
                          }`}
                          title={`${f.fieldLabel}: ${f.extractedValue} (${Math.round(f.confidence * 100)}% conf)`}
                        >
                          <span className="absolute -top-4 left-0 rounded bg-navy-900 px-1 py-0.5 font-mono text-[9px] font-bold text-white shadow whitespace-nowrap">
                            [{f.fieldKey.toUpperCase()}]
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
                <span>Green: Pass · Amber: Review · Red: Non-Compliant</span>
                <span className="font-mono">Zoom: {Math.round(zoomLevel * 100)}%</span>
              </div>
            </div>

            {/* Right: Declaration Findings & Adjudication Breakdown */}
            <div className="space-y-4">
              <div className="glass rounded-4xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Mandatory Statutory Declarations</h3>
                    <p className="text-[11px] text-ink-muted">
                      Evaluated against Legal Metrology (Packaged Commodities) Rules, 2011
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1">
                    {(["ALL", "COMPLIANT", "REVIEW", "VIOLATION"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                          statusFilter === filter
                            ? "bg-navy-900 text-white shadow-sm"
                            : "bg-white text-ink-muted hover:text-ink border border-line"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Findings Itemized List */}
                <div className="mt-4 space-y-3">
                  {displayedFindings.map((finding) => {
                    const isSelected = selectedFieldId === finding.id;
                    return (
                      <div
                        key={finding.id}
                        onClick={() => setSelectedFieldId(finding.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-navy-500 bg-white shadow-md ring-2 ring-navy-500/20"
                            : "border-line bg-white/60 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-navy-500">
                                {finding.ruleReference}
                              </span>
                              <span className="text-ink/30">·</span>
                              <span className="text-xs font-bold text-ink truncate">
                                {finding.fieldLabel}
                              </span>
                            </div>

                            <p className="mt-1 text-xs font-medium text-ink bg-slate-50 rounded-xl p-2 border border-line-soft font-mono">
                              &ldquo;{finding.extractedValue}&rdquo;
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
                              <span>
                                OCR Confidence:{" "}
                                <strong className={finding.confidence < 0.75 ? "text-amber-600 font-bold" : "text-ink font-bold"}>
                                  {Math.round(finding.confidence * 100)}%
                                </strong>
                              </span>
                              <span>·</span>
                              <span className="text-emerald-700 font-medium">
                                Configured PCR Rule
                              </span>
                            </div>

                            {finding.remarks && (
                              <p className="mt-1.5 text-[11px] text-ink-muted leading-relaxed">
                                {finding.remarks}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">{getStatusBadge(finding.status)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 4: OFFICER REVIEW & REPORT GENERATION ================= */}
      {currentStage === 4 && createdInspection && engineResult && (
        <div className="mt-8 space-y-8">
          {/* Human-in-the-Loop Review Banner */}
          <div className="glass-strong rounded-4xl p-6 sm:p-8 shadow-md border border-navy-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-navy-500/10 text-navy-500">
                  <UserCheck className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-navy-500">
                      HUMAN-IN-THE-LOOP VERIFICATION
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Authorized Review
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-ink">
                    Reviewing Officer Action &amp; Statutory Report Export
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xs font-bold text-ink">{user.name}</span>
                <span className="block text-[11px] text-ink-muted">{user.designation}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/20 text-xs text-amber-900 leading-relaxed">
              <strong>Credibility Notice:</strong> AI-assisted analysis. Final review and statutory compounding or adjudication remain strictly with the authorized reviewing officer.
            </div>

            {/* Officer Remarks Field */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-ink">
                Officer Observations &amp; Regulatory Directives
              </label>
              <textarea
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="Enter officer findings, directions to packer/retailer, or compounding notes..."
                className="mt-1.5 w-full rounded-2xl border border-line bg-white p-3.5 text-xs text-ink outline-none focus:border-navy-500"
              />
            </div>

            {/* One-Click Actions: Export PDF, DOCX, History */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const recordWithNotes = { ...createdInspection, officerNotes: officerRemarks };
                    downloadInspectionPDF(recordWithNotes);
                  }}
                  className="btn-ink flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-md"
                >
                  <Download className="size-4 text-saffron" />
                  <span>Download Compliance Report (A4 PDF)</span>
                </button>

                <button
                  onClick={() => {
                    const recordWithNotes = { ...createdInspection, officerNotes: officerRemarks };
                    generateAndDownloadDOCX(recordWithNotes);
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 text-xs font-bold text-ink shadow-sm hover:bg-slate-50"
                >
                  <FileSpreadsheet className="size-4 text-navy-500" />
                  <span>Export Editable Dossier (DOCX)</span>
                </button>

                <Link
                  href={`/reports/verify/${createdInspection.id}`}
                  className="flex items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink hover:bg-slate-50"
                >
                  <QrCode className="size-4 text-navy-500" />
                  <span>Verify Digital Seal</span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/inspections"
                  className="text-xs font-bold text-navy-500 hover:underline"
                >
                  View in Inspection History &amp; Audit Trail →
                </Link>

                <button
                  onClick={() => {
                    setCurrentStage(1);
                    setEngineResult(null);
                    setCreatedInspection(null);
                  }}
                  className="rounded-2xl border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink hover:bg-slate-50"
                >
                  Start New Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InspectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-muted">Loading Inspection Studio...</div>}>
      <InspectContent />
    </Suspense>
  );
}
