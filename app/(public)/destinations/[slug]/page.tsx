"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Users, Loader2 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface Package {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  duration: string;
  groupSize: number;
  images: string[];
  destination: { name: string; country: string };
}

interface DestinationData {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string | null;
  packages: Package[];
}

const fallbackImage = "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80";

export default function DestinationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [dest, setDest] = useState<DestinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => setDest(d.destination))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (notFound || !dest) {
    return (
      <div className="pt-32 pb-16 text-center min-h-screen">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-4">Destination Not Found</h1>
        <p className="text-on-surface-variant mb-6">The destination you&apos;re looking for doesn&apos;t exist.</p>
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
            <Image src={dest.imageUrl || fallbackImage} alt={dest.name} fill sizes="100vw" className="object-cover" />
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

        {dest.packages.length > 0 && (
          <>
            <FadeIn delay={0.2}>
              <h2 className="text-3xl font-headline font-bold text-on-surface mb-8">
                Available Packages in {dest.name}
              </h2>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dest.packages.map((pkg) => (
                <StaggerItem key={pkg.id}>
                  <Link href={`/packages/${pkg.slug}`}>
                    <Card hover className="group h-full">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={pkg.images?.[0] || fallbackImage}
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
          </>
        )}

        {dest.packages.length === 0 && (
          <FadeIn className="text-center py-12">
            <p className="text-on-surface-variant text-lg mb-4">No packages available for this destination yet.</p>
            <Link href="/packages"><Button variant="outline">Browse All Packages</Button></Link>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
