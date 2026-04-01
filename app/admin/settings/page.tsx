"use client";

import { useState } from "react";
import { Settings, Mail, Globe, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "TourKings",
    tagline: "Ghana's Premier Tour Company",
    currency: "GHS",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    flutterwavePublicKey: "",
    flutterwaveSecretKey: "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Globe size={20} className="text-primary" /> General Settings
        </h2>
        <div className="space-y-4">
          <Input label="Company Name" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
          <Input label="Tagline" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
          <Input label="Default Currency" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Mail size={20} className="text-primary" /> Email Settings (SMTP)
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="SMTP Host" value={settings.smtpHost} onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} />
            <Input label="SMTP Port" value={settings.smtpPort} onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })} />
          </div>
          <Input label="SMTP Username" value={settings.smtpUser} onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })} />
          <Input label="SMTP Password" type="password" value={settings.smtpPass} onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <Settings size={20} className="text-primary" /> Payment Gateway
        </h2>
        <div className="space-y-4">
          <Input label="Flutterwave Public Key" value={settings.flutterwavePublicKey} onChange={(e) => setSettings({ ...settings, flutterwavePublicKey: e.target.value })} />
          <Input label="Flutterwave Secret Key" type="password" value={settings.flutterwaveSecretKey} onChange={(e) => setSettings({ ...settings, flutterwaveSecretKey: e.target.value })} />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button variant="primary" size="lg" onClick={handleSave}>
          <Save size={18} className="mr-2" /> Save Settings
        </Button>
        {saved && <span className="text-emerald-500 text-sm">Settings saved!</span>}
      </div>
    </div>
  );
}
