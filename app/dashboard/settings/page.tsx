"use client";

import { useState } from "react";
import { Bell, Globe, Shield } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [walletAlerts, setWalletAlerts] = useState(true);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-headline font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your account preferences</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={20} className="text-primary" />
          <h2 className="text-lg font-headline font-bold text-on-surface">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Email Notifications", desc: "Receive updates about your bookings", state: emailNotifications, setter: setEmailNotifications },
            { label: "Wallet Alerts", desc: "Get notified when your savings reach a package price", state: walletAlerts, setter: setWalletAlerts },
            { label: "Booking Updates", desc: "Receive status updates for your bookings", state: bookingUpdates, setter: setBookingUpdates },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div>
                <p className="text-on-surface font-medium">{item.label}</p>
                <p className="text-on-surface-variant text-sm">{item.desc}</p>
              </div>
              <button
                onClick={() => item.setter(!item.state)}
                className={`relative w-12 h-6 rounded-full transition-colors ${item.state ? "bg-primary" : "bg-outline-variant"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${item.state ? "translate-x-6" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe size={20} className="text-primary" />
          <h2 className="text-lg font-headline font-bold text-on-surface">Preferences</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-lg">
            <label className="block text-sm font-medium text-on-surface mb-1.5">Preferred Currency</label>
            <select className="w-full px-4 py-2.5 bg-surface border border-outline-variant/15 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="GHS">GHS - Ghana Cedis</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} className="text-primary" />
          <h2 className="text-lg font-headline font-bold text-on-surface">Privacy</h2>
        </div>
        <div className="space-y-4">
          <p className="text-on-surface-variant text-sm">
            Your data is protected and only used to improve your experience with TourKings.
            For more information, please read our privacy policy.
          </p>
          <Button variant="outline" size="sm">Download My Data</Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
