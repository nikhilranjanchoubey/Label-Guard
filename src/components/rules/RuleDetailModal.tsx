"use client";

import React from "react";
import { LegalRule } from "@/lib/legal/types";
import { useTranslation } from "@/lib/i18n";
import {
  X,
  ExternalLink,
  BookOpen,
  Layers,
  ShieldCheck,
  History,
  Info,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface RuleDetailModalProps {
  rule: LegalRule | null;
  onClose: () => void;
}

export const RuleDetailModal: React.FC<RuleDetailModalProps> = ({ rule, onClose }) => {
  const { t, locale } = useTranslation();

  if (!rule) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {rule.internalRuleId}
                </span>
                <span className="text-xs font-semibold text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-800">
                  {rule.statutoryReference}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    rule.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : rule.verificationStatus === "NEEDS_REVIEW"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {rule.verificationStatus === "VERIFIED"
                    ? t("rules.verified", "VERIFIED")
                    : rule.verificationStatus === "NEEDS_REVIEW"
                    ? t("rules.needsReview", "NEEDS REVIEW")
                    : t("rules.superseded", "SUPERSEDED")}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1 leading-tight">
                {locale === "hi" && rule.titleHi ? rule.titleHi : rule.title}
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

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                {t("rules.category", "Category")}
              </span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                {rule.category}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                {t("rules.severity", "Severity")}
              </span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                {rule.severity}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                {t("rules.effectiveFrom", "Effective From")}
              </span>
              <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                {rule.effectiveFrom || "Principal Rules (2011)"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                {t("rules.effectiveTo", "Effective To")}
              </span>
              <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                {rule.effectiveTo || "Current Law (Active)"}
              </span>
            </div>
          </div>

          {/* Requirement Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t("rules.requirement", "Authoritative Requirement Summary")}
            </h3>
            <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed text-xs sm:text-sm">
              {rule.requirement}
            </p>
          </div>

          {/* Statutory Excerpt vs Interpretation (Clearly Separated) */}
          <div className="space-y-3">
            {rule.statutoryTextExcerpt && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  {t("rules.statutoryText", "Official Statutory Excerpt")}
                </div>
                <blockquote className="text-xs text-slate-700 italic border-l-2 border-primary/60 pl-3 py-0.5 leading-relaxed font-serif">
                  &ldquo;{rule.statutoryTextExcerpt}&rdquo;
                </blockquote>
              </div>
            )}

            {rule.interpretationNote && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  {t("rules.interpretation", "LabelGuard Technical Interpretation")}
                </div>
                <p className="text-xs text-blue-950 leading-relaxed">
                  {rule.interpretationNote}
                </p>
              </div>
            )}
          </div>

          {/* Applicability Criteria */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              {t("rules.applicability", "Applicability Criteria")}
            </h3>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <strong className="text-slate-600">Product Categories:</strong>
                <span className="text-slate-800">
                  {rule.applicability.productCategories.join(", ")}
                </span>
              </div>
              {rule.applicability.exclusions && rule.applicability.exclusions.length > 0 && (
                <div className="flex items-start gap-2">
                  <strong className="text-amber-700">Statutory Exclusions:</strong>
                  <span className="text-slate-700">
                    {rule.applicability.exclusions.join(", ")}
                  </span>
                </div>
              )}
              {rule.applicability.importedOnly && (
                <div className="text-blue-700 font-medium">
                  • Applies specifically to imported packages.
                </div>
              )}
              {rule.applicability.ecommerceOnly && (
                <div className="text-blue-700 font-medium">
                  • Applies specifically to digital listings on e-commerce platforms.
                </div>
              )}
            </div>
          </div>

          {/* Deterministic Conditions */}
          {rule.conditions && rule.conditions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                {t("rules.conditions", "Deterministic Conditions Model")}
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Field</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Operator</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rule.conditions.map((cond, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-mono text-blue-700 font-semibold">{cond.field}</td>
                        <td className="px-3 py-2 font-mono text-slate-700 font-medium">{cond.operator}</td>
                        <td className="px-3 py-2 text-slate-600">{cond.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Source & Traceability */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {t("rules.source", "Authoritative Source & Traceability")}
              </h3>
              <a
                href={rule.source.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-primary bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {t("rules.viewSource", "View Official Source")}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <strong>Document:</strong> {rule.source.documentTitle}
              </div>
              <div>
                <strong>Location:</strong> {rule.source.ruleNumber}{" "}
                {rule.source.subRule ? `(${rule.source.subRule})` : ""}{" "}
                {rule.source.clause ? `(${rule.source.clause})` : ""}
                {rule.source.pageNumber ? ` • Page ${rule.source.pageNumber}` : ""}
              </div>
              {rule.source.gazetteNotification && (
                <div>
                  <strong>Gazette Notification:</strong> {rule.source.gazetteNotification}
                </div>
              )}
              <div>
                <strong>Verified By:</strong> {rule.verifiedBy}
              </div>
            </div>
          </div>

          {/* Amendment History */}
          {rule.amendmentHistory && rule.amendmentHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-600" />
                {t("rules.amendmentHistory", "Statutory Amendment History")}
              </h3>
              <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
                {rule.amendmentHistory.map((amend, idx) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span>{amend.amendmentTitle}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({amend.notificationNumber})
                      </span>
                    </div>
                    <div className="text-slate-600">{amend.changeSummary}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Effective: {amend.effectiveDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs text-slate-500">
          <div>Last Verified: {rule.lastVerifiedAt}</div>
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
