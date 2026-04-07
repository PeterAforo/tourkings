"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useEffect, useState, useCallback } from "react";
import { Wallet, Users, Loader2, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  wallet: { balance: number; currency: string } | null;
  _count: { bookings: number };
}

export default function AdminVaultPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrfFetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRows(data.customers || []);
    } catch {
      setError("Could not load customer wallets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = rows.reduce((acc, r) => acc + (r.wallet?.balance ?? 0), 0);

  const sampleCurrency = rows.find((r) => r.wallet?.currency)?.wallet?.currency || "GHS";

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">CMS Vault Manager</p>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Customer vault overview</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
            Read-only balances from connected wallets. Use Payments and Customers for full account actions.
          </p>
        </div>
        <Button variant="outline" type="button" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border border-outline-variant/15 bg-surface-container-lowest adinkra-pattern">
          <div className="flex items-center gap-3 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet size={16} /> Aggregate balance
          </div>
          <p className="text-3xl font-headline font-bold text-primary tabular-nums">{formatCurrency(totals, sampleCurrency)}</p>
        </Card>
        <Card className="p-6 border border-outline-variant/15">
          <div className="flex items-center gap-3 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
            <Users size={16} /> Customers with wallet
          </div>
          <p className="text-3xl font-headline font-bold text-on-surface tabular-nums">{rows.length}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border border-outline-variant/15">
        <div className="px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/80">
          <h3 className="font-headline font-semibold text-on-surface">Wallets</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading…
          </div>
        ) : error ? (
          <p className="p-6 text-red-500 text-sm">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15 text-left text-on-surface-variant">
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold text-right">Balance</th>
                  <th className="px-6 py-3 font-semibold text-right">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                    <td className="px-6 py-3 text-on-surface font-medium">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-6 py-3 text-on-surface-variant">{r.email}</td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums text-primary">
                      {formatCurrency(r.wallet?.balance ?? 0, r.wallet?.currency || sampleCurrency)}
                    </td>
                    <td className="px-6 py-3 text-right text-on-surface-variant">{r._count.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
