"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { InspectionReportDocument } from "@/components/reports/InspectionReportDocument";
import { buildInspectionReportData } from "@/lib/reports/generator";
import { FullInspectionReportData, ReportLanguageMode } from "@/lib/reports/types";
import {
  Download,
  Printer,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportsPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

  const [languageMode, setLanguageMode] = useState<ReportLanguageMode>("bilingual");
  const [reportData, setReportData] = useState<FullInspectionReportData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Generate actual report data on mount
    try {
      const data = buildInspectionReportData();
      setReportData(data);
    } catch (err) {
      console.error("[Reports] Error building report data:", err);
    }
  }, []);

  // Handle direct PDF download via backend API
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    toast({
      title: locale === "hi" ? "पीडीएफ तैयार हो रही है" : "Compiling Inspection PDF",
      description: locale === "hi" ? "आधिकारिक विधिक मापविज्ञान रिपोर्ट तैयार की जा रही है..." : "Compiling statutory Legal Metrology report with authentic Devanagari ligatures...",
      type: "info",
    });
    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageMode,
          inspectionId: reportData?.executiveSummary.inspectionId,
        }),
      });

      if (!res.ok) {
        // If server-side headless renderer is unavailable, gracefully inform and trigger print
        const errJson = await res.json().catch(() => ({}));
        if (errJson.canUseBrowserPrint) {
          toast({
            title: "Local PDF Engine Notice",
            description: "Opening browser print engine to Save as PDF with native Hindi support.",
            type: "info",
          });
          window.print();
          setIsDownloading(false);
          return;
        }
        throw new Error(errJson.error || "Failed to compile report PDF");
      }

      // Download blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LabelGuard_Inspection_${reportData?.executiveSummary.inspectionId || "Report"}_${languageMode}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Exported",
        description: `Official Legal Metrology PDF inspection report downloaded (${languageMode.toUpperCase()}).`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      console.warn("[Reports] PDF Download failed, falling back to browser print:", msg);
      toast({
        title: "Export Notice",
        description: "Opening Print dialog to Save as PDF directly.",
        type: "info",
      });
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!reportData) return;
    const { executiveSummary: s, productInfo: p, declarations: d, complianceMatrix: c } = reportData;

    const escapeCsv = (str: string | undefined | null) => {
      if (str === undefined || str === null) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel Hindi/Devanagari rendering

    // Section 1: Executive Summary
    csvContent += "SECTION,EXECUTIVE SUMMARY\r\n";
    csvContent += "Report ID,Inspection ID,Timestamp,Officer Name,Officer Badge,Inspection Station,Overall Status,Total Rules,Rules Passed,Rules Failed,Rules Review\r\n";
    csvContent += `${escapeCsv(s.reportId)},${escapeCsv(s.inspectionId)},${escapeCsv(s.generatedAt)},${escapeCsv(s.officerName)},${escapeCsv(s.officerBadge)},${escapeCsv(s.inspectionStation)},${escapeCsv(s.overallStatus)},${s.totalRulesEvaluated},${s.rulesPassed},${s.rulesFailed},${s.rulesReview}\r\n\r\n`;

    // Section 2: Product Information
    csvContent += "SECTION,PRODUCT INFORMATION\r\n";
    csvContent += "Product Name,Brand,Category,Net Quantity,MRP,Manufacturer,Packer,Country of Origin,Batch Number,Mfg Date,Packing Date,Consumer Care\r\n";
    csvContent += `${escapeCsv(p.productName)},${escapeCsv(p.brand)},${escapeCsv(s.category)},${escapeCsv(p.netQuantity)},${escapeCsv(p.mrp)},${escapeCsv(p.manufacturer)},${escapeCsv(p.packer)},${escapeCsv(p.countryOfOrigin)},${escapeCsv(p.batchNumber)},${escapeCsv(p.mfgDate)},${escapeCsv(p.packingDate)},${escapeCsv(p.consumerCare)}\r\n\r\n`;

    // Section 3: Declaration Analysis
    csvContent += "SECTION,DECLARATION ANALYSIS\r\n";
    csvContent += "Field Key,Label (EN),Label (HI),Extracted Value,Confidence %,Source ID,Status\r\n";
    d.forEach((item) => {
      csvContent += `${escapeCsv(item.fieldKey)},${escapeCsv(item.labelEn)},${escapeCsv(item.labelHi)},${escapeCsv(item.extractedValue)},${(item.confidence * 100).toFixed(1)}%,${escapeCsv(item.sourceId)},${escapeCsv(item.status)}\r\n`;
    });
    csvContent += "\r\n";

    // Section 4: Compliance Matrix
    csvContent += "SECTION,STATUTORY COMPLIANCE MATRIX\r\n";
    csvContent += "Rule ID,Statutory Reference,Requirement (EN),Requirement (HI),Observed Packaging Value,Automated Result,Officer Verified Result,Officer Notes,Evidence Reference\r\n";
    c.forEach((row) => {
      csvContent += `${escapeCsv(row.ruleId)},${escapeCsv(row.statutoryReference)},${escapeCsv(row.requirementEn)},${escapeCsv(row.requirementHi || "")},${escapeCsv(row.observedValue)},${escapeCsv(row.automatedResult)},${escapeCsv(row.officerResult || "PENDING")},${escapeCsv(row.officerNotes || "")},${escapeCsv(row.evidenceRef)}\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LabelGuard_Inspection_${s.inspectionId}_Report.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "CSV Report Exported",
      description: `Official Legal Metrology inspection report downloaded as CSV spreadsheet.`,
      type: "success",
    });
  };

  if (!reportData) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">Compiling Legal Metrology Dossier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("reports.title", "Inspection Reports & Legal Dossiers")}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              OFFICIAL INSPECTION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("reports.subtitle", "Audit-grade statutory compliance reports with complete legal traceability")} • ID:{" "}
            <span className="font-mono text-slate-700">{reportData.executiveSummary.reportId}</span>
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            {locale === "hi" ? "सीएसवी निर्यात करें" : "Export CSV Report"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            {locale === "hi" ? "प्रिंट / पीडीएफ सहेजें" : "Print / Save as PDF"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {locale === "hi" ? "पीडीएफ डाउनलोड करें" : "Download PDF Document"}
          </Button>
        </div>
      </div>

      {/* Control Strip (Language Selector + Report Type) */}
      <Card className="p-4 bg-white border border-slate-200 print:hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Language Selection */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Report Language Mode / रिपोर्ट भाषा
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguageMode("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  languageMode === "en"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                English Only
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode("hi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  languageMode === "hi"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                केवल हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode("bilingual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  languageMode === "bilingual"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Bilingual (English + हिन्दी)
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Audit Status</span>
              <span className="font-bold text-slate-900">{reportData.executiveSummary.overallStatus}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rules Evaluated</span>
              <span className="font-bold text-slate-900">{reportData.complianceMatrix.length} Verified Rules</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Officer Attestation</span>
              <span className="font-bold text-emerald-700">Certified</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Report Document Container */}
      <div className="bg-slate-100/70 p-4 sm:p-8 rounded-2xl border border-slate-200 overflow-x-auto print:p-0 print:border-none print:bg-white">
        <InspectionReportDocument
          data={reportData}
          languageMode={languageMode}
        />
      </div>
    </div>
  );
}
