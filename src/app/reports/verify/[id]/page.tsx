"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useInspection } from "@/context/InspectionContext";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  FileCheck2,
  Lock,
} from "lucide-react";

export default function ReportVerifyPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getInspectionById } = useInspection();

  const record = getInspectionById(id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <Link href="/reports" className="hover:text-ink flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Reports Vault
        </Link>
      </div>

      <div className="glass-strong rounded-4xl p-6 sm:p-10 shadow-xl border border-white">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-navy-500">
                PROTOTYPE DIGITAL SEAL VERIFICATION
              </span>
              <h1 className="text-xl font-black tracking-tight text-ink">
                Report Authenticity Record
              </h1>
            </div>
          </div>

          <span className="rounded-full bg-navy-500/10 px-3 py-1 font-mono text-[10px] font-bold text-navy-500">
            DoCA · SIH 26034
          </span>
        </div>

        {record ? (
          <div className="mt-6 space-y-6">
            {/* Status Alert Banner */}
            <div
              className={`flex items-center gap-3 rounded-2xl p-4 ${
                record.status === "COMPLIANT"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : record.status === "NON_COMPLIANT"
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {record.status === "COMPLIANT" && <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />}
              {record.status === "NON_COMPLIANT" && <AlertOctagon className="size-6 text-red-600 shrink-0" />}
              {record.status === "NEEDS_REVIEW" && <AlertTriangle className="size-6 text-amber-600 shrink-0" />}

              <div>
                <p className="text-sm font-bold">
                  Inspection Record Authenticated: {record.status.replace("_", " ")}
                </p>
                <p className="text-xs opacity-80">
                  This report corresponds to genuine inspection data catalogued in the Label Guard local prototype repository.
                </p>
              </div>
            </div>

            {/* Audit Details */}
            <div className="divide-y divide-line-soft rounded-2xl bg-white/70 p-4 border border-line text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Inspection ID:</span>
                <span className="font-mono font-bold text-ink">{record.id}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Product / Commodity:</span>
                <span className="font-bold text-ink">{record.productName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Brand &amp; Category:</span>
                <span className="text-ink font-semibold">{record.brand} ({record.category})</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Batch / Lot Number:</span>
                <span className="font-mono text-ink">{record.batchLotNumber}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Inspection Timestamp:</span>
                <span className="text-ink">{record.inspectionDate}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Inspecting Authority:</span>
                <span className="text-ink font-bold">{record.officerName} ({record.officerId})</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-ink-muted">Statutory Rule Engine:</span>
                <span className="font-mono text-ink">{record.ruleSetVersion}</span>
              </div>
              <div className="py-2.5 flex flex-col gap-1">
                <span className="text-ink-muted">Digital Hash (SHA-256):</span>
                <span className="font-mono text-[11px] text-slate-600 break-all bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {record.digitalSignatureHash}
                </span>
              </div>
            </div>

            {/* Disclaimer pill */}
            <div className="rounded-2xl bg-slate-100 p-4 text-[11px] leading-relaxed text-ink-muted">
              <strong>Prototype Verification Notice:</strong> This digital verification page demonstrates how QR seals printed on packaged commodity inspection notices can be scanned by traders or judicial authorities to verify certificate authenticity. It is part of the Smart India Hackathon 2026 prototype (Problem 26034).
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/inspections/${record.id}`}
                className="btn-ink inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold"
              >
                <FileCheck2 className="size-4" />
                <span>View Full Inspection Audit</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-ink-muted">
            <p className="text-base font-bold text-ink">Record Not Found</p>
            <p className="mt-1">No certificate or inspection record matches ID: {id}</p>
          </div>
        )}
      </div>
    </div>
  );
}
