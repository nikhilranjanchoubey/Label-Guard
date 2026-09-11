/**
 * LabelGuard — Authoritative Legal Metrology Sources
 * Ministry of Consumer Affairs, Food and Public Distribution (Department of Consumer Affairs)
 * Official Publications, Consolidated Rules, and Gazette Notifications.
 */

export const LEGAL_SOURCES = {
  OFFICIAL_PORTAL: {
    title: "Ministry of Consumer Affairs — Legal Metrology Act & Rules Portal",
    url: "https://consumeraffairs.gov.in/pages/legal-metrology-act",
    department: "Department of Consumer Affairs, Government of India",
  },
  CONSOLIDATED_BOOK: {
    title: "Legal Metrology Packaged Commodities Rules, 2011 with all amendments",
    url: "https://consumeraffairs.gov.in/public/upload/admin/cmsfiles/whatsnews/Book_on_Legal_Metrology_Packaged_Commodities_Rules%2C2011_with_all_amendments_whatsnews.pdf",
    authority: "Government of India Press / Department of Consumer Affairs",
    pagesCount: 56,
  },
  PRINCIPAL_RULES_2011: {
    title: "The Legal Metrology (Packaged Commodities) Rules, 2011 (Principal Rules)",
    notification: "G.S.R. 202(E)",
    date: "2011-03-07",
    effectiveDate: "2011-04-01",
    url: "http://consumeraffairs.gov.in/public/upload/files/8_1732871406.pdf",
  },
  AMENDMENT_2015_GSR385: {
    title: "The Legal Metrology (Packaged Commodities) (Amendment) Rules, 2015",
    notification: "G.S.R. 385(E)",
    date: "2015-05-14",
    effectiveDate: "2016-01-01",
    keyChanges: "Mandatory consumer grievance telephone & email on packages; exemption exclusions for tobacco under Rule 26(a).",
    url: "http://consumeraffairs.gov.in/public/upload/files/8(vi)_0_1732861153.pdf",
  },
  AMENDMENT_2017_GSR629: {
    title: "The Legal Metrology (Packaged Commodities) (Amendment) Rules, 2017",
    notification: "G.S.R. 629(E)",
    date: "2017-06-23",
    effectiveDate: "2018-01-01",
    keyChanges: "Country of origin for imported goods (Rule 6(1)(aa)); E-commerce digital display (Rule 6(10)); Revised Table-I font size minimums (Rule 7); Best Before/Use By (Rule 6(1)(da)).",
    url: "http://consumeraffairs.gov.in/public/upload/files/8(x)_0_1732870750.pdf",
  },
  AMENDMENT_2021_GSR779: {
    title: "The Legal Metrology (Packaged Commodities) (Amendment) Rules, 2021",
    notification: "G.S.R. 779(E)",
    date: "2021-11-02",
    effectiveDate: "2022-10-01", // Extended from 2022-04-01 by GSR 226(E)
    keyChanges: "Introduced Unit Sale Price (USP) under Rule 6(11); simplified manufacturing date declaration under Rule 6(1)(d); omission of Schedule II standard pack sizes.",
    url: "https://consumeraffairs.gov.in/public/upload/files/230946_1732871433.pdf",
  },
  AMENDMENT_2022_GSR226: {
    title: "The Legal Metrology (Packaged Commodities) (Amendment) Rules, 2022",
    notification: "G.S.R. 226(E)",
    date: "2022-03-28",
    effectiveDate: "2022-10-01",
    keyChanges: "Extended implementation date of GSR 779(E) to 01.10.2022 and clarified Unit Sale Price rounding to two decimal places.",
    url: "http://consumeraffairs.gov.in/public/upload/files/GSR226_1732871458.pdf",
  },
  AMENDMENT_2022_QR_GSR542: {
    title: "The Legal Metrology (Packaged Commodities) (Second Amendment) Rules, 2022",
    notification: "G.S.R. 542(E)",
    date: "2022-07-14",
    effectiveDate: "2022-07-14",
    keyChanges: "Permitted electronic products to provide certain declarations via QR Code for a period of one year.",
    url: "http://consumeraffairs.gov.in/public/upload/files/Notification%20-%20%20Legal%20Metrology%20(QR%20Code)_1732871487.pdf",
  },
  AMENDMENT_2026_GSR128: {
    title: "The Legal Metrology (Packaged Commodities) (Amendment) Rules, 2026",
    notification: "G.S.R. 128(E)",
    date: "2026-02-13",
    effectiveDate: "2026-07-01",
    keyChanges: "Inserted Rule 6(10A) requiring every e-commerce entity selling imported products to provide product listings in a searchable and sortable filter specifying country of origin.",
    url: "https://consumeraffairs.gov.in/public/upload/files/2026.02.13%20PCR%201st%20COO%20Filter%20on%20e-commerce%20websites_1771231030.pdf",
  },
} as const;
