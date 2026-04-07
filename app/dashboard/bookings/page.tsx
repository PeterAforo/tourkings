"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface Booking {
  id: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  travelers: number;
  travelDate: string | null;
  notes: string | null;
  createdAt: string;
  package: { title: string; duration: string; images: string[]; destination: { name: string; country: string } };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    csrfFetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .catch(() => {});
  }, []);

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-emerald-500/20 text-emerald-600",
    PENDING: "bg-yellow-500/20 text-yellow-600",
    COMPLETED: "bg-blue-500/20 text-blue-600",
    CANCELLED: "bg-red-500/20 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === status ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest/80"
            )}
          >
            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">No Bookings Yet</h3>
          <p className="text-on-surface-variant mb-6">Start exploring our amazing tour packages!</p>
          <a href="/packages"><Button variant="primary">Browse Packages</Button></a>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-headline font-bold text-on-surface">{booking.package.title}</h3>
                      <span className={cn("px-3 py-0.5 rounded-full text-xs font-medium", statusColors[booking.status])}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {booking.package.destination.name}, {booking.package.destination.country}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {booking.package.duration}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {booking.travelers} traveler(s)</span>
                      {booking.travelDate && <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(booking.travelDate)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold text-primary">{formatCurrency(booking.totalAmount)}</p>
                    <p className="text-on-surface-variant text-sm">Paid: {formatCurrency(booking.paidAmount)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
