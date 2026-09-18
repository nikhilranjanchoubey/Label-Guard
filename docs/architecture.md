# Label Guard — Technical Architecture Specification

## Overview
**Label Guard** is an AI-assisted packaged commodity inspection and compliance platform developed for **Smart India Hackathon Problem Statement 26034** (Ministry of Consumer Affairs, Food & Public Distribution — Department of Consumer Affairs).

## Architecture Highlights
- **Decoupled Optical Intelligence**: OCR extracts text tokens and localized bounding coordinates; it does not adjudicate legal validity.
- **Deterministic Rule Engine**: An immutable rule catalog (`/data/legal/rules.json`) executes statutory assertions against extracted fields according to the Legal Metrology (Packaged Commodities) Rules, 2011.
- **Enforcement Studio**: Computer-vision visualizer overlays bounding boxes on package imagery, enabling enforcement officers to review evidence, adjust parameters, and override uncertain classifications.
- **Dual Document Exporter**: Generates government-style A4 PDFs and editable Microsoft Word (DOCX) summaries with SHA-256 cryptographic audit hashes.

## Component Stack
- **Framework**: Next.js 14 (App Router, Server Components + Client Interactivity)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom glassmorphism, Aurora dark palette, and official Government of India visual tokens
- **PDF Generation**: jsPDF + jspdf-autotable
- **Editable Reports**: docx + file-saver
- **State & Storage**: React Context + LocalStorage persistence with MongoDB/PostgreSQL cloud database schema readiness.
