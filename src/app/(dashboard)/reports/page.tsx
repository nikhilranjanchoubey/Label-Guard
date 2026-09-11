"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_INSPECTIONS, MOCK_OFFICER } from "@/mocks/sampleData";
import { Download, CheckCircle2, AlertOctagon, Printer, Layers } from "lucide-react";
import { ExtractedDeclaration } from "@/lib/compliance/types";

export default function ReportsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<"compliance" | "violation" | "dossier">("compliance");
  const sample = MOCK_INSPECTIONS[0];

  const handleExportPdf = () => {
    toast({
      title: "Report Generated (Demo)",
      description: "Sample compliance report prepared for export. PDF download hook ready.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("reports.title", "Compliance Reports & Summaries")}
            </h1>
            <Badge variant="demo" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("reports.subtitle", "Generate and export inspection summaries, violation registries, and evidentiary dossiers")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPdf}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {t("reports.downloadPdf", "Export Report PDF")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Report Type Selector */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("reports.reportType", "Report Type")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <button
                type="button"
                onClick={() => setSelectedReportType("compliance")}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedReportType === "compliance"
                    ? "border-action bg-blue-50 ring-1 ring-action text-action"
                    : "border-boundary hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-compliant" />
                  <span>{t("reports.complianceCertificate", "Compliance Summary Report")}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Full declaration verification summary across all audited mandatory attributes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportType("violation")}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedReportType === "violation"
                    ? "border-action bg-blue-50 ring-1 ring-action text-action"
                    : "border-boundary hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <AlertOctagon className="w-4 h-4 text-violation" />
                  <span>{t("reports.violationSummary", "Violation Notice Summary")}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Isolated itemization of missing declarations or formatting discrepancies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportType("dossier")}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedReportType === "dossier"
                    ? "border-action bg-blue-50 ring-1 ring-action text-action"
                    : "border-boundary hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>{t("reports.evidenceDossier", "Full Evidentiary Dossier")}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inspection imagery, bounding box metrics, optical clarity index, and cryptographic audit hash.
                </p>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Cols: Report Preview Document */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-2 border-slate-200">
            {/* Header Document Banner */}
            <div className="p-6 border-b border-boundary bg-slate-50 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-primary">LabelGuard</span>
                  <span className="text-xs text-slate-500">| Compliance Inspection Report</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Report Ref: <strong className="font-mono text-slate-700">REP-{sample.id}</strong>
                </p>
              </div>
              <Badge variant="demo" size="sm" />
            </div>

            {/* Document Content */}
            <CardContent className="p-6 space-y-6 text-xs text-slate-800">
              {/* Product & Inspector Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-boundary">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Commodity</span>
                  <div className="font-bold text-slate-900 mt-0.5">{sample.productName}</div>
                  <div className="text-[11px] text-slate-500">{sample.brand}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Inspecting Officer</span>
                  <div className="font-bold text-slate-900 mt-0.5">{MOCK_OFFICER.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{MOCK_OFFICER.badgeNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Audit Timestamp</span>
                  <div className="font-medium text-slate-900 mt-0.5">{sample.inspectionDate}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Cryptographically Signed</div>
                </div>
              </div>

              {/* Declaration Status Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Statutory Declarations Verification Log
                </h4>
                <div className="space-y-2">
                  {sample.declarations.map((dec: ExtractedDeclaration) => (
                    <div
                      key={dec.id}
                      className="p-3 rounded-lg border border-boundary flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{t(dec.labelKey, dec.key)}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{dec.extractedValue}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-slate-500">
                          OCR: {(dec.ocrConfidence * 100).toFixed(1)}%
                        </span>
                        <Badge status={dec.complianceStatus} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Verification Seal */}
              <div className="p-3 rounded-lg bg-slate-50 border border-boundary font-mono text-[11px] space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Evidentiary Audit Hash</div>
                <div className="text-slate-700 break-all">{sample.auditHash}</div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-boundary flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
                  Print Summary
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExportPdf} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
