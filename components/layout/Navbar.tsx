"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/dashboard/wallet", label: "The Vault" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, [setUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm"
          : "bg-white/60 backdrop-blur-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.png"
            alt="TourKings crown"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="text-2xl font-extrabold tracking-tighter text-blue-900 font-headline">
            TourKings
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold tracking-tight transition-colors font-headline",
                pathname === link.href
                  ? "text-blue-900 border-b-2 border-secondary pb-1"
                  : "text-stone-600 hover:text-blue-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <button className="bg-primary-container text-on-primary font-headline font-semibold px-6 py-2.5 rounded-lg hover:bg-primary transition-colors">
                  <LayoutDashboard size={16} className="inline mr-2" />
                  Dashboard
                </button>
              </Link>
              <button onClick={handleLogout} className="text-stone-400 hover:text-primary transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 font-headline">
                Sign In
              </button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-on-surface"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-outline-variant/15"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "block py-2 text-sm font-semibold font-headline transition-colors",
                    pathname === link.href ? "text-primary" : "text-stone-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-outline-variant/15 flex gap-3">
                {user ? (
                  <>
                    <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="flex-1">
                      <button className="w-full bg-primary-container text-on-primary font-semibold py-2.5 rounded-lg text-sm font-headline">Dashboard</button>
                    </Link>
                    <button onClick={handleLogout} className="px-3 text-stone-400 hover:text-primary transition-colors">
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex-1">
                    <button className="w-full bg-primary text-on-primary font-semibold py-2.5 rounded-lg text-sm font-headline">Sign In</button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
