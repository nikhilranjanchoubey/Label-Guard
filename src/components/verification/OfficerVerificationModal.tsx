"use client";

import React, { useState, useEffect } from "react";
import { RuleEvaluation } from "@/lib/compliance/types";
import { OfficerAction, OfficerVerificationStatus } from "@/lib/verification/types";
import { AuditUser } from "@/lib/audit/types";
import { useTranslation } from "@/lib/i18n";
import {
  X,
  AlertTriangle,
  ShieldCheck,
  Info,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";

interface OfficerVerificationModalProps {
  isOpen: boolean;
  evaluation: RuleEvaluation | null;
  initialAction?: OfficerAction;
  activeUser: AuditUser;
  onClose: () => void;
  onSubmit: (data: {
    action: OfficerAction;
    officerStatus: OfficerVerificationStatus;
    reason: string;
    note?: string;
    newValue?: string;
  }) => Promise<void>;
}

export const OfficerVerificationModal: React.FC<OfficerVerificationModalProps> = ({
  isOpen,
  evaluation,
  initialAction = "CONFIRM",
  activeUser,
  onClose,
  onSubmit,
}) => {
  const { t, locale } = useTranslation();
  const [action, setAction] = useState<OfficerAction>(initialAction);
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (evaluation) {
      setAction(initialAction);
      setNewValue(evaluation.extractedValue || "");
      setReason(
        initialAction === "CONFIRM"
          ? "Confirmed conforming to statutory requirement via visual packaging audit."
          : initialAction === "MARK_FOR_REVIEW"
          ? "Flagged for physical laboratory verification and metric gauge calibration."
          : ""
      );
      setNote("");
      setError(null);
    }
  }, [evaluation, initialAction]);

  if (!isOpen || !evaluation) return null;

  // Derive target officer status based on action
  let officerStatus: OfficerVerificationStatus = "CONFIRMED";
  if (action === "CORRECT") officerStatus = "CORRECTED";
  else if (action === "MARK_FOR_REVIEW") officerStatus = "REQUIRES_REVIEW";
  else if (action === "REJECT_EVIDENCE") officerStatus = "REJECTED";
  else if (action === "CONFIRM") {
    // If automated status was FAIL, confirming means the officer confirms the finding of non-compliance (or confirms compliant if pass)
    officerStatus = evaluation.status === "FAIL" ? "REJECTED" : "CONFIRMED";
  }

  const isOverride =
    (evaluation.status === "FAIL" && officerStatus === "CONFIRMED") ||
    (evaluation.status === "PASS" && officerStatus === "REJECTED") ||
    (evaluation.status === "REVIEW" && (officerStatus === "CONFIRMED" || officerStatus === "REJECTED")) ||
    officerStatus === "CORRECTED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isOverride && (!reason || reason.trim().length < 5)) {
      setError("A substantive justification reason (min 5 characters) is required when modifying automated results.");
      return;
    }

    if (action === "CORRECT" && (!newValue || newValue.trim() === "")) {
      setError("Please provide the corrected declaration value.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        action,
        officerStatus,
        reason: reason.trim(),
        note: note.trim() || undefined,
        newValue: action === "CORRECT" ? newValue.trim() : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {t("verification.recordDecision", "Record Officer Determination")}
                </h3>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  {evaluation.internalRuleId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {evaluation.statutoryReference}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Rule Requirement Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Statutory Requirement
            </span>
            <p className="text-slate-900 font-medium leading-relaxed">
              {evaluation.requirement}
            </p>
          </div>

          {/* Automated Engine Status vs Human Decision */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Automated Engine Result
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded font-bold text-[11px] uppercase inline-block",
                    evaluation.status === "PASS" && "bg-emerald-100 text-emerald-800",
                    evaluation.status === "FAIL" && "bg-red-100 text-red-800",
                    evaluation.status === "REVIEW" && "bg-amber-100 text-amber-800",
                    evaluation.status === "NOT_APPLICABLE" && "bg-slate-100 text-slate-700"
                  )}
                >
                  {evaluation.status}
                </span>
                <span className="text-[10px] text-slate-400">(Never Overwritten)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-[10px] font-bold uppercase text-blue-900 block">
                Acting Regulatory Officer
              </span>
              <div className="mt-1 font-semibold text-slate-900 truncate">
                {activeUser.name}
              </div>
              <div className="text-[10px] text-blue-700 font-mono">
                {activeUser.role} • {activeUser.badgeNumber || "BADGE-4082"}
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 text-xs">
              Officer Action:
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setAction("CONFIRM")}
                className={clsx(
                  "py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all",
                  action === "CONFIRM"
                    ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setAction("CORRECT")}
                className={clsx(
                  "py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all",
                  action === "CORRECT"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Correct
              </button>
              <button
                type="button"
                onClick={() => setAction("MARK_FOR_REVIEW")}
                className={clsx(
                  "py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all",
                  action === "MARK_FOR_REVIEW"
                    ? "bg-white text-amber-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => setAction("REJECT_EVIDENCE")}
                className={clsx(
                  "py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all",
                  action === "REJECT_EVIDENCE"
                    ? "bg-white text-red-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Reject
              </button>
            </div>
          </div>

          {/* Value Correction Input (If Correcting) */}
          {action === "CORRECT" && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 text-xs">
                  Correct Declaration Value
                </span>
                <span className="text-[10px] text-blue-800">
                  Original OCR remains stored
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Original AI Value</label>
                  <input
                    type="text"
                    readOnly
                    value={evaluation.extractedValue || "NOT DETECTED"}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-600 text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-blue-900 font-bold block mb-0.5">
                    Officer Corrected Value *
                  </label>
                  <input
                    type="text"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. ₹ 189.00"
                    className="w-full bg-white border border-blue-400 focus:ring-2 focus:ring-blue-500 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Justification Reason Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 text-xs">
                Audit Justification Reason {isOverride && <span className="text-red-500">*</span>}
              </label>
              {isOverride && (
                <span className="text-[10px] text-amber-700 font-semibold">
                  Mandatory for status/value override
                </span>
              )}
            </div>
            <textarea
              rows={2}
              required={isOverride}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State regulatory reason for this confirmation or correction..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Additional Notes Field */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 text-xs">
              Officer Notes (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Metric gauge verification verified under calibration batch DL-24"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Legal Notice */}
          <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              {locale === "hi"
                ? "सभी निर्णय गैर-प्रतिसाध्य ऑडिट ट्रेल में अपरिवर्तनीय रूप से दर्ज किए जाते हैं।"
                : "All officer verifications are appended to an immutable, cryptographically chained audit log."}
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <span>Record Officer Decision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
