"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Landmark,
  History,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/wallet", label: "The Vault", icon: Wallet },
  { href: "/dashboard/contribute", label: "Contribute", icon: CreditCard },
  { href: "/dashboard/wallet/history", label: "Vault History", icon: History },
  { href: "/dashboard/journey", label: "Heritage Path", icon: Landmark },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function dashboardPageTitle(pathname: string): string {
  const match = sidebarLinks.find((l) => pathname === l.href);
  if (match) return match.label;
  if (pathname.startsWith("/dashboard/contribute")) return "Contribute";
  if (pathname.startsWith("/dashboard/payments")) return "Payments";
  return "Dashboard";
}

function isSidebarActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    csrfFetch("/api/auth/me")
      .then((res) => { if (res.ok) return res.json(); return null; })
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, [setUser]);

  const handleLogout = async () => {
    await csrfFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-outline-variant/15 transform transition-transform lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/15">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-headline font-bold text-primary">Tour</span>
            <span className="text-xl font-headline font-bold text-on-surface">Kings</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-on-surface-variant"><X size={20} /></button>
        </div>

        {user && (
          <div className="p-6 border-b border-outline-variant/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">{user.firstName[0]}{user.lastName[0]}</span>
              </div>
              <div>
                <p className="text-on-surface text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-on-surface-variant text-xs">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isSidebarActive(pathname, link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              )}
            >
              <link.icon size={18} />
              {link.label}
              {isSidebarActive(pathname, link.href) && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-outline-variant/15">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:text-red-500 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-0">
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-on-surface-variant">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-headline font-semibold text-on-surface">{dashboardPageTitle(pathname)}</h1>
          <Link href="/" className="text-on-surface-variant hover:text-primary text-sm transition-colors">
            Back to Site
          </Link>
        </header>

        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
