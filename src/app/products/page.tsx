"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInspection } from "@/context/InspectionContext";
import {
  Package,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Scan,
} from "lucide-react";

export default function ProductsPage() {
  const { products, inspections } = useInspection();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-500">
            <Package className="size-4" />
            <span>Commodity Repository</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Scanned Product Repository
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Repository of previously inspected packaged commodities, manufacturer declarations, and compliance track record.
          </p>
        </div>

        <Link
          href="/inspect"
          className="btn-ink flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-md"
        >
          <Scan className="size-4 text-saffron" />
          <span>Scan New Commodity</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-3">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <Search className="size-4 text-ink-muted shrink-0 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, brand, or manufacturer..."
            className="w-full bg-transparent text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted/70"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-ink outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Packaged Staples & Grains">Staples &amp; Grains</option>
          <option value="Edible Oils & Fats">Edible Oils</option>
          <option value="Spices & Condiments">Spices</option>
          <option value="Bakery & Confectionery">Bakery</option>
          <option value="Beverages & Teas">Beverages</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prod) => {
          const statusBadge =
            prod.lastStatus === "COMPLIANT"
              ? { label: "COMPLIANT", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" }
              : prod.lastStatus === "NON_COMPLIANT"
              ? { label: "NON-COMPLIANT", color: "bg-red-500/15 text-red-700 border-red-500/30" }
              : { label: "NEEDS REVIEW", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" };

          return (
            <Link
              key={prod.id}
              href={`/products/${prod.id}`}
              className="glass group flex flex-col justify-between overflow-hidden rounded-4xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-100 p-3 border border-line">
                  <Image
                    src={prod.imageUrl}
                    alt={prod.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500">
                    {prod.brand} · {prod.category}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-ink group-hover:text-navy-500 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
                    {prod.manufacturer}
                  </p>
                </div>

                {/* Key Declarations Snapshot */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/70 p-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-ink-muted">Declared Net Qty</span>
                    <span className="font-bold text-ink">{prod.netQuantity}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-ink-muted">Retail MRP</span>
                    <span className="font-bold text-ink">{prod.mrp}</span>
                  </div>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="mt-5 flex items-center justify-between border-t border-line pt-3 text-xs font-semibold">
                <span className="text-ink-muted">
                  Inspections: <strong className="text-ink">{prod.inspectionCount}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-navy-500 group-hover:underline">
                  View Commodity History <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
