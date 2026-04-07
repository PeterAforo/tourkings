"use client";

import Link from "next/link";
import { Castle } from "lucide-react";

const HERO_IMAGE = "/images/auth-landscape.png";
const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAitGqylmli3BKMz9iK_TdVA9OsRGMD7z_3Lo7wBnID6G8fk6xV3nQQnYXAtR8To2LgUDIprh2TldWfmDa05QBbtGKY6Tf9yqBok_2Qtb9-6Tuqua-m2Pt7pGxcUz-w29la8v-h5Y7W3BvKgJb1RauO9_M-lFrYlpHTaQ07ZLxBHFVimxzMUYhEbA9YhwCubtNXAQ6RYDwkG75C1GLl4F2sQQkOGP1_6D6XBzmWkcEA0awOL0eorN7HST6J6qnKAK8Nfr_creibDA";

export default function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex bg-surface">
      <section className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="Ghanaian landscape — lush green rolling hills and villages"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
        <div className="relative z-20 flex flex-col justify-between p-16 w-full text-white">
          <div>
            <Link href="/" className="font-headline font-bold text-3xl tracking-tight text-white">
              TourKings
            </Link>
          </div>
          <div className="max-w-md">
            <span className="font-label text-secondary-fixed tracking-[0.2em] text-xs font-bold uppercase mb-4 block">
              The Sovereign Voyager
            </span>
            <h2 className="font-headline text-5xl font-extrabold leading-tight mb-6">
              Experience the Majesty of Ghana.
            </h2>
            <p className="text-lg text-surface-container-lowest/80 leading-relaxed font-light">
              Unlock curated luxury adventures from the heart of West Africa to the gold-lined horizons of the world.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="w-12 h-px bg-secondary-fixed" />
            <p>Ghanaian Heritage, Global Luxury</p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-8 opacity-10 pointer-events-none z-20">
          <Castle className="w-60 h-60 text-white" strokeWidth={1.25} />
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md space-y-12">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Link href="/" className="font-headline font-bold text-2xl text-primary mb-2">
              TourKings
            </Link>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
