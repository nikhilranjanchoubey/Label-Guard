"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useTranslation } from "@/lib/i18n";
import {
  LayoutDashboard,
  ScanLine,
  Binary,
  FileCheck2,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck,
  ClipboardList,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";

export const Sidebar: React.FC<{ className?: string; onCloseMobile?: () => void }> = ({
  className,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard", "Dashboard"), icon: LayoutDashboard },
    { href: "/scan", label: t("nav.scan", "Scan Package"), icon: ScanLine },
    { href: "/ocr", label: t("nav.analysis", "OCR Extraction"), icon: Binary },
    { href: "/declarations", label: t("nav.declarations", "Declarations"), icon: FileCheck2 },
    { href: "/compliance", label: t("nav.compliance", "Compliance Matrix"), icon: CheckCircle2 },
    { href: "/evidence", label: t("nav.evidence", "Evidence Viewer"), icon: ImageIcon },
    { href: "/verification", label: t("nav.verification", "Officer Verification"), icon: UserCheck },
    { href: "/inspections", label: t("nav.inspections", "Inspection Registry"), icon: ClipboardList },
    { href: "/reports", label: t("nav.reports", "Reports"), icon: FileText },
    { href: "/rules", label: t("nav.rules", "Rule Library"), icon: BookOpen },
    { href: "/analytics", label: t("nav.analytics", "Analytics"), icon: BarChart3 },
    { href: "/settings", label: t("nav.settings", "Settings"), icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        "w-64 bg-primary text-white flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen h-full",
        className
      )}
    >
      {/* Brand & Identity Header */}
      <div className="p-4 border-b border-primary-light/40 flex items-center justify-between">
        <Link href="/dashboard" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-action flex items-center justify-center text-white shadow-md group-hover:bg-action-hover transition-colors shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base tracking-tight text-white leading-tight">
              LabelGuard
            </span>
            <span className="text-[11px] text-slate-300 font-medium truncate">
              Compliance & Inspection
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-action text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Officer Quick Status Card */}
      <div className="p-3 border-t border-primary-light/40 bg-black/20 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-300 font-medium">Session Active (Demo)</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">Station: North Zone Lab</div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">ID: DEMO-INSP-DL-4082</div>

        <Link
          href="/login"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t("nav.logout", "Sign Out")}</span>
        </Link>
      </div>
    </aside>
  );
};
