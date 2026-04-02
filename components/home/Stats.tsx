"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FadeIn from "@/components/animations/FadeIn";
import type { PublicSiteContent } from "@/lib/site-content-defaults";
import { mergePublicSiteContent } from "@/lib/site-content-defaults";

export default function Stats() {
  const [content, setContent] = useState<PublicSiteContent | null>(null);

  useEffect(() => {
    fetch("/api/public/site-content")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) setContent(d.content as PublicSiteContent);
        else setContent(mergePublicSiteContent({}));
      })
      .catch(() => setContent(mergePublicSiteContent({})));
  }, []);

  if (!content) {
    return <section className="py-24 bg-surface-container-highest min-h-[200px]" aria-hidden />;
  }

  const { stats } = content;
  const headingParts = stats.heading.split(",").map((s) => s.trim());
  const line1 = headingParts[0] || stats.heading;
  const line2 = headingParts.slice(1).join(", ");

  const statBlocks = [
    { value: stats.years, label: "Years Experience" },
    { value: stats.paths, label: "Curated Paths" },
    { value: stats.voyagers, label: "Happy Voyagers" },
  ];

  return (
    <section className="py-24 bg-surface-container-highest overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400&q=80"
                    alt="Ghanaian kente cloth weaving"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-full h-80 rounded-xl shadow-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80"
                    alt="Luxury resort"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative w-full h-80 rounded-xl shadow-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=400&q=80"
                    alt="Accra city market"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80"
                    alt="Traditional Adinkra symbols"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -z-10 -top-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="order-1 lg:order-2">
            <FadeIn>
              <span className="text-secondary font-bold tracking-widest text-sm uppercase mb-4 block font-headline">
                Our Story
              </span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-8 leading-tight">
                {line2 ? (
                  <>
                    {line1}, <br />
                    <span className="text-primary">{line2}</span>
                  </>
                ) : (
                  stats.heading
                )}
              </h2>
              <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                <p>{stats.paragraph1}</p>
                <p>{stats.paragraph2}</p>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-10">
                {statBlocks.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-4xl font-extrabold text-primary mb-1 font-headline">{stat.value}</div>
                    <div className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
