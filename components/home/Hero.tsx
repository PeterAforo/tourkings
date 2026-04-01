"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-overlay",
        { opacity: 0 },
        { opacity: 1, duration: 1.5 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 80, clipPath: "inset(100% 0 0 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power3.out" },
          "-=0.8"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&q=80"
          alt="Stunning coastline in Ghana"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl">
          <span className="inline-block text-secondary font-bold tracking-widest text-sm mb-4 uppercase font-headline">
            Experience Ghanaian Heritage
          </span>

          <h1
            ref={titleRef}
            className="font-headline text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tighter"
          >
            Discovering Your Next{" "}
            <span className="text-secondary-fixed">Adventure</span>.
          </h1>

          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-white/90 font-medium mb-12 leading-relaxed"
          >
            From the mist-covered canopies of Kakum to the vibrant rhythms of Accra,
            we craft premium journeys that bridge the gap between tradition and luxury.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-6">
            <Link href="/packages">
              <button className="hero-gradient text-on-primary px-10 py-5 rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3 font-headline">
                Start Your Journey
                <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/destinations">
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-white/20 transition-all font-headline">
                Explore Destinations
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
