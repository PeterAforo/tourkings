"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Crown, Package, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, cn } from "@/lib/utils";

const quickAmounts = [50, 100, 200, 500, 1000, 2000];

export default function ContributeCheckoutPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setLoading(true);
    try {
      const res = await csrfFetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, type: "WALLET_TOPUP" }),
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
    } catch {
      toast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to The Vault
        </Link>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center w-full max-w-2xl">
          <StepDot active done label="Review" n={1} />
          <div className="h-0.5 bg-secondary-fixed flex-1 -mt-6" />
          <StepDot active={step >= 2} done={step >= 2} label="Payment" n={2} />
          <div className={cn("h-0.5 flex-1 -mt-6", step >= 2 ? "bg-secondary-fixed" : "bg-surface-container-highest")} />
          <StepDot active={false} done={false} label="Confirm" n={3} dim />
        </div>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <header>
            <h1 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tighter text-on-surface mb-2">
              Finalize your journey
            </h1>
            <p className="text-on-surface-variant text-lg">
              Contribute to your Vault below, or pay outright for a specific package from the catalog.
            </p>
          </header>

          <div className="bg-primary-container/10 p-6 rounded-xl flex items-start gap-4 border-l-4 border-secondary">
            <Crown className="text-secondary shrink-0" size={32} />
            <div>
              <h4 className="font-headline font-bold text-primary">Royal Navigator status</h4>
              <p className="text-on-surface-variant text-sm mt-1">
                Contributions grow your heritage savings. Package bookings use the same secure flow from each tour page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-start p-6 rounded-xl border-2 border-primary bg-surface-container-lowest shadow-sm">
              <span className="bg-primary-container text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-3 uppercase tracking-tighter">
                Recommended
              </span>
              <h3 className="font-bold text-xl mb-1 font-headline">Save to The Vault</h3>
              <p className="text-on-surface-variant text-sm">Custom contribution toward your savings goal</p>
            </div>
            <Link
              href="/packages"
              className="flex flex-col items-start p-6 rounded-xl border-2 border-transparent bg-surface-container-low hover:bg-surface-container-highest transition-all"
            >
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-0.5 rounded-full mb-3 uppercase tracking-tighter">
                Book
              </span>
              <h3 className="font-bold text-xl mb-1 font-headline flex items-center gap-2 text-on-surface">
                <Package size={20} /> Pay outright
              </h3>
              <p className="text-on-surface-variant text-sm">Choose a package and pay the full amount at checkout</p>
            </Link>
          </div>

          <div className="bg-surface-container-low p-8 rounded-xl kente-pattern space-y-6">
            <h3 className="font-headline font-bold text-2xl">Contribution amount</h3>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-3">Quick amounts ({currency})</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className={cn(
                      "py-2.5 rounded-lg text-sm font-medium border transition-all",
                      amount === String(a)
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container-lowest border-outline-variant/15 hover:border-primary/40"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Custom amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              variant="primary"
              size="lg"
              className="w-full heritage-gradient border-0"
              disabled={!amount || parseFloat(amount) <= 0}
              onClick={() => {
                setStep(2);
                csrfFetch("/api/wallet")
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.wallet?.currency) setCurrency(d.wallet.currency);
                  })
                  .catch(() => {});
              }}
            >
              Continue to payment
            </Button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Edit amount
          </button>
          <header>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-2">Secure payment</h1>
            <p className="text-on-surface-variant">
              You&apos;ll complete payment with our provider (e.g. Paystack). Card data is handled only by the gateway.
            </p>
          </header>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Vault top-up</span>
              <span className="text-2xl font-headline font-bold text-primary tabular-nums">
                {formatCurrency(parseFloat(amount) || 0, currency)}
              </span>
            </div>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-secondary" /> Encrypted redirect to payment gateway
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-secondary" /> Return to verification to confirm balance update
              </li>
            </ul>
            <Button
              variant="primary"
              size="lg"
              className="w-full heritage-gradient border-0 gap-2"
              isLoading={loading}
              onClick={pay}
            >
              <CreditCard size={18} />
              Continue to secure payment
            </Button>
          </div>

          <p className="text-xs text-center text-outline">
            After payment, step 3 (Confirm) completes on the verification screen when you return from the gateway.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function StepDot({
  n,
  label,
  active,
  done,
  dim,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex flex-col items-center flex-1">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 text-sm shadow-lg",
          dim && "opacity-40",
          done ? "bg-secondary text-on-secondary ring-4 ring-secondary-fixed" : active ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
        )}
      >
        {n}
      </div>
      <span className={cn("text-xs font-bold uppercase tracking-widest", dim ? "text-outline" : "text-secondary")}>
        {label}
      </span>
    </div>
  );
}
