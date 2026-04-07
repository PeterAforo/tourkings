"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthFormFooter from "@/components/auth/AuthFormFooter";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getSafeInternalPath } from "@/lib/safe-redirect";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAppStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = getSafeInternalPath(searchParams.get("next"));
  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await csrfFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (remember) {
        try {
          localStorage.setItem("tourkings_remember", "1");
        } catch {
          /* ignore */
        }
      }

      setUser(data.user);

      const role = data.user.role as string;
      if (role === "ADMIN") {
        if (nextPath && nextPath.startsWith("/admin")) {
          router.push(nextPath);
        } else {
          router.push("/admin");
        }
        return;
      }

      if (nextPath && nextPath.startsWith("/admin")) {
        router.push("/dashboard");
        return;
      }

      router.push(nextPath || "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="space-y-3">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Welcome Back</h1>
        <p className="text-on-surface-variant font-medium">Enter your credentials to access your royal itinerary.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-600 text-sm">{error}</div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2" htmlFor="email">
              Email or Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
              <input
                id="email"
                type="text"
                autoComplete="username"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded text-on-surface placeholder:text-outline/50 focus:ring-0 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded text-on-surface placeholder:text-outline/50 focus:ring-0 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-on-surface-variant cursor-pointer">
            Keep me logged in for future adventures
          </label>
        </div>

        <div className="space-y-6">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "heritage-gradient w-full py-4 px-6 text-on-primary font-headline font-bold rounded-lg shadow-xl shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
            )}
          >
            {isLoading ? "Signing in…" : "Sign In"}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-surface-container-highest" />
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-[0.2em] text-outline">New to TourKings?</span>
            <div className="flex-grow border-t border-surface-container-highest" />
          </div>

          <Link
            href={registerHref}
            className="flex w-full items-center justify-center py-4 px-6 bg-surface-container-high text-primary font-headline font-bold rounded-lg hover:bg-surface-container-highest transition-colors active:scale-[0.98]"
          >
            Create Account
          </Link>
        </div>
      </form>

      <AuthFormFooter />
    </motion.div>
  );
}
