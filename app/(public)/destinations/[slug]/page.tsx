"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Users } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

const destinationData: Record<string, {
  name: string; country: string; description: string; image: string;
  packages: { title: string; slug: string; price: number; duration: string; groupSize: number; image: string }[];
}> = {
  accra: {
    name: "Accra", country: "Ghana",
    description: "Accra, the vibrant capital of Ghana, is a city that pulsates with energy. From the historic Jamestown lighthouse to the modern Oxford Street, Accra offers a fascinating blend of old and new. Explore art galleries, enjoy world-class dining, visit the Kwame Nkrumah Memorial, and experience the city's legendary nightlife.",
    image: "https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=1200&q=80",
    packages: [
      { title: "Accra City Experience", slug: "accra-city-experience", price: 800, duration: "2 Days", groupSize: 15, image: "https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=600&q=80" },
    ],
  },
  "cape-coast": {
    name: "Cape Coast", country: "Ghana",
    description: "Cape Coast is a city steeped in history and natural beauty. Home to the famous Cape Coast Castle and the lush Kakum National Park, it offers a profound journey through Ghana's past alongside thrilling natural adventures.",
    image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&q=80",
    packages: [
      { title: "Cape Coast Heritage Tour", slug: "cape-coast-heritage-tour", price: 1500, duration: "3 Days", groupSize: 12, image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80" },
    ],
  },
};

export default function DestinationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const dest = destinationData[slug];

  if (!dest) {
    return (
      <div className="pt-32 pb-16 text-center min-h-screen">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-4">Destination Not Found</h1>
        <Link href="/destinations"><Button variant="primary">Browse Destinations</Button></Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Link href="/destinations" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8">
            <ArrowLeft size={18} /> Back to destinations
          </Link>
        </FadeIn>

        <FadeIn>
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10">
            <Image src={dest.image} alt={dest.name} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white/80 text-sm font-medium mb-2">{dest.country}</p>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-white">{dest.name}</h1>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-3xl mb-16">{dest.description}</p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-8">
            Available Packages in {dest.name}
          </h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dest.packages.map((pkg) => (
            <StaggerItem key={pkg.slug}>
              <Link href={`/packages/${pkg.slug}`}>
                <Card hover className="group h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={pkg.image} alt={pkg.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-sm font-bold">
                      {formatCurrency(pkg.price)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-headline font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">{pkg.title}</h3>
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
      </div>
    </div>
  );
}
