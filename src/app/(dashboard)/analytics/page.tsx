"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const weeklyTrend = [
    { day: "Mon", count: 24, compliant: 21 },
    { day: "Tue", count: 32, compliant: 28 },
    { day: "Wed", count: 28, compliant: 25 },
    { day: "Thu", count: 36, compliant: 31 },
    { day: "Fri", count: 42, compliant: 37 },
    { day: "Sat", count: 18, compliant: 16 },
    { day: "Sun", count: 12, compliant: 11 },
  ];

  const commonIssues = [
    { issue: "Missing 'Inclusive of all taxes' string", count: 46, percentage: 38 },
    { issue: "Unit Sale Price (USP) font height below threshold", count: 32, percentage: 26 },
    { issue: "Incomplete consumer helpline / email channel", count: 24, percentage: 20 },
    { issue: "Ambiguous date of manufacture / packing format", count: 19, percentage: 16 },
  ];

  const categoryShare = [
    { category: "Packaged Food & Confectionery", count: 580, rate: 89.2 },
    { category: "Personal Care & Cosmetics", count: 340, rate: 84.5 },
    { category: "Edible Oils & Grains", count: 290, rate: 92.1 },
    { category: "Household & Cleaning", count: 218, rate: 86.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("analytics.title", "Compliance Analytics")}
            </h1>
            <Badge variant="demo" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("analytics.subtitle", "Aggregate statistical insights across inspected packaged commodities")}
          </p>
        </div>
      </div>

      {/* Top 3 Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Audited Commodities
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">1,428</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Sample registry</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Mean OCR Confidence
              </p>
              <h3 className="text-2xl font-bold text-action mt-1">96.4%</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Optical extraction clarity</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-action flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compliance Benchmark
              </p>
              <h3 className="text-2xl font-bold text-compliant mt-1">88.4%</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Deterministic pass rate</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-compliant-bg text-compliant flex items-center justify-center">
              <PieChart className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("analytics.trend", "Weekly Inspection Volume")}</CardTitle>
            <CardDescription>Inspections conducted vs compliant determinations (Demo Sample)</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end justify-between gap-3 h-48 pt-6">
              {weeklyTrend.map((item) => {
                const heightPercent = Math.round((item.count / 45) * 100);
                const compliantPercent = Math.round((item.compliant / item.count) * 100);

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] font-mono text-slate-500">{item.count}</div>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: `${heightPercent}%` }}>
                      <div
                        className="w-full bg-action hover:bg-action-hover transition-colors rounded-t"
                        style={{ height: `${compliantPercent}%` }}
                        title={`${item.compliant} compliant out of ${item.count}`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{item.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-boundary text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-action rounded" />
                <span>Compliant Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-200 rounded" />
                <span>Total Inspected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Frequent Declaration Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("analytics.commonViolations", "Most Frequent Declaration Issues")}</CardTitle>
            <CardDescription>Distribution of flagged items requiring officer intervention</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {commonIssues.map((item) => (
              <div key={item.issue} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate">{item.issue}</span>
                  <span className="font-mono text-slate-500 shrink-0 ml-2">{item.count} cases ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Commodity Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t("analytics.categoryWise", "Commodity Category Breakdown")}</CardTitle>
          <CardDescription>Sample compliance indices by product category</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryShare.map((cat) => (
              <div key={cat.category} className="p-4 rounded-xl border border-boundary bg-slate-50/50 space-y-1">
                <div className="text-xs font-semibold text-slate-800">{cat.category}</div>
                <div className="text-xl font-bold text-primary mt-1">{cat.count}</div>
                <div className="text-xs font-semibold text-compliant flex items-center gap-1">
                  <span>{cat.rate}% Compliance</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
