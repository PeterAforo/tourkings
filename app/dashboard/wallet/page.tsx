"use client";

import { useState, useEffect, useMemo } from "react";
import { csrfFetch } from "@/lib/fetch-csrf";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  TrendingUp,
  Calendar,
  CirclePlus,
  ArrowUpRight,
  Medal,
  Lock,
  Check,
  ArrowRight,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const SAVINGS_GOAL = 20_000;
const GOAL_IMAGE =
  "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1200&auto=format&fit=crop";

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

export default function WalletPage() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    csrfFetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setWallet(d.wallet))
      .catch(() => {});
  }, []);

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency || "GHS";

  const goalPct = useMemo(() => {
    if (SAVINGS_GOAL <= 0) return 0;
    return Math.min(100, Math.round((balance / SAVINGS_GOAL) * 1000) / 10);
  }, [balance]);

  const remaining = Math.max(0, SAVINGS_GOAL - balance);

  const monthDelta = useMemo(() => {
    const txs = wallet?.transactions;
    if (!txs?.length) return null;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let monthCredits = 0;
    let prevCredits = 0;
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    for (const tx of txs) {
      const d = new Date(tx.createdAt);
      if (tx.type !== "CREDIT") continue;
      if (d >= startOfMonth) monthCredits += tx.amount;
      else if (d >= prevStart && d <= prevEnd) prevCredits += tx.amount;
    }
    if (prevCredits <= 0 && monthCredits <= 0) return null;
    if (prevCredits <= 0) return monthCredits > 0 ? 100 : 0;
    return Math.round(((monthCredits - prevCredits) / prevCredits) * 1000) / 10;
  }, [wallet?.transactions]);

  const recent = wallet?.transactions?.slice(0, 3) ?? [];

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);
    try {
      const res = await csrfFetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), type: "WALLET_TOPUP" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Payment failed", "error");
        return;
      }
      const verifyUrl = `/dashboard/payments/verify?paymentId=${data.paymentId}`;
      if (data.completed) {
        window.location.href = verifyUrl;
        return;
      }
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }
      if (data.paymentInstruction) {
        toast(data.paymentInstruction, "info", 8000);
        window.location.href = verifyUrl;
        return;
      }
      window.location.href = verifyUrl;
    } catch (err) {
      console.error("Topup failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  const firstName = user?.firstName || "Voyager";

  return (
    <div className="space-y-10 max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">The Vault</h2>
          <p className="text-secondary font-bold uppercase tracking-widest text-xs">
            Akwaaba! Welcome back, {firstName}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            variant="outline"
            className="border-outline-variant/30"
            onClick={() => window.print()}
            type="button"
          >
            <Download size={16} className="mr-2" /> Report
          </Button>
          <Link
            href="/dashboard/contribute"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border-2 border-primary/25 text-primary font-headline font-semibold hover:bg-primary hover:text-white transition-colors text-sm"
          >
            Full checkout
          </Link>
          <Button variant="primary" onClick={() => setShowTopup(true)}>
            <Plus size={18} className="mr-2" /> Quick top-up
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden adinkra-pattern flex flex-col justify-between min-h-[240px] border border-outline-variant/15"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-secondary-fixed text-on-secondary-fixed p-3 rounded-lg">
                <Wallet size={22} className="text-on-secondary-fixed" />
              </span>
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">
                Total Balance
              </span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-primary mb-1 tabular-nums">
              {formatCurrency(balance, currency)}
            </h3>
            <p className="text-on-surface-variant text-sm font-medium">Accumulated Heritage Savings</p>
          </div>
          {monthDelta !== null && (
            <div className="mt-6 flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <TrendingUp size={16} />
              <span>
                {monthDelta >= 0 ? "+" : ""}
                {monthDelta}% vs last month
              </span>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-8 bg-surface-container-low p-6 sm:p-8 rounded-xl border border-outline-variant/15 flex flex-col md:flex-row gap-6 md:gap-8"
        >
          <div className="w-full md:w-1/3 min-h-[200px] rounded-lg overflow-hidden shadow-sm relative group">
            <Image
              src={GOAL_IMAGE}
              alt="Coastal heritage destination"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-[10px] uppercase font-bold tracking-widest text-secondary-fixed">Target tour</p>
              <p className="font-bold text-sm leading-snug">Royal Heritage Experience</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4 gap-4">
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface">Saving goal</h3>
                <p className="text-on-surface-variant text-sm">Road to your next curated journey</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-extrabold text-primary tabular-nums">{goalPct}%</p>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Completed</p>
              </div>
            </div>
            <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10">
                <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Saved so far</p>
                <p className="text-lg font-bold text-on-surface tabular-nums">{formatCurrency(balance, currency)}</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10">
                <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Remaining</p>
                <p className="text-lg font-bold text-on-surface tabular-nums">{formatCurrency(remaining, currency)}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/15"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-headline font-bold text-on-surface">Recent contributions</h3>
            <Link href="/dashboard/wallet/history" className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {!recent.length ? (
            <p className="text-on-surface-variant text-sm">No contributions yet — top up to start your vault.</p>
          ) : (
            <div className="space-y-6">
              {recent.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                        tx.type === "CREDIT" ? "bg-primary-fixed text-primary" : "bg-secondary-fixed text-secondary"
                      )}
                    >
                      {tx.type === "CREDIT" ? <CirclePlus size={22} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface truncate">
                        {tx.description || (tx.type === "CREDIT" ? "Vault contribution" : "Payment")}
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("font-bold tabular-nums", tx.type === "CREDIT" ? "text-primary" : "text-red-500")}>
                      {tx.type === "CREDIT" ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </p>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                      {tx.type === "CREDIT" ? "Credit" : "Debit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lg:col-span-5 bg-primary p-8 rounded-xl text-on-primary relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Medal className="w-28 h-28" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-headline font-bold mb-6 relative z-10">Heritage milestones</h3>
          <div className="space-y-6 relative z-10">
            <Milestone title="First contribution" subtitle="Fund your vault for the first time" achieved={balance > 0} />
            <Milestone
              title="Coastal guardian"
              subtitle={`Save ${formatCurrency(5000, currency)} toward Ghanaian tours`}
              achieved={balance >= 5000}
            />
            <Milestone
              title="Royal navigator"
              subtitle={`Reach ${formatCurrency(20000, currency)} in your vault`}
              achieved={balance >= 20000}
            />
          </div>
          <Link
            href="/dashboard/journey"
            className="mt-8 w-full py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold hover:opacity-95 transition-all flex items-center justify-center"
          >
            View heritage path
          </Link>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <QuickAction
            icon={<Plus className="text-primary" />}
            title="Top up my vault"
            subtitle="Instant one-time deposit"
            onClick={() => setShowTopup(true)}
          />
          <QuickAction
            icon={<Calendar className="text-primary" />}
            title="View bookings"
            subtitle="Tours linked to your account"
            href="/dashboard/bookings"
          />
          <QuickAction
            icon={<TrendingUp className="text-primary" />}
            title="Transaction insights"
            subtitle="Filters and spending view"
            href="/dashboard/wallet/history"
          />
        </motion.section>
      </div>

      <Modal isOpen={showTopup} onClose={() => setShowTopup(false)} title="Contribute to your vault">
        <div className="kente-pattern rounded-lg -mx-1 px-1 pt-2 pb-1 space-y-6">
          <p className="text-sm text-on-surface-variant">
            Step 1 — Choose an amount. Step 2 — You&apos;ll complete payment securely, then return here to verify.
          </p>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-3">Quick amounts ({currency})</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-medium transition-all border",
                    amount === String(a)
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant/15 hover:border-primary/50"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <Input label="Custom amount" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button variant="primary" size="lg" className="w-full heritage-gradient border-0" isLoading={isLoading} onClick={handleTopup} disabled={!amount || parseFloat(amount) <= 0}>
            Continue to payment — {amount ? formatCurrency(parseFloat(amount), currency) : formatCurrency(0, currency)}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Milestone({ title, subtitle, achieved }: { title: string; subtitle: string; achieved: boolean }) {
  return (
    <div className={cn("flex gap-4 items-start", !achieved && "opacity-55")}>
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          achieved ? "bg-secondary text-white" : "border-2 border-white/40 text-white/90"
        )}
      >
        {achieved ? <Check size={16} /> : <Lock size={16} />}
      </div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-xs text-primary-fixed/90">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "bg-surface-container-high p-6 rounded-xl text-left flex items-center gap-4 hover:bg-surface-container-highest transition-all group w-full border border-outline-variant/10";
  const inner = (
    <>
      <span className="bg-surface p-3 rounded-lg shadow-sm group-hover:scale-105 transition-transform">{icon}</span>
      <div>
        <p className="font-bold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant">{subtitle}</p>
      </div>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
