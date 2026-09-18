"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { ShieldCheck, Contrast, User, ChevronDown } from "lucide-react";

export const GovernmentTopBar: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { user, role, switchRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(1);

  const handleFontSize = (delta: number) => {
    const next = Math.max(0, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(next);
    document.documentElement.style.fontSize = next === 0 ? "15px" : next === 1 ? "16px" : "17.5px";
  };

  const toggleContrast = () => {
    document.documentElement.classList.toggle("high-contrast");
  };

  const roles: UserRole[] = ["OFFICER", "ADMIN", "INSPECTOR", "REVIEWER"];

  return (
    <header className="border-b border-line bg-white/40 text-[11px] text-ink-muted backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-1.5 sm:px-6">
        {/* Government Identity / Problem Context */}
        <div className="flex items-center gap-2">
          <span className="tricolor-rule h-3.5 w-1 rounded-full" aria-hidden="true"></span>
          <span className="font-deva font-semibold text-ink">भारत सरकार</span>
          <span className="text-ink/30">/</span>
          <span className="font-medium text-ink">Government of India</span>
          <span className="hidden text-ink/20 sm:inline">|</span>
          <span className="hidden tracking-wide text-ink-muted lg:inline">
            Department of Consumer Affairs (Context)
          </span>
          <span className="ml-1 inline-flex items-center rounded-full bg-navy-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-navy-500">
            SIH 2026 Prototype · PS 26034
          </span>
        </div>

        {/* Controls & Tools */}
        <div className="flex items-center gap-2">
          <a
            href="#main"
            className="hidden rounded-full px-2 py-0.5 transition-colors hover:bg-white/80 hover:text-ink sm:inline"
          >
            Skip to content
          </a>

          {/* Font Resizer */}
          <div className="hidden items-center rounded-full border border-white/80 bg-white/60 p-0.5 sm:flex">
            <button
              onClick={() => handleFontSize(-1)}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold hover:bg-white hover:text-ink"
              title="Decrease font size"
            >
              A−
            </button>
            <button
              onClick={() => handleFontSize(0)}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold hover:bg-white hover:text-ink"
              title="Reset font size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSize(1)}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold hover:bg-white hover:text-ink"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* High Contrast */}
          <button
            onClick={toggleContrast}
            aria-label="High contrast mode"
            className="rounded-full p-1 transition-colors hover:bg-white/80 hover:text-ink"
            title="High contrast"
          >
            <Contrast className="size-3.5" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="rounded-full border border-white/80 bg-white/60 px-2.5 py-0.5 font-medium text-ink transition-colors hover:bg-white"
          >
            {lang === "en" ? (
              <span>EN / <span className="font-deva font-bold">हिन्दी</span></span>
            ) : (
              <span><span className="font-deva font-bold">हिन्दी</span> / EN</span>
            )}
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 rounded-full border border-navy-500/20 bg-navy-500/10 px-2.5 py-0.5 font-semibold text-navy-500 transition-colors hover:bg-navy-500/15"
              title="Switch user role"
            >
              <ShieldCheck className="size-3 text-navy-500" />
              <span>{role}</span>
              <ChevronDown className="size-3" />
            </button>

            {roleDropdownOpen && (
              <div
                className="glass-strong absolute right-0 top-full z-50 mt-1.5 w-44 rounded-2xl p-1.5 shadow-xl"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Switch Active Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      role === r
                        ? "bg-navy-500 text-white"
                        : "text-ink hover:bg-white/80"
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <span className="size-1.5 rounded-full bg-white"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
