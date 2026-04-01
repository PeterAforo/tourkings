"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe, MessageCircle, Share2 } from "lucide-react";

const footerLinks = {
  company: [
    { href: "/about", label: "Heritage" },
    { href: "/about#sustainability", label: "Sustainability" },
    { href: "/contact", label: "Careers" },
  ],
  support: [
    { href: "/about#privacy", label: "Privacy Policy" },
    { href: "/about#terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact Us" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-outline-variant/15">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Image
              src="/favicon.png"
              alt="TourKings crown"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-bold text-amber-600 font-headline">TourKings</span>
          </div>
          <p className="text-stone-500 font-body text-base leading-relaxed mb-8">
            Elevating travel into a royal expedition. Ghanaian heritage meets world-class luxury.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-stone-400 hover:text-primary transition-colors"><Globe size={20} /></a>
            <a href="#" className="text-stone-400 hover:text-primary transition-colors"><MessageCircle size={20} /></a>
            <a href="#" className="text-stone-400 hover:text-primary transition-colors"><Share2 size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-blue-900 mb-6 font-headline">Company</h4>
          <ul className="space-y-4 font-body">
            {footerLinks.company.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-stone-500 hover:text-blue-700 underline underline-offset-4 transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-blue-900 mb-6 font-headline">Support</h4>
          <ul className="space-y-4 font-body">
            {footerLinks.support.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-stone-500 hover:text-blue-700 underline underline-offset-4 transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-blue-900 mb-6 font-headline">The Vault</h4>
          <p className="text-stone-500 text-sm mb-4">
            Subscribe to our royal newsletter for exclusive packages and heritage stories.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email Address"
              className="bg-surface-container-low border-none rounded px-4 py-2 w-full text-sm focus:ring-2 focus:ring-primary"
            />
            <button className="bg-primary text-on-primary px-4 py-2 rounded font-bold text-xs font-headline">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-outline-variant/10 text-center">
        <p className="text-stone-400 text-sm font-body">
          &copy; {new Date().getFullYear()} TourKings. Ghanaian Heritage, Global Luxury.
        </p>
      </div>
    </footer>
  );
}
