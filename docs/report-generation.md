# Statutory Report Generation

## Output Formats
1. **Government A4 PDF**:
   - Clean government styling with official Ministry header and Tricolor indicator.
   - Comprehensive metadata block (Inspection ID, Date, Inspecting Officer, Jurisdiction).
   - Declaration evaluation table with status coloring and rule citations.
   - Officer observations, directions, and compounding memo notes.
   - SHA-256 digital verification seal hash and pagination.

2. **Editable Microsoft Word (DOCX)**:
   - Generated using the `docx` library.
   - Allows enforcement officials to append witness statements, seizure inventories, and prosecution memos directly in Word processing environments.

## Report Verification Route
Each report includes a verification link and QR code pointing to:
`/reports/verify/[id]`
allowing traders or judicial authorities to verify certificate authenticity.
