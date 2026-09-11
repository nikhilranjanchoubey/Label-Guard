/**
 * LabelGuard — PDF Renderer Architecture
 * Extensible renderer abstraction for compiling statutory inspection reports into PDF.
 * Supports Local Headless Edge on Windows demo environment with graceful fallback.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface ReportRenderer {
  name: string;
  isAvailable(): Promise<boolean>;
  renderHtmlToPdf(html: string): Promise<Buffer>;
}

/**
 * Local Headless Chromium / Microsoft Edge PDF Renderer
 * Uses native system Chromium rendering engine for 100% authentic Devanagari ligatures.
 */
export class EdgeHeadlessRenderer implements ReportRenderer {
  public name = "EdgeHeadlessRenderer";

  private edgePaths = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  public async getExecutablePath(): Promise<string | null> {
    for (const p of this.edgePaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  public async isAvailable(): Promise<boolean> {
    const p = await this.getExecutablePath();
    return p !== null;
  }

  public async renderHtmlToPdf(html: string): Promise<Buffer> {
    const exe = await this.getExecutablePath();
    if (!exe) {
      throw new Error("Local Microsoft Edge executable not found on host system.");
    }

    const tempDir = os.tmpdir();
    const nonce = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tempHtml = path.join(tempDir, `labelguard_rep_${nonce}.html`);
    const tempPdf = path.join(tempDir, `labelguard_rep_${nonce}.pdf`);

    // Use self-contained HTML directly if already formatted, avoiding slow external CDN script downloads
    const finalHtml = html.includes("<!DOCTYPE html>")
      ? html
      : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>LabelGuard Inspection Report</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    body {
      font-family: 'Inter', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .break-inside-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    table, tr {
      page-break-inside: avoid !important;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    try {
      await fs.promises.writeFile(tempHtml, finalHtml, "utf-8");

      // Execute modern headless print-to-pdf with compositor acceleration
      try {
        await execFileAsync(
          exe,
          [
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            `--print-to-pdf=${tempPdf}`,
            tempHtml,
          ],
          { timeout: 15000 }
        );
      } catch (execErr: unknown) {
        // Microsoft Edge writes progress ('X bytes written to file...') to stderr or exits with non-critical warnings.
        // If the PDF file was successfully created on disk, treat it as a valid render.
        if (!fs.existsSync(tempPdf)) {
          throw execErr;
        }
      }

      if (!fs.existsSync(tempPdf)) {
        throw new Error("PDF output was not created by the renderer process.");
      }

      const pdfBuffer = await fs.promises.readFile(tempPdf);
      return pdfBuffer;
    } finally {
      // Clean up temp files safely
      fs.promises.unlink(tempHtml).catch(() => {});
      fs.promises.unlink(tempPdf).catch(() => {});
    }
  }
}

// Global renderer instance
export const defaultReportRenderer: ReportRenderer = new EdgeHeadlessRenderer();
