"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Medal, Loader2, Save, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  DEFAULT_HERITAGE_CONFIG,
  parseHeritageConfig,
  type HeritageConfig,
  type HeritageMedalConfig,
} from "@/lib/heritage-config";

export default function AdminHeritagePage() {
  const [config, setConfig] = useState<HeritageConfig>({
    ...DEFAULT_HERITAGE_CONFIG,
    medals: DEFAULT_HERITAGE_CONFIG.medals.map((m) => ({ ...m })),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await csrfFetch("/api/admin/settings");
      if (!res.ok) throw new Error("load");
      const data = await res.json();
      const raw = data.settings?.heritageConfig;
      setConfig(parseHeritageConfig(raw));
    } catch {
      setConfig({
        ...DEFAULT_HERITAGE_CONFIG,
        medals: DEFAULT_HERITAGE_CONFIG.medals.map((m) => ({ ...m })),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await csrfFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heritageConfig: config }),
      });
      if (!res.ok) throw new Error("save");
      setMessage("Heritage logic saved.");
    } catch {
      setMessage("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateMedal = (index: number, patch: Partial<HeritageMedalConfig>) => {
    setConfig((prev) => ({
      ...prev,
      medals: prev.medals.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-on-surface-variant py-24">
        <Loader2 className="animate-spin" size={24} /> Loading heritage configuration…
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-10 pb-12">
      <header>
        <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">Heritage Path configuration</p>
        <h1 className="text-2xl font-headline font-bold text-on-surface">Point logic &amp; medals</h1>
        <p className="text-on-surface-variant text-sm mt-2 max-w-2xl">
          Tune scoring multipliers and milestone copy. Values are stored in site settings and can power journey and marketing
          features.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5">
          <Card className="p-8 border border-outline-variant/15 relative overflow-hidden">
            <Calculator className="absolute -right-4 -top-4 opacity-5 w-40 h-40 text-primary rotate-12 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">System engine</span>
                <h2 className="text-2xl font-bold text-primary mt-2 font-headline">Point multipliers</h2>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Points per GHS saved</label>
                <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg border-b-2 border-primary mt-2">
                  <input
                    type="number"
                    className="border-none bg-transparent text-xl font-bold focus:ring-0 w-full text-on-surface"
                    value={config.pointsPerGhsSaved}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, pointsPerGhsSaved: parseFloat(e.target.value) || 0 }))
                    }
                  />
                  <span className="text-sm font-semibold text-outline">PTS</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Points per tour completion
                </label>
                <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg border-b-2 border-primary mt-2">
                  <input
                    type="number"
                    className="border-none bg-transparent text-xl font-bold focus:ring-0 w-full text-on-surface"
                    value={config.pointsPerTourCompletion}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, pointsPerTourCompletion: parseFloat(e.target.value) || 0 }))
                    }
                  />
                  <span className="text-sm font-semibold text-outline">PTS</span>
                </div>
              </div>
              <Button variant="primary" className="w-full" onClick={save} isLoading={saving}>
                <Save size={16} className="mr-2" /> Update global multipliers
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-7">
          <Card className="p-8 border border-outline-variant/10 bg-surface-container-lowest">
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Medal preview</span>
            </div>
            <h3 className="font-bold text-primary mb-6 font-headline">Visual identity (light)</h3>
            <div className="flex gap-8 justify-center flex-wrap">
              {config.medals.slice(0, 3).map((m) => (
                <div key={m.id} className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center border-4 border-white shadow-xl">
                    <Medal className="text-secondary w-9 h-9" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">{m.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-secondary mb-4">
          <Medal size={18} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Milestone rewards</span>
        </div>
        <h2 className="text-2xl font-headline font-bold text-primary mb-8">Medal configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.medals.map((medal, index) => (
            <Card key={medal.id} className="p-6 border-l-4 border-secondary bg-surface-container">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center">
                  <Medal className="text-secondary w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded text-primary">{medal.tier}</span>
              </div>
              <Input
                label="Name"
                value={medal.name}
                onChange={(e) => updateMedal(index, { name: e.target.value })}
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Requirement</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm text-on-surface"
                  value={medal.requirement}
                  onChange={(e) => updateMedal(index, { requirement: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input
                  label="XP yield"
                  value={medal.xpYield}
                  onChange={(e) => updateMedal(index, { xpYield: e.target.value })}
                />
                <Input
                  label="Icon key"
                  value={medal.iconKey}
                  onChange={(e) => updateMedal(index, { iconKey: e.target.value })}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="primary" size="lg" onClick={save} isLoading={saving}>
          <Save size={18} className="mr-2" /> Save heritage configuration
        </Button>
        {message && <span className="text-sm text-on-surface-variant">{message}</span>}
      </div>
    </div>
  );
}
