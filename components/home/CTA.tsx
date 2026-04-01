"use client";

import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";

export default function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hero-gradient rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="adinkra-pattern absolute inset-0 opacity-10" />
          <div className="relative z-10">
            <FadeIn>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-8">
                Ready to Write Your Own <br />Royal Narrative?
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12 font-medium">
                Join thousands of travelers who have found their heritage and their heartbeat with TourKings.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Link href="/register">
                <button className="bg-white text-primary px-12 py-5 rounded-lg font-extrabold text-xl shadow-2xl hover:bg-secondary-fixed transition-all hover:scale-105 active:scale-95 font-headline">
                  Start Your Journey Today
                </button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
