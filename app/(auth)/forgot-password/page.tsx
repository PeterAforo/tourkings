"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LockKeyhole, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import AuthFormFooter from "@/components/auth/AuthFormFooter";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await csrfFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Request failed");
        return;
      }
      setStatus("sent");
      setMessage(data.message || "Check your email for next steps.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthSplitLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="relative mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-surface-container-highest mb-6 relative z-10">
          <LockKeyhole className="text-primary w-10 h-10" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-24 h-24 border border-secondary/10 rounded-full scale-125 pointer-events-none" />
      </div>

      <section className="bg-surface-container-lowest p-8 sm:p-10 rounded-xl shadow-sm border border-outline-variant/10">
        <header className="mb-8 text-left">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">Forgot Password</h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            Enter the email address associated with your TourKings account. We&apos;ll send you a link to reset your password when
            email delivery is enabled.
          </p>
        </header>

        {status === "sent" ? (
          <div className="space-y-6">
            <p className="text-on-surface text-sm leading-relaxed">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && message && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-600 text-sm">{message}</div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary tracking-widest uppercase" htmlFor="email">
                Registered Email
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. kofi.mensah@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-sm py-4 px-4 text-on-surface placeholder:text-on-surface-variant/85 transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                  <Mail className="text-primary w-4 h-4" />
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
                <span>{status === "loading" ? "Sending…" : "Send Reset Link"}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex items-center justify-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-container"
                >
                  <ArrowLeft size={16} className="transition-transform hover:-translate-x-0.5" />
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        )}
      </section>

      <div className="mt-12 text-center opacity-70">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-outline-variant" />
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Secure Recovery Path</span>
          <div className="h-px w-12 bg-outline-variant" />
        </div>
        <p className="text-xs text-on-surface-variant font-medium">
          Your request is handled with care. For urgent help, contact support via the Help Center.
        </p>
      </div>

      <AuthFormFooter />
      </motion.div>
    </AuthSplitLayout>
  );
}
