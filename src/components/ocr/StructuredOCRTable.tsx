"use client";

import React from "react";
import { OCRConfidenceBadge } from "./OCRConfidenceBadge";
import { BoundingBoxPercent } from "@/lib/declarations/types";
import { useTranslation } from "@/lib/i18n";
import { CheckCircle2, AlertTriangle, HelpCircle, Tag } from "lucide-react";
import { clsx } from "clsx";

export interface StructuredOCRFieldItem {
  id: string;
  fieldKey: string;
  labelEn: string;
  labelHi: string;
  value?: string;
  confidence: number;
  sourceId?: string;
  surface?: string;
  boundingBox?: BoundingBoxPercent;
  status: "DETECTED" | "AMBIGUOUS" | "NOT_DETECTED";
  verificationStatus?: string;
  notes?: string;
}

export interface StructuredOCRTableProps {
  fields: StructuredOCRFieldItem[];
  selectedFieldId?: string;
  onSelectField?: (field: StructuredOCRFieldItem) => void;
  className?: string;
}

export const StructuredOCRTable: React.FC<StructuredOCRTableProps> = ({
  fields,
  selectedFieldId,
  onSelectField,
  className,
}) => {
  const { locale } = useTranslation();

  return (
    <div className={clsx("overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <th className="py-3 px-3.5">Declaration Field / विहित घोषणा</th>
            <th className="py-3 px-3.5">Extracted Value / निष्कर्षित मान</th>
            <th className="py-3 px-3">OCR Confidence / विश्वास</th>
            <th className="py-3 px-3">Source ID / साक्ष्य</th>
            <th className="py-3 px-3">Bounding Box / स्थिति</th>
            <th className="py-3 px-3.5 text-right">Status / स्थिति</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fields.map((f) => {
            const isSelected = selectedFieldId === f.id;
            const isDetected = f.status === "DETECTED";
            const isAmbiguous = f.status === "AMBIGUOUS";

            return (
              <tr
                key={f.id}
                onClick={() => onSelectField && onSelectField(f)}
                className={clsx(
                  "cursor-pointer transition-colors",
                  isSelected
                    ? "bg-blue-50/80 ring-1 ring-inset ring-blue-500 font-medium"
                    : isDetected
                    ? "hover:bg-slate-50/80"
                    : isAmbiguous
                    ? "bg-amber-50/40 hover:bg-amber-50/70"
                    : "bg-slate-50/30 text-slate-400 hover:bg-slate-50"
                )}
              >
                {/* Field Label */}
                <td className="py-3 px-3.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    {locale === "hi" ? f.labelHi : f.labelEn}
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {locale === "hi" ? f.labelEn : f.labelHi}
                  </div>
                </td>

                {/* Extracted Value */}
                <td className="py-3 px-3.5 max-w-xs">
                  {isDetected && f.value ? (
                    <span className="font-medium text-slate-900 break-words leading-relaxed">
                      {f.value}
                    </span>
                  ) : isAmbiguous && f.value ? (
                    <div className="space-y-0.5">
                      <span className="font-medium text-amber-900 break-words leading-relaxed">
                        {f.value}
                      </span>
                      {f.notes && (
                        <div className="text-[10px] text-amber-700 italic">
                          {f.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 italic">
                      <HelpCircle className="w-3 h-3" />
                      <span>Not detected on packaging</span>
                    </span>
                  )}
                </td>

                {/* Confidence */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {f.status !== "NOT_DETECTED" && f.confidence > 0 ? (
                    <OCRConfidenceBadge confidence={f.confidence} />
                  ) : (
                    <span className="text-slate-400 font-mono text-[11px]">—</span>
                  )}
                </td>

                {/* Source ID & Surface */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {f.sourceId ? (
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{f.sourceId}</span>
                      {f.surface && (
                        <span className="px-1 py-0.2 bg-slate-100 rounded uppercase text-[9px] text-slate-500">
                          {f.surface}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>

                {/* Bounding Box Coordinates */}
                <td className="py-3 px-3 whitespace-nowrap font-mono text-[10px] text-slate-500">
                  {f.boundingBox ? (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      [{f.boundingBox.x.toFixed(1)}%, {f.boundingBox.y.toFixed(1)}%, {f.boundingBox.width.toFixed(1)}%, {f.boundingBox.height.toFixed(1)}%]
                    </span>
                  ) : (
                    <span className="text-slate-400 italic font-sans text-[11px]">
                      Bounding box unavailable
                    </span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3.5 text-right whitespace-nowrap">
                  {isDetected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Detected</span>
                    </span>
                  ) : isAmbiguous ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Needs review</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      <span>Not detected</span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
