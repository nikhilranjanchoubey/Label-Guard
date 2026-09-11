"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { legalRuleRepository } from "@/lib/legal/repository";
import { LegalRule, RuleVerificationStatus } from "@/lib/legal/types";
import { RuleDetailModal } from "@/components/rules/RuleDetailModal";
import {
  BookOpen,
  ShieldCheck,
  Search,
  Info,
  Calendar,
  History,
} from "lucide-react";

export default function RulesPage() {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<RuleVerificationStatus | "ALL">("ALL");
  const [selectedRule, setSelectedRule] = useState<LegalRule | null>(null);

  const stats = useMemo(() => legalRuleRepository.getStatistics(), []);
  const categories = useMemo(() => legalRuleRepository.getCategories(), []);

  const filteredRules = useMemo(() => {
    return legalRuleRepository.searchRules({
      query: searchQuery,
      category: selectedCategory,
      status: selectedStatus,
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("rules.title", "Verified Legal Metrology Rule Library")}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t("rules.verified", "VERIFIED CORPUS")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              "rules.subtitle",
              "Official source-backed rules under the Legal Metrology (Packaged Commodities) Rules, 2011 & amendments"
            )}
          </p>
        </div>
      </div>

      {/* Mandatory Statutory Notice / Legal Disclaimer */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900 shadow-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold uppercase tracking-wide text-blue-950">
            {locale === "hi" ? "कानूनी अस्वीकरण (Legal Disclaimer)" : "Authoritative Legal Disclaimer"}
          </strong>
          <p className="text-blue-800 leading-relaxed">
            {t(
              "rules.disclaimer",
              "LabelGuard provides automated compliance assistance based on configured legal rules. Final enforcement decisions require authorized human verification."
            )}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("rules.metricsTotal", "Total Rules")}
            </span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Packaged Commodities Rules</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              {t("rules.metricsVerified", "Verified Rules")}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.verified}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Source-backed & Active</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {t("rules.metricsAmendments", "Amendments Tracked")}
            </span>
            <History className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{stats.amendmentsCount}</div>
          <span className="text-[11px] text-slate-400">Gazette Notifications</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("rules.metricsLastVerified", "Last Verified")}
            </span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-base font-bold text-slate-800 mt-2 font-mono">
            {stats.lastVerifiedCorpusDate}
          </div>
          <span className="text-[11px] text-slate-400">DCA Gazette Catalogue</span>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("rules.searchPlaceholder", "Search by Rule ID, statutory reference, or requirement...")}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">{t("rules.filterAll", "All Categories")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as RuleVerificationStatus | "ALL")}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">{t("rules.filterStatus", "All Statuses")}</option>
              <option value="VERIFIED">{t("rules.verified", "VERIFIED")}</option>
              <option value="NEEDS_REVIEW">{t("rules.needsReview", "NEEDS REVIEW")}</option>
              <option value="SUPERSEDED">{t("rules.superseded", "SUPERSEDED")}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Rules Registry Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <CardTitle>
              Authoritative Rules Directory ({filteredRules.length} Rules Matching)
            </CardTitle>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Corpus: Legal Metrology (Packaged Commodities) Rules, 2011
          </span>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">{t("rules.internalRuleId", "Internal ID")}</TableHead>
                <TableHead className="w-[140px]">{t("rules.statutoryRef", "Statutory Reference")}</TableHead>
                <TableHead>{t("rules.requirement", "Rule Requirement Specification")}</TableHead>
                <TableHead className="w-[140px]">{t("rules.category", "Category")}</TableHead>
                <TableHead className="w-[110px]">{t("rules.effectiveFrom", "Effective")}</TableHead>
                <TableHead className="w-[120px]">{t("rules.activeStatus", "Status")}</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                    {t("rules.noResults", "No matching legal rules found.")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Internal Rule ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {rule.internalRuleId}
                      </span>
                    </TableCell>

                    {/* Statutory Reference */}
                    <TableCell>
                      <span className="font-semibold text-xs text-slate-900">
                        {rule.statutoryReference}
                      </span>
                    </TableCell>

                    {/* Requirement Specification */}
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">
                        {locale === "hi" && rule.titleHi ? rule.titleHi : rule.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {rule.requirement}
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-xs text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {rule.category}
                      </span>
                    </TableCell>

                    {/* Effective Date */}
                    <TableCell className="font-mono text-xs text-slate-600">
                      {rule.effectiveFrom}
                    </TableCell>

                    {/* Verification Status */}
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rule.verificationStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rule.verificationStatus === "NEEDS_REVIEW"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {rule.verificationStatus === "VERIFIED"
                          ? t("rules.verified", "VERIFIED")
                          : rule.verificationStatus === "NEEDS_REVIEW"
                          ? t("rules.needsReview", "NEEDS REVIEW")
                          : t("rules.superseded", "SUPERSEDED")}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRule(rule);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {t("rules.viewDetails", "Details")}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Rule Detail Modal */}
      <RuleDetailModal rule={selectedRule} onClose={() => setSelectedRule(null)} />
    </div>
  );
}
