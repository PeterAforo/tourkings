"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, Mail, Globe, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SettingsFields {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  flwPublicKey: string;
  flwSecretKey: string;
  flwWebhookSecret: string;
}

const DEFAULTS: SettingsFields = {
  siteName: "",
  siteDescription: "",
  contactEmail: "",
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  flwPublicKey: "",
  flwSecretKey: "",
  flwWebhookSecret: "",
};

type Status = { type: "success" | "error"; message: string } | null;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsFields>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const { settings: data } = await res.json();

      setSettings({ ...DEFAULTS, ...data });
    } catch {
      setStatus({ type: "error", message: "Failed to load settings from server." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const set = (key: keyof SettingsFields, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to save settings");
      }

      setStatus({ type: "success", message: "Settings saved successfully!" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-on-surface-variant">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* General */}
      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Globe size={20} className="text-primary" /> General Settings
        </h2>
        <div className="space-y-4">
          <Input
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => set("siteName", e.target.value)}
          />
          <Input
            label="Site Description"
            value={settings.siteDescription}
            onChange={(e) => set("siteDescription", e.target.value)}
          />
          <Input
            label="Contact Email"
            type="email"
            value={settings.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </div>
      </Card>

      {/* SMTP */}
      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Mail size={20} className="text-primary" /> Email Settings (SMTP)
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              value={settings.smtpHost}
              onChange={(e) => set("smtpHost", e.target.value)}
            />
            <Input
              label="SMTP Port"
              value={settings.smtpPort}
              onChange={(e) => set("smtpPort", e.target.value)}
            />
          </div>
          <Input
            label="SMTP Username"
            value={settings.smtpUser}
            onChange={(e) => set("smtpUser", e.target.value)}
          />
          <Input
            label="SMTP Password"
            type="password"
            value={settings.smtpPass}
            onChange={(e) => set("smtpPass", e.target.value)}
          />
        </div>
      </Card>

      {/* Flutterwave */}
      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Settings size={20} className="text-primary" /> Payment Gateway (Flutterwave)
        </h2>
        <div className="space-y-4">
          <Input
            label="Public Key"
            value={settings.flwPublicKey}
            onChange={(e) => set("flwPublicKey", e.target.value)}
          />
          <Input
            label="Secret Key"
            type="password"
            value={settings.flwSecretKey}
            onChange={(e) => set("flwSecretKey", e.target.value)}
          />
          <Input
            label="Webhook Secret"
            type="password"
            value={settings.flwWebhookSecret}
            onChange={(e) => set("flwWebhookSecret", e.target.value)}
          />
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button variant="primary" size="lg" onClick={handleSave} isLoading={saving}>
          <Save size={18} className="mr-2" /> Save Settings
        </Button>

        {status && (
          <span
            className={`inline-flex items-center gap-1.5 text-sm ${
              status.type === "success" ? "text-emerald-500" : "text-red-400"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {status.message}
          </span>
        )}
      </div>
    </div>
  );
}
