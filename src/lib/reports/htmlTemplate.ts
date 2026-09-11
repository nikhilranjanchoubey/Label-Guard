/**
 * LabelGuard — Professional HTML Generator for PDF Export
 * Generates print-optimized A4 HTML with embedded Google Fonts (Inter + Noto Sans Devanagari).
 * Standalone generator ensures clean Next.js 15 builds with zero react-dom/server bundle conflicts.
 */

import { FullInspectionReportData, ReportLanguageMode } from "./types";

export function generateReportHtml(
  data: FullInspectionReportData,
  languageMode: ReportLanguageMode = "bilingual"
): string {
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
          color: "#065f46",
          bg: "#ecfdf5",
          border: "#6ee7b7",
        };
      case "FAIL":
      case "VIOLATION":
      case "REJECTED":
        return {
          text: isHi ? "उल्लंघन (FAIL)" : "FAIL",
          color: "#991b1b",
          bg: "#fef2f2",
          border: "#fca5a5",
        };
      case "REVIEW":
      case "REVIEW_REQUIRED":
      case "REQUIRES_REVIEW":
        return {
          text: isHi ? "समीक्षा अपेक्षित (REVIEW)" : "REVIEW",
          color: "#92400e",
          bg: "#fffbeb",
          border: "#fcd34d",
        };
      default:
        return {
          text: isHi ? "लागू नहीं" : "NOT APPLICABLE",
          color: "#334155",
          bg: "#f1f5f9",
          border: "#cbd5e1",
        };
    }
  };

  const statusBadge = getStatusBadge(s.overallStatus);

  return `<!DOCTYPE html>
<html lang="${isHi ? "hi" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LabelGuard Inspection Report — ${s.inspectionId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .report-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 10px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      line-height: 1.1;
    }
    .brand-subtitle {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-top: 2px;
    }
    .report-heading {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 6px;
    }
    .statutory-ref {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
    }
    .demo-tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.5px;
      background: #fef3c7;
      color: #78350f;
      border: 1px solid #fde68a;
      margin-bottom: 4px;
    }
    .section-title {
      background: #f8fafc;
      padding: 5px 8px;
      border-left: 4px solid #0f172a;
      border-radius: 0 4px 4px 0;
      margin-bottom: 8px;
      margin-top: 14px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
      break-after: avoid;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .stat-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      background: #ffffff;
    }
    .stat-card .label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .stat-card .val {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 6px;
      break-inside: auto;
    }
    tr {
      break-inside: avoid;
      break-after: auto;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      text-align: left;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: middle;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 700;
      border-width: 1px;
      border-style: solid;
      white-space: nowrap;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .disclaimer-box {
      border-top: 2px solid #cbd5e1;
      padding-top: 12px;
      margin-top: 16px;
      break-inside: avoid;
    }
    .disclaimer-content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 9.5px;
      color: #475569;
      line-height: 1.5;
    }
    .disclaimer-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .footer-bar {
      border-top: 1px solid #e2e8f0;
      margin-top: 8px;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- HEADER -->
    <div class="header">
      <div>
        <div class="brand-title">LABELGUARD</div>
        <div class="brand-subtitle">Legal Metrology Inspection Platform • विधिक मापविज्ञान प्रणाली</div>
        <div class="report-heading">
          ${
            isHi
              ? "विधिक मापविज्ञान पैकेज अनुपालन रिपोर्ट"
              : isBi
              ? "Legal Metrology Package Compliance Report / विधिक मापविज्ञान पैकेज अनुपालन रिपोर्ट"
              : "Legal Metrology Package Compliance Report"
          }
        </div>
        <div class="statutory-ref">
          Pursuant to the Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
        </div>
      </div>
      <div class="meta-box">
        <div style="font-size: 9.5px; color: #475569;">
          <div><strong style="color: #0f172a;">Inspection ID:</strong> <span class="mono">${s.inspectionId}</span></div>
          <div><strong style="color: #0f172a;">Report ID:</strong> <span class="mono">${s.reportId}</span></div>
          <div><strong style="color: #0f172a;">Date/Time:</strong> ${new Date(s.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
        </div>
      </div>
    </div>

    <!-- SECTION 1: EXECUTIVE SUMMARY -->
    <div class="section-title">
      1. ${isHi ? "कार्यकारी सारांश" : isBi ? "Executive Summary / कार्यकारी सारांश" : "Executive Summary"}
    </div>
    <div class="grid-4" style="margin-bottom: 10px;">
      <div class="stat-card">
        <div class="label">Overall Assessment</div>
        <div style="margin-top: 4px;">
          <span class="badge" style="background: ${statusBadge.bg}; color: ${statusBadge.color}; border-color: ${statusBadge.border}; font-size: 11px; padding: 4px 8px;">
            ${statusBadge.text}
          </span>
        </div>
      </div>
      <div class="stat-card">
        <div class="label">Rules Evaluated</div>
        <div class="val">${s.totalRulesEvaluated}</div>
        <div style="font-size: 8px; color: #64748b;">${s.rulesPassed} Pass • ${s.rulesFailed} Fail • ${s.rulesReview} Review</div>
      </div>
      <div class="stat-card">
        <div class="label">Inspecting Officer</div>
        <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 2px;">${s.officerName}</div>
        <div style="font-size: 8px; color: #64748b;">${s.officerDesignation} (${s.officerBadge})</div>
      </div>
      <div class="stat-card">
        <div class="label">Station & Zone</div>
        <div style="font-size: 10px; font-weight: 600; color: #0f172a; margin-top: 2px;">${s.inspectionStation}</div>
        <div style="font-size: 8px; color: #64748b;">Verified: ${s.officerConfirmedCount} Rules</div>
      </div>
    </div>

    <!-- SECTION 2: PRODUCT INFORMATION -->
    <div class="section-title">
      2. ${isHi ? "उत्पाद विवरण" : isBi ? "Product Information / उत्पाद विवरण" : "Product Information"}
    </div>
    <table>
      <tbody>
        <tr>
          <td style="width: 25%; font-weight: 600; background: #f8fafc;">Product & Brand / उत्पाद एवं ब्रांड</td>
          <td style="width: 25%; font-weight: 700;">${p.productName} (${p.brand})</td>
          <td style="width: 25%; font-weight: 600; background: #f8fafc;">Declared Net Quantity / शुद्ध मात्रा</td>
          <td style="width: 25%; font-weight: 700;">${p.netQuantity}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; background: #f8fafc;">Manufacturer / निर्माता</td>
          <td colspan="3">${p.manufacturer}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; background: #f8fafc;">Packer & Importer / पैकर एवं आयातक</td>
          <td>${p.packer}</td>
          <td style="font-weight: 600; background: #f8fafc;">Country of Origin / मूल देश</td>
          <td style="font-weight: 700;">${p.countryOfOrigin}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; background: #f8fafc;">Retail Sale Price (MRP) / एमआरपी</td>
          <td style="font-weight: 700; color: #0f172a;">${p.mrp}</td>
          <td style="font-weight: 600; background: #f8fafc;">Batch / Lot No. / बैच संख्या</td>
          <td class="mono">${p.batchNumber}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; background: #f8fafc;">Date Declarations / तिथियां</td>
          <td>Mfg: ${p.mfgDate} • Pkd: ${p.packingDate}</td>
          <td style="font-weight: 600; background: #f8fafc;">Consumer Care / उपभोक्ता सहायता</td>
          <td>${p.consumerCare}</td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION 3: IMAGE & OCR INFORMATION -->
    <div class="section-title">
      3. ${isHi ? "छवि एवं ओसीआर जानकारी" : isBi ? "Image & OCR Information / छवि एवं ओसीआर जानकारी" : "Image & OCR Information"}
    </div>
    <table>
      <tbody>
        <tr>
          <td style="width: 25%; font-weight: 600; background: #f8fafc;">Scanned Surfaces / सतहें</td>
          <td style="width: 25%;">${o.scannedSurfaces.join(", ")}</td>
          <td style="width: 25%; font-weight: 600; background: #f8fafc;">OCR Confidence / सटीकता</td>
          <td style="width: 25%; font-weight: 700; color: #065f46;">${(o.overallConfidence * 100).toFixed(1)}% (High)</td>
        </tr>
        <tr>
          <td style="font-weight: 600; background: #f8fafc;">Detected Tokens / टोकन संख्या</td>
          <td>${o.totalTokensDetected} Tokens (${o.languagesDetected.join(", ")})</td>
          <td style="font-weight: 600; background: #f8fafc;">Processing Time / समय</td>
          <td>${o.processingTimeMs} ms</td>
        </tr>
        <tr>
          <td style="font-weight: 600; background: #f8fafc;">Image Quality Assessment</td>
          <td colspan="3">
            Resolution: <strong>${o.qualityMetrics?.resolution || "High"}</strong> • 
            Lighting: <strong>${o.qualityMetrics?.lighting || "Good"}</strong> • 
            Blur Index: <strong>${o.qualityMetrics?.blurIndex || "Low"}</strong> • 
            Orientation: <strong>${o.qualityMetrics?.orientation || "0°"}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION 4: DECLARATION ANALYSIS -->
    <div class="section-title">
      4. ${isHi ? "पैकेज घोषणा विश्लेषण" : isBi ? "Declaration Analysis / पैकेज घोषणा विश्लेषण" : "Declaration Analysis"}
    </div>
    <table>
      <thead>
        <tr>
          <th>Declaration / घोषणा</th>
          <th>Extracted Value / निष्कर्ष</th>
          <th style="text-align: center;">Confidence</th>
          <th>Evidence Source</th>
          <th style="text-align: right;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.declarations.map((d) => {
          const conf = (d.confidence * 100).toFixed(1);
          return `<tr>
            <td style="font-weight: 600;">
              ${d.labelEn}
              ${isBi ? `<div style="font-size: 8.5px; color: #64748b;">${d.labelHi}</div>` : ""}
            </td>
            <td style="font-weight: 500;">${d.extractedValue}</td>
            <td style="text-align: center;" class="mono">${conf}%</td>
            <td class="mono" style="font-size: 9px; color: #64748b;">${d.sourceId}</td>
            <td style="text-align: right;">
              <span class="badge" style="background: #ecfdf5; color: #065f46; border-color: #a7f3d0;">
                ${d.status}
              </span>
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>

    <!-- SECTION 5: COMPLIANCE MATRIX -->
    <div class="section-title">
      5. ${isHi ? "विधिक अनुपालन मैट्रिक्स" : isBi ? "Statutory Compliance Matrix / विधिक अनुपालन मैट्रिक्स" : "Statutory Compliance Matrix"}
    </div>
    <table>
      <thead>
        <tr>
          <th>Statutory Rule / विधिक नियम</th>
          <th>Requirement / अपेक्षा</th>
          <th>Observed Packaging Value</th>
          <th style="text-align: center;">Automated Result</th>
          <th style="text-align: center;">Officer Verified</th>
          <th>Evidence Link</th>
        </tr>
      </thead>
      <tbody>
        ${data.complianceMatrix.map((r) => {
          const autoBadge = getStatusBadge(r.automatedResult);
          const officerBadge = r.officerResult ? getStatusBadge(r.officerResult) : null;
          return `<tr>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${r.statutoryReference}</div>
              <div class="mono" style="font-size: 8.5px; color: #64748b;">${r.ruleId}</div>
            </td>
            <td>
              <div>${r.requirementEn}</div>
              ${isBi && r.requirementHi ? `<div style="font-size: 8.5px; color: #64748b;">${r.requirementHi}</div>` : ""}
            </td>
            <td style="font-size: 9.5px;">${r.observedValue}</td>
            <td style="text-align: center;">
              <span class="badge" style="background: ${autoBadge.bg}; color: ${autoBadge.color}; border-color: ${autoBadge.border};">
                ${autoBadge.text}
              </span>
            </td>
            <td style="text-align: center;">
              ${
                officerBadge
                  ? `<span class="badge" style="background: ${officerBadge.bg}; color: ${officerBadge.color}; border-color: ${officerBadge.border};">
                      ${officerBadge.text}
                    </span>`
                  : `<span style="color: #94a3b8; font-size: 8.5px;">Pending</span>`
              }
            </td>
            <td class="mono" style="font-size: 8.5px; color: #64748b;">${r.evidenceRef}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>

    <!-- SECTION 6: EVIDENCE TRACEABILITY -->
    <div class="section-title">
      6. ${isHi ? "ओसीआर साक्ष्य" : isBi ? "OCR Evidence & Packaging Traces / ओसीआर साक्ष्य" : "OCR Evidence & Packaging Traces"}
    </div>
    <table>
      <thead>
        <tr>
          <th>Evidence ID</th>
          <th>Surface</th>
          <th>Declaration Item</th>
          <th>Raw Detected OCR Text</th>
          <th style="text-align: center;">Confidence</th>
          <th>Bounding Box (x, y, w, h)</th>
        </tr>
      </thead>
      <tbody>
        ${data.evidenceItems.map((e) => `<tr>
          <td class="mono" style="font-weight: 700;">${e.id}</td>
          <td><strong>${e.surface}</strong></td>
          <td style="font-weight: 600;">${e.declarationName}</td>
          <td style="color: #334155; font-style: italic;">"${e.rawOcrText}"</td>
          <td style="text-align: center;" class="mono">${(e.confidence * 100).toFixed(1)}%</td>
          <td class="mono" style="font-size: 8.5px; color: #64748b;">
            ${e.boundingBox ? `[${e.boundingBox.x}%, ${e.boundingBox.y}%, ${e.boundingBox.width}%, ${e.boundingBox.height}%]` : "Unavailable"}
          </td>
        </tr>`).join("")}
      </tbody>
    </table>

    <!-- SECTION 7: OFFICER VERIFICATION -->
    <div class="section-title">
      7. ${isHi ? "अधिकारी सत्यापन रिकॉर्ड" : isBi ? "Officer Verification Audit / अधिकारी सत्यापन रिकॉर्ड" : "Officer Verification Audit"}
    </div>
    <table>
      <thead>
        <tr>
          <th>Rule Reference</th>
          <th style="text-align: center;">Automated Status</th>
          <th style="text-align: center;">Officer Decision</th>
          <th>Officer Justification / Notes</th>
          <th>Verified By & Station</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${
          data.verifications && data.verifications.length > 0
            ? data.verifications.map((v) => {
                const autoBadge = getStatusBadge(v.originalAutomatedStatus);
                const offBadge = getStatusBadge(v.officerStatus);
                return `<tr>
                  <td style="font-weight: 600;">${v.statutoryReference}</td>
                  <td style="text-align: center;">
                    <span class="badge" style="background: ${autoBadge.bg}; color: ${autoBadge.color}; border-color: ${autoBadge.border};">
                      ${autoBadge.text}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge" style="background: ${offBadge.bg}; color: ${offBadge.color}; border-color: ${offBadge.border};">
                      ${offBadge.text}
                    </span>
                  </td>
                  <td>${v.reason || v.note || "Verified against packaging evidence."}</td>
                  <td>${v.officer?.name || s.officerName} (${v.officer?.badgeNumber || s.officerBadge})</td>
                  <td class="mono" style="font-size: 8.5px;">${new Date(v.timestamp).toLocaleTimeString()}</td>
                </tr>`;
              }).join("")
            : `<tr>
                <td colspan="6" style="text-align: center; color: #64748b; padding: 8px;">
                  All evaluated declarations confirmed by inspecting officer ${s.officerName} (${s.officerBadge}).
                </td>
              </tr>`
        }
      </tbody>
    </table>

    <!-- SECTION 8: IMMUTABLE AUDIT TRAIL -->
    <div class="section-title">
      8. ${isHi ? "अपरिवर्तनीय ऑडिट ट्रेल" : isBi ? "Immutable Audit Trail / अपरिवर्तनीय ऑडिट ट्रेल" : "Immutable Audit Trail"}
    </div>
    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Actor / Role</th>
          <th>Timestamp (IST)</th>
          <th style="text-align: right;">Cryptographic Hash</th>
        </tr>
      </thead>
      <tbody>
        ${data.auditTrail.slice(-5).map((a) => `<tr>
          <td class="mono" style="font-weight: 600; color: #1e293b;">${a.action}</td>
          <td>${a.user?.name || "System"} (${a.user?.role || "SYSTEM"})</td>
          <td style="color: #64748b;">${new Date(a.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
          <td style="text-align: right;" class="mono">${a.hash ? a.hash.slice(0, 16) + "..." : "Tamper-Evident"}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <!-- SECTION 9: LEGAL SOURCE TRACEABILITY -->
    <div class="section-title">
      9. ${isHi ? "विधिक स्रोत अनुरेखणीयता" : isBi ? "Legal Source Traceability / विधिक स्रोत अनुरेखणीयता" : "Legal Source Traceability"}
    </div>
    <table>
      <thead>
        <tr>
          <th>Statutory Rule</th>
          <th>Source Document & Official Section</th>
          <th style="text-align: center;">Effective Date</th>
          <th style="text-align: right;">Verification Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.legalSources.slice(0, 8).map((ls) => `<tr>
          <td style="font-weight: 700; color: #0f172a;">
            ${ls.statutoryReference}
            <div class="mono" style="font-size: 8px; color: #64748b;">${ls.internalRuleId}</div>
          </td>
          <td>
            <div>${ls.sourceDocument}</div>
            <div class="mono" style="font-size: 8.5px; color: #64748b;">${ls.sourceSection}</div>
          </td>
          <td style="text-align: center;" class="mono">${ls.effectiveDate}</td>
          <td style="text-align: right;">
            <span class="badge" style="background: #ecfdf5; color: #065f46; border-color: #a7f3d0;">
              ${ls.verificationStatus}
            </span>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>

    <!-- SECTION 10: DISCLAIMER -->
    <div class="disclaimer-box">
      <div class="disclaimer-content">
        <div class="disclaimer-title">
          10. ${isHi ? "वैधानिक अस्वीकरण" : isBi ? "Statutory Disclaimer / वैधानिक अस्वीकरण" : "Statutory Disclaimer"}
        </div>
        ${
          languageMode === "en" || languageMode === "bilingual"
            ? `<p style="margin-bottom: 4px;">
                "LabelGuard provides automated compliance assistance based on configured legal rules.
                Final enforcement decisions require authorized human verification."
              </p>`
            : ""
        }
        ${
          languageMode === "hi" || languageMode === "bilingual"
            ? `<p style="color: #334155;">
                "LabelGuard कॉन्फ़िगर किए गए कानूनी नियमों के आधार पर स्वचालित अनुपालन सहायता प्रदान करता है।
                अंतिम प्रवर्तन निर्णय अधिकृत मानव सत्यापन के अधीन हैं।"
              </p>`
            : ""
        }
        <div class="footer-bar">
          <span>Generated securely via LabelGuard Deterministic Metrology Core.</span>
          <span>Official Inspection Dossier • Legal Metrology Act, 2009</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
