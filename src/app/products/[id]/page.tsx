"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useInspection } from "@/context/InspectionContext";
import {
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Scan,
  Eye,
  FileCheck2,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getProductById, inspections } = useInspection();

  const product = getProductById(id);
  const relatedInspections = inspections.filter(
    (i) => i.productId.toLowerCase() === id?.toLowerCase() || i.productName.toLowerCase().includes(product?.name.toLowerCase() || "")
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="glass rounded-4xl p-10">
          <p className="text-lg font-bold text-ink">Product Not Found</p>
          <p className="mt-1 text-xs text-ink-muted">
            The product identifier <strong>{id}</strong> does not exist in the database.
          </p>
          <Link
            href="/products"
            className="btn-ink mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <Link href="/products" className="hover:text-ink flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Products
        </Link>
        <span>/</span>
        <span className="font-mono text-ink">{product.id}</span>
      </div>

      {/* Main Product Card */}
      <div className="mt-4 glass-strong grid gap-8 rounded-4xl p-6 sm:p-8 lg:grid-cols-[1fr_1.5fr] shadow-md">
        {/* Left: Package Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-100 p-4 border border-line">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        {/* Right: Product Metadata & Declarations */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-navy-500/10 px-3 py-1 font-mono text-xs font-bold text-navy-500">
                {product.id}
              </span>
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
                  product.lastStatus === "COMPLIANT"
                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                    : product.lastStatus === "NON_COMPLIANT"
                    ? "bg-red-500/15 text-red-700 border-red-500/30"
                    : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                }`}
              >
                {product.lastStatus.replace("_", " ")}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm font-semibold text-ink-muted">
              {product.brand} · {product.category}
            </p>

            {/* Structured Declarations List */}
            <div className="mt-6 space-y-3 rounded-2xl bg-white/70 p-4 border border-line">
              <div className="flex items-start gap-2 text-xs">
                <Building2 className="size-4 text-navy-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink block">Manufacturer &amp; Packer Address:</span>
                  <span className="text-ink-muted">{product.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-line-soft pt-2 text-xs">
                <div>
                  <span className="font-bold text-ink block">Declared Net Quantity:</span>
                  <span className="text-ink-muted">{product.netQuantity}</span>
                </div>
                <div>
                  <span className="font-bold text-ink block">Maximum Retail Price:</span>
                  <span className="text-ink-muted">{product.mrp}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-line-soft pt-2 text-xs">
                <div>
                  <span className="font-bold text-ink block">Packing Date Stamp:</span>
                  <span className="text-ink-muted">{product.mfgPackingDate}</span>
                </div>
                <div>
                  <span className="font-bold text-ink block">Total Field Inspections:</span>
                  <span className="font-mono font-bold text-ink">{product.inspectionCount} Inspections</span>
                </div>
              </div>

              <div className="border-t border-line-soft pt-2 text-xs">
                <span className="font-bold text-ink block">Consumer Care Helpline &amp; Email:</span>
                <span className="text-ink-muted">{product.consumerCare}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              Last inspected on {product.lastInspectedDate}
            </span>
            <Link
              href="/inspect"
              className="btn-ink inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-md"
            >
              <Scan className="size-4 text-saffron" />
              <span>Inspect This Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Associated Inspection Records Table */}
      <div className="mt-10 glass rounded-4xl p-6">
        <h2 className="text-base font-bold text-ink">Historical Inspection Audits for this Commodity</h2>
        <p className="text-xs text-ink-muted mt-0.5">
          All past scans, OCR records, and compliance findings recorded under DoCA
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold text-ink-muted">
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Batch Lot</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Coverage</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {relatedInspections.map((row) => (
                <tr key={row.id} className="hover:bg-white/60">
                  <td className="py-3 px-3 font-mono font-bold text-navy-500">{row.id}</td>
                  <td className="py-3 px-3 text-ink-muted">{row.inspectionDate}</td>
                  <td className="py-3 px-3 font-mono text-ink">{row.batchLotNumber}</td>
                  <td className="py-3 px-3 text-ink">{row.officerName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-ink">{row.coverageScore}%</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        row.status === "COMPLIANT"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : row.status === "NON_COMPLIANT"
                          ? "bg-red-500/15 text-red-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}
                    >
                      {row.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/inspections/${row.id}`}
                      className="font-bold text-navy-500 hover:underline inline-flex items-center gap-1"
                    >
                      <Eye className="size-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
