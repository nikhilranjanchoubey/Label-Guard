"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "light",
  size = "md",
  showBadge = true,
  showSubtitle = true,
  href = "/",
  className = "",
}) => {
  const isDark = variant === "dark";

  // Dimensions based on size
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 34;

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Package + Inspection Reticle + Verification Check */}
      <div
        style={{ width: iconSize, height: iconSize }}
        className={`relative shrink-0 flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          isDark
            ? "bg-navy-800 border border-navy-700 shadow-md"
            : "bg-navy-950 border border-navy-900 shadow-sm"
        }`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-5/6"
        >
          {/* Package Outline / Shield Geometry */}
          <path
            d="M16 3L6 7.5V15.2C6 21.8 10.3 27.9 16 29.5C21.7 27.9 26 21.8 26 15.2V7.5L16 3Z"
            fill={isDark ? "#1e293b" : "#0f172a"}
            stroke="#2563eb"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Commodity Box Internal Lines */}
          <path
            d="M16 3V16M6 7.5L16 16M26 7.5L16 16"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.75"
          />
          {/* Inspection Reticle / Verification Seal Circle */}
          <circle
            cx="16"
            cy="19"
            r="6"
            fill={isDark ? "#0f172a" : "#ffffff"}
            stroke="#10b981"
            strokeWidth="1.5"
          />
          {/* Emerald Checkmark: Verified Compliance */}
          <path
            d="M13.5 19L15.2 20.7L18.5 17.3"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col justify-center whitespace-nowrap min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${
              size === "sm"
                ? "text-sm"
                : size === "lg"
                ? "text-xl"
                : "text-[15px]"
            } ${isDark ? "text-white" : "text-navy-950"}`}
          >
            LABEL GUARD
          </span>

          {showBadge && (
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                isDark
                  ? "bg-navy-800 text-blue-400 border border-navy-700"
                  : "bg-blue-50 text-blue-700 border border-blue-200/60"
              }`}
            >
              SIH 26034
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Packaged Commodity Compliance
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
