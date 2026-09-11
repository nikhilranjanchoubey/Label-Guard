"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useTranslation } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Global Demo Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-1.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold tracking-wide">{t("app.demoBadge", "DEMO MODE — SAMPLE DATA")}</span>
            <span className="hidden md:inline text-amber-700">
              — {t("app.demoDisclaimer", "Sample data for evaluation and testing purposes only. Not an official legal record.")}
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded font-semibold">
            v0.1-prototype
          </span>
        </div>

        {/* Scrollable Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
