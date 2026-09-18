"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { PhoneCall, ShieldCheck, ExternalLink, Scale } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto px-3 pb-3 pt-12 sm:px-4" id="footer">
      <div className="aurora-dark relative mx-auto w-full max-w-7xl overflow-hidden rounded-4xl text-white">
        {/* Glow blob in corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-indigo-500/20 blur-3xl"
        ></div>

        <div className="relative grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand Info */}
          <div>
            <Logo variant="dark" size="lg" showBadge={true} showSubtitle={true} />


            <p className="mt-4 max-w-sm text-[13px] leading-6 text-white/70">
              {t("footer.about")}
            </p>

            {/* Helpline Pill */}
            <a
              href="tel:18001140000"
              className="glass-dark mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            >
              <PhoneCall className="size-3.5 text-saffron" />
              <span>National Consumer Helpline: <span className="font-mono font-bold text-sky-300">1915 / 1800-11-4000</span></span>
            </a>

            {/* Ministry Tag */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/90 px-3.5 py-2 text-ink shadow-sm w-fit">
              <Scale className="size-5 text-navy-900 shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-bold leading-tight text-navy-900">
                  Department of Consumer Affairs (DoCA)
                </p>
                <p className="text-[9px] text-ink-muted">
                  Ministry of Consumer Affairs, Food &amp; Public Distribution · Govt. of India
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 */}
            <nav>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                Inspection Services
              </h3>
              <ul className="space-y-2 text-[13px] text-white/75">
                <li>
                  <Link href="/inspect" className="transition-colors hover:text-white">
                    Scan Product Label
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="transition-colors hover:text-white">
                    Enforcement Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/inspections" className="transition-colors hover:text-white">
                    Inspection History
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="transition-colors hover:text-white">
                    Product Repository
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Column 2 */}
            <nav>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                Statutory Rules (PCR)
              </h3>
              <ul className="space-y-2 text-[13px] text-white/75">
                <li>
                  <Link href="/rules" className="transition-colors hover:text-white">
                    Rule 6: Mandatory Declarations
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="transition-colors hover:text-white">
                    Rule 7: Font-Size Matrix
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="transition-colors hover:text-white">
                    Rule 8: Standard Units
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="transition-colors hover:text-white">
                    Rule 6(11): Unit Sale Price
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Column 3 */}
            <nav>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                Reports &amp; Auditing
              </h3>
              <ul className="space-y-2 text-[13px] text-white/75">
                <li>
                  <Link href="/reports" className="transition-colors hover:text-white">
                    Compliance Reports Vault
                  </Link>
                </li>
                <li>
                  <Link href="/reports/verify/LG-2026-0101" className="transition-colors hover:text-white">
                    Verify Report Digital Seal
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="transition-colors hover:text-white">
                    Inspection Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="transition-colors hover:text-white">
                    Audit Trail Architecture
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Column 4 */}
            <nav>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                Legal &amp; Architecture
              </h3>
              <ul className="space-y-2 text-[13px] text-white/75">
                <li>
                  <Link href="/docs" className="transition-colors hover:text-white">
                    System Architecture
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="transition-colors hover:text-white">
                    Legal Metrology Act, 2009
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="transition-colors hover:text-white">
                    SIH 26034 Requirement Matrix
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="transition-colors hover:text-white">
                    Deployment &amp; OCR Engine
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Large Decorative Watermark */}
        <p
          aria-hidden="true"
          className="relative select-none px-4 text-center text-[13vw] font-bold leading-[0.85] tracking-[-0.06em] text-white/[0.06] xl:text-[10.5rem]"
        >
          COMPLIANT.
        </p>

        {/* Sub-Footer Strip */}
        <div className="relative flex flex-col gap-2 border-t border-white/10 px-6 py-4 text-[11px] text-white/50 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <p>
            SIH 2026 Prototype · Problem Statement 26034 · Demonstration platform — not an official Government of India deployment.
          </p>
          <div className="flex items-center gap-3">
            <span className="tricolor-rule h-1 w-8 rounded-full" aria-hidden="true"></span>
            <span>Version 2.4.0 · PCR 2011 Engine Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
