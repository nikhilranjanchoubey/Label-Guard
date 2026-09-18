"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import {
  Scan,
  Bell,
  Menu,
  X,
  FileCheck2,
  AlertTriangle,
  Info,
  CheckCircle2,
  UserCheck,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Structured Primary Navigation
  const primaryLinks = [
    { label: "Home", href: "/" },
    { label: "Inspect", href: "/inspect" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inspections", href: "/inspections" },
    { label: "Products", href: "/products" },
    { label: "Reports", href: "/reports" },
  ];

  // Structured Secondary Navigation
  const secondaryLinks = [
    { label: "Rules", href: "/rules" },
    { label: "Analytics", href: "/analytics" },
    { label: "Docs", href: "/docs" },
  ];

  const allNavLinks = [...primaryLinks, ...secondaryLinks];

  const notifications = [
    {
      id: "n-1",
      title: "Potential Non-Compliance Detected",
      message: "Secondary price sticker pasted over MRP on Sunflower Oil 1L pouch.",
      time: "10m ago",
      type: "violation",
    },
    {
      id: "n-2",
      title: "Manual Inspection Recommended",
      message: "Low OCR confidence (68%) on Herbal Green Tea packing date due to crease.",
      time: "45m ago",
      type: "warning",
    },
    {
      id: "n-3",
      title: "Inspection Report Signed",
      message: "LG-2026-0101 (Aashirvaad Atta 5kg) report successfully finalized.",
      time: "2h ago",
      type: "success",
    },
  ];

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Hide the main application navigation on /signin for clean auth layout
  if (pathname === "/signin") {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 px-3 pt-2 sm:px-4">
      <div className="glass-strong mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl px-3.5 py-2 sm:px-5">
        {/* Brand Logo & Wordmark (never truncated) */}
        <div className="shrink-0">
          <Logo href="/" size="md" showBadge={true} showSubtitle={false} className="sm:hidden" />
          <Logo href="/" size="md" showBadge={true} showSubtitle={true} className="hidden sm:flex" />
        </div>

        {/* Structured Desktop Navigation Links (Primary | Secondary) */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-line bg-white/70 px-2 py-1 lg:flex shadow-2xs">
          {/* Primary Navigation */}
          <div className="flex items-center gap-0.5">
            {primaryLinks.map((item) => {
              const isActive = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-2.5 py-1.5 text-xs transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm font-bold"
                      : "text-slate-900 hover:text-blue-700 hover:bg-slate-100/80 font-semibold"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Hierarchy Divider */}
          <div className="h-3.5 w-px bg-slate-300/80 mx-0.5" />

          {/* Secondary Navigation (visually quieter) */}
          <div className="flex items-center gap-0.5">
            {secondaryLinks.map((item) => {
              const isActive = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-2.5 py-1.5 text-xs transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm font-bold"
                      : "text-slate-900 hover:text-blue-700 hover:bg-slate-100/80 font-semibold"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right Action Area: Scan Label CTA + User Role + Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notifications button */}

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex size-8.5 items-center justify-center rounded-full border border-line bg-white/60 text-ink transition-colors hover:bg-white hover:text-navy-500"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div
                className="glass-strong absolute right-0 top-full z-50 mt-2 w-80 rounded-3xl p-3 shadow-2xl"
                onMouseLeave={() => setNotificationsOpen(false)}
              >
                <div className="flex items-center justify-between border-b border-line px-2 pb-2">
                  <span className="text-xs font-bold text-ink">Recent Alerts</span>
                  <span className="rounded-full bg-navy-500/10 px-2 py-0.5 text-[10px] font-semibold text-navy-500">
                    3 New
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-2.5 rounded-2xl bg-white/70 p-2.5 text-left transition-colors hover:bg-white"
                    >
                      {n.type === "violation" && (
                        <AlertTriangle className="size-4 shrink-0 text-red-500 mt-0.5" />
                      )}
                      {n.type === "warning" && (
                        <Info className="size-4 shrink-0 text-amber-500 mt-0.5" />
                      )}
                      {n.type === "success" && (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink">{n.title}</p>
                        <p className="text-[11px] leading-4 text-ink-muted">{n.message}</p>
                        <span className="mt-1 block text-[10px] text-ink-muted/70">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <Link
                    href="/dashboard"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-[11px] font-semibold text-navy-500 hover:underline"
                  >
                    View enforcement dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action CTA: Scan Label (points to /inspect if authed, /signin if logged out) */}
          <Link
            href={isAuthenticated ? "/inspect" : "/signin"}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all hover:shadow"
          >
            <Scan className="size-3.5 text-blue-200" />
            <span>Scan Label</span>
          </Link>

          {/* User Area: Prototype Inspector Profile or Sign In */}
          {isAuthenticated ? (
            <div className="relative hidden xl:block">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1 pl-1.5 pr-2.5 text-xs font-medium text-ink transition-colors hover:bg-white shadow-2xs"
                title={`Active Profile: Prototype Inspector (${role})`}
                aria-label="Toggle user profile menu"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-navy-950 text-white font-bold text-[10px]">
                  <UserCheck className="size-3.5 text-emerald-400" />
                </div>
                <div className="text-left whitespace-nowrap">
                  <span className="block text-[11px] font-bold leading-tight text-navy-950">
                    Prototype Inspector
                  </span>
                  <span className="block text-[8.5px] text-slate-500 font-semibold tracking-wide uppercase">
                    DEMO ROLE
                  </span>
                </div>
                <ChevronDown className="size-3 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="glass-strong absolute right-0 top-full z-50 mt-2 w-64 rounded-3xl p-3 shadow-2xl border border-line"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="border-b border-line pb-2.5 px-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Prototype Inspector</span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        INSPECTOR
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-ink-muted">inspector@labelguard.demo</p>
                    <p className="mt-1 text-[9.5px] font-mono text-slate-500">Badge: INSP-DEMO-2026</p>
                  </div>

                  <div className="mt-2 space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-ink transition-colors"
                    >
                      <span>Enforcement Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        window.location.href = "/signin";
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="size-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-ink hover:bg-white hover:text-blue-600 shadow-2xs transition-colors"
            >
              <LogIn className="size-3.5 text-blue-600" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-8.5 items-center justify-center rounded-full border border-line bg-white/60 text-ink lg:hidden hover:bg-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="glass-strong mt-2 flex flex-col rounded-3xl p-4 shadow-xl lg:hidden border border-line">
          <div className="flex items-center justify-between border-b border-line pb-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-navy-950 text-white font-bold text-[10px]">
                  <UserCheck className="size-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-ink block leading-tight">Prototype Inspector</span>
                  <span className="text-[9px] text-emerald-700 font-semibold uppercase">DEMO ROLE</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink">Guest Session</span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  window.location.href = "/signin";
                }}
                className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-700 hover:bg-red-500/20"
              >
                <LogOut className="size-3 text-red-600" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-500/20"
              >
                <LogIn className="size-3 text-blue-600" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {allNavLinks.map((link) => {
              const isActive = isNavActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2 text-xs transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-900 hover:bg-slate-100 font-semibold"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-line">
            <Link
              href={isAuthenticated ? "/inspect" : "/signin"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <Scan className="size-4 text-blue-200" />
              <span>Scan Label</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
