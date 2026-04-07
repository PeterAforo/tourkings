"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PublicSiteContent } from "@/lib/site-content-defaults";
import {
  FALLBACK_HERO_IMAGE_URL,
  mergePublicSiteContent,
  sanitizeUnsplashImageUrl,
} from "@/lib/site-content-defaults";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [content, setContent] = useState<PublicSiteContent | null>(null);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  useEffect(() => {
    csrfFetch("/api/public/site-content")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) setContent(d.content as PublicSiteContent);
        else setContent(mergePublicSiteContent({}));
      })
      .catch(() => setContent(mergePublicSiteContent({})));
  }, []);

  const hero = content?.hero;

  useEffect(() => {
    if (!heroRef.current || !hero) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".hero-overlay", { opacity: 0 }, { opacity: 1, duration: 1.5 })
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
  }, [hero]);

  useEffect(() => {
    setHeroImageFailed(false);
  }, [hero?.image_url]);

  if (!hero) {
    return <section className="relative min-h-[50vh] bg-surface" aria-hidden />;
  }

  const title = hero.title;
  const adventureIdx = title.toLowerCase().indexOf("adventure");
  const titleBefore =
    adventureIdx >= 0 ? title.slice(0, adventureIdx) : title;
  const titleAdventure =
    adventureIdx >= 0 ? title.slice(adventureIdx, adventureIdx + "Adventure".length) : "";
  const titleAfter =
    adventureIdx >= 0 ? title.slice(adventureIdx + "Adventure".length) : "";

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] lg:min-h-[921px] flex items-center overflow-hidden bg-surface"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={
            heroImageFailed
              ? FALLBACK_HERO_IMAGE_URL
              : sanitizeUnsplashImageUrl(hero.image_url, FALLBACK_HERO_IMAGE_URL)
          }
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
          onError={() => setHeroImageFailed(true)}
        />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl">
          <span className="inline-block text-secondary font-bold tracking-widest text-sm mb-4 uppercase font-headline">
            {hero.badge}
          </span>

          <h1
            ref={titleRef}
            className="font-headline text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tighter"
          >
            {adventureIdx >= 0 ? (
              <>
                {titleBefore}
                <span className="text-secondary-fixed">{titleAdventure}</span>
                {titleAfter}
              </>
            ) : (
              title
            )}
          </h1>

          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-white/90 font-medium mb-12 leading-relaxed"
          >
            {hero.subtitle}
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-6">
            <Link href="/packages">
              <button
                type="button"
                className="hero-gradient text-on-primary px-10 py-5 rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3 font-headline"
              >
                {hero.cta_text}
                <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/destinations">
              <button
                type="button"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-white/20 transition-all font-headline"
              >
                Explore Destinations
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
