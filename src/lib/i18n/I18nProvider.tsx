"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, I18nContextType } from "./types";
import enTranslations from "@/locales/en.json";
import hiTranslations from "@/locales/hi.json";

type TranslationDictionary = Record<string, unknown>;

const translations: Record<Locale, TranslationDictionary> = {
  en: enTranslations as TranslationDictionary,
  hi: hiTranslations as TranslationDictionary,
};

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "labelguard_preferred_locale";

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "en" || stored === "hi") {
        setLocaleState(stored);
      }
    } catch {
      // Storage unavailable or blocked
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  };

  const t = (path: string, fallback?: string): string => {
    const dict = translations[locale] || translations.en;
    const parts = path.split(".");
    let current: unknown = dict;

    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        // Fallback to English dictionary if not found in current locale
        let enCurrent: unknown = translations.en;
        for (const enPart of parts) {
          if (enCurrent && typeof enCurrent === "object" && enPart in (enCurrent as Record<string, unknown>)) {
            enCurrent = (enCurrent as Record<string, unknown>)[enPart];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === "string" ? enCurrent : (fallback || path);
      }
    }

    return typeof current === "string" ? current : (fallback || path);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      t: (path: string, fallback?: string) => fallback || path,
    };
  }
  return context;
};
