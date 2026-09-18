# LABEL GUARD
### AI-Assisted Packaged Commodity Compliance & Inspection Platform
**Smart India Hackathon 2026 · Problem Statement 26034**  
**Ministry of Consumer Affairs, Food & Public Distribution — Department of Consumer Affairs (DoCA)**

---

## 1. Problem Statement
Under the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011, every packaged commodity is required to bear mandatory declarations including:
- Name and complete address of the manufacturer/packer/importer
- Common or generic name of the commodity
- Net quantity in standard metric units
- Month and year of manufacture/pre-packing/import
- Maximum Retail Price (MRP inclusive of all taxes)
- Consumer care details (Telephone and valid Email address)
- Specified font height ratios corresponding to the Principal Display Panel (PDP)

Manual inspection of massive retail and e-commerce volumes is resource-intensive. Non-compliances such as missing declarations, sub-standard font sizes, and illegal sticker over-pricing frequently escape notice.

**Label Guard** solves this through automated computer-vision label scanning, multi-field OCR extraction, and deterministic statutory rule engine evaluation.

---

## 2. Key Capabilities
- **Multi-Angle Image Scanning**: Front, back, and side panel inspection for flexible pouches, bottles, cartons, and sacks.
- **Label Visualizer**: Interactive computer vision bounding boxes with zoom, pan, and field pinpointing.
- **Deterministic Rule Engine**: Rules 6, 7, 8, 9, and 10 codified in `/src/data/legal/rules.json`.
- **Statutory Reports**: Real client-side A4 PDF generation with Department header and editable Microsoft Word (DOCX) export.
- **Digital Seal & QR Verification**: Verification route at `/reports/verify/[id]` for certificate authenticity check.
- **Role-Based Access Control**: Four designated roles: `OFFICER`, `ADMIN`, `INSPECTOR`, and `REVIEWER`.
- **Bilingual Interface**: Seamless toggle between English and हिन्दी (Devanagari script).

---

## 3. Local Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

---

## 4. Key Routes
- `/`: Home portal with hero scanner, live sample demonstration, and statutory rules overview.
- `/inspect`: Main 3-step inspection studio (Upload -> Scan -> Compliance Review & Export).
- `/dashboard`: Enforcement officer dashboard with KPIs, charts, and recent inspection tables.
- `/inspections`: Searchable and filterable repository of past inspections.
- `/inspections/[id]`: Deep-dive compliance result, visualizer bounding boxes, and officer action center.
- `/products`: Catalog of previously scanned packaged commodities and history.
- `/reports`: Digital report vault with PDF and DOCX download options.
- `/reports/verify/[id]`: Prototype report authenticity verification page.
- `/rules`: Comprehensive statutory rules repository based on PCR, 2011.
- `/analytics`: Enforcement analytics and category-wise violation breakdown.
- `/docs`: Built-in interactive documentation and SIH 26034 compliance matrix.
