import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedPackages from "@/components/home/FeaturedPackages";
import Stats from "@/components/home/Stats";
import Destinations from "@/components/home/Destinations";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedPackages />
      <Stats />
      <Destinations />
      <Testimonials />
      <CTA />
    </>
  );
}
