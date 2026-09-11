"use client";

import React, { useState } from "react";
import { AuditTrail, AuditEvent } from "@/lib/audit/types";
import { useTranslation } from "@/lib/i18n";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Hash,
  User,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";

interface AuditTrailModalProps {
  isOpen: boolean;
  trail: AuditTrail | null;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, trail, onClose }) => {
  const { t } = useTranslation();
  const [filterAction, setFilterAction] = useState<string>("ALL");

  if (!isOpen || !trail) return null;

  const events = trail.events || [];
  const filteredEvents =
    filterAction === "ALL"
      ? [...events].reverse()
      : [...events].filter((e) => e.action === filterAction).reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {t("audit.title", "Immutable Audit Trail & Chain of Custody")}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  SHA-256 Chained
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Inspection ID: {trail.inspectionId} • {events.length} Total Events
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

        {/* Cryptographic Integrity Banner */}
        <div className="px-6 py-2.5 bg-slate-900 text-slate-300 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">Chain Head Hash:</span>
            <span className="text-emerald-300 text-[11px] truncate max-w-xs font-bold">
              {trail.currentHash}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                trail.isTamperEvident
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-red-950 text-red-300 border border-red-800"
              )}
            >
              {trail.isTamperEvident ? "Integrity Verified" : "Chain Broken"}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-semibold text-[11px]">Filter Action:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Events ({events.length})</option>
              <option value="OFFICER_VERIFIED">Officer Verified</option>
              <option value="RESULT_CHANGED">Result Changed</option>
              <option value="VALUE_CORRECTED">Value Corrected</option>
              <option value="SUPERVISOR_SIGNOFF">Supervisor Signoff</option>
              <option value="COMPLIANCE_EVALUATED">Compliance Evaluated</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500">
            Displaying {filteredEvents.length} events (reverse chronological)
          </span>
        </div>

        {/* Events Timeline */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs bg-slate-50/50">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No audit events found matching the selected filter.
            </div>
          ) : (
            filteredEvents.map((ev: AuditEvent) => {
              const isOfficer = ev.user.role === "OFFICER";
              const isSupervisor = ev.user.role === "SUPERVISOR";
              const isSystem = ev.user.id.startsWith("SYS");

              return (
                <div
                  key={ev.eventId}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {ev.eventId}
                      </span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase",
                          ev.action === "OFFICER_VERIFIED" && "bg-emerald-100 text-emerald-800",
                          ev.action === "RESULT_CHANGED" && "bg-amber-100 text-amber-800",
                          ev.action === "VALUE_CORRECTED" && "bg-blue-100 text-blue-800",
                          ev.action === "SUPERVISOR_SIGNOFF" && "bg-purple-100 text-purple-800",
                          ev.action === "COMPLIANCE_EVALUATED" && "bg-slate-100 text-slate-800"
                        )}
                      >
                        {ev.action.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actor Details & Entity */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{ev.user.name}</strong>
                      <span
                        className={clsx(
                          "px-1.5 py-0.2 rounded text-[9px] font-bold font-mono",
                          isOfficer && "bg-blue-50 text-blue-700",
                          isSupervisor && "bg-purple-50 text-purple-700",
                          isSystem && "bg-slate-100 text-slate-600"
                        )}
                      >
                        {ev.user.role}
                      </span>
                      {ev.user.badgeNumber && (
                        <span className="text-slate-400 font-mono">({ev.user.badgeNumber})</span>
                      )}
                    </div>

                    <div className="text-slate-600 font-medium">
                      Target: <span className="font-mono text-slate-900">{ev.entity.name || ev.entity.id}</span>
                    </div>
                  </div>

                  {/* Justification Reason */}
                  {ev.reason && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-150 text-[11px] leading-relaxed">
                      <strong className="text-slate-900 block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Justification Reason:
                      </strong>
                      {ev.reason}
                    </div>
                  )}

                  {/* State Change Details */}
                  {ev.newState !== undefined && ev.newState !== null && (
                    <div className="text-[10px] text-slate-500 font-mono bg-slate-900 text-slate-300 p-2 rounded-lg overflow-x-auto">
                      <span className="text-slate-400 block mb-1">State Mutation:</span>
                      {JSON.stringify(ev.newState)}
                    </div>
                  )}

                  {/* Cryptographic Proof Hash */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span className="truncate max-w-sm">Prev: {ev.previousHash.substring(0, 16)}...</span>
                    <span className="text-emerald-700 font-bold truncate max-w-sm">
                      Hash: {ev.hash.substring(0, 24)}...
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Append-only legal log maintained pursuant to Rule 28 of PCR 2011.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
