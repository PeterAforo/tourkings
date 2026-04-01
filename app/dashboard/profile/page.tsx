"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";

export default function ProfilePage() {
  const { user } = useAppStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">{user?.firstName} {user?.lastName}</h2>
              <p className="text-on-surface-variant text-sm">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              <Input label="Last Name" id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <Input label="Email" id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Phone" id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary">
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-500 text-sm">
                  Changes saved!
                </motion.span>
              )}
            </div>
          </form>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
            <Lock size={18} /> Change Password
          </h3>
          <form className="space-y-4">
            <Input label="Current Password" id="currentPassword" type="password" placeholder="••••••••" />
            <Input label="New Password" id="newPassword" type="password" placeholder="Min. 8 characters" />
            <Input label="Confirm New Password" id="confirmNewPassword" type="password" placeholder="••••••••" />
            <Button type="submit" variant="outline">Update Password</Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
