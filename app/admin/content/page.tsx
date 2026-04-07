"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useEffect, useState, useCallback } from "react";
import { Save, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ContentFields {
  hero: { title: string; subtitle: string; cta_text: string };
  about: { title: string; description: string };
  contact: { email: string; phone: string; address: string };
}

const DEFAULTS: ContentFields = {
  hero: { title: "", subtitle: "", cta_text: "" },
  about: { title: "", description: "" },
  contact: { email: "", phone: "", address: "" },
};

type Status = { type: "success" | "error"; message: string } | null;

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentFields>(DEFAULTS);
  const [initial, setInitial] = useState<ContentFields>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await csrfFetch("/api/admin/content");
      if (!res.ok) throw new Error("Failed to load content");
      const { content: data } = await res.json();

      const merged: ContentFields = {
        hero: { ...DEFAULTS.hero, ...data?.hero },
        about: { ...DEFAULTS.about, ...data?.about },
        contact: { ...DEFAULTS.contact, ...data?.contact },
      };
      setContent(merged);
      setInitial(merged);
    } catch {
      setStatus({ type: "error", message: "Failed to load content from server." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const update = <S extends keyof ContentFields>(
    section: S,
    key: keyof ContentFields[S],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const changes: { section: string; key: string; value: string }[] = [];

      for (const section of ["hero", "about", "contact"] as const) {
        const sectionData = content[section];
        const initialData = initial[section];
        for (const key of Object.keys(sectionData) as (keyof typeof sectionData)[]) {
          if (sectionData[key] !== initialData[key]) {
            changes.push({ section, key: key as string, value: sectionData[key] });
          }
        }
      }

      if (changes.length === 0) {
        setStatus({ type: "success", message: "No changes to save." });
        setSaving(false);
        return;
      }

      const results = await Promise.all(
        changes.map((body) =>
          csrfFetch("/api/admin/content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        )
      );

      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) throw new Error(`${failed.length} update(s) failed`);

      setInitial(content);
      setStatus({ type: "success", message: "All changes saved successfully!" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-on-surface-variant">Loading content…</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-xl border border-outline-variant/15 bg-gradient-to-r from-primary/10 via-surface to-secondary-fixed/10 p-6 sm:p-8 adventure-tile relative overflow-hidden">
        <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-2">Site management</p>
        <h2 className="text-xl font-headline font-bold text-on-surface">Public content &amp; messaging</h2>
        <p className="text-on-surface-variant text-sm mt-2 max-w-xl">
          Update hero copy, about text, and contact details shown on the marketing site. Changes save to the database per field.
        </p>
      </div>

      {/* Hero Section */}
      <Card className="p-6 border border-outline-variant/15">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Hero Section
        </h2>
        <div className="space-y-4">
          <Input
            label="Hero Title"
            value={content.hero.title}
            onChange={(e) => update("hero", "title", e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Hero Subtitle
            </label>
            <textarea
              rows={3}
              value={content.hero.subtitle}
              onChange={(e) => update("hero", "subtitle", e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <Input
            label="CTA Text"
            value={content.hero.cta_text}
            onChange={(e) => update("hero", "cta_text", e.target.value)}
          />
        </div>
      </Card>

      {/* About Section */}
      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <FileText size={20} className="text-primary" /> About Section
        </h2>
        <div className="space-y-4">
          <Input
            label="About Title"
            value={content.about.title}
            onChange={(e) => update("about", "title", e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              About Description
            </label>
            <textarea
              rows={4}
              value={content.about.description}
              onChange={(e) => update("about", "description", e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Contact Info
        </h2>
        <div className="space-y-4">
          <Input
            label="Email"
            value={content.contact.email}
            onChange={(e) => update("contact", "email", e.target.value)}
          />
          <Input
            label="Phone"
            value={content.contact.phone}
            onChange={(e) => update("contact", "phone", e.target.value)}
          />
          <Input
            label="Address"
            value={content.contact.address}
            onChange={(e) => update("contact", "address", e.target.value)}
          />
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button variant="primary" size="lg" onClick={handleSave} isLoading={saving}>
          <Save size={18} className="mr-2" /> Save All Changes
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
