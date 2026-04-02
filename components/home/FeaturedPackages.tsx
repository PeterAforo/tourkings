"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ChevronRight, Loader2 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
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

export default function FeaturedPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages?featured=true&limit=3")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-surface">
        <div className="flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
      </section>
    );
  }

  if (packages.length === 0) return null;

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <FadeIn>
            <div>
              <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-2 block font-headline">
                Curated Collection
              </span>
              <h2 className="font-headline text-4xl font-bold text-on-surface">
                Featured Expeditions
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link
              href="/packages"
              className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all font-headline"
            >
              View All Packages <ChevronRight size={18} />
            </Link>
          </FadeIn>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <StaggerItem key={pkg.id}>
              <Link href={`/packages/${pkg.slug}`}>
                <div className="group bg-surface-container-low rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-500">
                  <div className="h-72 relative overflow-hidden">
                    <Image
                      src={pkg.images?.[0] || "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80"}
                      alt={pkg.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={idx === 0}
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-primary uppercase">
                      {pkg.destination?.country || "Ghana"}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-headline text-xl font-bold text-on-surface mb-4">
                      {pkg.title}
                    </h3>
                    <div className="flex gap-4 mb-6">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                        <Clock size={14} />
                        {pkg.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                        <Users size={14} />
                        {pkg.groupSize <= 2 ? "Couple" : "Group"}
                      </div>
                    </div>
                    <button className="w-full py-4 border-2 border-primary/10 text-primary font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all font-headline">
                      Explore Details
                    </button>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
