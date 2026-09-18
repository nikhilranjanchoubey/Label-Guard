"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectPath = redirectParam && redirectParam !== "/signin" ? redirectParam : "/";

  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState("inspector@labelguard.demo");
  const [password, setPassword] = useState("Demo@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      if (res.success) {
        router.push(redirectPath);
      } else {
        setErrorMessage(res.error || "Invalid credentials.");
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleDemoLogin = () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    loginAsDemo();
    setTimeout(() => {
      router.push(redirectPath);
    }, 300);
  };

  const autofillDemo = () => {
    setEmail("inspector@labelguard.demo");
    setPassword("Demo@2026");
    setErrorMessage(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center px-4 py-12 sm:px-6">
      {/* Brand & Prototype Identity */}
      <div className="flex flex-col items-center text-center">
        <Logo href="/" size="lg" showBadge={true} showSubtitle={true} />
        
        {/* Mandatory SIH Prototype Disclaimer */}
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-800">
          <ShieldCheck className="size-3.5 text-blue-600" />
          <span>SIH 2026 Prototype • Demo Authentication</span>
        </div>

        <p className="mt-2 text-xs text-ink-muted max-w-sm">
          Simulated identity portal for evaluation under Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      {/* Main Sign-In Card */}
      <div className="glass-strong mt-6 w-full rounded-4xl p-6 sm:p-8 shadow-xl border border-line">
        <div className="border-b border-line pb-4">
          <h2 className="text-lg font-black text-ink">Inspector Portal Sign In</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Access enforcement workbench, compliance analyzer, and audit records.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Authentication Failed</p>
              <p className="mt-0.5 text-[11px] text-red-600">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Email / User ID */}
          <div>
            <label className="block text-xs font-bold text-ink">Email or Inspector ID</label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
                <Mail className="size-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="inspector@labelguard.demo"
                className="w-full rounded-2xl border border-line bg-white/90 py-2.5 pl-10 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-ink">Password</label>
              <button
                type="button"
                onClick={autofillDemo}
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                Autofill demo password
              </button>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
                <Lock className="size-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-line bg-white/90 py-2.5 pl-10 pr-10 text-xs text-ink placeholder:text-ink-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:opacity-60"
          >
            <span>{isSubmitting ? "Verifying Credentials..." : "Sign In to Label Guard"}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-line"></div>
          <span className="absolute bg-white/80 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            OR
          </span>
        </div>

        {/* Instant One-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/60"
        >
          <Sparkles className="size-3.5 text-emerald-600" />
          <span>One-Click Demo Login (Prototype Inspector)</span>
        </button>

        {/* Demo Account Credentials Callout */}
        <div className="mt-6 rounded-2xl border border-line bg-slate-50/80 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <UserCheck className="size-4 text-blue-600" />
            <span>SIH Demo Credentials</span>
          </div>
          <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
            <div className="flex justify-between">
              <span className="text-ink-muted">Role:</span>
              <span className="font-semibold text-emerald-700">Prototype Inspector (INSPECTOR)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Email:</span>
              <span className="font-bold text-navy-950">inspector@labelguard.demo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Password:</span>
              <span className="font-bold text-navy-950">Demo@2026</span>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-ink-muted">
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>All mock inspection cases &amp; rule engines pre-configured.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <div className="glass rounded-3xl p-6 text-center text-xs font-bold text-ink">
            Loading sign in...
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
