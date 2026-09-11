import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock, ShieldAlert } from "lucide-react";
import { ComplianceStatus } from "@/lib/compliance/types";
import { useTranslation } from "@/lib/i18n";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "compliant" | "warning" | "violation" | "neutral" | "demo" | "confidence";
  status?: ComplianceStatus;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant,
  status,
  showIcon = true,
  size = "md",
  ...props
}) => {
  const { t } = useTranslation();

  // Resolve variant and label from status if provided
  let resolvedVariant = variant || "neutral";
  let label = children;
  let icon = null;

  if (status) {
    switch (status) {
      case "COMPLIANT":
        resolvedVariant = "compliant";
        label = label || t("status.compliant", "Compliant");
        icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />;
        break;
      case "REVIEW_REQUIRED":
        resolvedVariant = "warning";
        label = label || t("status.review_required", "Review Required");
        icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
        break;
      case "VIOLATION":
        resolvedVariant = "violation";
        label = label || t("status.violation", "Violation");
        icon = <AlertOctagon className="w-3.5 h-3.5 shrink-0" />;
        break;
      case "PENDING":
      default:
        resolvedVariant = "neutral";
        label = label || t("status.pending", "Pending");
        icon = <Clock className="w-3.5 h-3.5 shrink-0" />;
        break;
    }
  } else if (resolvedVariant === "demo") {
    icon = <ShieldAlert className="w-3.5 h-3.5 shrink-0" />;
    label = label || t("app.demoBadge", "DEMO MODE — SAMPLE DATA");
  }

  const baseStyles = "inline-flex items-center font-semibold rounded-md border tracking-wide select-none";

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1 leading-tight",
    md: "text-xs px-2.5 py-1 gap-1.5 leading-normal",
  };

  const variantStyles = {
    compliant: "bg-compliant-bg border-compliant-border text-compliant-text",
    warning: "bg-warning-bg border-warning-border text-warning-text",
    violation: "bg-violation-bg border-violation-border text-violation-text",
    neutral: "bg-slate-100 border-slate-200 text-slate-700",
    demo: "bg-amber-50 border-amber-300 text-amber-900 font-bold uppercase tracking-wider",
    confidence: "bg-blue-50 border-blue-200 text-blue-800 font-mono text-xs",
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[resolvedVariant], className))}
      {...props}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
