# Label Guard — SIH 2026 Demo Guide

## Quick Demo Scenarios
1. **Fully Compliant Staple Commodity**:
   - Navigate to `/inspect`
   - Select **Wheat Atta 5kg** preset
   - Click **Start Compliance Inspection**
   - Result: 100% coverage, all 6 mandatory declarations verified, compliant font height (4.8mm vs 4.0mm min).
   - Click **Export PDF** to view the generated A4 report.

2. **MRP Sticker Over-Pricing Violation**:
   - Navigate to `/inspect`
   - Select **Sunflower Oil 1L** preset
   - Click **Start Compliance Inspection**
   - Result: Violation detected under Rule 6(1)(da) and Section 36 of the Legal Metrology Act, 2009 (yellow sticker pasted over original ₹125 MRP).
   - Bounding box is highlighted in red on the visualizer.

3. **Sub-Standard Font Size & Missing Email**:
   - Navigate to `/inspect`
   - Select **Turmeric Powder 100g** preset
   - Result: Rule 7 Table 1 warning (1.8mm numeral height on 140 cm² PDP vs 2.5mm statutory minimum) + missing consumer care email under Rule 6(1)(e).

4. **Multi-Role Switching**:
   - Use the role dropdown in the top government bar to switch between **OFFICER**, **ADMIN**, **INSPECTOR**, and **REVIEWER**.
   - Notice how permissions and designation update dynamically.

5. **Language Switch**:
   - Click the **EN / हिन्दी** button to switch UI labels into Devanagari Hindi.
