"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OCRResultList } from "@/components/ocr/OCRResultList";
import { ImageQualityCard } from "@/components/ocr/ImageQualityCard";
import { OCRDocument, ExtractionResult } from "@/lib/ocr/types";
import { getActiveOCRDocument } from "@/lib/ocr/client";
import { MOCK_INSPECTIONS } from "@/mocks/sampleData";
import {
  Binary,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Eye,
  ScanLine,
} from "lucide-react";

export default function AnalysisPage() {
  const { t } = useTranslation();

  const [activeDoc, setActiveDoc] = useState<OCRDocument | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExtractionResult | null>(null);
  const [isRealUpload, setIsRealUpload] = useState<boolean>(false);

  useEffect(() => {
    // Check for real uploaded OCR session document
    const stored = getActiveOCRDocument();
    if (stored && stored.results && stored.results.length > 0) {
      setActiveDoc(stored);
      setIsRealUpload(true);
      setSelectedItem(stored.results[0] || null);
    } else {
      // Fallback to demo sample document
      const sample = MOCK_INSPECTIONS[0];
      const demoResults: ExtractionResult[] = sample.boundingBoxes.map(
        (b: { id?: string; rawText: string; ocrConfidence: number; x: number; y: number; width: number; height: number }, idx: number) => ({
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
        imageId: sample.id,
        surface: "back",
        imageWidth: 1200,
        imageHeight: 896,
        processingTimeMs: 412,
        overallConfidence: sample.overallOcrConfidence,
        results: demoResults,
        languagesDetected: ["en", "hi"],
        previewUrl: sample.sampleImageUrl,
        isDemo: true,
      };
      setActiveDoc(demoDoc);
      setIsRealUpload(false);
      setSelectedItem(demoResults[0] || null);
    }
  }, []);

  if (!activeDoc) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("analysis.title", "OCR & Extraction Pipeline")}
            </h1>
            {isRealUpload ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                REAL UPLOADED SCAN
              </span>
            ) : (
              <Badge variant="demo" size="sm" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("analysis.subtitle", "Automated text extraction pipeline separation from compliance evaluation")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/scan">
            <Button variant="outline" size="sm" leftIcon={<ScanLine className="w-4 h-4" />}>
              Upload Another Scan
            </Button>
          </Link>
          <Link href="/evidence">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open in Evidence Canvas
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-boundary shadow-card">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Detected Tokens</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{activeDoc.results.length} blocks</div>
          <span className="text-[10px] text-slate-400 font-mono">Bilingual segmentations</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-boundary shadow-card">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Overall OCR Confidence</span>
          <div className="text-xl font-bold text-action mt-0.5 font-mono">
            {(activeDoc.overallConfidence * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Optical character clarity</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-boundary shadow-card">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Languages Recognized</span>
          <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs">हिन्दी</span>
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">English</span>
          </div>
          <span className="text-[10px] text-slate-400">Preserving original script</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-boundary shadow-card">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Processing Latency</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
            {activeDoc.processingTimeMs} ms
          </div>
          <span className="text-[10px] text-slate-400">PaddleOCR Engine</span>
        </div>
      </div>

      {/* Critical Non-Statutory Callout */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Separation of Optical Confidence vs Statutory Validity</strong>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            Confidence badges (High ≥ 90%, Medium 70–89%, Low &lt; 70%) represent optical character clarity and spatial certainty. They do NOT evaluate statutory compliance.
          </p>
        </div>
      </div>

      {/* Dual Panel Inspection Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Image Canvas with Interactive Bounding Box Overlays */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-card">
            <div className="p-3 bg-slate-900 text-slate-200 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-action-light" />
                <span className="font-semibold text-slate-100 truncate">
                  Visual OCR Spatial Detection Map
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Surface: {activeDoc.surface.toUpperCase()}
              </span>
            </div>

            <div className="relative p-4 flex items-center justify-center min-h-[380px] max-h-[520px] overflow-auto bg-slate-950">
              <div className="relative inline-block">
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeDoc.previewUrl || MOCK_INSPECTIONS[0].sampleImageUrl}
                  alt="Scanned product package"
                  className="max-h-[460px] w-auto rounded object-contain border border-slate-800 shadow-2xl block"
                />

                {/* Overlaid Bounding Boxes */}
                {activeDoc.results.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isHigh = item.confidence >= 0.9;
                  const isMed = item.confidence >= 0.7 && item.confidence < 0.9;

                  let boxStyles = "border-2 border-emerald-500 bg-emerald-500/10";
                  if (isMed) boxStyles = "border-2 border-amber-500 bg-amber-500/15";
                  else if (!isHigh) boxStyles = "border-2 border-rose-500 bg-rose-500/20";

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`absolute cursor-pointer rounded transition-all duration-150 ${boxStyles} ${
                        isSelected
                          ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-30 scale-[1.01]"
                          : "hover:ring-1 hover:ring-white/80"
                      }`}
                      style={{
                        left: `${item.boundingBox.x}%`,
                        top: `${item.boundingBox.y}%`,
                        width: `${item.boundingBox.width}%`,
                        height: `${item.boundingBox.height}%`,
                      }}
                      title={`${item.text} (${(item.confidence * 100).toFixed(1)}%)`}
                    >
                      {/* Micro Coordinate Pin */}
                      <span
                        className={`absolute -top-5 left-0 text-[9px] font-bold font-mono px-1 py-0.2 rounded text-white shadow-sm whitespace-nowrap ${
                          isHigh ? "bg-emerald-600" : isMed ? "bg-amber-600" : "bg-rose-600"
                        }`}
                      >
                        {item.id} ({(item.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Item Callout Bar */}
            {selectedItem && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100">Selected Token:</span>
                  <span className="font-mono text-action-light font-bold bg-slate-800 px-2 py-0.5 rounded">
                    {selectedItem.id}
                  </span>
                  <span className="font-semibold text-white">&ldquo;{selectedItem.text}&rdquo;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">
                    Confidence: {(selectedItem.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    {selectedItem.language.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Image Quality Metrics if available */}
          {activeDoc.quality && (
            <ImageQualityCard metrics={activeDoc.quality} />
          )}
        </div>

        {/* Right 5 Cols: Detected Text Tokens List */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-action" />
                <CardTitle className="text-sm">
                  Detected Text Tokens ({activeDoc.results.length})
                </CardTitle>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Original Script</span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <OCRResultList
                items={activeDoc.results}
                selectedId={selectedItem?.id}
                onSelectItem={(item) => setSelectedItem(item)}
              />
            </CardContent>
          </Card>

          {/* Next Stage Navigation CTA */}
          <Card className="bg-slate-50 border-boundary">
            <CardContent className="p-4 space-y-3">
              <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-action" />
                <span>Next Pipeline Stage: Declaration Extraction</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                These raw OCR tokens will be mapped into mandatory packaged commodity declarations (MRP, Net Quantity, Dates, Manufacturer) in the upcoming stage.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Link href="/evidence" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    Evidence Canvas
                  </Button>
                </Link>
                <Link href="/declarations" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Declarations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
