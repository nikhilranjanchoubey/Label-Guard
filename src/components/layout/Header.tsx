"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { Search, ScanLine, UserCheck, ShieldAlert } from "lucide-react";
import { MOCK_OFFICER } from "@/mocks/sampleData";

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-white border-b border-boundary px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Search input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("common.search", "Search packages, barcodes, or inspection IDs...")}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-boundary rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus-ring"
          />
        </div>
      </div>

      {/* Center: Prominent Demo Disclaimer Tag */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-[11px] font-medium">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-bold">{t("app.demoBadge", "DEMO MODE — SAMPLE DATA")}</span>
      </div>

      {/* Right: Language Switcher, Officer Chip, Action Button */}
      <div className="flex items-center gap-3">
        {/* Bilingual Switcher */}
        <LanguageSwitcher />

        <div className="h-5 w-px bg-boundary mx-1" />

        {/* Officer Credential Chip */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {MOCK_OFFICER.name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono leading-none">
              {MOCK_OFFICER.badgeNumber}
            </span>
          </div>
        </div>

        {/* New Inspection CTA */}
        <Link
          href="/scan"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-action hover:bg-action-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors focus-ring"
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>{t("dashboard.quickScan", "New Inspection")}</span>
        </Link>
      </div>
    </header>
  );
};
