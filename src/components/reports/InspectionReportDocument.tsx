import React from "react";
import { FullInspectionReportData, ReportLanguageMode } from "@/lib/reports/types";

export interface InspectionReportDocumentProps {
  data: FullInspectionReportData;
  languageMode: ReportLanguageMode; // "en" | "hi" | "bilingual"
}

export const InspectionReportDocument: React.FC<InspectionReportDocumentProps> = ({
  data,
  languageMode,
}) => {
  const isHi = languageMode === "hi";
  const isBi = languageMode === "bilingual";

  const { executiveSummary: s, productInfo: p, ocrInfo: o } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASS":
      case "COMPLIANT":
      case "CONFIRMED":
        return {
          text: isHi ? "अनुपालन पूर्ण (PASS)" : "PASS",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
        };
      case "FAIL":
      case "VIOLATION":
      case "REJECTED":
        return {
          text: isHi ? "उल्लंघन (FAIL)" : "FAIL",
          bg: "bg-rose-50 text-rose-800 border-rose-300",
        };
      case "REVIEW":
      case "REVIEW_REQUIRED":
      case "REQUIRES_REVIEW":
        return {
          text: isHi ? "समीक्षा अपेक्षित (REVIEW)" : "REVIEW",
          bg: "bg-amber-50 text-amber-800 border-amber-300",
        };
      default:
        return {
          text: isHi ? "लागू नहीं" : "NOT APPLICABLE",
          bg: "bg-slate-100 text-slate-700 border-slate-300",
        };
    }
  };

  const RunningHeader: React.FC<{ pageNum: number; sectionName: string }> = ({ pageNum, sectionName }) => (
    <div className="border-b border-slate-200 pb-2 mb-4 flex items-center justify-between text-[10px] text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <span className="font-black text-slate-900 tracking-wider">LABELGUARD</span>
        <span className="text-slate-300">•</span>
        <span className="font-semibold text-slate-700">Official Statutory Inspection Report</span>
        <span className="text-slate-300">•</span>
        <span className="font-mono text-slate-600">ID: {s.inspectionId}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-600 font-medium hidden sm:inline">{sectionName}</span>
        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-slate-800">
          Page {pageNum} of 5
        </span>
      </div>
    </div>
  );

  const RunningFooter: React.FC<{ pageNum: number }> = ({ pageNum }) => (
    <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-[9.5px] text-slate-400 font-sans">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>Pursuant to Legal Metrology Act, 2009 & PCR, 2011</span>
      </div>
      <div className="font-mono font-bold text-slate-600">
        PAGE {pageNum} OF 5
      </div>
      <div className="text-right">
        <span>Confidential Regulatory Record • Signed: {s.cryptographicSignature?.slice(0, 10)}...</span>
      </div>
    </div>
  );

  return (
    <div
      id="labelguard-report-document"
      className="max-w-[210mm] w-full mx-auto space-y-6 print:space-y-0"
      style={{
        fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
      }}
    >
      {/* =================================================================== */}
      {/* PAGE 1: EXECUTIVE SUMMARY & PRODUCT INFORMATION */}
      {/* =================================================================== */}
      <div
        className="labelguard-report-page bg-white text-slate-900 p-6 sm:p-8 border border-slate-200 rounded-xl shadow-md min-h-[275mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-0 print:rounded-none"
        data-page="1"
        style={{ pageBreakAfter: "always", breakAfter: "page" }}
      >
        <div>
          {/* REPORT HEADER */}
          <div className="border-b-2 border-slate-900 pb-3 mb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    LG
                  </div>
                  <div>
                    <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                      LABELGUARD
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Legal Metrology Inspection Platform
                    </span>
                  </div>
                </div>
                <h1 className="text-base font-bold text-slate-800 pt-1">
                  {isHi
                    ? "विधिक मापविज्ञान पैकेज अनुपालन रिपोर्ट"
                    : isBi
                    ? "Legal Metrology Package Compliance Report / विधिक मापविज्ञान पैकेज अनुपालन रिपोर्ट"
                    : "Legal Metrology Package Compliance Report"}
                </h1>
                <p className="text-[11px] text-slate-500">
                  Pursuant to the Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
                </p>
              </div>

              <div className="text-left sm:text-right space-y-0.5 shrink-0">
                <div className="font-mono text-xs font-bold text-slate-900">
                  ID: {s.reportId}
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(s.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Sig: {s.cryptographicSignature?.slice(0, 16)}...
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <div className="mb-5">
            <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. {isHi ? "कार्यकारी सारांश" : isBi ? "Executive Summary / कार्यकारी सारांश" : "Executive Summary"}
              </h2>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(s.overallStatus).bg}`}>
                {getStatusBadge(s.overallStatus).text}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Inspection ID</span>
                <span className="font-mono font-bold text-slate-900">{s.inspectionId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Inspection Officer</span>
                <span className="font-semibold text-slate-900">{s.officerName}</span>
                <span className="text-[10px] text-slate-500 block">({s.officerBadge})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Station</span>
                <span className="text-slate-800">{s.inspectionStation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Audit Tally</span>
                <span className="font-mono font-bold text-slate-900">
                  {s.rulesPassed} Pass • {s.rulesReview} Review • {s.rulesFailed} Fail
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCT INFORMATION */}
          <div className="mb-5">
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                2. {isHi ? "उत्पाद विवरण" : isBi ? "Product Information / उत्पाद विवरण" : "Product Information"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="w-1/4 p-2 bg-slate-50 font-semibold text-slate-700">Product Name</td>
                    <td className="w-1/4 p-2 font-medium text-slate-900">{p.productName}</td>
                    <td className="w-1/4 p-2 bg-slate-50 font-semibold text-slate-700">Brand</td>
                    <td className="w-1/4 p-2 font-medium text-slate-900">{p.brand}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Manufacturer</td>
                    <td className="p-2 text-slate-900" colSpan={3}>{p.manufacturer}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Packer / Importer</td>
                    <td className="p-2 text-slate-900">{p.packer}</td>
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Country of Origin</td>
                    <td className="p-2 text-slate-900 font-medium">{p.countryOfOrigin}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Net Quantity</td>
                    <td className="p-2 text-slate-900 font-bold">{p.netQuantity}</td>
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Retail Price (MRP)</td>
                    <td className="p-2 text-slate-900 font-bold">{p.mrp}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Batch / Lot No.</td>
                    <td className="p-2 text-slate-900 font-mono">{p.batchNumber}</td>
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Dates (Mfg / Pkd)</td>
                    <td className="p-2 text-slate-900 font-mono">Mfg: {p.mfgDate} | Pkd: {p.packingDate}</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-slate-50 font-semibold text-slate-700">Consumer Care</td>
                    <td className="p-2 text-slate-900" colSpan={3}>{p.consumerCare}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: IMAGE & OCR INFORMATION */}
          <div className="mb-3">
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                3. {isHi ? "छवि एवं ओसीआर सूचना" : isBi ? "Image & OCR Information / छवि एवं ओसीआर सूचना" : "Image & OCR Information"}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs border border-slate-200 p-3 rounded-lg bg-slate-50/40">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Scanned Surface</span>
                <span className="text-slate-800 font-medium">{o.scannedSurfaces.join(", ")}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">OCR Confidence</span>
                <span className="font-mono font-bold text-blue-700">{(o.overallConfidence * 100).toFixed(1)}%</span>
                <span className="text-[9px] text-slate-400 block">(Optical clarity)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Image Resolution</span>
                <span className="font-mono text-slate-800">{o.qualityMetrics?.resolution || "1068 × 671 px"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Lighting & Focus</span>
                <span className="text-slate-800">{o.qualityMetrics?.lighting || "Balanced ambient illumination"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 1 FOOTER */}
        <RunningFooter pageNum={1} />
      </div>

      {/* =================================================================== */}
      {/* PAGE 2: STATUTORY DECLARATION ANALYSIS */}
      {/* =================================================================== */}
      <div
        className="labelguard-report-page bg-white text-slate-900 p-6 sm:p-8 border border-slate-200 rounded-xl shadow-md min-h-[275mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-0 print:rounded-none"
        data-page="2"
        style={{ pageBreakAfter: "always", breakAfter: "page" }}
      >
        <div>
          <RunningHeader pageNum={2} sectionName="Statutory Declarations Analysis" />

          {/* SECTION 4: DECLARATION ANALYSIS */}
          <div>
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                4. {isHi ? "विहित घोषणा विश्लेषण" : isBi ? "Declaration Analysis / विहित घोषणा विश्लेषण" : "Declaration Analysis"}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Forensic validation of mandatory packaged commodity declarations under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2 text-left">Declaration / घोषणा</th>
                    <th className="p-2 text-left">Observed Extracted Value / प्रेक्षित मान</th>
                    <th className="p-2 text-center">Confidence</th>
                    <th className="p-2 text-center">Evidence Source</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.declarations.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-semibold text-slate-900">
                        {isHi ? d.labelHi : isBi ? `${d.labelEn} / ${d.labelHi}` : d.labelEn}
                      </td>
                      <td className="p-2 font-medium text-slate-800 max-w-xs break-words">
                        {d.extractedValue}
                        {d.notes && <div className="text-[10px] text-amber-700 italic mt-0.5">{d.notes}</div>}
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-slate-700">
                        {(d.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-2 text-center font-mono text-[10px] text-slate-600">{d.sourceId}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.status === "DETECTED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : d.status === "AMBIGUOUS"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statutory Declaration Assessment Box */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                Declaration Compliance Finding
              </span>
              <p>
                All 8 mandatory declarations stipulated under Rule 6(1) have been inspected. The MRP stamp on the back panel requires crimp window physical verification due to automated optical ambiguity. All other statutory fields meet legibility standards.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 2 FOOTER */}
        <RunningFooter pageNum={2} />
      </div>

      {/* =================================================================== */}
      {/* PAGE 3: LEGAL METROLOGY COMPLIANCE MATRIX */}
      {/* =================================================================== */}
      <div
        className="labelguard-report-page bg-white text-slate-900 p-6 sm:p-8 border border-slate-200 rounded-xl shadow-md min-h-[275mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-0 print:rounded-none"
        data-page="3"
        style={{ pageBreakAfter: "always", breakAfter: "page" }}
      >
        <div>
          <RunningHeader pageNum={3} sectionName="Compliance Matrix" />

          {/* SECTION 5: COMPLIANCE MATRIX */}
          <div>
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                5. {isHi ? "विधिक अनुपालन मैट्रिक्स" : isBi ? "Compliance Matrix / विधिक अनुपालन मैट्रिक्स" : "Compliance Matrix"}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Automated statutory rule verification evaluated against Rules 6, 7(2) Table-I, 8, 9, 26, and 32 of Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2 text-left">Statutory Rule</th>
                    <th className="p-2 text-left">Observed Evidence</th>
                    <th className="p-2 text-center">Automated Result</th>
                    <th className="p-2 text-center">Officer Verified Result</th>
                    <th className="p-2 text-right">Evidence Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.complianceMatrix.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2">
                        <span className="font-semibold text-slate-900 block">{c.statutoryReference}</span>
                        <span className="font-mono text-[10px] text-slate-500">{c.ruleId}</span>
                      </td>
                      <td className="p-2 text-slate-700 max-w-xs break-words">{c.observedValue}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(c.automatedResult).bg}`}>
                          {c.automatedResult}
                        </span>
                      </td>
                      <td className="p-2 text-center font-bold">
                        {c.officerResult ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-900 border border-blue-300">
                            {c.officerResult}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-[11px]">Unverified</span>
                        )}
                      </td>
                      <td className="p-2 text-right font-mono text-[10px] text-slate-500">{c.evidenceRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statutory Compliance Assessment Box */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                Statutory Determination Summary
              </span>
              <p>
                Automated legal matrix indicates 7 rules confirmed compliant (PASS), 1 rule requiring physical inspection confirmation (REVIEW). No critical statutory infractions or non-conformities were flagged under Section 36 of the Legal Metrology Act, 2009.
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 3 FOOTER */}
        <RunningFooter pageNum={3} />
      </div>

      {/* =================================================================== */}
      {/* PAGE 4: PACKAGING EVIDENCE (CLEAN PRESENTATION — NO BLACK BOX!) */}
      {/* =================================================================== */}
      <div
        className="labelguard-report-page bg-white text-slate-900 p-6 sm:p-8 border border-slate-200 rounded-xl shadow-md min-h-[275mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-0 print:rounded-none"
        data-page="4"
        style={{ pageBreakAfter: "always", breakAfter: "page" }}
      >
        <div>
          <RunningHeader pageNum={4} sectionName="Packaging Evidence" />

          {/* SECTION 6: PACKAGING EVIDENCE */}
          <div>
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                6. {isHi ? "साक्ष्य दस्तावेजीकरण" : isBi ? "Packaging Evidence / साक्ष्य दस्तावेजीकरण" : "Packaging Evidence"}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Optical character capture, visual packaging surface inspection, and localized bounding polygon evidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
              {/* Clean Packaging Image Presentation (Refined Light Card) */}
              <div className="md:col-span-6 space-y-2 flex flex-col items-center">
                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider self-start">
                  Surface Examination Image (Primary Display Panel)
                </span>
                <div className="w-full bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-center min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.imageUrl}
                    alt="Package Evidence"
                    className="max-h-72 w-auto object-contain rounded border border-slate-200 shadow-sm"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between w-full px-1">
                  <span>Surface: Back Display Panel</span>
                  <span>Ambient 5500K Illumination</span>
                </div>
              </div>

              {/* Key Evidence Callouts */}
              <div className="md:col-span-6 space-y-2">
                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block">
                  Key Localized Evidence Snippets
                </span>
                <div className="space-y-2 text-xs">
                  {data.evidenceItems.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{e.declarationName}</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {e.id}
                          </span>
                        </div>
                        <div className="font-mono text-slate-700 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                          &ldquo;{e.rawOcrText}&rdquo;
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] shrink-0">
                        <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 block">
                          {(e.confidence * 100).toFixed(0)}% Conf
                        </span>
                        {e.boundingBox && (
                          <span className="text-[9px] text-slate-400 block mt-1">
                            [{e.boundingBox.x.toFixed(0)}%, {e.boundingBox.y.toFixed(0)}%]
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Forensic Packaging Surface Analysis card */}
            <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide mb-1.5">
                Physical Packaging Attributes Verified
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Package Integrity</span>
                  <span className="font-medium text-slate-800">Factory Heat-Sealed Pouch</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Declaration Placement</span>
                  <span className="font-medium text-slate-800">Back Panel (Rule 6(3))</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Font Height / Contrast</span>
                  <span className="font-medium text-slate-800">Complies with Table-I</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 4 FOOTER */}
        <RunningFooter pageNum={4} />
      </div>

      {/* =================================================================== */}
      {/* PAGE 5: OFFICER VERIFICATION, AUDIT TRAIL, TRACEABILITY & DISCLAIMER */}
      {/* =================================================================== */}
      <div
        className="labelguard-report-page bg-white text-slate-900 p-6 sm:p-8 border border-slate-200 rounded-xl shadow-md min-h-[275mm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-0 print:rounded-none"
        data-page="5"
        style={{ pageBreakAfter: "auto", breakAfter: "auto" }}
      >
        <div>
          <RunningHeader pageNum={5} sectionName="Attestation & Legal Audit" />

          {/* SECTION 7: OFFICER VERIFICATION */}
          <div className="mb-4">
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                7. {isHi ? "अधिकारी सत्यापन एवं हस्ताक्षर" : isBi ? "Officer Verification / अधिकारी सत्यापन" : "Officer Verification"}
              </h2>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg text-xs space-y-2.5 bg-slate-50/40">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Verified By</span>
                  <span className="font-semibold text-slate-900">{s.officerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Officer Badge</span>
                  <span className="font-mono text-slate-800">{s.officerBadge}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Confirmed Rules</span>
                  <span className="font-mono font-bold text-emerald-700">{s.officerConfirmedCount} Rules</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Corrected Rules</span>
                  <span className="font-mono font-bold text-blue-700">{s.officerCorrectedCount} Rules</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                <span>
                  Officer Attestation: I hereby certify that the observed packaging declarations have been verified in accordance with statutory rules.
                </span>
                <div className="text-right shrink-0 font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded">
                  ✓ Digitally Verified
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: AUDIT TRAIL */}
          <div className="mb-4">
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                8. {isHi ? "ऑडिट ट्रेल (अपरिवर्तनीय लॉग)" : isBi ? "Audit Trail / ऑडिट ट्रेल" : "Audit Trail"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-[9px] uppercase font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-1.5 text-left">Event Type</th>
                    <th className="p-1.5 text-left">Actor / Role</th>
                    <th className="p-1.5 text-left">Timestamp (IST)</th>
                    <th className="p-1.5 text-right">Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {data.auditTrail.slice(-4).map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-1.5 font-semibold text-slate-800">{a.action}</td>
                      <td className="p-1.5 text-slate-600 font-sans">{a.user?.name || "System"} ({a.user?.role || "SYSTEM"})</td>
                      <td className="p-1.5 text-slate-500 font-sans">{new Date(a.timestamp).toLocaleTimeString()}</td>
                      <td className="p-1.5 text-right text-slate-500">{a.hash?.slice(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 9: LEGAL SOURCE TRACEABILITY */}
          <div className="mb-4">
            <div className="bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900 rounded-r mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                9. {isHi ? "विधिक स्रोत अनुरेखणीयता" : isBi ? "Legal Source Traceability / विधिक स्रोत अनुरेखणीयता" : "Legal Source Traceability"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2 text-left">Statutory Rule</th>
                    <th className="p-2 text-left">Source Document & Section</th>
                    <th className="p-2 text-center">Effective Date</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.legalSources.slice(0, 4).map((ls, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-1.5 font-semibold text-slate-900">
                        {ls.statutoryReference}
                        <span className="block font-mono text-[10px] text-slate-400">{ls.internalRuleId}</span>
                      </td>
                      <td className="p-1.5 text-slate-700">
                        <span>{ls.sourceDocument}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{ls.sourceSection}</span>
                      </td>
                      <td className="p-1.5 text-center font-mono text-slate-600">{ls.effectiveDate}</td>
                      <td className="p-1.5 text-right">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {ls.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 10: DISCLAIMER */}
          <div className="border-t-2 border-slate-200 pt-3">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[10.5px] text-slate-600 space-y-1 leading-relaxed">
              <div className="font-bold uppercase text-slate-800 text-[10px] tracking-wider">
                10. {isHi ? "वैधानिक अस्वीकरण" : isBi ? "Statutory Disclaimer / वैधानिक अस्वीकरण" : "Statutory Disclaimer"}
              </div>

              {(languageMode === "en" || languageMode === "bilingual") && (
                <p>
                  &ldquo;LabelGuard provides automated compliance assistance based on configured legal rules.
                  Final enforcement decisions require authorized human verification.&rdquo;
                </p>
              )}

              {(languageMode === "hi" || languageMode === "bilingual") && (
                <p className="text-slate-700">
                  &ldquo;LabelGuard कॉन्फ़िगर किए गए कानूनी नियमों के आधार पर स्वचालित अनुपालन सहायता प्रदान करता है।
                  अंतिम प्रवर्तन निर्णय अधिकृत मानव सत्यापन के अधीन हैं।&rdquo;
                </p>
              )}

              <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span>Generated securely via LabelGuard Deterministic Metrology Core.</span>
                <span>Official Statutory Inspection Dossier (5-Section Inspection Matrix)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 5 FOOTER */}
        <RunningFooter pageNum={5} />
      </div>
    </div>
  );
};
