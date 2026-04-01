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

export const metadata: Metadata = {
  title: "TourKings - Premium Tour Experiences in Ghana & Beyond",
  description:
    "Discover extraordinary travel experiences with TourKings. Customized tour packages across Ghana and the world. Save towards your dream vacation.",
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
