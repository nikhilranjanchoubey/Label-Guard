"use client";

import React from "react";
import { RuleEvaluation } from "@/lib/compliance/types";
import { useTranslation } from "@/lib/i18n";
import {
  X,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  MinusCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  Info,
} from "lucide-react";

interface RuleEvaluationDetailModalProps {
  evaluation: RuleEvaluation | null;
  onClose: () => void;
}

export const RuleEvaluationDetailModal: React.FC<RuleEvaluationDetailModalProps> = ({
  evaluation,
  onClose,
}) => {
  const { t, locale } = useTranslation();

  if (!evaluation) return null;

  const isPass = evaluation.status === "PASS";
  const isFail = evaluation.status === "FAIL";
  const isReview = evaluation.status === "REVIEW";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isPass
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isFail
                  ? "bg-red-50 text-red-700 border-red-200"
                  : isReview
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isPass ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isFail ? (
                <AlertOctagon className="w-5 h-5" />
              ) : isReview ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <MinusCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {evaluation.internalRuleId}
                </span>
                <span className="text-xs font-semibold text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-900">
                  {evaluation.statutoryReference}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isPass
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isFail
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : isReview
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {evaluation.status}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-1">
                {evaluation.category}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm text-slate-700">
          {/* Engine Reason */}
          <div
            className={`p-4 rounded-xl border ${
              isPass
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                : isFail
                ? "bg-red-50/70 border-red-200/80 text-red-950"
                : isReview
                ? "bg-amber-50/70 border-amber-200/80 text-amber-950"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1">
              <Info className="w-4 h-4" />
              {t("compliance.evalReason", "Deterministic Engine Determination")}
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {locale === "hi" && evaluation.reasonHi ? evaluation.reasonHi : evaluation.reason}
            </p>
          </div>

          {/* Comparison Table: Extracted Fact vs Expected Statutory Requirement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t("compliance.extractedFact", "Detected Extraction")}
              </span>
              <div className="font-mono text-slate-900 font-semibold text-xs break-all">
                {evaluation.extractedValue || "NOT DETECTED"}
              </div>
              {evaluation.confidence !== undefined && (
                <div className="text-[11px] text-slate-500 pt-1">
                  Optical Confidence: {(evaluation.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t("compliance.expectedRequirement", "Statutory Requirement")}
              </span>
              <div className="text-slate-800 text-xs leading-relaxed font-medium">
                {evaluation.expectedValue || evaluation.requirement}
              </div>
            </div>
          </div>

          {/* Evidence Reference Card */}
          {evaluation.evidence && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  {t("compliance.evidenceLinking", "Visual Evidence & OCR Binding")}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Field: {evaluation.evidence.extractionField}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div>
                  <strong>OCR String:</strong>{" "}
                  <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-900">
                    {evaluation.evidence.ocrText}
                  </code>
                </div>
                {evaluation.evidence.boundingBox && (
                  <div>
                    <strong>Visual Coordinate Bounding Box:</strong>{" "}
                    <span className="font-mono text-slate-700">
                      [{evaluation.evidence.boundingBox.x.toFixed(1)}%, {evaluation.evidence.boundingBox.y.toFixed(1)}%, {evaluation.evidence.boundingBox.width.toFixed(1)}% × {evaluation.evidence.boundingBox.height.toFixed(1)}%]
                    </span>
                  </div>
                )}
                {evaluation.evidence.sourceOcrItemIds && (
                  <div>
                    <strong>Source Line Item Tokens:</strong>{" "}
                    <span className="font-mono text-slate-700">
                      {evaluation.evidence.sourceOcrItemIds.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Official Source Reference */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {evaluation.sourceReference.documentTitle}
              </div>
              <div className="text-slate-500 font-medium">
                Location: {evaluation.sourceReference.ruleNumber}
                {evaluation.sourceReference.pageNumber ? ` • Page ${evaluation.sourceReference.pageNumber}` : ""}
              </div>
              {evaluation.sourceReference.gazetteNotification && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Gazette: {evaluation.sourceReference.gazetteNotification}
                </div>
              )}
            </div>

            <a
              href={evaluation.sourceReference.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0"
            >
              {t("rules.viewSource", "View Official Source")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs text-slate-500">
          <div>Evaluated: {evaluation.evaluatedAt.slice(0, 19).replace("T", " ")}</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {t("common.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
