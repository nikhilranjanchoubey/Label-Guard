"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { MOCK_INSPECTIONS } from "@/mocks/sampleData";
import { ClipboardList, Search, Filter, Eye, Download, ScanLine } from "lucide-react";

export default function InspectionsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInspections = MOCK_INSPECTIONS.filter((item) => {
    const matchesFilter = filter === "ALL" || item.overallStatus === filter;
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("nav.inspections", "Inspection Registry")}
            </h1>
            <Badge variant="demo" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical repository of evaluated packaged commodities and statutory audit records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/scan">
            <Button variant="secondary" size="sm" leftIcon={<ScanLine className="w-4 h-4" />}>
              {t("dashboard.quickScan", "New Inspection")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, brand, or inspection ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-boundary rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus-ring"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            {["ALL", "COMPLIANT", "REVIEW_REQUIRED", "VIOLATION"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors shrink-0 ${
                  filter === st
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registry Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <CardTitle>Commodity Inspection Records ({filteredInspections.length})</CardTitle>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Registry (CSV)
          </Button>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inspection ID</TableHead>
              <TableHead>Commodity / Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>OCR Confidence</TableHead>
              <TableHead>Compliance Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {item.id}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-slate-900">{item.productName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {item.brand} • EAN: {item.barcode}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {item.category}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {item.inspectionDate}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-action border border-blue-200">
                    {(item.overallOcrConfidence * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge status={item.overallStatus} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href="/evidence">
                      <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Audit
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
