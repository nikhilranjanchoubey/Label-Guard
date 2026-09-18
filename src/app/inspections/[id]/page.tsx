"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useInspection } from "@/context/InspectionContext";
import { useAuth } from "@/context/AuthContext";
import { downloadInspectionPDF, generateAndDownloadDOCX } from "@/lib/reportGenerator";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  QrCode,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  ShieldCheck,
  Check,
  X,
  Clock,
  HelpCircle,
} from "lucide-react";

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getInspectionById, updateFindingAction, updateOfficerNotes } = useInspection();
  const { user, canPerformAction } = useAuth();

  const record = getInspectionById(id);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(record?.officerNotes || "");

  if (!record) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="glass rounded-4xl p-10">
          <p className="text-lg font-bold text-ink">Inspection Record Not Found</p>
          <p className="mt-1 text-xs text-ink-muted">
            The record ID <strong>{id}</strong> could not be located in the local repository.
          </p>
          <Link
            href="/inspections"
            className="btn-ink mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold"
          >
            ← Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  const handleAction = (findingId: string, action: "ACCEPTED" | "REJECTED" | "MANUAL_VERIFIED") => {
    updateFindingAction(record.id, findingId, action);
  };

  const handleSaveNotes = () => {
    updateOfficerNotes(record.id, editingNotes);
    alert("Officer remarks updated successfully.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <Link href="/inspections" className="hover:text-ink flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Inspections
        </Link>
        <span>/</span>
        <span className="font-mono text-ink">{record.id}</span>
      </div>

      {/* Main Title Banner */}
      <div className="mt-4 glass-strong flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-navy-500">
              {record.id}
            </span>
            <span className="text-ink/30">·</span>
            <span className="text-xs text-ink-muted">{record.inspectionDate}</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            {record.productName}
          </h1>
          <p className="text-xs text-ink-muted font-medium">
            {record.brand} · {record.category} · Batch Lot: {record.batchLotNumber}
          </p>
        </div>

        {/* Status and Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`rounded-2xl px-5 py-2.5 text-center ${
              record.status === "COMPLIANT"
                ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                : record.status === "NON_COMPLIANT"
                ? "bg-red-500/15 text-red-700 border border-red-500/30"
                : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider">
              Legal Status
            </span>
            <span className="block text-lg font-black tracking-tight">
              {record.status.replace("_", " ")}
            </span>
          </div>

          <button
            onClick={() => downloadInspectionPDF(record)}
            className="btn-ink flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold shadow-md"
          >
            <Download className="size-4 text-saffron" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => generateAndDownloadDOCX(record)}
            className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-xs font-bold text-ink shadow-sm hover:bg-slate-50"
          >
            <FileSpreadsheet className="size-4 text-navy-500" />
            <span>Download DOCX</span>
          </button>

          <Link
            href={`/reports/verify/${record.id}`}
            className="flex items-center gap-1.5 rounded-2xl border border-line bg-white/70 px-3.5 py-3 text-xs font-semibold text-ink hover:bg-white"
            title="Verify Digital Seal"
          >
            <QrCode className="size-4 text-slate-700" />
            <span>Verify Seal</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass rounded-3xl p-4">
          <span className="block text-xs font-bold text-ink-muted">Coverage Score</span>
          <span className="num mt-1 block text-3xl font-black text-ink">
            {record.coverageScore}%
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Statutory Rule Coverage</span>
        </div>
        <div className="glass rounded-3xl p-4">
          <span className="block text-xs font-bold text-ink-muted">Avg OCR Confidence</span>
          <span className="num mt-1 block text-3xl font-black text-ink">
            {record.ocrConfidenceAvg}%
          </span>
          <span className="text-[11px] text-navy-500 font-semibold">High Fidelity Extraction</span>
        </div>
        <div className="glass rounded-3xl p-4">
          <span className="block text-xs font-bold text-ink-muted">Inspecting Officer</span>
          <span className="mt-1 block truncate text-base font-bold text-ink">
            {record.officerName}
          </span>
          <span className="text-[11px] text-ink-muted">{record.jurisdiction}</span>
        </div>
        <div className="glass rounded-3xl p-4">
          <span className="block text-xs font-bold text-ink-muted">Rule-Set Active</span>
          <span className="font-mono mt-1 block text-base font-bold text-ink">
            {record.ruleSetVersion}
          </span>
          <span className="text-[11px] text-ink-muted">PCR 2011 Table 1</span>
        </div>
      </div>

      {/* Visualizer & Declarations Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Left: Interactive Label Visualizer */}
        <div className="glass flex flex-col rounded-4xl p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink">Computer Vision Label Visualizer</h3>
              <p className="text-[11px] text-ink-muted">
                Overlay bounding coordinates &amp; declaration pinpoints
              </p>
            </div>
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 rounded-full border border-line bg-white/70 p-1">
              <button
                onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
                className="rounded-full p-1 text-ink hover:bg-white"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="px-1 font-mono text-[10px] font-bold text-ink">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(1.8, zoomLevel + 0.2))}
                className="rounded-full p-1 text-ink hover:bg-white"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="rounded-full p-1 text-ink hover:bg-white"
                title="Reset Zoom"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="relative mt-4 flex min-h-[480px] w-full items-center justify-center overflow-hidden rounded-3xl bg-slate-100/60 p-4 border border-line">
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                width: "380px",
                height: "475px",
              }}
            >
              <Image
                src={record.images[0]?.url || "/products/atta/atta-front.jpg"}
                alt="Package Scan"
                fill
                className="object-contain"
              />

              {record.findings.map((f) => {
                if (!f.bbox) return null;
                const isSelected = selectedFieldId === f.id;
                const colorClass =
                  f.status === "COMPLIANT"
                    ? "border-emerald-500 bg-emerald-500/15"
                    : f.status === "NON_COMPLIANT"
                    ? "border-red-500 bg-red-500/25 animate-pulse"
                    : f.status === "WARNING"
                    ? "border-amber-500 bg-amber-500/20"
                    : "border-indigo-500 bg-indigo-500/20";

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`absolute cursor-pointer rounded border-2 transition-all duration-200 ${colorClass} ${
                      isSelected ? "ring-4 ring-navy-500 z-30" : "z-10 hover:z-20"
                    }`}
                    style={{
                      left: `${f.bbox.x}%`,
                      top: `${f.bbox.y}%`,
                      width: `${f.bbox.width}%`,
                      height: `${f.bbox.height}%`,
                    }}
                  >
                    <span className="absolute -top-4 left-0 rounded bg-ink px-1 py-0.2 font-mono text-[8px] font-bold text-white shadow">
                      {f.fieldLabel.split(" ")[0]} ({Math.round(f.confidence * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-ink-muted">
            <span>{record.images.length} Image(s) Attached to Inspection</span>
            <span>Digital Audit Hash: {record.digitalSignatureHash.slice(0, 16)}...</span>
          </div>
        </div>

        {/* Right: Detailed Declarations Table with Officer Action Options */}
        <div className="space-y-6">
          <div className="glass flex flex-col rounded-4xl p-6">
            <div className="border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink">Mandatory Declaration Findings</h3>
              <p className="text-xs text-ink-muted">
                Inspect findings, override if necessary, or confirm statutory notices
              </p>
            </div>

            <div className="mt-4 divide-y divide-line-soft">
              {record.findings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  className={`cursor-pointer p-4 rounded-2xl transition-colors ${
                    selectedFieldId === f.id ? "bg-navy-500/10 ring-1 ring-navy-500" : "hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-ink">{f.fieldLabel}</span>
                      <span className="ml-2 font-mono text-[10px] text-navy-500">
                        [{f.ruleReference}]
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-muted font-bold">
                        {Math.round(f.confidence * 100)}%
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          f.status === "COMPLIANT"
                            ? "bg-emerald-500/15 text-emerald-700"
                            : f.status === "NON_COMPLIANT"
                            ? "bg-red-500/15 text-red-700"
                            : "bg-amber-500/15 text-amber-700"
                        }`}
                      >
                        {f.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-ink border border-line-soft">
                    <span className="text-[10px] font-bold uppercase text-ink-muted block">
                      Evidence Snippet:
                    </span>
                    {f.extractedValue}
                  </div>

                  {f.remarks && (
                    <p className="mt-2 text-[11px] text-ink-muted">
                      <strong className="text-ink">Observation:</strong> {f.remarks}
                    </p>
                  )}

                  {/* Officer Action Bar */}
                  <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2 text-[11px]">
                    <span className="text-ink-muted font-medium">
                      Action Status: <strong className="text-ink">{f.officerAction || "PENDING"}</strong>
                    </span>

                    {canPerformAction("APPROVE_VIOLATION") && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(f.id, "ACCEPTED");
                          }}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                            f.officerAction === "ACCEPTED"
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-ink border border-line hover:bg-emerald-50"
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(f.id, "REJECTED");
                          }}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                            f.officerAction === "REJECTED"
                              ? "bg-red-600 text-white"
                              : "bg-white text-ink border border-line hover:bg-red-50"
                          }`}
                        >
                          Reject
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(f.id, "MANUAL_VERIFIED");
                          }}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                            f.officerAction === "MANUAL_VERIFIED"
                              ? "bg-navy-500 text-white"
                              : "bg-white text-ink border border-line hover:bg-navy-50"
                          }`}
                        >
                          Manual Verified
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Notes Editor */}
          <div className="glass rounded-4xl p-6">
            <h3 className="text-sm font-bold text-ink">Official Observations &amp; Statutory Directives</h3>
            <textarea
              rows={3}
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-line bg-white p-3 text-xs text-ink outline-none focus:border-navy-500"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="btn-ink rounded-xl px-4 py-1.5 text-xs font-bold"
              >
                Update Remarks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
