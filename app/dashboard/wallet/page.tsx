"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
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

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setWallet(d.wallet))
      .catch(() => {});
  }, []);

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), type: "WALLET_TOPUP" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Payment failed");
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
        alert(data.paymentInstruction);
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/15">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-primary/15 rounded-xl flex items-center justify-center">
                <Wallet size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-on-surface-variant text-sm">Available Balance</p>
                <p className="text-3xl font-headline font-bold text-on-surface">
                  {formatCurrency(wallet?.balance || 0, wallet?.currency || "GHS")}
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={() => setShowTopup(true)} className="w-full">
              <Plus size={18} className="mr-2" /> Top Up Wallet
            </Button>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={20} className="text-secondary" />
              <h3 className="text-lg font-headline font-semibold text-on-surface">Savings Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">&bull;</span>
                Set aside a fixed amount each month towards your travel fund
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">&bull;</span>
                When your balance reaches a package price, we&apos;ll notify you!
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">&bull;</span>
                You can book any package once your savings cover the cost
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-headline font-bold text-on-surface mb-6">Transaction History</h2>
        {!wallet?.transactions?.length ? (
          <div className="text-center py-12">
            <Wallet size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
            <p className="text-on-surface-variant">No transactions yet</p>
            <p className="text-on-surface-variant/70 text-sm">Top up your wallet to start saving</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === "CREDIT" ? "bg-emerald-500/20" : "bg-red-500/20"
                  )}>
                    {tx.type === "CREDIT" ? <ArrowDownLeft size={18} className="text-emerald-500" /> : <ArrowUpRight size={18} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-on-surface text-sm font-medium">{tx.description || (tx.type === "CREDIT" ? "Wallet Top-up" : "Payment")}</p>
                    <p className="text-on-surface-variant text-xs">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <span className={cn("font-semibold", tx.type === "CREDIT" ? "text-emerald-500" : "text-red-500")}>
                  {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount, wallet.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showTopup} onClose={() => setShowTopup(false)} title="Top Up Wallet">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-3">Quick Amounts (GHS)</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium transition-all border",
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
          <Input label="Custom Amount" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button variant="primary" size="lg" className="w-full" isLoading={isLoading} onClick={handleTopup} disabled={!amount || parseFloat(amount) <= 0}>
            Pay {amount ? formatCurrency(parseFloat(amount)) : "GHS 0.00"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
