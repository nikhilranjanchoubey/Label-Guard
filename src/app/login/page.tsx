"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Shield, Lock, User, AlertCircle, Sparkles } from "lucide-react";
import { MOCK_OFFICER } from "@/mocks/sampleData";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [badgeId, setBadgeId] = useState(MOCK_OFFICER.id);
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Bar with Language Switcher */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">LabelGuard</h1>
            <p className="text-[11px] text-slate-500 font-medium">Compliance & Inspection Platform</p>
          </div>
        </div>

        <LanguageSwitcher />
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-8">
        {/* Prominent Demo Mode Notice */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">{t("app.demoBadge", "DEMO MODE — SAMPLE DATA")}</strong>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {t("login.demoCredentialsNotice", "DEMO MODE: Click sign in with sample credentials to enter test session.")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-boundary p-6 sm:p-8 shadow-card">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("login.title", "Inspector Portal Sign In")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t("login.subtitle", "LabelGuard Compliance & Inspection Platform")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("login.badgeId", "Inspector / User ID")}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-boundary rounded-lg text-slate-900 focus:bg-white focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("login.password", "Password")}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-boundary rounded-lg text-slate-900 focus:bg-white focus-ring"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              {t("login.signIn", "Sign In to Console")}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-boundary text-center text-xs text-slate-500">
            <span className="font-mono text-[11px]">
              Active Profile: {MOCK_OFFICER.name} ({MOCK_OFFICER.badgeNumber})
            </span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="max-w-md mx-auto text-center text-[11px] text-slate-400">
        <p>{t("app.demoDisclaimer", "Sample data for evaluation and testing purposes only. Not an official government record.")}</p>
        <p className="mt-1">LabelGuard Prototype © 2026</p>
      </footer>
    </div>
  );
}
