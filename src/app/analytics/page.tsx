"use client";

import React, { useState } from "react";
import { useInspection } from "@/context/InspectionContext";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Scan,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function AnalyticsPage() {
  const { inspections } = useInspection();
  const [timeRange, setTimeRange] = useState<"30D" | "90D" | "1Y">("30D");

  // Monthly trends data
  const monthlyTrends = [
    { month: "Jan", total: 420, compliant: 385, violations: 35 },
    { month: "Feb", total: 510, compliant: 460, violations: 50 },
    { month: "Mar", total: 680, compliant: 590, violations: 90 },
    { month: "Apr", total: 790, compliant: 710, violations: 80 },
    { month: "May", total: 950, compliant: 875, violations: 75 },
    { month: "Jun", total: 1120, compliant: 1040, violations: 80 },
  ];

  const maxTotal = Math.max(...monthlyTrends.map((d) => d.total));

  // Category compliance breakdown
  const categoryStats = [
    { category: "Packaged Staples & Grains", total: 480, complianceRate: 94 },
    { category: "Edible Oils & Fats", total: 320, complianceRate: 78 },
    { category: "Spices & Condiments", total: 290, complianceRate: 83 },
    { category: "Bakery & Confectionery", total: 240, complianceRate: 88 },
    { category: "Cosmetics & Personal Care", total: 180, complianceRate: 72 },
  ];

  // OCR confidence buckets
  const ocrBuckets = [
    { label: "95% - 100% (High)", count: 742, pct: 62, color: "bg-emerald-500" },
    { label: "85% - 94% (Good)", count: 310, pct: 26, color: "bg-navy-500" },
    { label: "70% - 84% (Adequate)", count: 96, pct: 8, color: "bg-amber-500" },
    { label: "< 70% (Manual Check)", count: 48, pct: 4, color: "bg-red-500" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
            <TrendingUp className="size-4" />
            <span>Inspection Intelligence</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Inspection Analytics &amp; Violation Trends
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Aggregated metrics on declaration violations, OCR confidence, and commodity categories under PCR 2011 · SIH 2026 Prototype.
          </p>
        </div>

        {/* Prototype Dataset Notice */}
        <div className="rounded-full bg-navy-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-navy-500 border border-navy-500/20">
          Prototype Demonstration Metrics (Sample Dataset)
        </div>
      </div>

      {/* 4 Summary Score Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass rounded-3xl p-5">
          <span className="text-xs font-bold text-ink-muted">Test Packages Inspected</span>
          <span className="num mt-1 block text-3xl font-black text-ink">128</span>
          <span className="mt-1 block text-[11px] font-semibold text-emerald-600">
            Prototype demonstration cohort
          </span>
        </div>
        <div className="glass rounded-3xl p-5">
          <span className="text-xs font-bold text-ink-muted">Sample Dataset Compliance</span>
          <span className="num mt-1 block text-3xl font-black text-emerald-600">87.5%</span>
          <span className="mt-1 block text-[11px] text-ink-muted">Across tested FMCG categories</span>
        </div>
        <div className="glass rounded-3xl p-5">
          <span className="text-xs font-bold text-ink-muted">Configured Violations Flagged</span>
          <span className="num mt-1 block text-3xl font-black text-red-600">16</span>
          <span className="mt-1 block text-[11px] text-red-600 font-semibold">Flagged for officer review</span>
        </div>
        <div className="glass rounded-3xl p-5">
          <span className="text-xs font-bold text-ink-muted">Mean OCR Extraction Rate</span>
          <span className="num mt-1 block text-3xl font-black text-navy-500">94.8%</span>
          <span className="mt-1 block text-[11px] text-ink-muted">Average token confidence</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Inspection Volume Trends Chart */}
        <div className="glass flex flex-col rounded-4xl p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink">Inspection Volume &amp; Violation Trends</h3>
              <p className="text-[11px] text-ink-muted">Monthly packaging inspections vs detected violations</p>
            </div>
            <BarChart3 className="size-4 text-ink-muted" />
          </div>

          <div className="mt-6 flex h-64 items-end gap-4 pt-6 pb-2 px-2">
            {monthlyTrends.map((d, i) => {
              const heightPct = Math.round((d.total / maxTotal) * 100);
              const violationPct = Math.round((d.violations / d.total) * 100);

              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <div className="relative w-full flex items-end justify-center h-full">
                    {/* Total bar */}
                    <div
                      className="w-full max-w-[36px] rounded-t-xl bg-navy-500/20 relative group transition-all duration-300 hover:bg-navy-500/30"
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Violation sub-bar at top */}
                      <div
                        className="w-full rounded-t-xl bg-red-500 transition-all"
                        style={{ height: `${Math.max(12, violationPct * 2)}%` }}
                        title={`${d.violations} violations`}
                      />

                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 font-mono text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
                        {d.total} scans ({d.violations} viol.)
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-ink-muted">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 border-t border-line pt-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-navy-500/30" /> Inspected Volume
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-red-500" /> Violations Flagged
            </span>
          </div>
        </div>

        {/* Commodity Category Compliance Rates */}
        <div className="glass flex flex-col rounded-4xl p-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink">Compliance Rate by Commodity Category</h3>
              <p className="text-[11px] text-ink-muted">Percentage adherence to mandatory PCR 2011 declarations</p>
            </div>
            <PieChart className="size-4 text-ink-muted" />
          </div>

          <div className="mt-6 space-y-4 my-auto">
            {categoryStats.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-ink">{cat.category}</span>
                  <span className="font-mono text-ink font-bold">{cat.complianceRate}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.complianceRate >= 90
                        ? "bg-emerald-500"
                        : cat.complianceRate >= 80
                        ? "bg-navy-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${cat.complianceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-line pt-3 text-[11px] text-ink-muted">
            Edible oils &amp; personal care packages record lowest compliance due to sticker alterations &amp; omitted email IDs.
          </div>
        </div>
      </div>

      {/* OCR Confidence Distribution Row */}
      <div className="mt-8 glass rounded-4xl p-6">
        <h3 className="text-sm font-bold text-ink">Optical Character Recognition (OCR) Accuracy Distribution</h3>
        <p className="text-xs text-ink-muted">Performance matrix of multi-scale text recognition on curved and flexible labels</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ocrBuckets.map((b, i) => (
            <div key={i} className="rounded-2xl bg-white/70 p-4 border border-line">
              <span className="block text-xs font-bold text-ink-muted">{b.label}</span>
              <span className="num mt-1 block text-2xl font-black text-ink">{b.count} Scans</span>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
              </div>
              <span className="mt-1 block text-[10px] text-ink-muted font-mono">{b.pct}% of total scans</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
