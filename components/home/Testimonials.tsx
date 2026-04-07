"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Image from "next/image";
import FadeIn from "@/components/animations/FadeIn";
import type { PublicSiteContent } from "@/lib/site-content-defaults";
import { mergePublicSiteContent } from "@/lib/site-content-defaults";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [items, setItems] = useState<PublicSiteContent["testimonials"]["items"]>([]);

  useEffect(() => {
    csrfFetch("/api/public/site-content")
      .then((r) => r.json())
      .then((d) => {
        const c = d.content
          ? (d.content as PublicSiteContent)
          : mergePublicSiteContent({});
        setItems(c.testimonials.items);
      })
      .catch(() => setItems(mergePublicSiteContent({}).testimonials.items));
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % Math.max(items.length, 1));
  const prev = () =>
    setCurrent((p) => (p - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1));

  if (items.length === 0) {
    return null;
  }

  const t = items[current];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span className="text-secondary font-bold tracking-widest text-xs uppercase font-headline">
            Testimonials
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mt-3">
            What Our Travelers Say
          </h2>
        </FadeIn>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-surface-container-low rounded-2xl p-8 md:p-12"
            >
              <Quote size={48} className="text-secondary/20 mb-6" />
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8 italic">
                &quot;{t.text}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-on-surface font-semibold font-headline">{t.name}</h4>
                  <p className="text-on-surface-variant text-sm">{t.location}</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={prev}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-primary w-6" : "bg-outline-variant"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
