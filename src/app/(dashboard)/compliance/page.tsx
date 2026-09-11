"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ComplianceResult,
  RuleEvaluation,
  ComplianceEvaluationStatus,
} from "@/lib/compliance/types";
import {
  getActiveComplianceResult,
  evaluateCompliance,
} from "@/lib/compliance/client";
import { getActiveDeclarationResult } from "@/lib/declarations/client";
import { SAMPLE_COMPLIANCE_INPUT } from "@/lib/compliance/demoSample";
import { RuleEvaluationDetailModal } from "@/components/compliance/RuleEvaluationDetailModal";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  MinusCircle,
  UserCheck,
  Eye,
  RefreshCw,
  Info,
  ShieldCheck,
  Search,
  Scan,
  Sparkles,
  Hash,
  Layers,
} from "lucide-react";

export default function CompliancePage() {
  const { t, locale } = useTranslation();
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ComplianceEvaluationStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState<RuleEvaluation | null>(null);

  // Load or trigger evaluation on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Check existing compliance result in session
        const existing = getActiveComplianceResult();
        if (existing) {
          setResult(existing);
          setLoading(false);
          return;
        }

        // 2. Check if active declarations exist from Step 3
        const activeDeclarations = getActiveDeclarationResult();
        if (activeDeclarations && activeDeclarations.fields.length > 0) {
          const evalResult = await evaluateCompliance({
            inspectionId: `INS-${Date.now()}`,
            productId: activeDeclarations.productId,
            declarationResult: activeDeclarations,
            metadata: {
              category: activeDeclarations.category || "General Commodity",
              hasPhysicalScaleCalibration: false,
            },
          });
          setResult(evalResult);
        }
      } catch (err) {
        console.error("[CompliancePage] Error during evaluation initialization:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLoadDemoSample = async () => {
    setLoading(true);
    try {
      const demoResult = await evaluateCompliance(SAMPLE_COMPLIANCE_INPUT);
      setResult(demoResult);
    } catch (err) {
      console.error("Failed to load sample evaluation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReevaluate = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const reResult = await evaluateCompliance({
        inspectionId: result.inspectionId,
        productId: result.productId,
        productName: result.productName,
        brand: result.brand,
        declarationResult: {
          productId: result.productId,
          sourceType: "PACKAGE_IMAGE",
          sourceImages: [],
          overallExtractionConfidence: 0.95,
          extractionTimestamp: new Date().toISOString(),
          extractionEngine: result.engineVersion,
          category: result.metadata.category,
          categoryConfidence: 0.95,
          warnings: [],
          isDemo: result.isDemo,
          fields: [], // Re-runs against current stored state
        },
        metadata: result.metadata,
      });
      setResult(reResult);
    } catch (err) {
      console.error("Failed to re-evaluate:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = useMemo(() => {
    if (!result) return [];
    return result.rulesEvaluated.filter((ev) => {
      if (statusFilter !== "ALL" && ev.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const inId = ev.internalRuleId.toLowerCase().includes(q);
        const inRef = ev.statutoryReference.toLowerCase().includes(q);
        const inReq = ev.requirement.toLowerCase().includes(q);
        const inVal = (ev.extractedValue || "").toLowerCase().includes(q);
        if (!inId && !inRef && !inReq && !inVal) return false;
      }
      return true;
    });
  }, [result, statusFilter, searchQuery]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs font-semibold text-slate-600">
          {t("common.loading", "Executing deterministic statutory compliance engine...")}
        </span>
      </div>
    );
  }

  // Empty State
  if (!result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("compliance.title", "Deterministic Legal Compliance Matrix")}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                "compliance.subtitle",
                "Deterministic statutory evaluation of extracted facts against verified Legal Metrology rules"
              )}
            </p>
          </div>
        </div>

        <Card className="p-12 text-center max-w-2xl mx-auto border-dashed border-2">
          <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {t("compliance.emptyTitle", "No Compliance Analysis Available Yet")}
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            {t(
              "compliance.emptyDesc",
              "Upload a package image on the Scan Package page or run sample evaluation to assess statutory compliance."
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/scan">
              <Button variant="primary" size="sm" leftIcon={<Scan className="w-4 h-4" />}>
                {t("compliance.goToScan", "Go to Scan Package")}
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-600" />}
              onClick={handleLoadDemoSample}
            >
              {t("compliance.loadSample", "Run Sample Compliance Evaluation")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { summary } = result;

  const isAttention = summary.overallStatus === "NEEDS_ATTENTION";
  const isReview = summary.overallStatus === "REVIEW_REQUIRED";
  const isCompliant = summary.overallStatus === "COMPLIANT_ASSISTANCE_RESULT";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("compliance.title", "Deterministic Legal Compliance Matrix")}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              STEP 5 ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              "compliance.subtitle",
              "Deterministic statutory evaluation of extracted facts against verified Legal Metrology rules"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleReevaluate}
          >
            {t("compliance.recheck", "Re-evaluate")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadDemoSample}
          >
            {t("compliance.loadSample", "Reload Demo")}
          </Button>
          <Link href="/verification">
            <Button variant="primary" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
              {t("nav.verification", "Proceed to Officer Verification")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900 shadow-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold uppercase tracking-wide text-blue-950">
            {locale === "hi" ? "कानूनी अस्वीकरण (Legal Disclaimer)" : "Automated Compliance Assistance Disclaimer"}
          </strong>
          <p className="text-blue-800 leading-relaxed">
            {locale === "hi"
              ? "LabelGuard कॉन्फ़िगर किए गए कानूनी नियमों के आधार पर स्वचालित अनुपालन सहायता प्रदान करता है। अंतिम प्रवर्तन निर्णय अधिकृत मानव सत्यापन के अधीन हैं।"
              : "LabelGuard provides automated compliance assistance based on configured legal rules. Final enforcement decisions require authorized human verification."}
          </p>
        </div>
      </div>

      {/* Overall Deterministic Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start sm:items-center justify-between gap-4 shadow-xs ${
          isAttention
            ? "bg-red-50 border-red-200 text-red-950"
            : isReview
            ? "bg-amber-50 border-amber-200 text-amber-950"
            : isCompliant
            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
            : "bg-slate-50 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isAttention
                ? "bg-red-100/70 text-red-700 border-red-300"
                : isReview
                ? "bg-amber-100/70 text-amber-700 border-amber-300"
                : isCompliant
                ? "bg-emerald-100/70 text-emerald-700 border-emerald-300"
                : "bg-slate-200/70 text-slate-700 border-slate-300"
            }`}
          >
            {isAttention ? (
              <AlertOctagon className="w-6 h-6" />
            ) : isReview ? (
              <AlertTriangle className="w-6 h-6" />
            ) : isCompliant ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <MinusCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t("compliance.overallStatus", "Overall Compliance Assistance Result")}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white/80 border border-current">
                {summary.overallStatus}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold mt-0.5">
              {locale === "hi" && summary.summaryNarrativeHi
                ? summary.summaryNarrativeHi
                : summary.summaryNarrative}
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end text-xs font-mono">
          <span className="text-slate-500">Inspection: {result.inspectionId}</span>
          <span className="font-semibold text-slate-700">{result.productName}</span>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Pass */}
        <Card className="p-4 border-emerald-200/80 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {t("compliance.filterPass", "PASS")}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{summary.passCount}</div>
          <span className="text-[11px] text-emerald-600">Statutory Rules Satisfied</span>
        </Card>

        {/* Fail */}
        <Card className="p-4 border-red-200/80 bg-red-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              {t("compliance.filterFail", "FAIL")}
            </span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{summary.failCount}</div>
          <span className="text-[11px] text-red-600">Missing / Non-Compliant</span>
        </Card>

        {/* Review */}
        <Card className="p-4 border-amber-200/80 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {t("compliance.filterReview", "REVIEW")}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{summary.reviewCount}</div>
          <span className="text-[11px] text-amber-600">Uncertain / Uncalibrated</span>
        </Card>

        {/* Total Applicable */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              APPLICABLE RULES
            </span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {summary.totalApplicableRules}
          </div>
          <span className="text-[11px] text-slate-400">
            {result.exemptions.length > 0 ? `${result.exemptions.length} Rule(s) Exempted` : "Verified Active Rules"}
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter evaluations by Rule ID, reference, or text..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "PASS", "FAIL", "REVIEW"] as const).map((filterVal) => (
              <button
                key={filterVal}
                onClick={() => setStatusFilter(filterVal)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === filterVal
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filterVal === "ALL" ? t("compliance.filterAll", "ALL") : filterVal}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Rule Evaluation Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t("compliance.ruleSummary", "Statutory Rule Evaluation Directory")} (
            {filteredEvaluations.length} Results)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Engine: {result.engineVersion}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredEvaluations.map((ev) => {
            const isPass = ev.status === "PASS";
            const isFail = ev.status === "FAIL";
            const isRev = ev.status === "REVIEW";

            return (
              <Card
                key={ev.id}
                onClick={() => setSelectedEvaluation(ev)}
                className="cursor-pointer hover:border-primary/50 transition-all shadow-xs"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Status Badge, Rule ID, Statutory Ref, Requirement */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isFail
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : isRev
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {ev.status}
                      </span>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {ev.internalRuleId}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {ev.statutoryReference}
                      </span>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ev.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">
                      {ev.requirement}
                    </p>

                    {/* Detected Fact vs Engine Reason */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                        <strong className="text-slate-500 block text-[10px] uppercase">
                          Detected Fact:
                        </strong>
                        <span className="font-mono text-slate-900 font-semibold">
                          {ev.extractedValue || "NOT DETECTED"}
                        </span>
                      </div>
                      <div
                        className={`p-2 rounded-lg border text-xs ${
                          isPass
                            ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-950"
                            : isFail
                            ? "bg-red-50/50 border-red-200/60 text-red-950"
                            : "bg-amber-50/50 border-amber-200/60 text-amber-950"
                        }`}
                      >
                        <strong className="block text-[10px] uppercase">
                          Engine Justification:
                        </strong>
                        <span className="line-clamp-1">
                          {locale === "hi" && ev.reasonHi ? ev.reasonHi : ev.reason}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Evidence CTA & Optical Confidence */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {ev.confidence !== undefined && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Optical Conf: {(ev.confidence * 100).toFixed(0)}%
                      </span>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5 text-primary" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvaluation(ev);
                      }}
                    >
                      {t("compliance.viewEvidence", "View Evidence")}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Audit & Provenance Footer */}
      <Card className="p-4 bg-slate-50/80 border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />
            <span>
              {t("compliance.auditHash", "Audit Record Hash")}:{" "}
              <strong className="font-mono text-slate-900">{result.auditHash}</strong>
            </span>
          </div>
          <div>
            Evaluated: {result.evaluationTimestamp.slice(0, 19).replace("T", " ")} UTC
          </div>
        </div>
      </Card>

      {/* Evaluation Detail Modal */}
      <RuleEvaluationDetailModal
        evaluation={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
      />
    </div>
  );
}
