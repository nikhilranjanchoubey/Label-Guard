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

  const isResGood = metrics.width >= 600 && metrics.height >= 600;
  const isLightingGood = metrics.brightness >= 50 && metrics.brightness <= 215 && metrics.contrast >= 30;
  const isBlurLow = !metrics.isBlurry;

  return (
    <div className={clsx("p-4 rounded-xl border border-boundary bg-white shadow-card space-y-3", className)}>
      <div className="flex items-center justify-between border-b border-boundary pb-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-action" />
          <span>Image Quality Indicators</span>
        </div>
        <span
          className={clsx(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            metrics.ocrReadiness === "Ready"
              ? "bg-compliant-bg text-compliant-text border border-compliant-border"
              : metrics.ocrReadiness === "Suboptimal"
              ? "bg-warning-bg text-warning-text border border-warning-border"
              : "bg-violation-bg text-violation-text border border-violation-border"
          )}
        >
          OCR {metrics.ocrReadiness}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-boundary">
          {getStatusIcon(isResGood, !isResGood && metrics.width >= 400)}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Resolution</span>
            <span className="font-mono text-slate-800 font-semibold">{metrics.resolution}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-boundary">
          {getStatusIcon(isLightingGood, true)}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Lighting</span>
            <span className="font-semibold text-slate-800">
              {isLightingGood ? "Balanced" : metrics.brightness < 50 ? "Dark" : "Overexposed"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-boundary">
          {getStatusIcon(isBlurLow, metrics.blurScore >= 6.0)}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Blur Index</span>
            <span className="font-semibold text-slate-800">
              {isBlurLow ? "Sharp (Low Blur)" : "Potential Blur"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-boundary">
          {getStatusIcon(true)}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Orientation</span>
            <span className="font-semibold text-slate-800 capitalize">{metrics.orientation}</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 italic pt-1 leading-normal">
        * Optical clarity indicators calculated to assist OCR detection. Not a legal metrology compliance assessment.
      </p>
    </div>
  );
};
