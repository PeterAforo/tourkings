"use client";

import { useState, useEffect } from "react";
import { Users, Search, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  wallet: { balance: number; currency: string } | null;
  _count: { bookings: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch(() => {});
  }, []);

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
        <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Customer</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Email</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Wallet Balance</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Bookings</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{c.firstName[0]}{c.lastName[0]}</span>
                      </div>
                      <span className="text-on-surface font-medium">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{c.email}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Wallet size={14} /> {formatCurrency(c.wallet?.balance || 0, c.wallet?.currency || "GHS")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{c._count.bookings}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-on-surface-variant text-sm text-center py-12">No customers found</p>}
        </div>
      </Card>
    </div>
  );
}
