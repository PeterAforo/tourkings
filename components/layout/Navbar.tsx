"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, Search, Bell } from "lucide-react";
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ packages: any[]; destinations: any[] }>({ packages: [], destinations: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    csrfFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, [setUser]);

  useEffect(() => {
    if (!user) return;
    csrfFetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data?.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount ?? data.notifications.filter((n: any) => !n.read).length);
        } else if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.read).length);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ packages: [], destinations: [] });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [pkgRes, destRes] = await Promise.all([
          csrfFetch(`/api/packages?search=${encodeURIComponent(searchQuery)}`),
          csrfFetch("/api/destinations"),
        ]);
        const pkgData = await pkgRes.json();
        const destData = await destRes.json();
        const packages = Array.isArray(pkgData) ? pkgData.slice(0, 5) : (pkgData.packages ?? []).slice(0, 5);
        const query = searchQuery.toLowerCase();
        const destinations = (Array.isArray(destData) ? destData : destData.destinations ?? [])
          .filter((d: any) => d.name?.toLowerCase().includes(query) || d.country?.toLowerCase().includes(query))
          .slice(0, 3);
        setSearchResults({ packages, destinations });
      } catch {
        setSearchResults({ packages: [], destinations: [] });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const markAllRead = async () => {
    await csrfFetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = async (id: string) => {
    await csrfFetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleLogout = async () => {
    await csrfFetch("/api/auth/logout", { method: "POST" });
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
          <button
            onClick={() => { setShowSearch(!showSearch); setShowNotifications(false); }}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <Search size={20} />
          </button>
          {user && (
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowSearch(false); }}
                className="text-on-surface-variant hover:text-primary transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-outline-variant/15 overflow-hidden z-50">
                  <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center">
                    <span className="font-headline font-bold text-on-surface">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-on-surface-variant text-sm">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n: any) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-outline-variant/10 hover:bg-surface-container-low cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <p className="text-sm font-medium text-on-surface">{n.title}</p>
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-20 bg-white shadow-2xl border-t border-outline-variant/15 z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search packages, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-headline"
                />
              </div>
              {(searchResults.packages.length > 0 || searchResults.destinations.length > 0) && (
                <div className="mt-3 divide-y divide-outline-variant/15">
                  {searchResults.packages.length > 0 && (
                    <div className="pb-3">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Packages</p>
                      {searchResults.packages.map((pkg: any) => (
                        <Link
                          key={pkg.id}
                          href={`/packages/${pkg.slug || pkg.id}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                        >
                          {pkg.imageUrl && (
                            <Image src={pkg.imageUrl} alt={pkg.title} width={40} height={40} className="w-10 h-10 rounded-md object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{pkg.title}</p>
                            {pkg.price && <p className="text-xs text-on-surface-variant">From ${pkg.price}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.destinations.length > 0 && (
                    <div className="pt-3">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Destinations</p>
                      {searchResults.destinations.map((dest: any) => (
                        <Link
                          key={dest.id}
                          href={`/destinations/${dest.slug || dest.id}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                        >
                          {dest.imageUrl && (
                            <Image src={dest.imageUrl} alt={dest.name} width={40} height={40} className="w-10 h-10 rounded-md object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{dest.name}</p>
                            {dest.country && <p className="text-xs text-on-surface-variant">{dest.country}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {searchQuery.trim() && searchResults.packages.length === 0 && searchResults.destinations.length === 0 && (
                <p className="mt-3 text-center text-sm text-on-surface-variant">No results found for &ldquo;{searchQuery}&rdquo;</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
