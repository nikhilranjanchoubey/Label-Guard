"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useInspection } from "@/context/InspectionContext";
import { downloadInspectionPDF, generateAndDownloadDOCX } from "@/lib/reportGenerator";
import {
  Search,
  Filter,
  Eye,
  Download,
  FileSpreadsheet,
  QrCode,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Scan,
  RotateCcw,
} from "lucide-react";
import { Suspense } from "react";

function InspectionsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { inspections, resetToDefaults } = useInspection();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const filtered = inspections.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.id.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.batchLotNumber.toLowerCase().includes(q) ||
      item.officerName.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Inspection History &amp; Audit Trail
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Permanent audit trail of packaged commodities inspected under Legal Metrology Rules, 2011 · SIH 2026 Prototype.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inspect"
            className="btn-ink flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-md"
          >
            <Scan className="size-4 text-saffron" />
            <span>New Inspection</span>
          </Link>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2.5 text-xs font-medium text-ink hover:bg-slate-50"
            title="Reset to sample dataset"
          >
            <RotateCcw className="size-3.5 text-ink-muted" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-3">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <Search className="size-4 text-ink-muted shrink-0 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Inspection ID, Product Name, Brand, Batch Lot, Officer..."
            className="w-full bg-transparent text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted/70"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-ink outline-none"
          >
            <option value="ALL">All Compliance Statuses</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-ink outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Packaged Staples & Grains">Staples &amp; Grains</option>
            <option value="Edible Oils & Fats">Edible Oils</option>
            <option value="Spices & Condiments">Spices</option>
            <option value="Bakery & Confectionery">Bakery</option>
          </select>
        </div>
      </div>

      {/* Inspections Grid Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((record) => {
          const statusBadge =
            record.status === "COMPLIANT"
              ? { label: "COMPLIANT", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" }
              : record.status === "NON_COMPLIANT"
              ? { label: "NON-COMPLIANT", color: "bg-red-500/15 text-red-700 border-red-500/30" }
              : { label: "NEEDS REVIEW", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" };

          return (
            <div
              key={record.id}
              className="glass group flex flex-col justify-between overflow-hidden rounded-3xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Header ID & Status */}
                <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
                  <span className="font-mono text-[11px] font-bold text-navy-500">
                    {record.id}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Product Thumbnail & Name */}
                <div className="mt-3 flex items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 p-1 border border-line">
                    <Image
                      src={record.images[0]?.url || "/products/atta/atta-front.jpg"}
                      alt={record.productName}
                      fill
                      className="object-contain"
                    />

                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold text-ink">
                      {record.productName}
                    </h3>
                    <p className="text-[11px] text-ink-muted">
                      {record.brand} · {record.category}
                    </p>
                    <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                      Lot: {record.batchLotNumber}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-2 text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-ink-muted">Coverage</span>
                    <span className="font-mono font-bold text-ink">{record.coverageScore}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-ink-muted">OCR Conf.</span>
                    <span className="font-mono font-bold text-ink">{record.ocrConfidenceAvg}%</span>
                  </div>
                </div>

                <p className="mt-2.5 line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
                  {record.officerNotes}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <Link
                  href={`/inspections/${record.id}`}
                  className="font-bold text-navy-500 hover:underline inline-flex items-center gap-1"
                >
                  <Eye className="size-3.5" /> Details
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadInspectionPDF(record)}
                    className="rounded-lg bg-white p-1.5 text-ink shadow-sm hover:bg-slate-100"
                    title="Download Official PDF"
                  >
                    <Download className="size-3.5" />
                  </button>
                  <button
                    onClick={() => generateAndDownloadDOCX(record)}
                    className="rounded-lg bg-white p-1.5 text-ink shadow-sm hover:bg-slate-100"
                    title="Download Editable DOCX"
                  >
                    <FileSpreadsheet className="size-3.5 text-navy-500" />
                  </button>
                  <Link
                    href={`/reports/verify/${record.id}`}
                    className="rounded-lg bg-white p-1.5 text-ink shadow-sm hover:bg-slate-100"
                    title="Verify Digital Seal"
                  >
                    <QrCode className="size-3.5 text-slate-600" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
        <div className="glass mt-8 rounded-4xl p-12 text-center">
          <p className="text-base font-bold text-ink">No inspections match your search criteria</p>
          <p className="mt-1 text-xs text-ink-muted">
            Try resetting your filters or search for another term like &quot;Atta&quot;, &quot;Oil&quot;, or &quot;Turmeric&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("ALL");
              setSelectedCategory("ALL");
            }}
            className="btn-ink mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-line bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-mono text-ink">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-line bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function InspectionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-muted">Loading repository...</div>}>
      <InspectionsContent />
    </Suspense>
  );
}
