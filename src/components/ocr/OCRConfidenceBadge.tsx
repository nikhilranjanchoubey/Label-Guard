import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface OCRConfidenceBadgeProps {
  confidence: number; // 0.0 - 1.0
  className?: string;
  showPercent?: boolean;
}

/**
 * Renders internal OCR optical character recognition confidence tier.
 * NOTE: These are strictly optical certainty tiers, NOT statutory compliance thresholds.
 */
export const OCRConfidenceBadge: React.FC<OCRConfidenceBadgeProps> = ({
  confidence,
  className,
  showPercent = true,
}) => {
  const percent = Math.round(confidence * 1000) / 10;

  let tier: "High" | "Medium" | "Low" = "High";
  let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (percent >= 90) {
    tier = "High";
    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (percent >= 70) {
    tier = "Medium";
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    tier = "Low";
    badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border select-none",
          badgeColor,
          className
        )
      )}
      title={`Internal OCR Confidence: ${percent}% (Optical clarity index, not a legal compliance determination)`}
    >
      <span className="font-sans font-bold uppercase text-[10px] tracking-wider">
        {tier}
      </span>
      {showPercent && <span>{percent.toFixed(1)}%</span>}
    </span>
  );
};
