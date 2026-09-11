"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_INSPECTIONS,
  MOCK_OFFICER,
} from "@/mocks/sampleData";
import {
  ClipboardCheck,
  Percent,
  AlertOctagon,
  Clock,
  ScanLine,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("dashboard.welcome", "Welcome back")}, {MOCK_OFFICER.name}
            </h1>
            <Badge variant="demo" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("dashboard.summary", "Compliance overview and recent package inspections")} • {MOCK_OFFICER.station}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/scan">
            <Button
              variant="secondary"
              leftIcon={<ScanLine className="w-4 h-4" />}
            >
              {t("dashboard.quickScan", "Initiate New Inspection")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Clearly labeled sample data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inspections */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.totalInspections", "Total Inspections")}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {MOCK_DASHBOARD_METRICS.totalInspections.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Sample aggregate</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Compliance Rate */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.complianceRate", "Compliance Rate")}
              </p>
              <h3 className="text-2xl font-bold text-compliant mt-1">
                {MOCK_DASHBOARD_METRICS.complianceRate}%
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Sample rate</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-compliant-bg text-compliant flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Violations Flagged */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.violationsFlagged", "Violations Detected")}
              </p>
              <h3 className="text-2xl font-bold text-violation mt-1">
                {MOCK_DASHBOARD_METRICS.violationsDetected}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Requires follow-up</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violation-bg text-violation flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.pendingReviews", "Pending Reviews")}
              </p>
              <h3 className="text-2xl font-bold text-warning mt-1">
                {MOCK_DASHBOARD_METRICS.pendingReviews}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Human audit required</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-warning-bg text-warning flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Activity & Quick Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Inspections Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t("dashboard.recentActivity", "Recent Inspections")}</CardTitle>
                <CardDescription>
                  Audit log of recently ingested and evaluated packaged goods
                </CardDescription>
              </div>
              <Link href="/inspections">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  {t("common.view", "View All")}
                </Button>
              </Link>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product / Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>OCR Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INSPECTIONS.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.id} • {item.brand}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {item.category}
                    </TableCell>
                    <TableCell>
                      <Badge status={item.overallStatus} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {(item.overallOcrConfidence * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/evidence">
                        <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          {t("common.details", "Audit")}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right 1 Col: High-Risk Attention & Guidelines Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm flex items-center gap-1.5 text-warning-text">
                  <ShieldAlert className="w-4 h-4 text-warning" />
                  <span>{t("dashboard.highRiskAlerts", "Attention Needed")}</span>
                </CardTitle>
                <CardDescription>
                  Items flagged for ambiguous print or potential statutory violations
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border border-warning-border bg-warning-bg/50 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-warning-text">
                  <span>Anand Delights Atta Biscuits</span>
                  <Badge variant="warning" size="sm">REVIEW</Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  Unit Sale Price (USP) font height clarity ambiguous on packaging side.
                </p>
                <Link href="/verification" className="inline-block text-[11px] font-semibold text-action hover:underline mt-1">
                  Open in Verification Cockpit →
                </Link>
              </div>

              <div className="p-3 rounded-lg border border-violation-border bg-violation-bg/50 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-violation-text">
                  <span>Himalayan Herbal Toothpaste</span>
                  <Badge variant="violation" size="sm">VIOLATION</Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  MRP declaration missing mandatory &quot;inclusive of all taxes&quot; specification.
                </p>
                <Link href="/compliance" className="inline-block text-[11px] font-semibold text-action hover:underline mt-1">
                  Review Compliance Matrix →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-800">Verification Principles</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Optical character recognition (OCR) confidence is calculated strictly based on pixel clarity and character segmentation. Compliance evaluations are executed deterministically against regulatory rules.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
