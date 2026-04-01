"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setUser(data.user);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <span className="text-3xl font-headline font-bold text-primary">Tour</span>
          <span className="text-3xl font-headline font-bold text-on-surface">Kings</span>
        </Link>
        <h1 className="text-2xl font-headline font-bold text-on-surface">Create Account</h1>
        <p className="text-on-surface-variant text-sm mt-1">Start your journey with TourKings</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" id="firstName" placeholder="Kofi" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
            <Input label="Last Name" id="lastName" placeholder="Mensah" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
          </div>
          <Input label="Email" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Phone (optional)" id="phone" type="tel" placeholder="+233 20 123 4567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="Password" id="password" type="password" placeholder="Min. 8 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <Input label="Confirm Password" id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">Create Account</Button>
        </form>
      </Card>

      <p className="text-center text-on-surface-variant text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-container font-medium">Sign in</Link>
      </p>
    </motion.div>
  );
}
