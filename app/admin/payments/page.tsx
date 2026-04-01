"use client";

import { useState, useEffect } from "react";
import { CreditCard, Search } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  providerRef: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .catch(() => {});
  }, []);

  const filtered = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "SUCCESS", "FAILED"].map((s) => (
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
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Type</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Amount</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Status</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Reference</th>
                <th className="text-left py-4 px-6 text-on-surface-variant font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-on-surface font-medium">{p.user.firstName} {p.user.lastName}</p>
                    <p className="text-on-surface-variant text-xs">{p.user.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium",
                      p.type === "WALLET_TOPUP" ? "bg-blue-500/20 text-blue-600" : "bg-primary/10 text-primary")}>
                      {p.type === "WALLET_TOPUP" ? "Wallet" : "Booking"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-emerald-600 font-medium">{formatCurrency(p.amount, p.currency)}</td>
                  <td className="py-4 px-6">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium",
                      p.status === "SUCCESS" ? "bg-emerald-500/20 text-emerald-600" : p.status === "PENDING" ? "bg-yellow-500/20 text-yellow-600" : "bg-red-500/20 text-red-600")}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant text-xs font-mono">{p.providerRef || "\u2014"}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-on-surface-variant text-sm text-center py-12">No payments found</p>}
        </div>
      </Card>
    </div>
  );
}
