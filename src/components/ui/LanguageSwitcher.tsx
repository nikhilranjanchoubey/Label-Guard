"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { clsx } from "clsx";
import { Globe } from "lucide-react";

export interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  showIcon = true,
}) => {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={clsx(
        "inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 border border-slate-300 text-xs font-medium shadow-inner",
        className
      )}
      role="group"
      aria-label="Language selector"
    >
      {showIcon && (
        <span className="pl-2 pr-1 text-slate-500">
          <Globe className="w-3.5 h-3.5" />
        </span>
      )}
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={clsx(
          "px-2.5 py-1 rounded-md transition-all font-semibold select-none",
          locale === "en"
            ? "bg-white text-primary shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLocale("hi")}
        className={clsx(
          "px-2.5 py-1 rounded-md transition-all font-semibold select-none",
          locale === "hi"
            ? "bg-white text-primary shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        हिन्दी
      </button>
    </div>
  );
};
