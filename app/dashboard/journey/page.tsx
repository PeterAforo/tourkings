"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, TrendingUp, BookOpen, Landmark, Trees, Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export default function HeritageJourneyPage() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("GHS");

  useEffect(() => {
    csrfFetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => {
        setBalance(d.wallet?.balance ?? 0);
        setCurrency(d.wallet?.currency ?? "GHS");
      })
      .catch(() => {});
  }, []);

  const heritageScore = Math.min(20000, Math.round(balance * 0.6 + 4200));

  const milestones = [
    { title: "Joined TourKings", subtitle: "Your royal journey begins", done: true },
    { title: "First vault contribution", subtitle: "Started saving for heritage travel", done: balance > 0 },
    { title: "Explorer badge", subtitle: "Complete a booking when you are ready", done: false },
  ];

  return (
    <div className="space-y-12 max-w-6xl adinkra-pattern rounded-xl">
      <header className="mb-4">
        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Personal cultural legacy</span>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">Your Heritage Path</h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          A visual chronicle of your exploration through Ghana and beyond. Every contribution deepens your connection to curated journeys.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 relative overflow-hidden border border-outline-variant/15 shadow-[0_20px_40px_rgba(31,27,24,0.06)]">
            <Star className="absolute -right-4 -top-4 opacity-5 w-32 h-32 text-primary" />
            <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-2">Heritage score</p>
            <h3 className="text-4xl font-headline font-black text-primary tabular-nums">{heritageScore.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-secondary font-bold text-sm">
              <TrendingUp size={16} />
              <span>Linked to your vault activity</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-8 border border-outline-variant/15">
            <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-2">Current rank</p>
            <h3 className="text-2xl font-headline font-bold text-on-surface">Royal Chronicler</h3>
            <div className="mt-6">
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full royal-gradient rounded-full transition-all"
                  style={{ width: `${Math.min(100, (balance / 20000) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Vault progress: {formatCurrency(balance, currency)} toward {formatCurrency(20000, currency)}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8 border border-outline-variant/15">
            <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-6">Path badges</p>
            <div className="flex gap-4 flex-wrap">
              <Badge icon={<BookOpen size={22} />} unlocked />
              <Badge icon={<Landmark size={22} />} unlocked={balance >= 2000} />
              <Badge icon={<Trees size={22} />} unlocked={balance >= 8000} />
              <Badge icon={<Lock size={22} />} unlocked={false} />
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-surface-container-highest hidden md:block rounded-full" />
        <h2 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
          <span className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center md:ml-0">
            <Landmark size={22} />
          </span>
          Journey timeline
        </h2>
        <ul className="space-y-8 md:pl-20">
          {milestones.map((m, i) => (
            <motion.li
              key={m.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="relative md:pl-8"
            >
              <span
                className={`hidden md:flex absolute left-[-1.75rem] top-1.5 w-4 h-4 rounded-full border-2 ${
                  m.done ? "bg-secondary border-secondary" : "bg-surface border-outline-variant"
                }`}
              />
              <h3 className="font-bold text-on-surface">{m.title}</h3>
              <p className="text-sm text-on-surface-variant">{m.subtitle}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg heritage-gradient text-on-primary font-bold shadow-lg"
        >
          Grow your vault
        </Link>
        <Link href="/dashboard/profile" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-outline-variant/30 font-bold text-primary hover:bg-surface-container-high">
          Profile & preferences
        </Link>
      </div>
    </div>
  );
}

function Badge({ icon, unlocked }: { icon: React.ReactNode; unlocked: boolean }) {
  return (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
        unlocked ? "bg-secondary-container/25 text-secondary" : "bg-surface-container-highest text-on-surface-variant opacity-40"
      }`}
    >
      {icon}
    </div>
  );
}
