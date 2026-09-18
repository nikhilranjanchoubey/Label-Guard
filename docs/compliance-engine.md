# Legal Metrology Compliance Engine

## Codified Legal Rules
The compliance engine implements tests based on the **Legal Metrology (Packaged Commodities) Rules, 2011**:

1. **Rule 6(1)(a) — Manufacturer & Packer Identification**
   - Must contain complete name and postal address with pincode and state.
2. **Rule 6(1)(b) — Generic Name of Commodity**
   - Prominent common or generic name on the Principal Display Panel (PDP).
3. **Rule 6(1)(c) read with Rule 8 — Net Quantity & Standard Units**
   - Expressed exclusively in standard metric units (`g`, `kg`, `mL`, `L`, `m`, `cm`, `mm`, `N`).
   - Prohibits non-standard symbols like `gms`, `kilo`, `lit`.
4. **Rule 6(1)(da) — Maximum Retail Price (MRP)**
   - Must include `₹` or `Rs.` symbol and the statutory phrase `inclusive of all taxes` or `incl. of all taxes`.
   - Prohibits unauthorized price stickers or overwriting under Section 36 of the Legal Metrology Act, 2009.
5. **Rule 6(1)(d) — Month and Year of Manufacture / Packing**
   - Clear numeral declaration without requiring cryptic decoding.
6. **Rule 6(1)(e) — Consumer Care Contact Details**
   - Mandatory inclusion of: (i) Contact Name/Designation, (ii) Physical Address, (iii) Telephone/Helpline, and (iv) Valid Email Address.
7. **Rule 7 Table 1 — Minimum Numeral and Letter Height**
   - Evaluates numeral height relative to PDP area:
     - Area $\le 50\text{ cm}^2$: min $1.0\text{ mm}$
     - Area $50 - 100\text{ cm}^2$: min $1.5\text{ mm}$
     - Area $100 - 500\text{ cm}^2$: min $2.5\text{ mm}$
     - Area $500 - 2500\text{ cm}^2$: min $4.0\text{ mm}$
     - Area $> 2500\text{ cm}^2$: min $6.0\text{ mm}$
8. **Rule 6(11) — Unit Sale Price (USP)**
   - Mandatory unit price per gram/kg or mL/litre for transparent consumer comparison.
