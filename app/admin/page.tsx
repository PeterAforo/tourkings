"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, Calendar, CreditCard, TrendingUp, ArrowUpRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency, cn } from "@/lib/utils";

interface AdminStats {
  totalCustomers: number;
  totalPackages: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: { id: string; user: { firstName: string; lastName: string }; package: { title: string }; totalAmount: number; status: string; createdAt: string }[];
  recentPayments: { id: string; amount: number; type: string; status: string; createdAt: string; user: { firstName: string; lastName: string } }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalCustomers: 0, totalPackages: 0, totalBookings: 0, totalRevenue: 0,
    recentBookings: [], recentPayments: [],
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.stats) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/20" },
    { label: "Tour Packages", value: stats.totalPackages, icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-secondary", bg: "bg-secondary/20" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: CreditCard, color: "text-green-500", bg: "bg-green-500/20", isRevenue: true },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.bg)}>
                  <card.icon size={24} className={card.color} />
                </div>
                <ArrowUpRight size={16} className="text-on-surface-variant" />
              </div>
              <p className="text-2xl font-headline font-bold text-on-surface">{card.value}</p>
              <p className="text-on-surface-variant text-sm mt-1">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-headline font-bold text-on-surface mb-4">Recent Bookings</h2>
          {stats.recentBookings.length === 0 ? (
            <p className="text-on-surface-variant text-sm py-8 text-center">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                  <div>
                    <p className="text-on-surface text-sm font-medium">{booking.user.firstName} {booking.user.lastName}</p>
                    <p className="text-on-surface-variant text-xs">{booking.package.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary text-sm font-medium">{formatCurrency(booking.totalAmount)}</p>
                    <span className={cn(
                      "text-xs",
                      booking.status === "CONFIRMED" ? "text-emerald-500" : "text-yellow-500"
                    )}>{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-headline font-bold text-on-surface mb-4">Recent Payments</h2>
          {stats.recentPayments.length === 0 ? (
            <p className="text-on-surface-variant text-sm py-8 text-center">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                  <div>
                    <p className="text-on-surface text-sm font-medium">{payment.user.firstName} {payment.user.lastName}</p>
                    <p className="text-on-surface-variant text-xs">{payment.type === "WALLET_TOPUP" ? "Wallet Top-up" : "Booking Payment"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 text-sm font-medium">{formatCurrency(payment.amount)}</p>
                    <span className={cn(
                      "text-xs",
                      payment.status === "SUCCESS" ? "text-emerald-500" : "text-yellow-500"
                    )}>{payment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
