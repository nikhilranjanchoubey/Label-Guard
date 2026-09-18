"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PROTECTED_ROUTES = [
  "/inspect",
  "/dashboard",
  "/inspections",
  "/products",
  "/reports",
  "/rules",
  "/analytics",
  "/docs",
];

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && isProtectedRoute) {
        router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && pathname === "/signin") {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, isProtectedRoute, pathname, router]);

  // While checking auth on a protected route, show a sleek placeholder to prevent flicker
  if (isLoading && isProtectedRoute) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-8 py-6 text-center shadow-lg">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-600 text-white animate-pulse">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-xs font-bold text-ink">Verifying Session...</p>
          <span className="text-[10px] text-ink-muted">Label Guard SIH 2026</span>
        </div>
      </div>
    );
  }

  // If not authenticated and on protected route, block rendering while redirecting
  if (!isLoading && !isAuthenticated && isProtectedRoute) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-8 py-6 text-center shadow-lg">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-xs font-bold text-ink">Authentication Required</p>
          <p className="text-[11px] text-ink-muted">Redirecting to demo sign in portal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
