"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.inspect": "Inspect Product",
    "nav.dashboard": "Dashboard",
    "nav.inspections": "Inspections",
    "nav.products": "Products",
    "nav.reports": "Reports",
    "nav.rules": "Rule Engine",
    "nav.analytics": "Analytics",
    "nav.docs": "Architecture & Docs",
    "nav.scanCta": "Scan Label",
    "nav.officer": "Enforcement Officer",
    "nav.govtIndia": "Government of India",
    "nav.doca": "Department of Consumer Affairs",
    "nav.sihBadge": "SIH 2026 Prototype · Problem Statement 26034",

    // Hero
    "hero.tag": "Legal Metrology (Packaged Commodities) Rules, 2011 · Automated Inspection",
    "hero.title1": "Scan the label.",
    "hero.title2": "Check the declaration.",
    "hero.title3": "Verify compliance.",
    "hero.sub": "AI-assisted packaged commodity inspection platform. Automatically detect missing, misleading or non-standard declarations, analyze font-size ratios, and generate official compliance reports.",
    "hero.ctaInspect": "Start Product Inspection",
    "hero.ctaDashboard": "Enforcement Dashboard",
    "hero.searchPlaceholder": "Search by Inspection ID, Barcode, or Product Name...",
    "hero.searchBtn": "Inspect",
    "hero.tryLabel": "Quick Inspect Samples:",

    // Stats
    "stats.inspections": "Packages Inspected",
    "stats.complianceRate": "Compliance Accuracy",
    "stats.officers": "Enforcement Officers",
    "stats.violations": "Violations Detected",

    // Process
    "process.tag": "Standard Operating Procedure",
    "process.title": "How Packaged Commodity Inspection Works",
    "process.sub": "Deterministic legal rule execution layered on computer vision OCR text extraction.",
    "process.step1.title": "Scan / Upload Label",
    "process.step1.desc": "Capture or upload front, back, and side panels of packaged commodities.",
    "process.step2.title": "OCR & Field Extraction",
    "process.step2.desc": "Detect declarations including MRP, Net Qty, Dates, Manufacturer, and Consumer Care.",
    "process.step3.title": "Rule Engine Verification",
    "process.step3.desc": "Verify against PCR 2011 Rule 6, 7, 8, 9, 10 for completeness and metric unit compliance.",
    "process.step4.title": "Violation Pinpointing",
    "process.step4.desc": "Highlight visual bounding boxes, font size deviations, and sticker over-pricing.",
    "process.step5.title": "Digital Report & Seal",
    "process.step5.desc": "Generate tamper-evident PDF inspection reports and editable DOCX summaries.",

    // Rights / Law
    "law.tag": "Statutory Framework",
    "law.title": "Mandatory Declarations under PCR, 2011",
    "law.sub": "What every manufacturer, packer and importer must declare on pre-packaged goods.",

    // Footer
    "footer.title": "LABEL GUARD",
    "footer.subtitle": "AI-Assisted Packaged Commodity Compliance & Inspection Platform",
    "footer.about": "Developed for Smart India Hackathon Problem Statement 26034. Empowers Department of Consumer Affairs (DoCA) enforcement officials to check packaged commodity declarations through image scanning and automated rule validation.",
    "footer.helpline": "National Consumer Helpline: 1915 / 1800-11-4000",
    "footer.disclaimer": "Smart India Hackathon Prototype · Not an official government notification portal · Legal Metrology (Packaged Commodities) Rules, 2011",
  },
  hi: {
    // Nav
    "nav.home": "होम",
    "nav.inspect": "उत्पाद निरीक्षण",
    "nav.dashboard": "डैशबोर्ड",
    "nav.inspections": "निरीक्षण इतिहास",
    "nav.products": "पैकेज्ड उत्पाद",
    "nav.reports": "रिपोर्ट्स",
    "nav.rules": "नियम इंजन (PCR)",
    "nav.analytics": "एनालिटिक्स",
    "nav.docs": "वास्तुकला एवं दस्तावेज",
    "nav.scanCta": "लेबल स्कैन करें",
    "nav.officer": "प्रवर्तन अधिकारी",
    "nav.govtIndia": "भारत सरकार",
    "nav.doca": "उपभोक्ता मामले विभाग",
    "nav.sihBadge": "SIH 2026 प्रोटोटाइप · समस्या विवरण 26034",

    // Hero
    "hero.tag": "विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 · स्वचालित निरीक्षण",
    "hero.title1": "लेबल स्कैन करें।",
    "hero.title2": "घोषणाओं की जांच करें।",
    "hero.title3": "अनुपालन सत्यापित करें।",
    "hero.sub": "एआई-सहायता प्राप्त पैकेज्ड वस्तु अनुपालन निरीक्षण मंच। लापता, भ्रामक या गैर-मानक घोषणाओं का स्वतः पता लगाएं, फ़ॉन्ट आकार अनुपात का विश्लेषण करें और आधिकारिक रिपोर्ट तैयार करें।",
    "hero.ctaInspect": "उत्पाद निरीक्षण शुरू करें",
    "hero.ctaDashboard": "प्रवर्तन डैशबोर्ड देखें",
    "hero.searchPlaceholder": "निरीक्षण आईडी, बारकोड या उत्पाद नाम से खोजें...",
    "hero.searchBtn": "जांचें",
    "hero.tryLabel": "त्वरित नमूना परीक्षण:",

    // Stats
    "stats.inspections": "निरीक्षित पैकेज",
    "stats.complianceRate": "अनुपालन सटीकता",
    "stats.officers": "सक्रिय अधिकारी",
    "stats.violations": "उल्लंघन दर्ज",

    // Process
    "process.tag": "मानक संचालन प्रक्रिया",
    "process.title": "पैकेज्ड वस्तु निरीक्षण कैसे कार्य करता है",
    "process.sub": "कंप्यूटर विज़न ओसीआर निष्कर्षण पर विधिक नियम इंजन द्वारा स्वचालित सत्यापन।",
    "process.step1.title": "लेबल अपलोड / स्कैन",
    "process.step1.desc": "पैकेज्ड वस्तुओं के मुख्य, पिछले एवं पार्श्व पैनल की छवियां कैप्चर करें।",
    "process.step2.title": "ओसीआर निष्कर्षण",
    "process.step2.desc": "एमआरपी, शुद्ध मात्रा, निर्माण तिथि, निर्माता एवं उपभोक्ता सेवा विवरण का पता लगाएं।",
    "process.step3.title": "नियम इंजन सत्यापन",
    "process.step3.desc": "पीसीआर 2011 के नियम 6, 7, 8, 9 के अनुसार सटीकता और मानक मीट्रिक इकाइयों की पुष्टि करें।",
    "process.step4.title": "उल्लंघन साक्ष्य अंकन",
    "process.step4.desc": "छवि पर बाउंडिंग बॉक्स, छोटे फ़ॉन्ट और स्टिकर ओवर-प्राइसिंग का दृश्य अंकन।",
    "process.step5.title": "डिजिटल रिपोर्ट व सील",
    "process.step5.desc": "छेड़छाड़-मुक्त डिजिटल पीडीएफ रिपोर्ट और संपादन योग्य डीओसीएक्स दस्तावेज बनाएं।",

    // Rights / Law
    "law.tag": "विधिक ढांचा",
    "law.title": "पैकेज्ड कमोडिटीज नियम, 2011 की अनिवार्य घोषणाएं",
    "law.sub": "हर निर्माता, पैकर एवं आयातक द्वारा पैकेज पर घोषित किए जाने वाले आवश्यक विधिक विवरण।",

    // Footer
    "footer.title": "लेबल गार्ड",
    "footer.subtitle": "एआई-सहायता प्राप्त पैकेज्ड वस्तु अनुपालन एवं निरीक्षण मंच",
    "footer.about": "स्मार्ट इंडिया हैकाथॉन समस्या विवरण 26034 हेतु विकसित। उपभोक्ता मामले विभाग (DoCA) के प्रवर्तन अधिकारियों को पैकेज्ड वस्तुओं की विधिक जांच में सक्षम बनाता है।",
    "footer.helpline": "राष्ट्रीय उपभोक्ता हेल्पलाइन: 1915 / 1800-11-4000",
    "footer.disclaimer": "स्मार्ट इंडिया हैकाथॉन प्रोटोटाइप · आधिकारिक सरकारी अधिसूचना पोर्टल नहीं है · विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k: string) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lg_lang") as Language;
    if (saved === "en" || saved === "hi") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lg_lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
