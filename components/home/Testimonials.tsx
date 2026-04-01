"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Image from "next/image";
import FadeIn from "@/components/animations/FadeIn";

const testimonials = [
  {
    name: "Kwame Asante",
    location: "Accra, Ghana",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    text: "TourKings made our family vacation absolutely unforgettable. The Cape Coast tour was perfectly organized, and our guide was incredibly knowledgeable about Ghana's history.",
  },
  {
    name: "Sarah Johnson",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    text: "As a solo traveler, I felt completely safe and welcomed. The Volta Region adventure was the highlight of my Africa trip. TourKings is simply the best!",
  },
  {
    name: "David Mensah",
    location: "Kumasi, Ghana",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    rating: 5,
    text: "The wallet savings feature is brilliant! I saved gradually and got to experience the premium Dubai package. The team is professional and truly cares about their customers.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

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
                &quot;{testimonials[current].text}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={testimonials[current].image}
                    alt={testimonials[current].name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-on-surface font-semibold font-headline">{testimonials[current].name}</h4>
                  <p className="text-on-surface-variant text-sm">{testimonials[current].location}</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-primary w-6" : "bg-outline-variant"
                  }`}
                />
              ))}
            </div>
            <button
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
