"use client";

import React, { useState } from "react";
import rulesData from "@/data/legal/rules.json";
import { LegalRule } from "@/types";
import {
  Scale,
  Search,
  BookOpen,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Tag,
  Calendar,
} from "lucide-react";

export default function RulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const rules: LegalRule[] = rulesData as LegalRule[];

  const categories = [
    "ALL",
    "Mandatory Declarations",
    "Net Quantity",
    "MRP & Pricing",
    "Manufacturer & Origin",
    "Dates & Shelf Life",
    "Consumer Care",
    "Readability & Font Size",
    "Unit Sale Price",
  ];

  const filteredRules = rules.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.ruleCode.toLowerCase().includes(q) ||
      r.ruleNumber.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.prescribedRequirement.toLowerCase().includes(q);

    const matchesCat = selectedCategory === "ALL" || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
            <Scale className="size-4" />
            <span>Statutory Compliance Architecture</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Legal Metrology Rules Repository (PCR, 2011)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Deterministic rule engine definitions governing packaged commodity declarations, metric units, and font heights.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2 border border-line">
          <BookOpen className="size-4 text-navy-500" />
          <span className="text-xs font-bold text-ink">
            {rules.length} Configured Legal Rules
          </span>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="mt-6 space-y-3">
        <div className="glass flex items-center gap-2 rounded-3xl p-3">
          <Search className="size-4 text-ink-muted shrink-0 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search statutory rules by rule code, title, section, or description..."
            className="w-full bg-transparent text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted/70"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-ink text-white shadow-sm"
                  : "bg-white/70 text-ink-muted hover:bg-white hover:text-ink border border-line-soft"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="glass group flex flex-col justify-between rounded-4xl p-6 transition-all duration-300 hover:shadow-xl"
          >
            <div>
              {/* Header Badge Strip */}
              <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy-500">
                    {rule.ruleCode}
                  </span>
                  <span className="text-ink/20">|</span>
                  <span className="text-xs font-bold text-ink">{rule.ruleNumber}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    rule.severity === "HIGH"
                      ? "bg-red-500/15 text-red-700 border border-red-500/25"
                      : "bg-amber-500/15 text-amber-700 border border-amber-500/25"
                  }`}
                >
                  {rule.severity} SEVERITY
                </span>
              </div>

              <h2 className="mt-3 text-lg font-bold text-ink group-hover:text-navy-500 transition-colors">
                {rule.title}
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {rule.description}
              </p>

              {/* Prescribed Requirement Box */}
              <div className="mt-4 rounded-2xl bg-white/80 p-3.5 border border-line-soft text-xs space-y-2">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-500">
                    Prescribed Statutory Requirement:
                  </span>
                  <p className="mt-0.5 font-medium text-ink">
                    {rule.prescribedRequirement}
                  </p>
                </div>
                <div className="pt-2 border-t border-line-soft/80 flex flex-wrap items-center justify-between text-[11px]">
                  <span className="text-ink-muted">
                    Legal Source: <strong className="text-ink">{rule.legalAct}</strong>
                  </span>
                  <span className="rounded bg-navy-500/10 px-2 py-0.5 font-semibold text-navy-600 text-[10px]">
                    Prototype Configuration: PCR Engine v{rule.version}
                  </span>
                </div>
              </div>
            </div>

            {/* Rule Footer Info */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-ink-muted">
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="text-navy-500 font-bold">FLOW:</span>
                <span>Rule</span>
                <span>→</span>
                <span>Declaration</span>
                <span>→</span>
                <span>Evidence</span>
                <span>→</span>
                <span className="text-emerald-700 font-bold">Verdict</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">Rule Code: {rule.ruleCode}</span>
                <span>·</span>
                <span>Updated {rule.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Authoritative Notice */}
      <div className="mt-12 rounded-3xl bg-white/60 p-6 border border-line text-xs text-ink-muted leading-relaxed">
        <h3 className="text-sm font-bold text-ink mb-1">
          Authority &amp; Configuration Notice
        </h3>
        <p>
          These rules are structured in accordance with the Legal Metrology (Packaged Commodities) Rules, 2011 as mandated by the Ministry of Consumer Affairs, Food &amp; Public Distribution (DoCA). The deterministic rule engine evaluates OCR extractions against this central rule schema to avoid probabilistic legal decisions.
        </p>
      </div>
    </div>
  );
}
