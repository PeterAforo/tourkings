"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ShieldCheck, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getSafeInternalPath } from "@/lib/safe-redirect";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDzsq78EbUUBplwOBWQ_Nr2ELpT8CiT0HC1JbWJvNY6XPlRRAdJMW6vNY3QJuyh19NSWJPxysMR1g5qpEsOuvF7pPtc5BJvxeiKD63pbRsNXZTi_u78LoKKTlZLnggfvzYZmtu1XRIMd_F0DL1bQYgA4L6uXuHn_YIi_yWLHa42Dy4tXAcIx4BW8S2SiebPgiVDvuRrHwBlWutwIY0pMcujv2W565rbCrVGR1FE2i0ox7KAXisUguXY6o2jjGuhMO4lFqtY_cGxFQ";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAppStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = getSafeInternalPath(searchParams.get("next"));
  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await csrfFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setUser(data.user);
      let dest = nextPath || "/dashboard";
      if (dest.startsWith("/admin")) dest = "/dashboard";
      router.push(dest);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex items-stretch">
        {/* Split Layout: Visual Side */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src={HERO_IMAGE}
            alt="Cape Coast Castle at dawn"
          />
          <div className="absolute inset-0 heritage-gradient opacity-40" />
          <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full">
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-4">TourKings</h1>
              <p className="text-secondary-fixed text-sm font-semibold tracking-widest uppercase">
                Ghanaian Heritage, Global Luxury
              </p>
            </div>
            <div className="max-w-md">
              <h2 className="font-headline text-5xl font-bold mb-6 leading-tight">
                Your Royal Journey Begins Here.
              </h2>
              <p className="text-lg text-primary-fixed font-medium leading-relaxed opacity-90">
                Experience the gold standard of African travel. Curated itineraries, elite guides, and the untamed
                beauty of the Gold Coast.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-highest" />
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high" />
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container" />
              </div>
              <p className="text-sm font-medium">Join 2,000+ elite travelers</p>
            </div>
          </div>
        </div>

        {/* Split Layout: Form Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface">
          <motion.div
            className="w-full max-w-md space-y-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Brand Anchor for Mobile */}
            <div className="lg:hidden mb-8">
              <span className="font-headline text-2xl font-extrabold text-primary tracking-tight">TourKings</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Start Your Adventure</h2>
              <p className="text-on-surface-variant font-medium">
                Secure your portal to the heart of West Africa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Full Name (first + last) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-bold text-secondary uppercase tracking-wider"
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                    <input
                      id="firstName"
                      placeholder="Kwame"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 border-b-2 border-transparent focus:border-primary placeholder:text-outline-variant text-on-surface"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-bold text-secondary uppercase tracking-wider"
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                    <input
                      id="lastName"
                      placeholder="Mensah"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 border-b-2 border-transparent focus:border-primary placeholder:text-outline-variant text-on-surface"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-bold text-secondary uppercase tracking-wider"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                  <input
                    id="email"
                    type="email"
                    placeholder="voyager@heritage.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 border-b-2 border-transparent focus:border-primary placeholder:text-outline-variant text-on-surface"
                  />
                </div>
              </div>

              {/* Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-bold text-secondary uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 border-b-2 border-transparent focus:border-primary placeholder:text-outline-variant text-on-surface"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-bold text-secondary uppercase tracking-wider"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-0 focus:bg-surface-container-lowest transition-all duration-200 border-b-2 border-transparent focus:border-primary placeholder:text-outline-variant text-on-surface"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 py-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    required
                    className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low"
                  />
                </div>
                <label className="text-sm text-on-surface-variant leading-tight" htmlFor="terms">
                  I agree to the{" "}
                  <Link href="/about" className="text-primary font-bold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and acknowledge the{" "}
                  <Link href="/about" className="text-primary font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full heritage-gradient text-on-primary font-bold py-4 px-6 rounded-md shadow-lg active:scale-[0.98] transition-transform duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{isLoading ? "Creating account…" : "Create Your Heritage Account"}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Already have an account */}
            <div className="pt-6 border-t border-surface-container-highest flex flex-col items-center gap-4">
              <p className="text-on-surface-variant font-medium">Already have an account?</p>
              <Link href={loginHref} className="inline-flex items-center text-primary font-bold group">
                Sign In
                <span className="ml-2 h-[2px] w-0 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 py-12 px-8 border-t border-stone-200/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-stone-900">TourKings</span>
            <p className="font-body text-sm text-stone-500">
              © {new Date().getFullYear()} TourKings. Ghanaian Heritage, Global Luxury.
            </p>
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="font-body text-sm text-stone-500 hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="font-body text-sm text-stone-500 hover:text-secondary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="font-body text-sm text-stone-500 hover:text-secondary transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
