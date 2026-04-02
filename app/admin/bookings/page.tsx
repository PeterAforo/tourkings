"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface BookingItem {
  id: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  travelers: number;
  travelDate: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  package: { title: string; destination: { name: string } };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .catch(() => {});
  }, []);

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-emerald-500/20 text-emerald-600",
    PENDING: "bg-yellow-500/20 text-yellow-600",
    COMPLETED: "bg-blue-500/20 text-blue-600",
    CANCELLED: "bg-red-500/20 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <a
          href="/api/admin/export/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80 border border-outline-variant/15"
        >
          <Download size={18} />
          Export CSV
        </a>
      </div>
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === s ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest/80")}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Customer</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Package</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Amount</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Status</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Date</th>
                <th className="text-right py-4 px-6 text-on-surface-variant font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-on-surface font-medium">{b.user.firstName} {b.user.lastName}</p>
                    <p className="text-on-surface-variant text-xs">{b.user.email}</p>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{b.package.title}</td>
                  <td className="py-4 px-6">
                    <p className="text-primary font-medium">{formatCurrency(b.totalAmount)}</p>
                    <p className="text-on-surface-variant text-xs">Paid: {formatCurrency(b.paidAmount)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusColors[b.status])}>{b.status}</span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{formatDate(b.createdAt)}</td>
                  <td className="py-4 px-6 text-right">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="bg-surface-container-low border border-outline-variant/15 rounded-lg px-2 py-1 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-on-surface-variant text-sm text-center py-12">No bookings found</p>}
        </div>
      </Card>
    </div>
  );
}
