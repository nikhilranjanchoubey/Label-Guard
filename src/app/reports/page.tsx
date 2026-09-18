"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useInspection } from "@/context/InspectionContext";
import { downloadInspectionPDF, generateAndDownloadDOCX } from "@/lib/reportGenerator";
import { InspectionRecord } from "@/types";
import {
  FileCheck2,
  Download,
  FileSpreadsheet,
  QrCode,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Printer,
  ShieldCheck,
} from "lucide-react";

export default function ReportsPage() {
  const { inspections } = useInspection();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<InspectionRecord | null>(null);

  const filtered = inspections.filter(
    (i) =>
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.officerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
            <FileCheck2 className="size-4" />
            <span>Digital Evidence Archive</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Compliance Reports Vault
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Generated packaged commodity compliance inspection summaries available in A4 PDF and editable DOCX formats · SIH 2026 Prototype.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2 border border-line">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span className="text-xs font-bold text-ink">
            {inspections.length} Digitally Signed Reports
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 glass flex items-center gap-2 rounded-3xl p-3">
        <Search className="size-4 text-ink-muted shrink-0 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter reports by report ID, product name, brand, or officer..."
          className="w-full bg-transparent text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted/70"
        />
      </div>

      {/* Reports Table */}
      <div className="mt-6 glass rounded-4xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold text-ink-muted">
                <th className="py-3 px-3">Report ID</th>
                <th className="py-3 px-3">Inspection Ref</th>
                <th className="py-3 px-3">Packaged Commodity</th>
                <th className="py-3 px-3">Date &amp; Time</th>
                <th className="py-3 px-3">Officer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Downloads &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-ink">
                    REP-{record.id.slice(3)}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-navy-500">
                    <Link href={`/inspections/${record.id}`} className="hover:underline">
                      {record.id}
                    </Link>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="block font-bold text-ink">{record.productName}</span>
                    <span className="block text-[11px] text-ink-muted">
                      {record.brand} · Lot: {record.batchLotNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-ink-muted">{record.inspectionDate}</td>
                  <td className="py-3.5 px-3 text-ink font-medium">{record.officerName}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        record.status === "COMPLIANT"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : record.status === "NON_COMPLIANT"
                          ? "bg-red-500/15 text-red-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}
                    >
                      {record.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedRecordForPreview(record)}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-slate-50 inline-flex items-center gap-1"
                        title="Preview A4 Report Modal"
                      >
                        <Eye className="size-3 text-navy-500" /> Preview
                      </button>

                      <button
                        onClick={() => downloadInspectionPDF(record)}
                        className="btn-ink rounded-lg px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1"
                        title="Download Real PDF"
                      >
                        <Download className="size-3 text-saffron" /> PDF
                      </button>

                      <button
                        onClick={() => generateAndDownloadDOCX(record)}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-slate-50 inline-flex items-center gap-1"
                        title="Download Editable DOCX"
                      >
                        <FileSpreadsheet className="size-3 text-emerald-600" /> DOCX
                      </button>

                      <Link
                        href={`/reports/verify/${record.id}`}
                        className="rounded-lg border border-line bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                        title="Verify Report QR Seal"
                      >
                        <QrCode className="size-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* A4 Report Interactive Preview Modal */}
      {selectedRecordForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-4xl p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-navy-500">
                  A4 REPORT PREVIEW: {selectedRecordForPreview.id}
                </span>
                <h3 className="text-lg font-black text-ink">
                  {selectedRecordForPreview.productName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInspectionPDF(selectedRecordForPreview)}
                  className="btn-ink inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
                >
                  <Download className="size-3.5 text-saffron" /> Download PDF
                </button>
                <button
                  onClick={() => setSelectedRecordForPreview(null)}
                  className="rounded-full p-2 text-ink-muted hover:bg-white hover:text-ink"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* A4 Document Simulation Box */}
            <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-inner text-ink">
              {/* Document Header */}
              <div className="border-b-2 border-navy-900 pb-3 text-center">
                <span className="tricolor-rule mx-auto block h-1 w-24 rounded-full mb-2"></span>
                <p className="text-xs font-bold tracking-wider text-navy-900 uppercase">
                  DEPARTMENT OF CONSUMER AFFAIRS (DoCA) · GOVERNMENT OF INDIA
                </p>
                <h4 className="text-base font-extrabold text-ink mt-0.5">
                  LEGAL METROLOGY (PACKAGED COMMODITIES) INSPECTION REPORT
                </h4>
                <p className="text-[10px] text-ink-muted">
                  Under the Legal Metrology Act, 2009 &amp; Packaged Commodities Rules, 2011 · SIH ID: 26034
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-[11px]">
                <div>
                  <p><strong>Inspection ID:</strong> {selectedRecordForPreview.id}</p>
                  <p><strong>Date &amp; Time:</strong> {selectedRecordForPreview.inspectionDate}</p>
                  <p><strong>Officer:</strong> {selectedRecordForPreview.officerName}</p>
                  <p><strong>Jurisdiction:</strong> {selectedRecordForPreview.jurisdiction}</p>
                </div>
                <div>
                  <p><strong>Commodity:</strong> {selectedRecordForPreview.productName}</p>
                  <p><strong>Brand / Category:</strong> {selectedRecordForPreview.brand} | {selectedRecordForPreview.category}</p>
                  <p><strong>Batch / Lot No:</strong> {selectedRecordForPreview.batchLotNumber}</p>
                  <p>
                    <strong>Compliance Status:</strong>{" "}
                    <span className="font-bold text-navy-500">
                      {selectedRecordForPreview.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Table of declarations */}
              <div className="mt-4">
                <h5 className="text-xs font-bold text-navy-900 mb-2">
                  Mandatory Declarations Evaluation (PCR 2011):
                </h5>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-1.5 border">#</th>
                      <th className="p-1.5 border">Declaration</th>
                      <th className="p-1.5 border">Extracted Value</th>
                      <th className="p-1.5 border">Status</th>
                      <th className="p-1.5 border">Rule Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecordForPreview.findings.map((f, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-1.5 border font-mono text-center">{i + 1}</td>
                        <td className="p-1.5 border font-semibold">{f.fieldLabel}</td>
                        <td className="p-1.5 border">{f.extractedValue}</td>
                        <td className="p-1.5 border font-bold">
                          <span
                            className={
                              f.status === "COMPLIANT"
                                ? "text-emerald-700"
                                : f.status === "NON_COMPLIANT"
                                ? "text-red-700"
                                : "text-amber-700"
                            }
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="p-1.5 border font-mono">{f.ruleReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Officer Notes */}
              <div className="mt-4 rounded-lg bg-slate-50 p-2.5 text-[11px]">
                <strong>Officer Observations &amp; Statutory Directives:</strong>
                <p className="mt-1 text-slate-700">{selectedRecordForPreview.officerNotes}</p>
              </div>

              {/* Signature Block */}
              <div className="mt-6 pt-3 border-t flex items-center justify-between text-[10px] text-slate-500">
                <div>
                  <p><strong>Digital Audit Hash:</strong></p>
                  <p className="font-mono">{selectedRecordForPreview.digitalSignatureHash}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{selectedRecordForPreview.officerName}</p>
                  <p>Legal Metrology Enforcement Authority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
