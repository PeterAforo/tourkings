"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";

interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  imageUrl: string | null;
  packages: { id: string }[];
}

const fallbackImage = "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80";

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    csrfFetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations((d.destinations || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-surface-container-low">
        <div className="flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
      </section>
    );
  }

  if (destinations.length === 0) return null;

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span className="text-secondary font-bold tracking-widest text-xs uppercase font-headline">
            Explore
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mt-3 mb-4">
            Top Destinations
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            From bustling cities to serene landscapes, explore Ghana&apos;s most captivating locations
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <StaggerItem key={dest.id}>
              <Link href={`/destinations/${dest.slug}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={dest.imageUrl || fallbackImage}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-headline font-bold text-white mb-1">
                      {dest.name}
                    </h3>
                    <p className="text-secondary-fixed text-sm font-medium">
                      {dest.packages.length} package{dest.packages.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
