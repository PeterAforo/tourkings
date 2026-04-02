"use client";

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
  description: string;
  imageUrl: string | null;
  packages: { id: string }[];
}

const fallbackImage = "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-surface mb-4">
            Our <span className="text-primary">Destinations</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            From Ghana&apos;s cultural heartlands to international paradises
          </p>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <StaggerItem key={dest.id}>
                <Link href={`/destinations/${dest.slug}`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <Image
                      src={dest.imageUrl || fallbackImage}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white/80 text-sm font-medium mb-1">{dest.country}</p>
                      <h3 className="text-2xl font-headline font-bold text-white mb-2">{dest.name}</h3>
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{dest.description}</p>
                      <span className="text-white font-medium text-sm">
                        {dest.packages.length} package{dest.packages.length !== 1 ? "s" : ""} available &rarr;
                      </span>
                    </div>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-all duration-300" />
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {!loading && destinations.length === 0 && (
          <FadeIn className="text-center py-20">
            <p className="text-on-surface-variant text-lg">No destinations available yet.</p>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
