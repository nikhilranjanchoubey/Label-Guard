"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInspection } from "@/context/InspectionContext";
import { useAuth } from "@/context/AuthContext";
import { downloadInspectionPDF, generateAndDownloadDOCX } from "@/lib/reportGenerator";
import {
  LayoutDashboard,
  Scan,
  FileCheck2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  PieChart,
} from "lucide-react";

export default function DashboardPage() {
  const { inspections } = useInspection();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Metrics computation
  const totalInspections = inspections.length;
  const compliantCount = inspections.filter((i) => i.status === "COMPLIANT").length;
  const nonCompliantCount = inspections.filter((i) => i.status === "NON_COMPLIANT").length;
  const reviewCount = inspections.filter((i) => i.status === "NEEDS_REVIEW").length;
  const complianceRate = totalInspections > 0 ? Math.round((compliantCount / totalInspections) * 100) : 0;

  // Filtered recent inspections
  const filteredInspections = inspections.filter((item) => {
    const matchesQuery =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesQuery && matchesStatus && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Officer Welcome & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
            <LayoutDashboard className="size-4" />
            <span>State Command &amp; Enforcement Centre</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Enforcement Officer Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Logged in as <strong>{user.name}</strong> ({user.designation}) · {user.jurisdiction}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inspect"
            className="btn-ink flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-md"
          >
            <Scan className="size-4 text-saffron" />
            <span>New Inspection Scan</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-sm hover:bg-slate-50"
          >
            <FileCheck2 className="size-4 text-navy-500" />
            <span>Reports Vault</span>
          </Link>
        </div>
      </div>

      {/* 5 Top Summary Metric Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Total Scans</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-navy-500/10 text-navy-500">
              <Scan className="size-4" />
            </span>
          </div>
          <span className="num mt-2 block text-3xl font-black text-ink">{totalInspections}</span>
          <span className="mt-1 block text-[11px] font-semibold text-emerald-600">
            +14% this month
          </span>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Compliant</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <span className="num mt-2 block text-3xl font-black text-emerald-600">{compliantCount}</span>
          <span className="mt-1 block text-[11px] text-ink-muted">
            {complianceRate}% rate of total
          </span>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Violations</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
              <AlertOctagon className="size-4" />
            </span>
          </div>
          <span className="num mt-2 block text-3xl font-black text-red-600">{nonCompliantCount}</span>
          <span className="mt-1 block text-[11px] font-semibold text-red-600">
            Action required
          </span>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Needs Review</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Eye className="size-4" />
            </span>
          </div>
          <span className="num mt-2 block text-3xl font-black text-amber-600">{reviewCount}</span>
          <span className="mt-1 block text-[11px] text-ink-muted">
            Visual checks pending
          </span>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Reports Generated</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <FileCheck2 className="size-4" />
            </span>
          </div>
          <span className="num mt-2 block text-3xl font-black text-ink">{totalInspections}</span>
          <span className="mt-1 block text-[11px] font-semibold text-navy-500">
            100% Digitally Sealed
          </span>
        </div>
      </div>

      {/* Analytics & Charts Row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Compliance Distribution Donut Chart */}
        <div className="glass flex flex-col rounded-4xl p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="text-sm font-bold text-ink">Compliance Distribution</h3>
            <PieChart className="size-4 text-ink-muted" />
          </div>

          <div className="relative my-auto flex items-center justify-center py-6">
            <svg viewBox="0 0 100 100" className="size-40 -rotate-90">
              {/* Compliant Slice: 60% */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#149c4a"
                strokeWidth="14"
                strokeDasharray="143 238"
                strokeDashoffset="0"
              />
              {/* Violations Slice: 20% */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#dc2626"
                strokeWidth="14"
                strokeDasharray="47 238"
                strokeDashoffset="-143"
              />
              {/* Review Slice: 20% */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="14"
                strokeDasharray="48 238"
                strokeDashoffset="-190"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="num text-2xl font-black text-ink">{complianceRate}%</span>
              <span className="text-[10px] font-bold uppercase text-ink-muted">Compliant</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-line pt-4 text-center text-xs font-semibold">
            <div>
              <span className="block text-[10px] text-emerald-600 font-bold">Compliant</span>
              <span className="num block font-bold text-ink">{compliantCount}</span>
            </div>
            <div>
              <span className="block text-[10px] text-amber-600 font-bold">Review</span>
              <span className="num block font-bold text-ink">{reviewCount}</span>
            </div>
            <div>
              <span className="block text-[10px] text-red-600 font-bold">Violations</span>
              <span className="num block font-bold text-ink">{nonCompliantCount}</span>
            </div>
          </div>
        </div>

        {/* Top Recurring Non-Compliance Issues */}
        <div className="glass flex flex-col rounded-4xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink">Top Recurring Non-Compliance Issues</h3>
              <p className="text-[11px] text-ink-muted">Frequency across inspected packaged goods</p>
            </div>
            <BarChart3 className="size-4 text-ink-muted" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              {
                rule: "Rule 6(1)(da) - MRP Over-Pricing & Pasted Stickers",
                count: 42,
                pct: 84,
                color: "bg-red-500",
              },
              {
                rule: "Rule 6(1)(e) - Missing Email ID in Consumer Care Details",
                count: 36,
                pct: 72,
                color: "bg-amber-500",
              },
              {
                rule: "Rule 7 - Font Size Below Principal Display Panel Table 1",
                count: 28,
                pct: 56,
                color: "bg-amber-500",
              },
              {
                rule: "Rule 8 - Non-Standard Metric Units ('gms', 'lit')",
                count: 19,
                pct: 38,
                color: "bg-red-500",
              },
              {
                rule: "Rule 6(11) - Unit Sale Price (USP) Omitted on Packaging",
                count: 14,
                pct: 28,
                color: "bg-navy-500",
              },
            ].map((issue, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="truncate text-ink">{issue.rule}</span>
                  <span className="font-mono text-ink font-bold">{issue.count} cases</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${issue.color}`}
                    style={{ width: `${issue.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-line text-right">
            <Link
              href="/rules"
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-500 hover:underline"
            >
              View rule definitions in repository <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Inspections Data Table */}
      <div className="mt-8 glass rounded-4xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Recent Packaged Commodity Inspections</h2>
            <p className="text-xs text-ink-muted">
              Live records from field officers and automated scanning stations
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inspections..."
                className="w-48 rounded-xl border border-line bg-white/80 py-1.5 pl-8 pr-3 text-xs text-ink outline-none focus:border-navy-500"
              />
            </div>

            {/* Status dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-line bg-white/80 px-2.5 py-1.5 text-xs font-medium text-ink outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
            </select>

            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-line bg-white/80 px-2.5 py-1.5 text-xs font-medium text-ink outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Packaged Staples & Grains">Staples &amp; Grains</option>
              <option value="Edible Oils & Fats">Edible Oils</option>
              <option value="Spices & Condiments">Spices</option>
              <option value="Bakery & Confectionery">Bakery</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold text-ink-muted">
                <th className="py-3 px-3">Inspection ID</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Brand &amp; Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Coverage</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filteredInspections.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-white/60">
                  <td className="py-3 px-3 font-mono font-bold text-navy-500">
                    <Link href={`/inspections/${row.id}`} className="hover:underline">
                      {row.id}
                    </Link>
                  </td>
                  <td className="py-3 px-3 font-semibold text-ink">
                    <div className="flex items-center gap-2">
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-slate-100 p-0.5">
                        <Image
                          src={row.images[0]?.url || "/products/atta/atta-front.jpg"}
                          alt={row.productName}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="max-w-[200px] truncate">{row.productName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ink-muted">
                    {row.brand} · {row.category}
                  </td>
                  <td className="py-3 px-3 text-ink-muted">{row.inspectionDate}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-ink">{row.coverageScore}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        row.status === "COMPLIANT"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : row.status === "NON_COMPLIANT"
                          ? "bg-red-500/15 text-red-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}
                    >
                      {row.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/inspections/${row.id}`}
                        className="rounded-lg bg-white p-1.5 text-ink shadow-sm hover:bg-slate-50"
                        title="View Full Inspection"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => downloadInspectionPDF(row)}
                        className="rounded-lg bg-white p-1.5 text-ink shadow-sm hover:bg-slate-50"
                        title="Download PDF Report"
                      >
                        <Download className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
