"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setUser(data.user);
      router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
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
        <h1 className="text-2xl font-headline font-bold text-on-surface">Welcome Back</h1>
        <p className="text-on-surface-variant text-sm mt-1">Sign in to your account</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">{error}</div>
          )}
          <Input label="Email" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Password" id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">Sign In</Button>
        </form>
      </Card>

      <p className="text-center text-on-surface-variant text-sm mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:text-primary-container font-medium">Create one</Link>
      </p>
    </motion.div>
  );
}
