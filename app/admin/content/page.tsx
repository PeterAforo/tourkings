"use client";

import { useState } from "react";
import { Save, FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminContentPage() {
  const [content, setContent] = useState({
    heroTitle: "Discover the Magic of Africa",
    heroSubtitle: "Experience extraordinary adventures with customized tour packages across Ghana and beyond.",
    aboutTitle: "Crafting Unforgettable Journeys Since 2015",
    aboutText: "TourKings was born from a simple dream: to share the beauty and richness of Ghana with the world.",
    contactEmail: "info@tourkings.com",
    contactPhone: "+233 20 123 4567",
    contactAddress: "15 Independence Ave, Accra, Ghana",
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
          <FileText size={20} className="text-primary" /> Hero Section
        </h2>
        <div className="space-y-4">
          <Input label="Hero Title" value={content.heroTitle} onChange={(e) => setContent({ ...content, heroTitle: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Hero Subtitle</label>
            <textarea rows={3} value={content.heroSubtitle} onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <FileText size={20} className="text-primary" /> About Section
        </h2>
        <div className="space-y-4">
          <Input label="About Title" value={content.aboutTitle} onChange={(e) => setContent({ ...content, aboutTitle: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">About Text</label>
            <textarea rows={4} value={content.aboutText} onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Contact Info
        </h2>
        <div className="space-y-4">
          <Input label="Email" value={content.contactEmail} onChange={(e) => setContent({ ...content, contactEmail: e.target.value })} />
          <Input label="Phone" value={content.contactPhone} onChange={(e) => setContent({ ...content, contactPhone: e.target.value })} />
          <Input label="Address" value={content.contactAddress} onChange={(e) => setContent({ ...content, contactAddress: e.target.value })} />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button variant="primary" size="lg" onClick={handleSave}>
          <Save size={18} className="mr-2" /> Save All Changes
        </Button>
        {saved && <span className="text-emerald-500 text-sm">All changes saved!</span>}
      </div>
    </div>
  );
}
