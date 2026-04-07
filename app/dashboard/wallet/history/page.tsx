"use client";

import { useEffect, useMemo, useState } from "react";
import { csrfFetch } from "@/lib/fetch-csrf";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, BarChart3, Filter, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  transactions: {
    id: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    description: string | null;
    reference: string | null;
    createdAt: string;
  }[];
}

export default function VaultHistoryPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [filter, setFilter] = useState<"all" | "CREDIT" | "DEBIT">("all");

  useEffect(() => {
    csrfFetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setWallet(d.wallet))
      .catch(() => {});
  }, []);

  const txs = wallet?.transactions ?? [];
  const currency = wallet?.currency || "GHS";

  const filtered = useMemo(() => {
    if (filter === "all") return txs;
    return txs.filter((t) => t.type === filter);
  }, [txs, filter]);

  const insights = useMemo(() => {
    let credits = 0;
    let debits = 0;
    for (const t of txs) {
      if (t.type === "CREDIT") credits += t.amount;
      else debits += t.amount;
    }
    return { credits, debits, count: txs.length };
  }, [txs]);

  return (
    <div className="space-y-8 max-w-5xl">
      <header>
        <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">Insights</p>
        <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Transaction history</h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl">
          Filter credits and debits, and review how your vault has grown over time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 border border-outline-variant/15 bg-surface-container-lowest adinkra-pattern">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 size={14} /> Total in
            </div>
            <p className="text-2xl font-headline font-bold text-emerald-600 tabular-nums">
              +{formatCurrency(insights.credits, currency)}
            </p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-6 border border-outline-variant/15 bg-surface-container-lowest">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 size={14} /> Total out
            </div>
            <p className="text-2xl font-headline font-bold text-red-500 tabular-nums">
              −{formatCurrency(insights.debits, currency)}
            </p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 border border-outline-variant/15 bg-surface-container-lowest">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
              <Wallet size={14} /> Movements
            </div>
            <p className="text-2xl font-headline font-bold text-on-surface tabular-nums">{insights.count}</p>
          </Card>
        </motion.div>
      </div>

      <Card className="p-6 border border-outline-variant/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-headline font-bold text-on-surface">All activity</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-on-surface-variant" />
            {(["all", "CREDIT", "DEBIT"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors",
                  filter === f ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                )}
              >
                {f === "all" ? "All" : f === "CREDIT" ? "Credits" : "Debits"}
              </button>
            ))}
          </div>
        </div>

        {!filtered.length ? (
          <div className="text-center py-16 text-on-surface-variant">
            <Wallet className="mx-auto mb-3 opacity-30" size={40} />
            <p>No transactions match this filter.</p>
            <Link href="/dashboard/wallet" className="text-primary font-bold text-sm mt-2 inline-block hover:underline">
              Back to The Vault
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/15">
            {filtered.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                      tx.type === "CREDIT" ? "bg-emerald-500/15" : "bg-red-500/15"
                    )}
                  >
                    {tx.type === "CREDIT" ? (
                      <ArrowDownLeft size={18} className="text-emerald-600" />
                    ) : (
                      <ArrowUpRight size={18} className="text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface truncate">
                      {tx.description || (tx.type === "CREDIT" ? "Wallet credit" : "Debit")}
                    </p>
                    <p className="text-xs text-on-surface-variant">{formatDate(tx.createdAt)}</p>
                    {tx.reference && (
                      <p className="text-[10px] text-outline truncate mt-0.5">Ref: {tx.reference}</p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "font-semibold tabular-nums shrink-0",
                    tx.type === "CREDIT" ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {tx.type === "CREDIT" ? "+" : "-"}
                  {formatCurrency(tx.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
