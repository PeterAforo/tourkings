"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck, ArrowRight, Loader2 } from "lucide-react";
import AuthFormFooter from "@/components/auth/AuthFormFooter";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    csrfFetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="relative mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-surface-container-highest mb-6 relative z-10">
          <MailCheck className="text-primary w-10 h-10" />
        </div>
      </div>

      <section className="bg-surface-container-lowest p-8 sm:p-10 rounded-xl shadow-sm border border-outline-variant/10 text-center">
        {status === "loading" && (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-on-surface-variant">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Email Verified!</h1>
            <p className="text-on-surface-variant text-base leading-relaxed">{message}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Verification Failed</h1>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600 text-sm">
              {message}
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      <AuthFormFooter />
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthSplitLayout>
      <Suspense fallback={<div className="pt-24 min-h-screen bg-surface" />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthSplitLayout>
  );
}
