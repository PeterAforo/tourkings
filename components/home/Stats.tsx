"use client";

import Image from "next/image";
import FadeIn from "@/components/animations/FadeIn";

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "200+", label: "Curated Paths" },
  { value: "5k+", label: "Happy Voyagers" },
];

export default function Stats() {
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
                Ghanaian Owned, <br />
                <span className="text-primary">Global Reach.</span>
              </h2>
              <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                <p>
                  Founded on the principles of hospitality and cultural pride, TourKings is more than
                  a travel agency. We are the custodians of your adventures, committed to showcasing
                  the hidden gems of West Africa alongside the world&apos;s most iconic wonders.
                </p>
                <p>
                  Our roots in Ghana define our service—warm, authentic, and regal. We believe every
                  traveler should feel like a king, whether they are trekking through our ancestral
                  forests or dining in the skyscrapers of the West.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-10">
                {stats.map((stat) => (
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
