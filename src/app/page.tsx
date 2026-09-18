"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Scan,
  LayoutDashboard,
  Search,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Scale,
  Sparkles,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  Megaphone,
  QrCode,
  Building2,
  Users,
  Eye,
  Sliders,
  Check,
  Cpu,
  AlertOctagon,
  FileCheck2,
} from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"atta" | "tea" | "oil">("atta");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/inspections?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleTrySearch = (term: string) => {
    setSearchQuery(term);
    router.push(`/inspections?q=${encodeURIComponent(term)}`);
  };

  const packageVisuals = {
    atta: {
      image: "/products/atta/atta-front.jpg",
      name: "Superior Sharbati Atta 5kg",
      brand: "Aashirvaad",
      caseTag: "CASE A",
      caseLabel: "Wheat Flour",
      status: "COMPLIANT",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-300",
      coverage: "100%",
      ocrConf: "98%",
      inspectQuery: "case=compliant",
      highlights: [
        { label: "MRP", value: "₹285.00 · 98% (Pass)", box: "top-[48%] right-[8%]" },
        { label: "Net Qty", value: "5 kg · 97% (Pass)", box: "top-[48%] left-[8%]" },
        { label: "Packer", value: "ITC Limited · 98% (Pass)", box: "bottom-[12%] left-[8%]" },
      ],
    },
    tea: {
      image: "/products/tea/tea-front.jpg",
      name: "Herbal Green Tea 250g",
      brand: "Organic India",
      caseTag: "CASE B",
      caseLabel: "Tea",
      status: "NEEDS REVIEW",
      statusColor: "text-amber-800 bg-amber-50 border-amber-300",
      coverage: "82%",
      ocrConf: "78%",
      inspectQuery: "case=review",
      highlights: [
        { label: "Mfg Date", value: "01/2026 · 68% (Crease - Review)", box: "top-[42%] left-[8%]" },
        { label: "Net Qty", value: "250 g · 94% (Pass)", box: "top-[58%] left-[8%]" },
        { label: "Consumer Care", value: "care@organicindia.com · 92% (Pass)", box: "bottom-[12%] left-[8%]" },
      ],
    },
    oil: {
      image: "/products/oil/oil-front.jpg",
      name: "Fortune Sunflower Oil 1L",
      brand: "Adani Wilmar",
      caseTag: "CASE C",
      caseLabel: "Cooking Oil",
      status: "NON-COMPLIANT",
      statusColor: "text-red-700 bg-red-50 border-red-300",
      coverage: "50%",
      ocrConf: "89%",
      inspectQuery: "case=violation",
      highlights: [
        { label: "MRP Violation", value: "Secondary Sticker over ₹125 · Rule 6(1)(da)", box: "top-[38%] right-[8%]" },
        { label: "Net Volume", value: "1 L (910g) · 95% (Pass)", box: "top-[55%] left-[8%]" },
        { label: "Packer", value: "Adani Wilmar Ltd · 94% (Pass)", box: "bottom-[12%] left-[8%]" },
      ],
    },
  };

  const activeVisual = packageVisuals[activeTab];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:pt-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Left Hero Copy */}
          <div>
            {/* Ministry / SIH Tag */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <div className="flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 shadow-sm">
                <Scale className="size-3.5 text-navy-500" />
                <span className="font-semibold text-ink">
                  Legal Metrology (Packaged Commodities) Rules, 2011
                </span>
              </div>
              <span className="hidden h-4 w-px bg-line sm:block"></span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60"></span>
                  <span className="relative size-2 rounded-full bg-emerald-500"></span>
                </span>
                SIH 2026 Prototype · Problem Statement 26034
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              <span className="block">Scan the label.</span>
              <span className="block text-navy-500">Check the declaration.</span>
              <span className="relative inline-block text-ink">
                <span className="font-display italic font-normal text-navy-700">
                  Verify compliance.
                </span>
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-3 w-full text-saffron"
                  viewBox="0 0 300 20"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 14C40 6 70 5 104 10s64 7 96 1 70-8 97 2"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              AI-assisted packaged commodity inspection for detecting missing, incorrect, and unreadable mandatory declarations under the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>

            {/* Visual Pipeline Ribbon */}
            <div className="mt-5 flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono text-slate-600 bg-white/80 p-2.5 rounded-2xl border border-line shadow-2xs">
              <span className="font-extrabold text-blue-700 uppercase tracking-wider">PIPELINE:</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">IMAGE</span>
              <span className="text-slate-400">→</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">OCR + VISION</span>
              <span className="text-slate-400">→</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">DECLARATION EXTRACTION</span>
              <span className="text-slate-400">→</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">RULE ENGINE</span>
              <span className="text-slate-400">→</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">COMPLIANCE RESULT</span>
              <span className="text-slate-400">→</span>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-900">EVIDENCE + REPORT</span>
            </div>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/inspect"
                className="group btn-ink inline-flex items-center gap-3 rounded-full py-2.5 pl-6 pr-2.5 text-sm font-semibold shadow-lg shadow-navy-900/10"
              >
                <Scan className="size-4.5 text-saffron" />
                <span>Start Product Inspection</span>
                <span className="relative flex size-8 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="size-4" />
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition-all hover:bg-white hover:shadow-md"
              >
                <LayoutDashboard className="size-4 text-navy-500" />
                <span>Enforcement Dashboard</span>
              </Link>
            </div>

            {/* Quick Inspection ID Search Box */}
            <div className="mt-8 max-w-xl">
              <form
                onSubmit={handleSearch}
                className="glass group flex items-center gap-2 rounded-full p-1.5 pl-5 transition-all focus-within:ring-2 focus-within:ring-navy-500/30"
              >
                <Search className="size-4 shrink-0 text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inspection records by ID, commodity, or brand..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted/70"
                />
                <button
                  type="submit"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-200 hover:scale-105"
                  title="Search repository"
                >
                  <ArrowRight className="size-4" />
                </button>
              </form>

              {/* Standardized 2026 Sample chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-[11px] text-ink-muted">
                <span>Demo Records:</span>
                <button
                  type="button"
                  onClick={() => handleTrySearch("LG-2026-0101")}
                  className="num rounded-full border border-line bg-white/60 px-2.5 py-1 font-mono text-ink/80 transition-colors hover:bg-white hover:text-navy-500"
                >
                  LG-2026-0101 (Atta Compliant)
                </button>
                <button
                  type="button"
                  onClick={() => handleTrySearch("LG-2026-0102")}
                  className="num rounded-full border border-line bg-white/60 px-2.5 py-1 font-mono text-ink/80 transition-colors hover:bg-white hover:text-navy-500"
                >
                  LG-2026-0102 (Tea Review)
                </button>
                <button
                  type="button"
                  onClick={() => handleTrySearch("LG-2026-0103")}
                  className="num rounded-full border border-line bg-white/60 px-2.5 py-1 font-mono text-ink/80 transition-colors hover:bg-white hover:text-navy-500"
                >
                  LG-2026-0103 (Oil Violation)
                </button>
              </div>
            </div>
          </div>

          {/* Right Hero Stage: Interactive Computer Vision Package Scanner */}
          <div className="relative aspect-[600/580] w-full overflow-hidden rounded-[2.5rem] bg-[#fbf1e1] shadow-[inset_0_0_0_1px_rgba(18,26,62,0.06),0_40px_80px_-40px_rgba(120,72,20,0.35)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(18,26,62,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,26,62,0.08)_1px,transparent_1px)] [background-size:36px_36px]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 size-72 rounded-full bg-[#ffd9a8] blur-3xl"
            />

            {/* Stage Selector Pills at Top */}
            <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-2">
              <div className="glass flex items-center gap-1 rounded-full p-1 border border-white/80 shadow-xs">
                {(["atta", "tea", "oil"] as const).map((tab) => {
                  const item = packageVisuals[tab];
                  const isSelected = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-navy-950 text-white shadow-xs"
                          : "text-slate-600 hover:text-navy-950 hover:bg-white/80"
                      }`}
                    >
                      <span className="text-[10px] opacity-75 font-mono">{item.caseTag}</span>
                      <span>{item.caseLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Status Badge */}
              <span className={`rounded-full border px-3 py-1 font-mono text-xs font-bold shadow-2xs ${activeVisual.statusColor}`}>
                {activeVisual.status}
              </span>
            </div>

            {/* Interactive Package Display */}
            <div className="relative flex size-full items-center justify-center p-8 pt-16">
              <div className="relative h-full max-h-[420px] w-auto aspect-[4/5] rounded-2xl shadow-xl overflow-hidden bg-white/40 border border-white/80 p-2">
                <Image
                  src={activeVisual.image}
                  alt={activeVisual.name}
                  width={400}
                  height={500}
                  className="size-full object-contain"
                  priority
                />

                {/* Laser Scanning Line */}
                <div className="laser-scanner pointer-events-none absolute left-0 right-0 z-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_3px_rgba(34,211,238,0.8)]">
                  <span className="absolute right-4 -top-3 rounded-full bg-cyan-500/90 px-2 py-0.5 font-mono text-[9px] font-bold text-white shadow">
                    OPTICAL OCR SCAN
                  </span>
                </div>

                {/* Detected Bounding Box Overlays */}
                {activeVisual.highlights.map((h, i) => (
                  <div
                    key={i}
                    className={`absolute z-10 rounded-md border-2 border-dashed ${
                      activeVisual.status === "NON-COMPLIANT" && i === 0
                        ? "border-red-500 bg-red-500/20"
                        : activeVisual.status === "NEEDS REVIEW" && i === 0
                        ? "border-amber-500 bg-amber-500/20"
                        : "border-emerald-500 bg-emerald-500/15"
                    } p-1 shadow-sm transition-transform hover:scale-105 ${h.box}`}
                  >
                    <span className="block font-mono text-[9px] font-extrabold uppercase text-ink">
                      [{h.label}]
                    </span>
                    <span className="block font-sans text-[10px] font-semibold text-ink">
                      {h.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Live Metrics Tag */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-2.5 backdrop-blur-md border border-white">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-navy-500" />
                <span className="text-xs font-semibold text-ink">{activeVisual.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-ink-muted">
                <span>Coverage: <strong className="text-ink">{activeVisual.coverage}</strong></span>
                <span>OCR: <strong className="text-ink">{activeVisual.ocrConf}</strong></span>
                <Link
                  href={`/inspect?${activeVisual.inspectQuery}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Inspect Case</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>




        {/* Prototype Demonstration Metrics Strip */}
        <div className="mt-14 border-t border-line pt-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-500">
              Prototype Demonstration Metrics
            </span>
            <span className="text-[11px] text-ink-muted italic">
              Demonstration data — not official government statistics.
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
            <div className="glass rounded-3xl p-5">
              <dd className="num text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                128
              </dd>
              <dt className="mt-1 text-xs font-medium text-ink-muted">Test Packages Inspected</dt>
            </div>
            <div className="glass rounded-3xl p-5">
              <dd className="num text-3xl font-extrabold tracking-tight text-emerald-600 sm:text-4xl">
                87.5%
              </dd>
              <dt className="mt-1 text-xs font-medium text-ink-muted">Sample Dataset Compliance</dt>
            </div>
            <div className="glass rounded-3xl p-5">
              <dd className="num text-3xl font-extrabold tracking-tight text-navy-500 sm:text-4xl">
                94.8%
              </dd>
              <dt className="mt-1 text-xs font-medium text-ink-muted">Average OCR Confidence</dt>
            </div>
            <div className="glass rounded-3xl p-5">
              <dd className="num text-3xl font-extrabold tracking-tight text-red-600 sm:text-4xl">
                16
              </dd>
              <dt className="mt-1 text-xs font-medium text-ink-muted">Configured Violations Detected</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* ================= SECTION: HOW LABEL GUARD WORKS (5 STEPS) ================= */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
            <span className="h-px w-6 bg-current"></span>
            SIH Problem Statement 26034
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            How Label Guard Works
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            End-to-end statutory verification workflow from image ingest to judicial-ready inspection reports:
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="glass flex flex-col rounded-3xl p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-navy-500/10 text-navy-500 font-mono font-bold text-sm">
              01
            </div>
            <h3 className="mt-4 text-base font-bold text-ink">Capture / Upload</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Upload multi-angle packaged commodity photographs (PDP, back statutory panel, side panels) or artwork proofs.
            </p>
          </div>

          <div className="glass flex flex-col rounded-3xl p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 font-mono font-bold text-sm">
              02
            </div>
            <h3 className="mt-4 text-base font-bold text-ink">OCR + Vision</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Computer vision localizes textual regions, extracts coordinates, and assigns per-token confidence scores.
            </p>
          </div>

          <div className="glass flex flex-col rounded-3xl p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 font-mono font-bold text-sm">
              03
            </div>
            <h3 className="mt-4 text-base font-bold text-ink">Declaration Parser</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Extracted tokens are mapped to mandatory PCR fields (Packer, Generic Name, Net Qty, MRP, Date, Consumer Care).
            </p>
          </div>

          <div className="glass flex flex-col rounded-3xl p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 font-mono font-bold text-sm">
              04
            </div>
            <h3 className="mt-4 text-base font-bold text-ink">Rule Engine</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Deterministic rule engine evaluates compliance against Rules 6, 7 (Table 1 font ratio), 8 (units), and 9.
            </p>
          </div>

          <div className="glass flex flex-col rounded-3xl p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-mono font-bold text-sm">
              05
            </div>
            <h3 className="mt-4 text-base font-bold text-ink">Evidence Report</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Compiles tamper-evident A4 PDF and editable DOCX reports with spatial bounding boxes and SHA-256 seal.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION: WHAT DECLARATIONS ARE CHECKED ================= */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 border-t border-line">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
            <span className="h-px w-6 bg-current"></span>
            Statutory Scope
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            What Declarations Are Checked
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            The platform assesses mandatory statutory declarations prescribed under Rule 6 of PCR 2011 alongside verification dimensions:
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="glass rounded-3xl p-6">
            <span className="font-mono text-xs font-bold text-navy-500">Rule 6(1)(a)</span>
            <h3 className="mt-2 text-base font-bold text-ink">Manufacturer / Packer / Importer</h3>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Verifies complete name and physical address including street, state, and 6-digit postal pincode.
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              IMPLEMENTED
            </span>
          </div>

          <div className="glass rounded-3xl p-6">
            <span className="font-mono text-xs font-bold text-navy-500">Rule 6(1)(b)</span>
            <h3 className="mt-2 text-base font-bold text-ink">Generic / Common Commodity Name</h3>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Validates that the true commodity description is prominently declared on the Principal Display Panel.
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              IMPLEMENTED
            </span>
          </div>

          <div className="glass rounded-3xl p-6">
            <span className="font-mono text-xs font-bold text-navy-500">Rule 6(1)(c) &amp; Rule 8</span>
            <h3 className="mt-2 text-base font-bold text-ink">Net Quantity &amp; Standard Units</h3>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Checks standard metric units (g, kg, mL, L). Flags illegal non-standard symbols like &quot;gms&quot; or &quot;lit&quot;.
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              IMPLEMENTED
            </span>
          </div>

          <div className="glass rounded-3xl p-6">
            <span className="font-mono text-xs font-bold text-navy-500">Rule 6(1)(da)</span>
            <h3 className="mt-2 text-base font-bold text-ink">Maximum Retail Price (MRP)</h3>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Confirms Rupee symbol (₹), explicit phrase &quot;incl. of all taxes&quot;, and detects secondary sticker overlays.
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              IMPLEMENTED
            </span>
          </div>

          <div className="glass rounded-3xl p-6">
            <span className="font-mono text-xs font-bold text-navy-500">Rule 6(1)(d)</span>
            <h3 className="mt-2 text-base font-bold text-ink">Month &amp; Year of Packing / Mfg</h3>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Validates unambiguous date format (MM/YYYY) legible without decoding or obscure lot stamps.
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              IMPLEMENTED
            </span>
          </div>

          <div className="glass rounded-3xl p-6">
            <span className="font-mono text-xs font-bold text-navy-500">Rule 6(1)(e)</span>
            <h3 className="mt-2 text-base font-bold text-ink">Consumer Care Redressal</h3>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              Ensures both telephone number / toll-free helpline and valid electronic email address are provided.
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              IMPLEMENTED
            </span>
          </div>
        </div>

        {/* 4 Additional Validation Dimensions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl border border-line bg-white/60 p-4">
            <span className="font-bold text-navy-500">1. Readability</span>
            <p className="mt-1 text-ink-muted">Optical contrast and token sharpness score.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/60 p-4">
            <span className="font-bold text-navy-500">2. Font Size (Rule 7)</span>
            <p className="mt-1 text-ink-muted">Table 1 ratio evaluated against PDP area.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/60 p-4">
            <span className="font-bold text-navy-500">3. Placement</span>
            <p className="mt-1 text-ink-muted">Principal Display Panel vs. statutory panel.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/60 p-4">
            <span className="font-bold text-navy-500">4. Completeness</span>
            <p className="mt-1 text-ink-muted">Absence of any mandatory declaration.</p>
          </div>
        </div>
      </section>

      {/* ================= SECTION: SEE LABEL GUARD IN ACTION (EVIDENCE-FIRST) ================= */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 border-t border-line">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
              <span className="h-px w-6 bg-current"></span>
              Evidence-First Architecture
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              See Label Guard in Action
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Label Guard never outputs a simple unverified verdict. Every adjudication is paired with the exact detected text token, OCR confidence percentage, statutory rule reference, and spatial evidence location on the packaging.
            </p>

            {/* Quick Demo Case Launchers */}
            <div className="mt-8 space-y-3">
              <Link
                href="/inspect?case=compliant"
                className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:bg-emerald-500/10 transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-800">Demo Case A: Compliant Commodity</span>
                  <p className="text-[11px] text-ink-muted">Wheat Atta 5kg · 100% Declarations Detected · 98% OCR</p>
                </div>
                <ArrowRight className="size-4 text-emerald-700" />
              </Link>

              <Link
                href="/inspect?case=review"
                className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 hover:bg-amber-500/10 transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-amber-800">Demo Case B: Low OCR Confidence / Review</span>
                  <p className="text-[11px] text-ink-muted">Herbal Green Tea · Date Smudged by Crease (68% Conf) · Manual Verification</p>
                </div>
                <ArrowRight className="size-4 text-amber-700" />
              </Link>

              <Link
                href="/inspect?case=violation"
                className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/5 p-4 hover:bg-red-500/10 transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-red-800">Demo Case C: Configured Violation</span>
                  <p className="text-[11px] text-ink-muted">Sunflower Oil 1L · Secondary Price Sticker Overprinted over MRP</p>
                </div>
                <ArrowRight className="size-4 text-red-700" />
              </Link>
            </div>
          </div>

          {/* Right: Evidence Card Breakdown */}
          <div className="glass-strong rounded-4xl p-6 sm:p-8 shadow-xl border border-navy-500/20 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <span className="text-xs font-bold text-ink">Sample Evidence Inspection Record</span>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                PASS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-line-soft">
                <span className="text-ink-muted font-medium">Declaration Field:</span>
                <strong className="text-ink">Net Quantity Declaration</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-line-soft">
                <span className="text-ink-muted font-medium">Detected Text:</span>
                <span className="font-mono font-bold text-navy-500">&ldquo;5 kg&rdquo;</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-line-soft">
                <span className="text-ink-muted font-medium">OCR Confidence:</span>
                <strong className="text-emerald-700">97% (High Confidence)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-line-soft">
                <span className="text-ink-muted font-medium">Statutory Rule:</span>
                <span className="font-mono text-ink">Rule 6(1)(c) read with Rule 8</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-line-soft">
                <span className="text-ink-muted font-medium">Spatial Evidence:</span>
                <span className="text-ink font-mono text-[11px]">BBox [X: 12%, Y: 50%, W: 35%, H: 11%]</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-muted font-medium">Adjudication Reason:</span>
                <span className="text-right text-ink max-w-[280px]">
                  Standard metric unit (kg); numeral height 4.8mm exceeds Table 1 minimum 4.0mm.
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-line text-center">
              <Link
                href="/inspect"
                className="btn-ink inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold"
              >
                <Scan className="size-3.5 text-saffron" />
                <span>Launch Live Inspection Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
