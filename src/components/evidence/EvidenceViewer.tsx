"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { BoundingBox } from "@/lib/compliance/types";
import { useTranslation } from "@/lib/i18n";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Move,
  Sliders,
} from "lucide-react";
import { clsx } from "clsx";

export interface EvidenceQualityMetrics {
  resolution?: string;
  blurScore?: number; // 0 to 100 (higher = sharper)
  brightnessScore?: number; // 0 to 100
  contrastScore?: number; // 0 to 100
  orientation?: number; // 0, 90, 180, 270
}

export interface EvidenceViewerProps {
  imageUrl: string;
  productName: string;
  boxes?: BoundingBox[];
  selectedBoxId?: string;
  onSelectBox?: (box: BoundingBox) => void;
  ruleBeingChecked?: string;
  surface?: string;
  qualityMetrics?: EvidenceQualityMetrics;
  className?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  imageUrl,
  productName,
  boxes = [],
  selectedBoxId,
  onSelectBox,
  ruleBeingChecked,
  surface = "front",
  qualityMetrics = {
    resolution: "1920 × 1080 px",
    blurScore: 88,
    brightnessScore: 78,
    contrastScore: 82,
    orientation: 0,
  },
  className,
}) => {
  const { t } = useTranslation();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showQualityPanel, setShowQualityPanel] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeBox = boxes.find((b) => b.id === selectedBoxId) || boxes[0] || null;

  // Auto-focus and center on selected box if specified
  useEffect(() => {
    if (selectedBoxId) {
      const target = boxes.find((b) => b.id === selectedBoxId);
      if (target) {
        // Calculate gentle pan to keep target box centered
        const offsetX = (50 - (target.x + target.width / 2)) * 3;
        const offsetY = (50 - (target.y + target.height / 2)) * 3;
        setPanOffset({ x: offsetX, y: offsetY });
      }
    }
  }, [selectedBoxId, boxes]);

  const handleBoxClick = (box: BoundingBox) => {
    if (onSelectBox) onSelectBox(box);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(2))), 3.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetTransform = () => {
    setZoomLevel(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    },
    [isPanning, panStart]
  );

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Evidence quality warning threshold
  const isQualityDegraded =
    (qualityMetrics.blurScore !== undefined && qualityMetrics.blurScore < 60) ||
    (qualityMetrics.contrastScore !== undefined && qualityMetrics.contrastScore < 50);

  return (
    <div
      className={clsx(
        "flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg select-none",
        className
      )}
    >
      {/* Top Control Header */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950 text-slate-200 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-action-light" />
          <span className="font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-xs">
            {productName}
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {surface} PANEL
          </span>
          {ruleBeingChecked && (
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
              {ruleBeingChecked}
            </span>
          )}
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-1">
          {/* Overlays toggle */}
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors",
              showOverlays
                ? "bg-action/25 text-blue-300 border border-action/40"
                : "text-slate-400 hover:bg-slate-800"
            )}
            title={t("evidence.toggleBoxes", "Toggle Bounding Boxes")}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{showOverlays ? "Boxes On" : "Boxes Off"}</span>
          </button>

          {/* Quality Panel toggle */}
          <button
            type="button"
            onClick={() => setShowQualityPanel(!showQualityPanel)}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors",
              showQualityPanel
                ? "bg-amber-950/80 text-amber-300 border border-amber-700"
                : "text-slate-400 hover:bg-slate-800"
            )}
            title={t("evidence.quality", "Optical Quality Metrics")}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quality</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={t("evidence.zoomOut", "Zoom Out")}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom display */}
          <span className="font-mono text-[11px] text-slate-300 w-11 text-center select-none">
            {Math.round(zoomLevel * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => handleZoom(0.25)}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={t("evidence.zoomIn", "Zoom In")}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Rotate Clockwise */}
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={`Rotate 90° Clockwise (${rotation}°)`}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Reset All View */}
          <button
            type="button"
            onClick={resetTransform}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={t("evidence.reset", "Reset View")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optical Quality Degradation Warning Banner (Mandatory Legal Guardrail) */}
      {isQualityDegraded && (
        <div className="px-3 py-2 bg-amber-950/90 border-b border-amber-800 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Optical Quality Warning:</strong> Image sharpness or contrast is low. Statutory
            non-compliance must not be claimed solely on degraded optical evidence. Physical
            inspection recommended.
          </span>
        </div>
      )}

      {/* Optical Quality Drawer / Status Strip */}
      {showQualityPanel && (
        <div className="px-3 py-2 bg-slate-950/95 border-b border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 text-[11px] uppercase font-semibold">
              Optical Quality Assessment:
            </span>
            <span>
              Res: <strong className="text-white font-mono">{qualityMetrics.resolution}</strong>
            </span>
            <span>
              Sharpness:{" "}
              <strong
                className={clsx(
                  "font-mono",
                  (qualityMetrics.blurScore ?? 100) >= 70 ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {qualityMetrics.blurScore ?? 85}/100
              </strong>
            </span>
            <span>
              Brightness:{" "}
              <strong className="text-white font-mono">{qualityMetrics.brightnessScore ?? 75}%</strong>
            </span>
            <span>
              Contrast:{" "}
              <strong className="text-white font-mono">{qualityMetrics.contrastScore ?? 80}%</strong>
            </span>
            <span>
              Rotation:{" "}
              <strong className="text-action-light font-mono">{rotation}°</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 italic">
            Computed via PaddleOCR Optical Preprocessor
          </span>
        </div>
      )}

      {/* Pan & Zoom Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={clsx(
          "relative flex-1 min-h-[360px] max-h-[560px] overflow-hidden bg-slate-950 flex items-center justify-center p-4",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {/* Transform Container with Zoom, Pan, Rotate */}
        <div
          className="relative inline-block transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          {/* Packaging Scan Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={productName}
            draggable={false}
            className="max-h-[460px] w-auto rounded object-contain shadow-2xl block border border-slate-800 pointer-events-none"
          />

          {/* Interactive Bounding Boxes Overlays */}
          {showOverlays &&
            boxes.map((box) => {
              const isSelected = activeBox?.id === box.id;

              // Border and fill based on compliance status
              let boxStyles = "border-2 border-emerald-500 bg-emerald-500/15";
              let badgeStyles = "bg-emerald-600 text-white";

              if (box.status === "REVIEW_REQUIRED") {
                boxStyles = "border-2 border-dashed border-amber-400 bg-amber-400/20";
                badgeStyles = "bg-amber-600 text-white";
              } else if (box.status === "VIOLATION") {
                boxStyles = "border-2 border-dashed border-red-500 bg-red-500/25";
                badgeStyles = "bg-red-600 text-white";
              }

              return (
                <div
                  key={box.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBoxClick(box);
                  }}
                  className={clsx(
                    "absolute cursor-pointer rounded transition-all duration-150 group pointer-events-auto",
                    boxStyles,
                    isSelected && "ring-2 ring-white ring-offset-2 ring-offset-slate-950 z-20 scale-[1.02]"
                  )}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  {/* Micro pin tag at top-left coordinate */}
                  <div
                    className={clsx(
                      "absolute -top-6 left-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap select-none",
                      badgeStyles
                    )}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{box.fieldKey}</span>
                    <span className="opacity-90 font-mono text-[9px] bg-black/30 px-1 rounded">
                      {(box.ocrConfidence * 100).toFixed(1)}% OCR
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Floating Controls Overlay (Pan guide & Reset) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs border border-slate-700 px-2 py-1 rounded text-[11px] text-slate-300 select-none pointer-events-none">
          <Move className="w-3 h-3 text-slate-400" />
          <span>Click & drag to pan</span>
        </div>
      </div>

      {/* Selected Box Details Footer */}
      {activeBox && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100">{t("evidence.boxInfo", "Selected Evidence Box")}:</span>
            <span className="font-mono text-action-light font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {activeBox.fieldKey}
            </span>
            <span className="text-slate-300 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
              &ldquo;{activeBox.rawText}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              {t("evidence.confidenceScore", "OCR Confidence")}:{" "}
              <strong className="text-white font-mono">{(activeBox.ocrConfidence * 100).toFixed(1)}%</strong>
            </span>
            <span
              className={clsx(
                "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                activeBox.status === "COMPLIANT" && "bg-emerald-950 text-emerald-300 border border-emerald-800",
                activeBox.status === "REVIEW_REQUIRED" && "bg-amber-950 text-amber-300 border border-amber-800",
                activeBox.status === "VIOLATION" && "bg-red-950 text-red-300 border border-red-800"
              )}
            >
              {activeBox.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
