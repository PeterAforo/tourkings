"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, MapPin, Search, Loader2 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  groupSize: number;
  images: string[];
  destination: { name: string; country: string };
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filtered, setFiltered] = useState<Package[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.packages || []);
        setFiltered(d.packages || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(packages);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      packages.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.destination?.name?.toLowerCase().includes(q) ||
          p.destination?.country?.toLowerCase().includes(q)
      )
    );
  }, [search, packages]);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-surface mb-4">
            Tour <span className="text-primary">Packages</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Choose from our curated selection of tours across Ghana and beyond
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            <input
              type="text"
              placeholder="Search packages or destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/15 rounded-xl text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((pkg) => (
              <StaggerItem key={pkg.id}>
                <Link href={`/packages/${pkg.slug}`}>
                  <Card hover className="group h-full">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={pkg.images?.[0] || "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80"}
                        alt={pkg.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-sm font-bold">
                        {formatCurrency(pkg.price, pkg.currency)}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-primary text-sm mb-2">
                        <MapPin size={14} />
                        <span>{pkg.destination?.name}, {pkg.destination?.country}</span>
                      </div>
                      <h3 className="text-xl font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {pkg.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{pkg.description}</p>
                      <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                        <span className="flex items-center gap-1"><Clock size={14} /> {pkg.duration}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> Up to {pkg.groupSize}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {!loading && filtered.length === 0 && (
          <FadeIn className="text-center py-20">
            <p className="text-on-surface-variant text-lg">No packages found matching your search.</p>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
