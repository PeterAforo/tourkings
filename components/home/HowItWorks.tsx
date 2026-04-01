"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { Wallet, Shield, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-20">
          <h2 className="font-headline text-4xl font-bold text-on-surface mb-4">
            Flexible Luxury, Your Way
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            Luxury shouldn&apos;t be a hurdle. We offer two seamless ways to secure your dream escape.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-12">
          <FadeIn>
            <motion.div
              whileHover={{ y: -4 }}
              className="group bg-surface rounded-xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
            >
              <div className="adinkra-pattern absolute inset-0" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-8">
                  <Wallet size={28} className="text-primary" />
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-4">Pay Outright</h3>
                <p className="text-on-surface-variant mb-8 leading-relaxed">
                  Secure your booking instantly. Ideal for spontaneous explorers who want their full
                  itinerary confirmed today with premium priority status.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-on-surface font-medium">
                    <CheckCircle size={20} className="text-secondary" />
                    Instant Confirmation
                  </li>
                  <li className="flex items-center gap-3 text-on-surface font-medium">
                    <CheckCircle size={20} className="text-secondary" />
                    Priority Concierge Access
                  </li>
                </ul>
                <Link
                  href="/packages"
                  className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all border-b-2 border-secondary pb-1 font-headline"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <motion.div
              whileHover={{ y: -4 }}
              className="group bg-primary-container text-on-primary rounded-xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-8">
                  <Shield size={28} className="text-white" />
                </div>
                <h3 className="font-headline text-2xl font-bold text-white mb-4">Save into The Vault</h3>
                <p className="text-white/80 mb-8 leading-relaxed">
                  The smarter way to travel. Lock in your package price and contribute gradually.
                  No interest, no stress, just the anticipation of the royal treatment.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle size={20} className="text-secondary-fixed" />
                    Fixed Package Prices
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle size={20} className="text-secondary-fixed" />
                    Flexible Monthly Contributions
                  </li>
                </ul>
                <Link href="/register">
                  <button className="bg-secondary text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:bg-secondary-container transition-colors font-headline">
                    Open Your Vault
                  </button>
                </Link>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
