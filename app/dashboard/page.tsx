"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency, cn } from "@/lib/utils";

interface WalletData {
  balance: number;
  currency: string;
  transactions: { id: string; amount: number; type: string; description: string; createdAt: string }[];
}

interface Booking {
  id: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  package: { title: string; destination: { name: string } };
}

const suggestedPackages = [
  { title: "Accra City Experience", price: 800, slug: "accra-city-experience" },
  { title: "Cape Coast Heritage Tour", price: 1500, slug: "cape-coast-heritage-tour" },
  { title: "Volta Region Adventure", price: 2200, slug: "volta-region-adventure" },
  { title: "Kumasi Cultural Immersion", price: 1800, slug: "kumasi-cultural-immersion" },
];

export default function DashboardPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch("/api/wallet").then((r) => r.json()).then((d) => setWallet(d.wallet)).catch(() => {});
    fetch("/api/bookings").then((r) => r.json()).then((d) => setBookings(d.bookings || [])).catch(() => {});
  }, []);

  const balance = wallet?.balance || 0;
  const currency = wallet?.currency || "GHS";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-primary" />
              </div>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Wallet Balance</span>
            </div>
            <p className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(balance, currency)}</p>
            <Link href="/dashboard/wallet" className="text-primary text-sm mt-2 inline-flex items-center gap-1 hover:text-primary-container">
              Top Up <ArrowRight size={14} />
            </Link>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-secondary" />
              </div>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Active Bookings</span>
            </div>
            <p className="text-3xl font-headline font-bold text-on-surface">{bookings.filter((b) => b.status === "CONFIRMED").length}</p>
            <Link href="/dashboard/bookings" className="text-primary text-sm mt-2 inline-flex items-center gap-1 hover:text-primary-container">
              View All <ArrowRight size={14} />
            </Link>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-blue-500" />
              </div>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Total Trips</span>
            </div>
            <p className="text-3xl font-headline font-bold text-on-surface">{bookings.filter((b) => b.status === "COMPLETED").length}</p>
            <p className="text-on-surface-variant text-sm mt-2">Completed adventures</p>
          </Card>
        </motion.div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Savings Progress</h2>
        <p className="text-on-surface-variant text-sm mb-6">See how close your wallet balance is to these packages:</p>
        <div className="space-y-4">
          {suggestedPackages.map((pkg) => {
            const progress = Math.min((balance / pkg.price) * 100, 100);
            return (
              <div key={pkg.slug}>
                <div className="flex justify-between text-sm mb-1">
                  <Link href={`/packages/${pkg.slug}`} className="text-on-surface hover:text-primary transition-colors">{pkg.title}</Link>
                  <span className="text-on-surface-variant">{formatCurrency(balance, currency)} / {formatCurrency(pkg.price, currency)}</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", progress >= 100 ? "bg-emerald-500" : "bg-primary")}
                  />
                </div>
                {progress >= 100 && (
                  <p className="text-emerald-500 text-xs mt-1">You can book this package now!</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {bookings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-headline font-bold text-on-surface">Recent Bookings</h2>
            <Link href="/dashboard/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div>
                  <p className="text-on-surface font-medium">{booking.package.title}</p>
                  <p className="text-on-surface-variant text-sm">{booking.package.destination.name}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  booking.status === "CONFIRMED" && "bg-emerald-500/20 text-emerald-600",
                  booking.status === "PENDING" && "bg-yellow-500/20 text-yellow-600",
                  booking.status === "COMPLETED" && "bg-blue-500/20 text-blue-600",
                  booking.status === "CANCELLED" && "bg-red-500/20 text-red-600"
                )}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
