import React from "react";
import { ExtractionResult } from "@/lib/ocr/types";
import { OCRConfidenceBadge } from "./OCRConfidenceBadge";
import { Tag, Globe2 } from "lucide-react";
import { clsx } from "clsx";

export interface OCRResultListProps {
  items: ExtractionResult[];
  selectedId?: string;
  onSelectItem?: (item: ExtractionResult) => void;
  className?: string;
}

export const OCRResultList: React.FC<OCRResultListProps> = ({
  items,
  selectedId,
  onSelectItem,
  className,
}) => {
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "hi":
        return { label: "हिन्दी", badge: "bg-orange-50 text-orange-700 border-orange-200" };
      case "en":
        return { label: "English", badge: "bg-blue-50 text-blue-700 border-blue-200" };
      case "mixed":
        return { label: "Bilingual / Mixed", badge: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: "Numeric / Code", badge: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-boundary text-xs text-slate-500">
        No text tokens detected in this scan.
      </div>
    );
  }

  return (
    <div className={clsx("space-y-2 max-h-[600px] overflow-y-auto pr-1", className)}>
      {items.map((item, idx) => {
        const isSelected = selectedId === item.id;
        const langInfo = getLanguageLabel(item.language);

        return (
          <div
            key={item.id || idx}
            onClick={() => onSelectItem && onSelectItem(item)}
            className={clsx(
              "p-3 rounded-lg border transition-all cursor-pointer text-xs space-y-1.5",
              isSelected
                ? "bg-blue-50/70 border-action ring-1 ring-action shadow-sm"
                : "bg-white border-boundary hover:border-slate-300 hover:bg-slate-50/60"
            )}
          >
            {/* Top row: ID, Language tag, Confidence */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                  {item.id}
                </span>
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                    langInfo.badge
                  )}
                >
                  <Globe2 className="w-2.5 h-2.5" />
                  <span>{langInfo.label}</span>
                </span>
              </div>

              <OCRConfidenceBadge confidence={item.confidence} />
            </div>

            {/* Middle row: Original Extracted String (preserving Devanagari or Latin script) */}
            <div className="font-semibold text-slate-900 text-sm break-words leading-relaxed py-0.5">
              {item.text}
            </div>

            {/* Bottom row: Coordinates */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Zone Bounds:</span>
              </span>
              <span>
                X: {item.boundingBox.x}% | Y: {item.boundingBox.y}% | W: {item.boundingBox.width}% | H: {item.boundingBox.height}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
