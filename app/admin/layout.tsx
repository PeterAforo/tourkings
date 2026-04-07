"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, MapPin, Calendar, Users, CreditCard,
  FileText, Settings, LogOut, Menu, X, ChevronRight, Shield, Wallet, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/heritage", label: "Heritage Logic", icon: Medal },
  { href: "/admin/vault", label: "Vault Manager", icon: Wallet },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          <Link href="/admin" className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <span className="text-lg font-headline font-bold text-on-surface">Admin CMS</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-on-surface-variant"><X size={20} /></button>
        </div>

        <nav className="p-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              )}
            >
              <link.icon size={18} />
              {link.label}
              {pathname === link.href && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-outline-variant/15">
          <div className="mb-3 px-4">
            <p className="text-on-surface text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-on-surface-variant text-xs">Administrator</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:text-red-500 hover:bg-red-500/5 transition-all w-full">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1">
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-on-surface-variant"><Menu size={24} /></button>
            <h1 className="text-lg font-headline font-semibold text-on-surface">
              {adminLinks.find((l) => l.href === pathname)?.label || "Admin"}
            </h1>
          </div>
          <Link href="/" className="text-on-surface-variant hover:text-primary text-sm transition-colors">View Site</Link>
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
