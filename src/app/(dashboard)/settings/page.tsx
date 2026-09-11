"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useToast } from "@/components/ui/Toast";
import { MOCK_OFFICER } from "@/mocks/sampleData";
import { Globe, User, Cpu, Database, Save } from "lucide-react";

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();

  const [officerName, setOfficerName] = useState(MOCK_OFFICER.name);
  const [station, setStation] = useState(MOCK_OFFICER.station);
  const [ocrEngine, setOcrEngine] = useState("paddleocr");
  const [visionProvider, setVisionProvider] = useState("gemini-2.5");
  const [databaseAdapter, setDatabaseAdapter] = useState("supabase");

  const handleSave = () => {
    toast({
      title: "Settings Updated",
      description: "Inspector configuration and engine preferences saved successfully.",
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
              {t("settings.title", "Platform Settings")}
            </h1>
            <Badge variant="demo" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("settings.subtitle", "Inspection parameters, inspector profile, and system configurations")}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {t("common.save", "Save Changes")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Preference Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-action" />
              <CardTitle className="text-sm">{t("settings.languagePreference", "Interface Language")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-600">
              Select your preferred operational language. LabelGuard provides continuous bilingual support for all statutory tables, declaration forms, and navigation menus.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <LanguageSwitcher />
              <span className="text-[11px] text-slate-500 font-mono">
                Active locale: {locale.toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Inspector Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">{t("settings.inspectorProfile", "Inspector Profile")}</CardTitle>
            </div>
            <span className="text-xs font-mono text-slate-500">{MOCK_OFFICER.badgeNumber}</span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Officer Name (Demo)
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-boundary rounded-lg text-slate-900 text-xs focus:bg-white focus-ring"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t("settings.inspectionStation", "Inspection Station / Lab")}
              </label>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-boundary rounded-lg text-slate-900 text-xs focus:bg-white focus-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI / OCR Engine Backend Integration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">{t("settings.ocrEnginePreference", "Extraction Engine Backend")}</CardTitle>
            </div>
            <Badge variant="neutral" size="sm">Extensible</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Text Extraction Engine
              </label>
              <select
                value={ocrEngine}
                onChange={(e) => setOcrEngine(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-boundary rounded-lg text-slate-900 text-xs focus:bg-white focus-ring"
              >
                <option value="paddleocr">PaddleOCR (High Multilingual Indian Script Support)</option>
                <option value="opencv_tesseract">OpenCV Preprocessing + Tesseract</option>
                <option value="easyocr">EasyOCR Deep Learning Engine</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Multimodal Verification Model
              </label>
              <select
                value={visionProvider}
                onChange={(e) => setVisionProvider(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-boundary rounded-lg text-slate-900 text-xs focus:bg-white focus-ring"
              >
                <option value="gemini-2.5">Gemini 2.5 Flash Multimodal API</option>
                <option value="gemini-pro">Gemini 1.5 Pro Multimodal</option>
                <option value="local_offline">Local Offline Deterministic Heuristics</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Persistence & Export Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Storage & Report Generation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Inspection Database Provider
              </label>
              <select
                value={databaseAdapter}
                onChange={(e) => setDatabaseAdapter(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-boundary rounded-lg text-slate-900 text-xs focus:bg-white focus-ring"
              >
                <option value="supabase">Supabase PostgreSQL with Vector Embeddings</option>
                <option value="sqlite_local">Local SQLite (Field Offline Kit)</option>
                <option value="in_memory">In-Memory Demo Adapter</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              Supports seamless offline caching during field inspections, synchronizing with central registries upon network availability.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
