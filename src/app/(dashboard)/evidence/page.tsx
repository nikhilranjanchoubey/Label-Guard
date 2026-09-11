"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { EvidenceViewer } from "@/components/evidence/EvidenceViewer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OCRConfidenceBadge } from "@/components/ocr/OCRConfidenceBadge";
import { MOCK_INSPECTIONS } from "@/mocks/sampleData";
import { BoundingBox } from "@/lib/compliance/types";
import { getActiveOCRDocument } from "@/lib/ocr/client";
import { OCRDocument } from "@/lib/ocr/types";
import { Tag, ArrowRight, Hash, ScanLine } from "lucide-react";

export default function EvidencePage() {
  const { t } = useTranslation();

  const [activeDoc, setActiveDoc] = useState<OCRDocument | null>(null);
  const [isRealUpload, setIsRealUpload] = useState<boolean>(false);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [productTitle, setProductTitle] = useState<string>("");

  useEffect(() => {
    const realDoc = getActiveOCRDocument();
    if (realDoc && realDoc.results && realDoc.results.length > 0) {
      setActiveDoc(realDoc);
      setIsRealUpload(true);
      setImageUrl(realDoc.previewUrl || MOCK_INSPECTIONS[0].sampleImageUrl);
      setProductTitle(`Uploaded Scan (${realDoc.surface.toUpperCase()} Panel)`);

      // Convert OCR results to BoundingBox interface
      const mappedBoxes: BoundingBox[] = realDoc.results.map((r) => ({
        id: r.id,
        fieldKey: (r.text.length > 18 ? `${r.text.substring(0, 18)}...` : r.text) as unknown as BoundingBox["fieldKey"],
        x: r.boundingBox.x,
        y: r.boundingBox.y,
        width: r.boundingBox.width,
        height: r.boundingBox.height,
        rawText: r.text,
        ocrConfidence: r.confidence,
        status: r.confidence >= 0.9 ? "COMPLIANT" : r.confidence >= 0.7 ? "REVIEW_REQUIRED" : "VIOLATION",
      }));

      setBoxes(mappedBoxes);
      setSelectedBox(mappedBoxes[0] || null);
    } else {
      // Fallback to sample demo inspection
      const sample = MOCK_INSPECTIONS[0];
      setIsRealUpload(false);
      setImageUrl(sample.sampleImageUrl);
      setProductTitle(sample.productName);
      setBoxes(sample.boundingBoxes);
      setSelectedBox(sample.boundingBoxes[0] || null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("evidence.title", "Evidence Verification Canvas")}
            </h1>
            {isRealUpload ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                REAL UPLOADED EVIDENCE
              </span>
            ) : (
              <Badge variant="demo" size="sm" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("evidence.subtitle", "Audit-grade visual examination with localized bounding box overlays")} • {productTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/scan">
            <Button variant="outline" size="sm" leftIcon={<ScanLine className="w-4 h-4" />}>
              New Scan
            </Button>
          </Link>
          <Link href="/analysis">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Back to OCR Tokens
            </Button>
          </Link>
        </div>
      </div>

      {/* 12-Column Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Interactive Evidence Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <EvidenceViewer
            imageUrl={imageUrl}
            productName={productTitle}
            boxes={boxes}
            selectedBoxId={selectedBox?.id}
            onSelectBox={(box) => setSelectedBox(box)}
            surface={activeDoc?.surface || "back"}
            qualityMetrics={{
              resolution: "1920 × 1080 px",
              blurScore: 88,
              brightnessScore: 78,
              contrastScore: 82,
              orientation: 0,
            }}
          />

          <div className="p-3 bg-white rounded-lg border border-boundary flex items-center justify-between text-xs text-slate-600 shadow-sm">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Evidentiary Record ID:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {activeDoc ? activeDoc.imageId : MOCK_INSPECTIONS[0].auditHash.substring(0, 24)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {boxes.length} Bounding Zones Mapped
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Selected Zone Details & Coordinate Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-action" />
                <CardTitle className="text-sm">Active Evidence Overlay Zone</CardTitle>
              </div>
              {selectedBox && (
                <OCRConfidenceBadge confidence={selectedBox.ocrConfidence} />
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Detected Text Token
                </label>
                <div className="p-3 rounded-lg bg-slate-50 border border-boundary font-semibold text-slate-900 text-sm break-words leading-relaxed">
                  {selectedBox?.rawText || "Select an overlay on the canvas"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">
                    {t("evidence.confidenceScore", "OCR Confidence")}
                  </div>
                  <div className="text-lg font-bold font-mono text-action mt-0.5">
                    {selectedBox ? (selectedBox.ocrConfidence * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Optical character clarity</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-boundary">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">
                    Spatial Coordinates
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-800 mt-1">
                    X: {selectedBox?.x}% | Y: {selectedBox?.y}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    W: {selectedBox?.width}% | H: {selectedBox?.height}%
                  </div>
                </div>
              </div>

              {/* Detected Text List Quick Selector */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  All Detected Surface Zones ({boxes.length})
                </label>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {boxes.map((box) => (
                    <button
                      key={box.id}
                      type="button"
                      onClick={() => setSelectedBox(box)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        selectedBox?.id === box.id
                          ? "border-action bg-blue-50 text-action font-semibold"
                          : "border-boundary hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-semibold text-xs truncate max-w-[200px]">
                        {box.rawText}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          {(box.ocrConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-boundary">
                <Link href="/verification">
                  <Button variant="primary" size="md" className="w-full">
                    Proceed to Officer Verification
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
