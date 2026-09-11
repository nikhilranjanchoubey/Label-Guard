"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { DeclarationField } from "@/lib/declarations/types";
import { Button } from "@/components/ui/Button";
import {
  X,
  Edit3,
  History,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

interface ManualCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: DeclarationField | null;
  onSave: (
    fieldId: string,
    correctedValue: string,
    officerName: string,
    reason: string
  ) => void;
}

export const ManualCorrectionModal: React.FC<ManualCorrectionModalProps> = ({
  isOpen,
  onClose,
  field,
  onSave,
}) => {
  const { t } = useTranslation();

  const [correctedValue, setCorrectedValue] = useState<string>("");
  const [officerName, setOfficerName] = useState<string>("Insp. S. Sharma (Badge #LM-4089)");
  const [reason, setReason] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    if (field) {
      setCorrectedValue(field.normalizedValue || field.rawText || "");
      if (field.status === "AMBIGUOUS" && field.possibleInterpretation) {
        setReason(`Resolved character ambiguity (suggested: ${field.possibleInterpretation})`);
      } else {
        setReason("");
      }
      setShowHistory(false);
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedValue.trim()) return;
    onSave(
      field.id,
      correctedValue.trim(),
      officerName.trim() || "Authorized Inspector",
      reason.trim() || "Manual inspection verification"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-semibold">
                {t("declarations.manual_correction", "Manual Declaration Correction")}
              </h3>
              <p className="text-xs text-slate-400">
                {t(field.labelKey, field.fieldType)} • {field.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ambiguity Alert Banner */}
          {field.status === "AMBIGUOUS" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold">OCR Ambiguity Detected:</span> The raw text
                contains unclear or confusable characters.
                {field.possibleInterpretation && (
                  <div className="mt-1 flex items-center justify-between">
                    <span>
                      Suggested interpretation:{" "}
                      <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded">
                        {field.possibleInterpretation}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCorrectedValue(field.possibleInterpretation!)}
                      className="text-[11px] bg-amber-600 text-white px-2 py-0.5 rounded hover:bg-amber-700 transition"
                    >
                      Apply Suggested
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Original Packaging Raw Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Raw Packaging Text (Evidence)
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 break-words">
              {field.rawText || <span className="italic text-slate-400">No raw text detected</span>}
            </div>
          </div>

          {/* Corrected Normalized Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Corrected / Verified Value <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter verified label declaration..."
            />
          </div>

          {/* Officer Identity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspector / Officer ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Justification / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correction Reason & Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Visual verification on package confirms zero instead of letter O..."
            />
          </div>

          {/* Audit Trail Toggle */}
          {field.auditTrail && field.auditTrail.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                {showHistory ? "Hide Previous Audit Records" : `View ${field.auditTrail.length} Previous Edit(s)`}
              </button>

              {showHistory && (
                <div className="mt-2 space-y-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {field.auditTrail.map((entry, idx) => (
                    <div key={idx} className="text-[11px] text-slate-600 border-b border-slate-200 last:border-b-0 pb-1.5 mb-1.5">
                      <div className="flex justify-between font-medium text-slate-800">
                        <span>{entry.editedBy}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.editedAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        &quot;{entry.originalValue}&quot; → <strong className="text-emerald-700">&quot;{entry.editedValue}&quot;</strong>
                      </div>
                      <div className="text-slate-500 italic mt-0.5">Reason: {entry.editReason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {t("common.save", "Save & Record Audit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
