"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { DeclarationField } from "@/lib/declarations/types";
import {
  Eye,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  History,
  UserCheck,
} from "lucide-react";
import { clsx } from "clsx";

interface DeclarationItemRowProps {
  field: DeclarationField;
  isSelected: boolean;
  onSelect: (field: DeclarationField) => void;
  onEdit: (field: DeclarationField) => void;
  complianceStatus?: "PASS" | "FAIL" | "REVIEW" | "NOT_APPLICABLE";
  statutoryRule?: string;
  officerStatus?: string;
}

export const DeclarationItemRow: React.FC<DeclarationItemRowProps> = ({
  field,
  isSelected,
  onSelect,
  onEdit,
  complianceStatus,
  statutoryRule,
  officerStatus,
}) => {
  const { t } = useTranslation();

  if (!field) return null;

  const isDetected = field.status === "DETECTED";
  const isAmbiguous = field.status === "AMBIGUOUS";
  const isNotDetected = field.status === "NOT_DETECTED";
  const fieldTypeStr = String(field.fieldType || "OTHER_DECLARATION");
  const fieldLabel = fieldTypeStr.replace(/_/g, " ");

  return (
    <div
      onClick={() => onSelect(field)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left Info: Title, Raw text, Normalized value */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {t(field.labelKey || "", fieldLabel)}
            </span>

            {/* Statutory Rule Binding Badge */}
            {statutoryRule && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {statutoryRule}
              </span>
            )}

            {/* Language Tag */}
            {field.language !== "unknown" && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  field.language === "hi"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : field.language === "en"
                    ? "bg-sky-100 text-sky-800 border border-sky-200"
                    : "bg-purple-100 text-purple-800 border border-purple-200"
                }`}
              >
                {field.language === "hi" ? "हिंदी (HI)" : field.language === "en" ? "English (EN)" : "Bilingual"}
              </span>
            )}

            {/* Officer Verification Status */}
            {officerStatus && (
              <span
                className={clsx(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                  officerStatus === "CONFIRMED" && "bg-emerald-50 text-emerald-700 border-emerald-300",
                  officerStatus === "CORRECTED" && "bg-blue-50 text-blue-700 border-blue-300",
                  officerStatus === "REQUIRES_REVIEW" && "bg-amber-50 text-amber-700 border-amber-300",
                  officerStatus === "REJECTED" && "bg-red-50 text-red-700 border-red-300"
                )}
              >
                <UserCheck className="w-2.5 h-2.5" />
                Officer {officerStatus}
              </span>
            )}

            {/* Audit Indicator */}
            {field.auditTrail && field.auditTrail.length > 0 && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                <History className="w-3 h-3 text-slate-500" />
                Edited ({field.auditTrail.length})
              </span>
            )}
          </div>

          {/* Detected / Normalized Value */}
          <div className="text-sm">
            {isDetected && (
              <div className="font-semibold text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 inline-block break-words">
                {field.normalizedValue || field.rawText}
              </div>
            )}

            {isAmbiguous && (
              <div className="space-y-1">
                <div className="font-semibold text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-300 inline-block break-words">
                  {field.normalizedValue || field.rawText}
                </div>
                {field.possibleInterpretation && (
                  <p className="text-xs text-amber-700">
                    Suggested: <strong className="font-mono">{field.possibleInterpretation}</strong>
                  </p>
                )}
              </div>
            )}

            {isNotDetected && (
              <div className="text-slate-400 italic text-xs flex items-center gap-1.5 py-1">
                <MinusCircle className="w-3.5 h-3.5" />
                <span>{t("declarations.status_not_detected", "Not Detected in packaging evidence")}</span>
              </div>
            )}
          </div>

          {/* Verbatim Raw OCR Snippet */}
          {field.rawText && field.rawText !== field.normalizedValue && (
            <p className="text-[11px] font-mono text-slate-500 truncate" title={field.rawText}>
              <span className="text-slate-400">Verbatim:</span> &quot;{field.rawText}&quot;
            </p>
          )}
        </div>

        {/* Right Info: Status Badge, Confidence & Action Buttons */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
          {/* Status Badges: Extraction + Rule Compliance */}
          <div className="flex items-center sm:flex-col sm:items-end gap-1.5">
            {/* Extraction Status */}
            <div>
              {isDetected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("declarations.status_detected", "Detected")}
                </span>
              )}

              {isAmbiguous && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {t("declarations.status_ambiguous", "Ambiguous")}
                </span>
              )}

              {isNotDetected && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300"
                  title={t("declarations.not_detected_disclaimer", "NOT_DETECTED indicates the field was not identified in OCR. It does NOT imply non-compliance.")}
                >
                  <MinusCircle className="w-3 h-3 text-slate-400" />
                  {t("declarations.status_not_detected", "Not Detected")}
                </span>
              )}
            </div>

            {/* Compliance Engine Status */}
            {complianceStatus && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  complianceStatus === "PASS" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                  complianceStatus === "FAIL" && "bg-red-50 text-red-700 border border-red-200",
                  complianceStatus === "REVIEW" && "bg-amber-50 text-amber-700 border border-amber-200",
                  complianceStatus === "NOT_APPLICABLE" && "bg-slate-50 text-slate-700 border border-slate-200"
                )}
              >
                Rule: {complianceStatus}
              </span>
            )}
          </div>

          {/* Extraction Confidence Badge (Separate from OCR Confidence) */}
          {field.confidence > 0 && (
            <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <span className="text-slate-400 text-[9px] mr-1">EXTR:</span>
              <strong>{(field.confidence * 100).toFixed(1)}%</strong>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pt-1">
            {field.boundingBox && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(field);
                }}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                title={t("declarations.view_evidence", "Highlight Evidence Box")}
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(field);
              }}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
              title={t("declarations.manual_correction", "Manual Correction")}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
