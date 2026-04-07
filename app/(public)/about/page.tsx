"use client";

import { csrfFetch } from "@/lib/fetch-csrf";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import CountUp from "@/components/animations/CountUp";
import { Shield, Heart, Globe, Award } from "lucide-react";
import type { PublicSiteContent } from "@/lib/site-content-defaults";
import { mergePublicSiteContent } from "@/lib/site-content-defaults";

const values = [
  { icon: Shield, title: "Trust & Safety", description: "Your safety is our top priority. We ensure every tour meets the highest safety standards." },
  { icon: Heart, title: "Passion for Travel", description: "We live and breathe travel. Every package is crafted with genuine love for exploration." },
  { icon: Globe, title: "Local Expertise", description: "Our deep knowledge of Ghana and beyond ensures authentic, off-the-beaten-path experiences." },
  { icon: Award, title: "Excellence", description: "We strive for perfection in every detail, from accommodation to guides to itineraries." },
];

const team = [
  { name: "Kofi Mensah", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
  { name: "Ama Darko", role: "Head of Operations", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80" },
  { name: "Yaw Boateng", role: "Lead Tour Guide", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80" },
  { name: "Efua Owusu", role: "Customer Experience", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80" },
];

function parseStatNum(s: string): number {
  const n = parseInt(String(s).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export default function AboutPage() {
  const [about, setAbout] = useState<PublicSiteContent["about"] | null>(null);

  useEffect(() => {
    csrfFetch("/api/public/site-content")
      .then((r) => r.json())
      .then((d) => {
        const c = d.content
          ? (d.content as PublicSiteContent)
          : mergePublicSiteContent({});
        setAbout(c.about);
      })
      .catch(() => setAbout(mergePublicSiteContent({}).about));
  }, []);

  if (!about) {
    return <div className="pt-24 min-h-screen bg-surface" aria-hidden />;
  }

  const title = about.story_title || about.title;
  const yearsBadge = `${parseStatNum(about.stat_years) || 10}+`;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <span className="text-primary text-sm font-medium tracking-widest uppercase">Our Story</span>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mt-3 mb-6">
                {(() => {
                  const parts = title.split(/(Journeys)/i);
                  if (parts.length === 3) {
                    return (
                      <>
                        {parts[0]}
                        <span className="text-primary">{parts[1]}</span>
                        {parts[2]}
                      </>
                    );
                  }
                  return title;
                })()}
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-6">{about.story_p1}</p>
              <p className="text-on-surface-variant leading-relaxed mb-8">{about.story_p2}</p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-headline font-bold text-primary">
                    <CountUp end={parseStatNum(about.stat_travelers)} suffix="+" />
                  </div>
                  <p className="text-on-surface-variant text-sm mt-1">Travelers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-headline font-bold text-primary">
                    <CountUp end={parseStatNum(about.stat_years)} suffix="+" />
                  </div>
                  <p className="text-on-surface-variant text-sm mt-1">Years</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-headline font-bold text-primary">
                    <CountUp end={parseStatNum(about.stat_countries)} suffix="+" />
                  </div>
                  <p className="text-on-surface-variant text-sm mt-1">Countries</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="relative">
                <div className="relative h-[500px] rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80"
                    alt="TourKings Team"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-headline font-bold text-primary">{yearsBadge}</p>
                    <p className="text-on-surface-variant text-xs">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="text-primary text-sm font-medium tracking-widest uppercase">Why Choose Us</span>
            <h2 className="text-4xl font-headline font-bold text-on-surface mt-3">Our Core Values</h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <motion.div whileHover={{ y: -5 }} className="bg-surface border border-outline-variant/15 rounded-2xl p-6 text-center h-full shadow-sm">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-headline font-bold text-on-surface mb-3">{value.title}</h3>
                  <p className="text-on-surface-variant text-sm">{value.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="text-primary text-sm font-medium tracking-widest uppercase">The Team</span>
            <h2 className="text-4xl font-headline font-bold text-on-surface mt-3">Meet Our Experts</h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <StaggerItem key={member.name}>
                <motion.div whileHover={{ y: -5 }} className="text-center group">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary transition-all">
                    <Image src={member.image} alt={member.name} fill sizes="192px" className="object-cover" />
                  </div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">{member.name}</h3>
                  <p className="text-primary text-sm">{member.role}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
