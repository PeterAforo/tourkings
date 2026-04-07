"use client";

import { useState, useEffect } from "react";
import { csrfFetch } from "@/lib/fetch-csrf";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Save, Landmark, Wallet, Star, User } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const { user, setUser } = useAppStore();
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [vaultCurrency, setVaultCurrency] = useState("GHS");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    csrfFetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => {
        setVaultBalance(d.wallet?.balance ?? 0);
        setVaultCurrency(d.wallet?.currency ?? "GHS");
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await csrfFetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        if (data.user) setUser(data.user);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await csrfFetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password updated successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to update password" });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setPasswordSaving(false);
    }
  };

  const heritageScore = vaultBalance !== null ? Math.min(20000, Math.round(vaultBalance * 0.6 + 4200)) : 0;
  const goalPct = vaultBalance !== null ? Math.min(100, Math.round((vaultBalance / 20000) * 1000) / 10) : 0;
  const pathStops = [
    { name: "Elmina", unlocked: true },
    { name: "Kakum", unlocked: (vaultBalance ?? 0) >= 2000 },
    { name: "Manhyia", unlocked: (vaultBalance ?? 0) >= 8000 },
    { name: "Mole", unlocked: (vaultBalance ?? 0) >= 15000 },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-0 overflow-hidden border border-outline-variant/15">
          <div className="bg-gradient-to-r from-surface-container-highest via-surface-container-high to-surface-container-highest h-28 relative" />
          <div className="px-6 sm:px-8 pb-6 -mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/15 border-4 border-surface flex items-center justify-center shadow-md shrink-0">
                  <span className="text-2xl font-bold text-primary">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="pb-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary">Voyager Profile</p>
                  <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-sm text-on-surface-variant">Royal Concierge Member</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" size="sm" onClick={() => document.getElementById("editSection")?.scrollIntoView({ behavior: "smooth" })}>
                  Edit Profile
                </Button>
                <Link href="/dashboard/journey" className="inline-flex items-center px-4 py-2 rounded-lg border border-outline-variant/30 text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">
                  View Journey
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-6 border border-outline-variant/15">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-headline font-bold text-primary">Heritage Path</h3>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Level: Navigator</span>
              </div>
              <div className="flex items-center justify-between mb-6 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-container-highest -translate-y-1/2" />
                {pathStops.map((stop, i) => (
                  <div key={stop.name} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stop.unlocked ? "bg-secondary text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>
                      {stop.unlocked ? <Landmark size={18} /> : <Lock size={16} />}
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">{stop.name}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Landmark size={16} className="text-secondary" />
                    <span className="text-sm font-bold text-on-surface">Heritage Points</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{heritageScore.toLocaleString()} points toward next tier</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={16} className="text-secondary" />
                    <span className="text-sm font-bold text-on-surface">Royal Points</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{Math.round(heritageScore * 0.7).toLocaleString()} redeemable</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Card className="p-0 overflow-hidden border border-outline-variant/15">
              <div className="bg-primary p-6 text-on-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Wallet className="w-full h-full" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed mb-1">The Royal Vault</p>
                <h3 className="text-3xl font-extrabold tabular-nums">
                  {vaultBalance !== null ? formatCurrency(vaultBalance, vaultCurrency) : "—"}
                </h3>
                {vaultBalance !== null && (
                  <>
                    <div className="mt-3 w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-container rounded-full" style={{ width: `${goalPct}%` }} />
                    </div>
                    <p className="text-xs text-primary-fixed mt-1">{goalPct}% toward savings goal</p>
                  </>
                )}
              </div>
              <div className="p-4 flex gap-3">
                <Link href="/dashboard/wallet" className="flex-1 text-center py-2.5 rounded-lg border border-outline-variant/20 text-sm font-bold text-primary hover:bg-surface-container-low transition-colors">
                  Deposit
                </Link>
                <Link href="/dashboard/wallet/history" className="flex-1 text-center py-2.5 rounded-lg border border-outline-variant/20 text-sm font-bold text-primary hover:bg-surface-container-low transition-colors">
                  Details
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div id="editSection" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 border border-outline-variant/15">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Edit Profile</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First Name" id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  <Input label="Last Name" id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <Input label="Email" id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <Input label="Phone" id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <div className="flex items-center gap-3">
                  <Button type="submit" variant="primary" isLoading={saving}>
                    <Save size={16} className="mr-2" /> Save Changes
                  </Button>
                  {message && (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={message.type === "success" ? "text-emerald-500 text-sm" : "text-red-500 text-sm"}>
                      {message.text}
                    </motion.span>
                  )}
                </div>
              </form>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <Card className="p-6 border border-outline-variant/15">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-5 flex items-center gap-2">
                <User size={18} className="text-primary" /> Identity
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email Address</p>
                  <p className="text-sm font-medium text-on-surface">{user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Contact Number</p>
                  <p className="text-sm font-medium text-on-surface">{user?.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Preferred Language</p>
                  <p className="text-sm font-medium text-on-surface">English</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
            <Card className="p-6 border border-outline-variant/15">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-5 flex items-center gap-2">
                <Lock size={18} className="text-primary" /> Vault Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-on-surface-variant" />
                    <span className="text-sm font-medium text-on-surface">Password</span>
                  </div>
                  <button type="button" onClick={() => document.getElementById("passwordSection")?.scrollIntoView({ behavior: "smooth" })} className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline">
                    Change
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <Card className="p-6 bg-secondary/10 border border-secondary/20 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <Landmark size={22} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-on-surface">Need a Concierge?</h4>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Our royal travel advisors are ready to assist with your next Ghanaian expedition.
                  </p>
                </div>
              </div>
              <Link href="/contact" className="mt-3 w-full py-2.5 bg-secondary text-white rounded-lg font-bold text-sm flex items-center justify-center hover:bg-secondary-container transition-colors">
                Contact Royal Concierge
              </Link>
            </Card>
          </motion.div>

          <motion.div id="passwordSection" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
            <Card className="p-6 border border-outline-variant/15">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                <Lock size={18} /> Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input label="Current Password" id="currentPassword" type="password" placeholder="••••••••" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                <Input label="New Password" id="newPassword" type="password" placeholder="Min. 8 characters" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
                <Input label="Confirm New Password" id="confirmNewPassword" type="password" placeholder="••••••••" value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })} required />
                <div className="flex items-center gap-3">
                  <Button type="submit" variant="outline" isLoading={passwordSaving}>Update Password</Button>
                  {passwordMessage && (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={passwordMessage.type === "success" ? "text-emerald-500 text-sm" : "text-red-500 text-sm"}>
                      {passwordMessage.text}
                    </motion.span>
                  )}
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
