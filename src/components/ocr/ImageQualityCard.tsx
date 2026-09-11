import React from "react";
import { ImageQualityMetrics } from "@/lib/ocr/types";
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { clsx } from "clsx";

export interface ImageQualityCardProps {
  metrics: ImageQualityMetrics;
  className?: string;
}

export const ImageQualityCard: React.FC<ImageQualityCardProps> = ({ metrics, className }) => {
  const getStatusIcon = (isGood: boolean, isWarning?: boolean) => {
    if (isGood) return <CheckCircle2 className="w-3.5 h-3.5 text-compliant shrink-0" />;
    if (isWarning) return <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />;
    return <AlertCircle className="w-3.5 h-3.5 text-violation shrink-0" />;
  };

  const isResGood = metrics.width ? metrics.width >= 600 && metrics.height >= 600 : false;
  const isLightingGood = typeof metrics.brightness === "number" && typeof metrics.contrast === "number"
    ? metrics.brightness >= 50 && metrics.brightness <= 215 && metrics.contrast >= 30
    : false;
  const isBlurLow = typeof metrics.isBlurry === "boolean" ? !metrics.isBlurry : false;

  // Compute actionable rescan suggestions
  const rescanReasons: string[] = [];
  if (metrics.width && (metrics.width < 600 || metrics.height < 600)) {
    rescanReasons.push("Image resolution below 600px may cause small statutory numerals to be unreadable.");
  }
  if (metrics.isBlurry) {
    rescanReasons.push("Motion blur or defocus detected. Stabilize package surface for crisp text.");
  }
  if (typeof metrics.brightness === "number" && metrics.brightness < 50) {
    rescanReasons.push("Low illumination detected. Increase ambient inspection lighting.");
  } else if (typeof metrics.brightness === "number" && metrics.brightness > 220) {
    rescanReasons.push("Specular glare / overexposure detected on packaging laminate.");
  }

  return (
    <div className={clsx("p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Image Quality Pre-Check</span>
        </div>
        <span
          className={clsx(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            metrics.ocrReadiness === "Ready"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : metrics.ocrReadiness === "Suboptimal"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          )}
        >
          OCR {metrics.ocrReadiness || "Readiness Unknown"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {/* Resolution */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          {metrics.resolution ? getStatusIcon(isResGood, !isResGood && metrics.width >= 400) : <span className="w-3.5 h-3.5 text-slate-300">—</span>}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Resolution</span>
            <span className="font-mono text-slate-800 font-semibold">{metrics.resolution || "Not measured"}</span>
          </div>
        </div>

        {/* Lighting Balance */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          {typeof metrics.brightness === "number" ? getStatusIcon(isLightingGood, true) : <span className="w-3.5 h-3.5 text-slate-300">—</span>}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Lighting / Glare</span>
            <span className="font-semibold text-slate-800">
              {typeof metrics.brightness === "number"
                ? isLightingGood
                  ? "Balanced"
                  : metrics.brightness < 50
                  ? "Under-lit"
                  : "Glare Detected"
                : "Not measured"}
            </span>
          </div>
        </div>

        {/* Blur Index */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          {typeof metrics.isBlurry === "boolean" ? getStatusIcon(isBlurLow, metrics.blurScore >= 60) : <span className="w-3.5 h-3.5 text-slate-300">—</span>}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Blur / Focus</span>
            <span className="font-semibold text-slate-800">
              {typeof metrics.isBlurry === "boolean"
                ? isBlurLow
                  ? "Sharp (Low Blur)"
                  : "Defocus Blur"
                : "Not measured"}
            </span>
          </div>
        </div>

        {/* Orientation / Skew */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          {metrics.orientation ? getStatusIcon(true) : <span className="w-3.5 h-3.5 text-slate-300">—</span>}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Orientation / Skew</span>
            <span className="font-semibold text-slate-800 capitalize">{metrics.orientation || "Not measured"}</span>
          </div>
        </div>
      </div>

      {/* Actionable Re-Scan Warning if issues detected */}
      {rescanReasons.length > 0 && (
        <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1">
          <div className="font-semibold flex items-center gap-1 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Rescan Recommendation:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 text-[10.5px]">
            {rescanReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic pt-0.5 leading-normal">
        * Optical clarity metrics are calculated to assist character recognition. They do not determine legal compliance.
      </p>
    </div>
  );
};
