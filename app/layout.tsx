import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TourKings - Premium Tour Experiences in Ghana & Beyond",
    template: "%s | TourKings",
  },
  description:
    "Discover extraordinary travel experiences with TourKings. Customized tour packages across Ghana and the world. Save towards your dream vacation.",
  keywords: ["Ghana tours", "travel", "TourKings", "vacation", "wallet savings", "West Africa"],
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: "TourKings",
    title: "TourKings - Premium Tour Experiences in Ghana & Beyond",
    description:
      "Discover extraordinary travel experiences with TourKings. Customized tour packages across Ghana and the world.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TourKings - Premium Tour Experiences",
    description: "Premium tours in Ghana and beyond. Save with your wallet toward your dream trip.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${plusJakarta.variable} ${manrope.variable}`}>
      <body className="font-body bg-surface text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
