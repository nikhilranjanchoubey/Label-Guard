import React from "react";
import { Loader2, Scan } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  variant?: "spinner" | "scanner" | "skeleton";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  subMessage,
  variant = "spinner",
  className,
}) => {
  if (variant === "skeleton") {
    return (
      <div className={twMerge("w-full space-y-3 animate-pulse", className)}>
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-100 rounded w-full"></div>
        <div className="h-10 bg-slate-100 rounded w-full"></div>
        <div className="h-10 bg-slate-100 rounded w-4/5"></div>
      </div>
    );
  }

  if (variant === "scanner") {
    return (
      <div className={twMerge("flex flex-col items-center justify-center p-8 text-center", className)}>
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-action/10 border border-action/20 text-action mb-4">
          <Scan className="w-8 h-8 animate-pulse" />
          <div className="absolute inset-x-2 top-0 h-0.5 bg-action/60 animate-bounce shadow-sm" />
        </div>
        <p className="text-sm font-semibold text-slate-800">{message}</p>
        {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-xs">{subMessage}</p>}
      </div>
    );
  }

  return (
    <div className={twMerge("flex flex-col items-center justify-center p-8 text-center", className)}>
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      {subMessage && <p className="text-xs text-slate-500 mt-1">{subMessage}</p>}
    </div>
  );
};
