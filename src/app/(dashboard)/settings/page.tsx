"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useToast } from "@/components/ui/Toast";
import {
  getActiveUser,
  setActiveUserRole,
  DEFAULT_OFFICER_USER,
} from "@/lib/verification/client";
import { UserRole } from "@/lib/audit/types";
import {
  Globe,
  User,
  Save,
  Sliders,
  ShieldCheck,
  RefreshCw,
  SunMoon,
  ToggleLeft,
  ToggleRight,
  Server,
} from "lucide-react";

interface HealthData {
  status: string;
  version: string;
  ruleLibraryVersion: string;
  services: {
    ocrMicroservice: {
      status: string;
      url: string;
      engine: string;
      details: string;
    };
    geminiAi: {
      status: string;
      provider: string;
    };
    complianceEngine: {
      status: string;
      architecture: string;
      verifiedRuleCount: number;
    };
    verificationAuditTrail: {
      status: string;
      storage: string;
    };
  };
}

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

  // Role management
  const [currentUser, setCurrentUser] = useState(DEFAULT_OFFICER_USER);

  // Inspection thresholds
  const [ocrConfidenceThreshold, setOcrConfidenceThreshold] = useState<number>(70);
  const [imageQualityThreshold, setImageQualityThreshold] = useState<number>(80);

  // Demo mode
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Theme
  const [theme, setTheme] = useState<string>("light");

  // Health check data
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);

  useEffect(() => {
    // Load persisted settings
    if (typeof window !== "undefined") {
      setCurrentUser(getActiveUser());

      const savedOcrThresh = localStorage.getItem("labelguard_ocr_threshold");
      if (savedOcrThresh) setOcrConfidenceThreshold(Number(savedOcrThresh));

      const savedBlurThresh = localStorage.getItem("labelguard_blur_threshold");
      if (savedBlurThresh) setImageQualityThreshold(Number(savedBlurThresh));

      const savedDemo = localStorage.getItem("labelguard_demo_mode");
      if (savedDemo !== null) setDemoMode(savedDemo === "true");

      const savedTheme = localStorage.getItem("labelguard_theme") || "light";
      setTheme(savedTheme);
    }

    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // offline fallback
      setHealth(null);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    const updated = setActiveUserRole(role);
    setCurrentUser(updated);
    toast({
      title: "Inspector Role Changed",
      description: `Active role switched to ${role} (${updated.name}). Verification privileges updated.`,
      type: "info",
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("labelguard_theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    toast({
      title: "Theme Preference Updated",
      description: `Interface appearance set to ${newTheme} mode.`,
      type: "info",
    });
  };

  const toggleDemoMode = () => {
    const newDemo = !demoMode;
    setDemoMode(newDemo);
    if (typeof window !== "undefined") {
      localStorage.setItem("labelguard_demo_mode", String(newDemo));
    }
    toast({
      title: newDemo ? "Demo Mode Enabled" : "Field Production Mode Enabled",
      description: newDemo
        ? "Demo sample data and mock fallbacks are active."
        : "Live enforcement mode active: all scans require live hardware/camera feeds.",
      type: "info",
    });
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("labelguard_ocr_threshold", String(ocrConfidenceThreshold));
      localStorage.setItem("labelguard_blur_threshold", String(imageQualityThreshold));
      localStorage.setItem("labelguard_demo_mode", String(demoMode));
    }

    toast({
      title: "Configuration Saved",
      description: "Inspection parameters and engine preferences saved successfully.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("settings.title", "Platform Settings & Administration")}
            </h1>
            <Badge variant={demoMode ? "demo" : "neutral"} size="sm">
              {demoMode ? "Demo Mode Active" : "Field Enforcement"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("settings.subtitle", "Statutory threshold configuration, officer profile, real service health, and rule telemetry")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={isCheckingHealth}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />}
          >
            Check Health
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {t("common.save", "Save Changes")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health & Service Telemetry */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Real-Time Service Telemetry</CardTitle>
              </div>
              <Badge
                variant={health?.services.ocrMicroservice.status === "ONLINE" ? "compliant" : "warning"}
                size="sm"
              >
                {health?.services.ocrMicroservice.status === "ONLINE" ? "Microservice Connected" : "Local Standalone"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">PaddleOCR Microservice (Port 8000):</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    health?.services.ocrMicroservice.status === "ONLINE"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {health?.services.ocrMicroservice.status || "CHECKING..."}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Engine: {health?.services.ocrMicroservice.engine || "PaddleOCR v2.9 + OpenCV"}
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Gemini AI Vision Integration:</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    health?.services.geminiAi.status === "CONFIGURED"
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {health?.services.geminiAi.status || "CHECKING..."}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Note: LMPC compliance verdicts are strictly deterministic and never generated by LLM.
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Deterministic Rule Engine:</span>
                <span className="font-mono text-[11px] font-bold text-emerald-700">
                  {health?.services.complianceEngine.status || "ONLINE"} (17 Rules)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span>App Build: {health?.version || "v0.1.0-SIH2026"}</span>
              <span>Rules: LMPC 2011 (Amended 2026)</span>
            </div>
          </CardContent>
        </Card>

        {/* Inspector Profile & RBAC Role Switcher */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">{t("settings.inspectorProfile", "Inspector Profile & Role")}</CardTitle>
              </div>
              <Badge variant="neutral" size="sm">
                Role: {currentUser.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Active Demonstration Role (RBAC)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange("OFFICER")}
                  className={`p-2 rounded-lg border text-xs font-medium text-left transition-all ${
                    currentUser.role === "OFFICER"
                      ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs">Field Officer</div>
                  <div className="text-[10px] text-slate-500 font-normal">Primary verification</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("SUPERVISOR")}
                  className={`p-2 rounded-lg border text-xs font-medium text-left transition-all ${
                    currentUser.role === "SUPERVISOR"
                      ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs">Supervisor</div>
                  <div className="text-[10px] text-slate-500 font-normal">Final sign-off</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange("ADMIN")}
                  className={`p-2 rounded-lg border text-xs font-medium text-left transition-all ${
                    currentUser.role === "ADMIN"
                      ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs">Administrator</div>
                  <div className="text-[10px] text-slate-500 font-normal">System & rules</div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Assigned Officer:</span>
                <span className="font-semibold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Badge ID:</span>
                <span className="font-mono text-slate-700">{currentUser.badgeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Station:</span>
                <span className="text-slate-700">{currentUser.station}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Thresholds & Calibration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-action" />
              <CardTitle className="text-sm">Inspection Confidence & Quality Thresholds</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  OCR Minimum Confidence Threshold
                </label>
                <span className="font-mono font-bold text-action text-xs">
                  {ocrConfidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={ocrConfidenceThreshold}
                onChange={(e) => setOcrConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-action cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tokens with confidence below this threshold are flagged for mandatory human review.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Image Blur / Quality Laplacian Variance
                </label>
                <span className="font-mono font-bold text-action text-xs">
                  {imageQualityThreshold}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="5"
                value={imageQualityThreshold}
                onChange={(e) => setImageQualityThreshold(Number(e.target.value))}
                className="w-full accent-action cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Scans below this sharpness threshold prompt the officer for image re-capture before analysis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interface Preferences, Language & Demo Mode */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-action" />
              <CardTitle className="text-sm">Language, Appearance & Environment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Operational Language (Bilingual EN / HI)
              </label>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <span className="text-[11px] text-slate-500 font-mono">
                  Current: {locale === "hi" ? "हिंदी (Hindi)" : "English (Indian Standard)"}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Demonstration Mode</span>
                <span className="text-[11px] text-slate-500">
                  Load pre-calibrated sample packages (e.g., Tata Salt 1kg) for live jury presentations
                </span>
              </div>
              <button
                type="button"
                onClick={toggleDemoMode}
                className="text-action hover:opacity-80 transition-opacity"
              >
                {demoMode ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Appearance Theme</span>
                <span className="text-[11px] text-slate-500">
                  Active mode: {theme === "dark" ? "High-Contrast Dark" : "Standard Metrology Light"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                leftIcon={<SunMoon className="w-4 h-4" />}
              >
                Toggle {theme === "light" ? "Dark" : "Light"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Rule Library Version Info Banner */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">
              Statutory Rule Library: LMPC Act 2009 & Packaged Commodities Rules 2011
            </span>
            <span className="text-slate-500 block text-[11px]">
              Includes 2022/2026 amendments: mandatory unit sale price (Rule 6(11)), consumer care contacts, and importer disclosures.
            </span>
          </div>
        </div>
        <Badge variant="compliant" size="sm">
          17 Rules Verified
        </Badge>
      </div>
    </div>
  );
}
