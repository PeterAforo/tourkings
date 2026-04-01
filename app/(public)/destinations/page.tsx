"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";

const destinations = [
  { name: "Accra", slug: "accra", country: "Ghana", description: "The vibrant capital city blending modern energy with rich traditions.", image: "https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=600&q=80", packages: 8 },
  { name: "Cape Coast", slug: "cape-coast", country: "Ghana", description: "Historic coastal city home to UNESCO World Heritage castles.", image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80", packages: 5 },
  { name: "Kumasi", slug: "kumasi", country: "Ghana", description: "Heart of the Ashanti Kingdom with rich cultural heritage.", image: "https://images.unsplash.com/photo-1504736038806-94bd1115084e?w=600&q=80", packages: 4 },
  { name: "Volta Region", slug: "volta-region", country: "Ghana", description: "Breathtaking waterfalls, mountains, and lush tropical landscapes.", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80", packages: 6 },
  { name: "Northern Region", slug: "northern-region", country: "Ghana", description: "Home to Mole National Park and ancient Islamic architecture.", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80", packages: 3 },
  { name: "Dubai", slug: "dubai", country: "UAE", description: "The city of gold offering ultimate luxury and modern marvels.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", packages: 2 },
];

export default function DestinationsPage() {
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

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <StaggerItem key={dest.slug}>
              <Link href={`/destinations/${dest.slug}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <Image src={dest.image} alt={dest.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white/80 text-sm font-medium mb-1">{dest.country}</p>
                    <h3 className="text-2xl font-headline font-bold text-white mb-2">{dest.name}</h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{dest.description}</p>
                    <span className="text-white font-medium text-sm">{dest.packages} packages available &rarr;</span>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-all duration-300" />
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
