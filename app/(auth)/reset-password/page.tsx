"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import AuthFormFooter from "@/components/auth/AuthFormFooter";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await csrfFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to reset password.");
        return;
      }
      setStatus("success");
      setMessage(data.message || "Password reset successfully.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <section className="bg-surface-container-lowest p-8 sm:p-10 rounded-xl shadow-sm border border-outline-variant/10">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">Invalid Link</h1>
          <p className="text-on-surface-variant text-base leading-relaxed mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
            <ArrowLeft size={16} /> Request New Link
          </Link>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="relative mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-surface-container-highest mb-6 relative z-10">
          <ShieldCheck className="text-primary w-10 h-10" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-24 h-24 border border-secondary/10 rounded-full scale-125 pointer-events-none" />
      </div>

      <section className="bg-surface-container-lowest p-8 sm:p-10 rounded-xl shadow-sm border border-outline-variant/10">
        <header className="mb-8 text-left">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">Reset Password</h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            Enter your new password below. Make it strong — at least 8 characters.
          </p>
        </header>

        {status === "success" ? (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-700 text-sm">{message}</div>
            <Link href="/login" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
              <ArrowRight size={16} /> Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && message && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-600 text-sm">{message}</div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary tracking-widest uppercase" htmlFor="password">
                New Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-sm py-4 px-4 pr-12 text-on-surface placeholder:text-on-surface-variant/85 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary tracking-widest uppercase" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-sm py-4 px-4 text-on-surface placeholder:text-on-surface-variant/85 transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                  <Lock className="text-primary w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className={cn(
                  "w-full heritage-gradient text-on-primary font-bold py-4 rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
                )}
              >
                <span>{status === "loading" ? "Resetting…" : "Reset Password"}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex items-center justify-center pt-2">
                <Link href="/login" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-container">
                  <ArrowLeft size={16} className="transition-transform hover:-translate-x-0.5" />
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        )}
      </section>

      <AuthFormFooter />
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout>
      <Suspense fallback={<div className="pt-24 min-h-screen bg-surface" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
