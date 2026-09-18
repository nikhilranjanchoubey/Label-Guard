"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Code2,
  BookOpen,
  ArrowRight,
  Database,
  FileText,
  FileCheck2,
  Eye,
  Scale,
  UserCheck,
  ExternalLink,
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<
    "workflow" | "architecture" | "sih-coverage" | "tech-stack"
  >("workflow");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="border-b border-line pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
          <BookOpen className="size-4" />
          <span>Technical Proof · Problem Statement 26034</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Architecture &amp; Documentation
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-muted">
          How Label Guard transforms package images into evidence-backed compliance results.
        </p>
      </div>

      {/* 4 Main Section Tabs (Under 60-Second Judge Review) */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {[
          { id: "workflow", label: "1. How Label Guard Works", icon: Eye },
          { id: "architecture", label: "2. System Architecture", icon: Layers },
          { id: "sih-coverage", label: "3. SIH 26034 Coverage", icon: CheckCircle2 },
          { id: "tech-stack", label: "4. Technology Stack", icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-navy-950 text-white shadow-sm"
                  : "bg-white/80 text-slate-600 hover:bg-white hover:text-navy-950 border border-line"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= SECTION 1: HOW LABEL GUARD WORKS ================= */}
      {activeSection === "workflow" && (
        <div className="mt-8 space-y-6">
          <div className="glass rounded-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Section 1: How Label Guard Works</h2>
                <p className="text-xs text-ink-muted">
                  From optical label input to judicial-ready compliance audit report.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-[11px] font-bold text-blue-700">
                End-to-End Workflow
              </span>
            </div>

            {/* Visual 7-Step Vertical Flowchart */}
            <div className="mt-6 rounded-3xl bg-navy-950 p-6 text-white font-mono text-xs overflow-x-auto shadow-inner">
              <pre className="text-sky-300">
{`[01] IMAGE
     └─ Real packaged commodity label capture (Front PDP, Back panel, Side, Batch stamp)
     │
     ▼
[02] OCR / COMPUTER VISION  (Probabilistic Optical Layer)
     └─ Bounding box coordinate extraction [x, y, w, h] + per-token confidence scoring
     │
     ▼
[03] DECLARATION EXTRACTION
     └─ NLP & regex structuring into the 6 mandatory Legal Metrology categories
     │
     ▼
[04] RULE ENGINE  (Deterministic Legal Metrology Layer - PCR 2011)
     └─ Codified statutory logic (Rules 6, 7 Table 1 font ratio, 8 metric units, 9, 10)
     │
     ▼
[05] COMPLIANCE RESULT
     └─ Classification into PASS / NEEDS REVIEW (Low Confidence) / VIOLATION
     │
     ▼
[06] HUMAN REVIEW  (Human-in-the-Loop)
     └─ Authorized officer verification, finding override, and statutory remarks
     │
     ▼
[07] INSPECTION REPORT
     └─ Evidentiary A4 PDF report with SHA-256 seal & editable DOCX export`}
              </pre>
            </div>

            {/* Distinction Callout */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                  <Eye className="size-4 text-amber-700 shrink-0" />
                  <span>Probabilistic Vision (Steps 01 - 03)</span>
                </div>
                <p className="text-amber-900/80 leading-relaxed">
                  Extracts optical text tokens, locations, and confidence levels. Handles folds, specular glare, and curved pouches. Never makes legal decisions autonomously.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <Scale className="size-4 text-emerald-700 shrink-0" />
                  <span>Deterministic Rule Engine (Steps 04 - 05)</span>
                </div>
                <p className="text-emerald-900/80 leading-relaxed">
                  Executes deterministic PCR 2011 code. Tests metric units (Rule 8), numeral height (Rule 7 Table 1), sticker alterations (Rule 6(1)(da)), and contact details. Zero hallucination.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: SYSTEM ARCHITECTURE ================= */}
      {activeSection === "architecture" && (
        <div className="mt-8 space-y-6">
          <div className="glass rounded-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Section 2: System Architecture</h2>
                <p className="text-xs text-ink-muted">
                  Modular technical stack connecting frontend UI, vision pipeline, deterministic rule logic, and document generator.
                </p>
              </div>
              <span className="rounded-full bg-navy-500/10 border border-navy-500/20 px-3 py-1 text-[11px] font-bold text-navy-700">
                Component Hierarchy
              </span>
            </div>

            {/* Architecture Block Flow */}
            <div className="mt-6 rounded-3xl bg-navy-950 p-6 text-white font-mono text-xs overflow-x-auto shadow-inner">
              <pre className="text-emerald-400">
{`┌────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14 App Router / React 18 / Tailwind)│
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  API LAYER (Type-Safe Route Handlers & State Context)  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  OCR SERVICE (Optical Character Extraction & BBoxes)  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  DECLARATION PARSER (Field Normalization & Filtering)  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  RULE ENGINE (Deterministic PCR 2011 Legal Evaluator)  │
└────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│ DATABASE / AUDIT TRAIL    │  │ REPORT GENERATOR        │
│ • Unified 2026 Repository │  │ • Client-side jsPDF A4  │
│ • Immutable Inspection IDs│  │ • Editable DOCX Export  │
│ • SHA-256 Digital Hash    │  │ • Evidence Imagery      │
└───────────────────────────┘  └─────────────────────────┘`}
              </pre>
            </div>

            {/* 3 Core Architecture Cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">1. User Experience Layer</span>
                <p className="text-slate-600 leading-relaxed">
                  Responsive Next.js 14 interface with 4-stage progressive Inspection Studio, interactive bounding box visualizer, and bilingual support.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">2. Statutory Engine Layer</span>
                <p className="text-slate-600 leading-relaxed">
                  Decoupled TypeScript rules in <code className="bg-slate-100 px-1 py-0.5 rounded">complianceEngine.ts</code> evaluating Rules 6(1)(a)-(e), 7 (Table 1 area matrix), and 8.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">3. Evidentiary Document Layer</span>
                <p className="text-slate-600 leading-relaxed">
                  jsPDF AutoTable generating multi-page statutory inspection reports with original and annotated package photography and cryptographic SHA-256 digital seals.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: SIH 26034 REQUIREMENT COVERAGE ================= */}
      {activeSection === "sih-coverage" && (
        <div className="mt-8 space-y-6">
          <div className="glass rounded-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Section 3: SIH Problem Statement 26034 Requirement Coverage</h2>
                <p className="text-xs text-ink-muted">
                  Comprehensive requirement traceability matrix for judge review.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-700">
                100% Traceability
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">SIH Requirement</th>
                    <th className="py-3 px-3">Label Guard Feature</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Demonstration Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {[
                    {
                      req: "SCAN PACKAGED COMMODITY",
                      feat: "Multi-panel image ingestion (Front, Back, Side)",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Upload, camera, and sample cases in /inspect",
                    },
                    {
                      req: "OCR EXTRACTION",
                      feat: "OCR token localization with confidence scoring",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Per-token scores; low-confidence fold detection in Case B",
                    },
                    {
                      req: "MANDATORY DECLARATIONS",
                      feat: "Structured field extraction for all 6 PCR categories",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Manufacturer, Name, Net Qty, MRP, Dates, Consumer Care",
                    },
                    {
                      req: "CORRECTNESS / COMPLETENESS",
                      feat: "Deterministic PCR 2011 rule engine evaluation",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "complianceEngine.ts validating rules 6(1)(a)-(e) & rule 8",
                    },
                    {
                      req: "READABILITY / FONT ANALYSIS",
                      feat: "Rule 7 Table 1 font height calculation from PDP area",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Height comparison (e.g. 4.8mm vs 4.0mm statutory threshold)",
                    },
                    {
                      req: "VIOLATION IDENTIFICATION",
                      feat: "Evidence-backed result with rule citation and severity",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Case C sticker MRP alteration detection under Rule 6(1)(da)",
                    },
                    {
                      req: "HUMAN REVIEW / OVERRIDE",
                      feat: "Human-in-the-loop Stage 4 review and remarks workflow",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Accept / Flag for Review actions in Inspection Studio",
                    },
                    {
                      req: "REPORTING (PDF / DOCX)",
                      feat: "Client-side jsPDF A4 report & DOCX exporter",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Downloadable reports with SHA-256 seal in /reports",
                    },
                    {
                      req: "INSPECTION HISTORY",
                      feat: "Audit trail with filtering, search, and detail views",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Inspection History & Audit Trail in /inspections",
                    },
                    {
                      req: "DASHBOARD",
                      feat: "Enforcement dashboard with metrics and trend charts",
                      status: "IMPLEMENTED",
                      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      evidence: "Enforcement dashboard in /dashboard & /analytics",
                    },
                    {
                      req: "ROLE-BASED ACCESS (RBAC)",
                      feat: "Prototype authentication architecture",
                      status: "PROTOTYPE",
                      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
                      evidence: "AuthContext with Officer, Admin, Inspector, Reviewer roles",
                    },
                    {
                      req: "PRINCIPAL DISPLAY PANEL BOUNDARY",
                      feat: "Automated PDP boundary calculation",
                      status: "PROTOTYPE",
                      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
                      evidence: "PDP surface area input (cm²) mapped to Table 1 lookup",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-navy-950">{row.req}</td>
                      <td className="py-3 px-3 text-slate-600">{row.feat}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-blue-700 font-medium">{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: TECHNOLOGY STACK ================= */}
      {activeSection === "tech-stack" && (
        <div className="mt-8 space-y-6">
          <div className="glass rounded-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Section 4: Verified Technology Stack</h2>
                <p className="text-xs text-ink-muted">
                  Strictly reflects the packages and libraries actually installed in <code className="bg-slate-100 px-1 py-0.5 rounded">package.json</code>.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-700">
                package.json Verified
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">Core Framework</span>
                <p className="text-blue-700 font-bold text-sm">Next.js 14.2.24</p>
                <p className="text-slate-600 mt-1">App Router architecture with React 18.3.1 and React DOM 18.3.1</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">Language &amp; Type Safety</span>
                <p className="text-blue-700 font-bold text-sm">TypeScript 5.6.3</p>
                <p className="text-slate-600 mt-1">Strict type definitions across data models, rule schemas, and context</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">Styling &amp; Interface</span>
                <p className="text-blue-700 font-bold text-sm">Tailwind CSS 3.4.14</p>
                <p className="text-slate-600 mt-1">PostCSS 8.4.47, Autoprefixer 10.4.20, Lucide React 0.460.0 icons</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">PDF Generation Engine</span>
                <p className="text-blue-700 font-bold text-sm">jsPDF 2.5.2 + AutoTable 3.8.4</p>
                <p className="text-slate-600 mt-1">Client-side A4 report generation with multi-table geometric layout</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">DOCX Generation Engine</span>
                <p className="text-blue-700 font-bold text-sm">docx 9.0.3 + File-Saver 2.0.5</p>
                <p className="text-slate-600 mt-1">Editable OpenXML Microsoft Word document generation for official memos</p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 border border-line">
                <span className="font-bold text-navy-950 block mb-1">Legal Rule Engine</span>
                <p className="text-blue-700 font-bold text-sm">TypeScript Deterministic Engine</p>
                <p className="text-slate-600 mt-1">Deterministic statutory PCR 2011 evaluator with zero hallucinations</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
