"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, Users, MapPin, X, ArrowLeft, Wallet, Star,
  Bus, Hotel, Sparkles, ChevronDown, UtensilsCrossed,
  Wifi, Waves, Dumbbell, Shield, Camera, Gift, Map,
  CheckCircle, Phone,
} from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import Button from "@/components/ui/Button";
import { formatCurrency, cn } from "@/lib/utils";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

interface HotelInfo {
  name: string;
  rating: number;
  location: string;
  nights: number;
  amenities: string[];
}

interface TransportInfo {
  type: string;
  details: string;
  pickup?: string;
  dropoff?: string;
}

interface AmenityGroup {
  category: string;
  items: string[];
}

interface PackageData {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  groupSize: number;
  images: string[];
  included: string[];
  excluded: string[];
  highlights: string[];
  itinerary: ItineraryDay[] | null;
  hotels: HotelInfo[] | null;
  transportation: TransportInfo | null;
  amenities: AmenityGroup[] | null;
  destination: { name: string; country: string };
}

const amenityIcons: Record<string, typeof Wifi> = {
  "Air conditioning": Wifi,
  "Free Wi-Fi": Wifi,
  "Swimming pool": Waves,
  "Infinity pool": Waves,
  "Restaurant": UtensilsCrossed,
  "Gym": Dumbbell,
  "Fitness centre": Dumbbell,
  "Spa": Sparkles,
};

function getAmenityIcon(amenity: string) {
  for (const [key, Icon] of Object.entries(amenityIcons)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Sparkles;
}

function getCategoryIcon(category: string) {
  const map: Record<string, typeof Shield> = {
    Comfort: Hotel, Safety: Shield, Extras: Gift, Cultural: Map,
    Experience: Sparkles, Adventure: Map, Luxury: Star, Dining: UtensilsCrossed,
    "Adventure Gear": Shield, "Safari Gear": Camera,
  };
  return map[category] || Sparkles;
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllDays, setShowAllDays] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/packages/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.package) setPkg(d.package);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center min-h-screen bg-surface">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="pt-32 pb-16 text-center min-h-screen bg-surface">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-4">Package Not Found</h1>
        <p className="text-on-surface-variant mb-8">The package you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/packages"><Button variant="primary">Browse Packages</Button></Link>
      </div>
    );
  }

  const itinerary = (pkg.itinerary || []) as ItineraryDay[];
  const hotels = (pkg.hotels || []) as HotelInfo[];
  const transport = pkg.transportation as TransportInfo | null;
  const amenityGroups = (pkg.amenities || []) as AmenityGroup[];
  const visibleDays = showAllDays ? itinerary : itinerary.slice(0, 3);

  const handleBookNow = async () => {
    setBookingLoading(true);
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData?.user) {
        router.push("/login");
        return;
      }

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, travelDate: travelDate || undefined, travelers }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingData.booking) throw new Error("Booking failed");

      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: pkg.price * travelers, type: "BOOKING", bookingId: bookingData.booking.id }),
      });
      const payData = await payRes.json();
      if (payData.paymentLink) {
        window.location.href = payData.paymentLink;
      } else {
        alert("Payment initialization failed. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleVaultSave = async () => {
    const authRes = await fetch("/api/auth/me");
    const authData = await authRes.json();
    if (authData?.user) {
      router.push("/dashboard/wallet");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {/* Hero Section: Editorial Asymmetry */}
      <section className="relative h-[500px] md:h-[700px] lg:h-[870px] w-full overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-12 h-full">
          {/* Large Image — 8 cols */}
          <div className="col-span-1 lg:col-span-8 relative h-full">
            {pkg.images[0] && (
              <Image
                src={pkg.images[0]}
                alt={pkg.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-surface/40 to-transparent" />

            {/* Back button overlaid on image */}
            <button
              onClick={() => router.back()}
              className="absolute top-8 left-8 z-10 flex items-center gap-2 text-on-surface/80 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg font-headline font-semibold text-sm hover:bg-white/80 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* Info Panel — 4 cols */}
          <div className="hidden lg:flex lg:col-span-4 bg-surface-container-low flex-col justify-center p-12 gap-6 relative">
            <span className="text-secondary font-headline font-bold uppercase tracking-[0.2em] text-xs">
              {pkg.destination.country} &middot; {pkg.destination.name}
            </span>
            <h1 className="text-on-surface font-headline font-extrabold text-5xl leading-tight tracking-tighter">
              {pkg.title}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">Duration</span>
                <span className="text-lg font-bold">{pkg.duration}</span>
              </div>
              <div className="w-[1px] h-10 bg-outline-variant/30" />
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">Group</span>
                <span className="text-lg font-bold">Max {pkg.groupSize}</span>
              </div>
            </div>
            <div className="mt-8">
              <span className="text-on-surface-variant text-sm block mb-1">Starting from</span>
              <span className="text-4xl font-headline font-extrabold text-primary">
                {formatCurrency(pkg.price, pkg.currency)}{" "}
                <span className="text-lg font-normal text-on-surface-variant">/ person</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-surface to-transparent lg:hidden">
          <h1 className="text-on-surface font-headline font-extrabold text-3xl md:text-4xl">
            {pkg.title}
          </h1>
          <p className="text-on-surface-variant font-bold mt-2">
            {pkg.duration} &middot; {pkg.destination.name}
          </p>
        </div>
      </section>

      {/* Mobile Price Bar */}
      <div className="lg:hidden bg-surface-container-low px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-on-surface-variant text-sm block">Starting from</span>
            <span className="text-2xl font-headline font-extrabold text-primary">
              {formatCurrency(pkg.price, pkg.currency)}
            </span>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowBooking(true)}>Book Now</Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Details & Itinerary */}
          <div className="lg:col-span-8 space-y-20">

            {/* Overview */}
            <FadeIn>
              <div className="space-y-6">
                <h2 className="text-3xl font-headline font-bold text-on-surface">Overview</h2>
                <p className="text-lg leading-relaxed text-on-surface-variant font-body">
                  {pkg.description}
                </p>

                {/* Quick Info Chips */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                  <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center text-center">
                    <Clock size={22} className="text-secondary mb-2" />
                    <span className="text-xs uppercase font-bold text-on-surface-variant mb-1">Duration</span>
                    <span className="font-bold text-on-surface">{pkg.duration}</span>
                  </div>
                  <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center text-center">
                    <Users size={22} className="text-secondary mb-2" />
                    <span className="text-xs uppercase font-bold text-on-surface-variant mb-1">Group</span>
                    <span className="font-bold text-on-surface">Max {pkg.groupSize}</span>
                  </div>
                  <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center text-center">
                    <MapPin size={22} className="text-secondary mb-2" />
                    <span className="text-xs uppercase font-bold text-on-surface-variant mb-1">Location</span>
                    <span className="font-bold text-on-surface">{pkg.destination.name}</span>
                  </div>
                  {transport && (
                    <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center text-center">
                      <Bus size={22} className="text-secondary mb-2" />
                      <span className="text-xs uppercase font-bold text-on-surface-variant mb-1">Transport</span>
                      <span className="font-bold text-on-surface">{transport.type}</span>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <FadeIn>
                <div className="space-y-6">
                  <h2 className="text-3xl font-headline font-bold text-on-surface">Highlights</h2>
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.highlights.map((hl, i) => (
                      <StaggerItem key={i}>
                        <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Star size={16} className="text-secondary" />
                          </div>
                          <p className="text-on-surface-variant">{hl}</p>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeIn>
            )}

            {/* Day-by-Day Itinerary — Timeline Style */}
            {itinerary.length > 0 && (
              <FadeIn>
                <div className="space-y-12">
                  <h2 className="text-3xl font-headline font-bold text-on-surface">The Journey</h2>
                  <div className="relative border-l-2 border-secondary/20 ml-4 pl-12 space-y-16">
                    {visibleDays.map((day, i) => (
                      <motion.div
                        key={day.day}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div
                          className={cn(
                            "absolute -left-[3.25rem] top-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-sm font-headline font-bold",
                            i === 0
                              ? "bg-secondary text-on-secondary"
                              : i === 1
                                ? "bg-secondary-container text-on-secondary"
                                : "bg-surface-container-highest border-2 border-secondary/30 text-secondary"
                          )}
                        >
                          {day.day}
                        </div>
                        <span className="text-secondary font-headline font-bold text-sm uppercase tracking-widest">
                          Day {day.day}
                        </span>
                        <h3 className="text-2xl font-headline font-bold text-on-surface mt-2">{day.title}</h3>
                        <p className="mt-4 text-on-surface-variant leading-relaxed">{day.description}</p>

                        {day.activities.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {day.activities.map((act, j) => (
                              <span
                                key={j}
                                className="inline-flex items-center gap-1.5 text-sm bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-lg"
                              >
                                <span className="w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {!showAllDays && itinerary.length > 3 && (
                      <button
                        onClick={() => setShowAllDays(true)}
                        className="text-primary font-headline font-bold flex items-center gap-2 hover:translate-x-2 transition-transform"
                      >
                        View Full {pkg.duration} Itinerary
                        <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Hotels & Accommodation */}
            {hotels.length > 0 && (
              <FadeIn>
                <div className="space-y-8">
                  <h2 className="text-3xl font-headline font-bold text-on-surface">Accommodation</h2>
                  <div className="space-y-6">
                    {hotels.map((hotel, i) => (
                      <div key={i} className="bg-surface-container-low rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                            <Hotel size={26} className="text-secondary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                              <div>
                                <h3 className="text-xl font-headline font-bold text-on-surface">{hotel.name}</h3>
                                <p className="text-on-surface-variant text-sm flex items-center gap-1">
                                  <MapPin size={13} /> {hotel.location}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: hotel.rating }).map((_, j) => (
                                    <Star key={j} size={14} className="fill-secondary text-secondary" />
                                  ))}
                                </div>
                                <span className="text-on-surface-variant text-sm">
                                  {hotel.nights} night{hotel.nights > 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {hotel.amenities.map((amenity, j) => {
                                const Icon = getAmenityIcon(amenity);
                                return (
                                  <span
                                    key={j}
                                    className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-highest rounded-full px-3 py-1.5"
                                  >
                                    <Icon size={12} className="text-secondary" />
                                    {amenity}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Transportation */}
            {transport && (
              <FadeIn>
                <div className="space-y-6">
                  <h2 className="text-3xl font-headline font-bold text-on-surface">Transportation</h2>
                  <div className="bg-surface-container-low rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Bus size={26} className="text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-headline font-bold text-on-surface mb-2">{transport.type}</h3>
                        <p className="text-on-surface-variant mb-4">{transport.details}</p>
                        {(transport.pickup || transport.dropoff) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {transport.pickup && (
                              <div className="bg-surface-container-highest rounded-xl p-4">
                                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Pickup</p>
                                <p className="text-on-surface text-sm font-medium">{transport.pickup}</p>
                              </div>
                            )}
                            {transport.dropoff && (
                              <div className="bg-surface-container-highest rounded-xl p-4">
                                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Drop-off</p>
                                <p className="text-on-surface text-sm font-medium">{transport.dropoff}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* What's Included / Not Included */}
            <FadeIn>
              <div className="bg-surface-container-low p-8 md:p-12 rounded-2xl">
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-8 text-center">
                  What&apos;s Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ul className="space-y-4">
                    {pkg.included.slice(0, Math.ceil(pkg.included.length / 2)).map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                        <span className="text-on-surface-variant font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-4">
                    {pkg.included.slice(Math.ceil(pkg.included.length / 2)).map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                        <span className="text-on-surface-variant font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* Not Included */}
            {pkg.excluded.length > 0 && (
              <FadeIn>
                <div className="space-y-6">
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Not Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pkg.excluded.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-on-surface-variant">
                        <X size={16} className="text-error mt-0.5 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Amenities */}
            {amenityGroups.length > 0 && (
              <FadeIn>
                <div className="space-y-8">
                  <h2 className="text-3xl font-headline font-bold text-on-surface">Amenities & Extras</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {amenityGroups.map((group, i) => {
                      const CatIcon = getCategoryIcon(group.category);
                      return (
                        <div key={i} className="bg-surface-container-low rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                              <CatIcon size={20} className="text-secondary" />
                            </div>
                            <h3 className="text-lg font-headline font-bold text-on-surface">{group.category}</h3>
                          </div>
                          <ul className="space-y-2.5">
                            {group.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                                <CheckCircle size={15} className="text-secondary mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right Column: Sticky Pricing Sidebar */}
          <div className="lg:col-span-4">
            <FadeIn delay={0.2} direction="left">
              <div className="lg:sticky lg:top-28 space-y-8">
                {/* Pricing Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-on-surface/5 flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        Total Investment
                      </span>
                      <div className="text-4xl font-headline font-extrabold text-primary">
                        {formatCurrency(pkg.price, pkg.currency)}
                      </div>
                    </div>
                    <span className="text-secondary font-bold text-sm bg-secondary-fixed px-3 py-1 rounded-full">
                      Best Value
                    </span>
                  </div>

                  <div className="space-y-4">
                    <Button variant="primary" size="lg" className="w-full" onClick={() => setShowBooking(true)}>
                      Book Now
                    </Button>
                    <Button variant="tonal" size="lg" className="w-full" onClick={handleVaultSave}>
                      <Wallet size={18} className="mr-2" /> Add to The Vault
                    </Button>
                  </div>

                  {/* Quick Info */}
                  <div className="pt-6 border-t border-outline-variant/20">
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between">
                        <span className="text-on-surface-variant">Duration</span>
                        <span className="text-on-surface font-semibold">{pkg.duration}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-on-surface-variant">Group Size</span>
                        <span className="text-on-surface font-semibold">Up to {pkg.groupSize}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-on-surface-variant">Location</span>
                        <span className="text-on-surface font-semibold">{pkg.destination.name}</span>
                      </li>
                      {transport && (
                        <li className="flex justify-between">
                          <span className="text-on-surface-variant">Transport</span>
                          <span className="text-on-surface font-semibold">{transport.type}</span>
                        </li>
                      )}
                      {hotels.length > 0 && (
                        <li className="flex justify-between">
                          <span className="text-on-surface-variant">Hotel</span>
                          <span className="text-on-surface font-semibold">{hotels[0].rating}-star</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="pt-6 border-t border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Questions?</p>
                        <p className="text-sm font-bold text-primary">Speak to a Travel Expert</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vault Savings Card */}
                <div className="bg-primary text-white p-8 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <Wallet size={160} />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-secondary-container" />
                    Vault Your Dream
                  </h3>
                  <p className="text-on-primary-container text-sm leading-relaxed mb-6">
                    Not ready to pay in full? Secure this package price today by starting a savings goal in your Vault.
                  </p>
                  <button
                    onClick={handleVaultSave}
                    className="text-secondary-container font-bold text-sm inline-flex items-center gap-1 group"
                  >
                    Start Saving
                    <ChevronDown size={14} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <FadeIn>
        <section className="bg-surface-container-low py-20">
          <div className="max-w-3xl mx-auto px-8 text-center">
            <span className="text-secondary font-headline font-bold uppercase tracking-[0.2em] text-xs">
              Ready to Explore?
            </span>
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface mt-3 mb-4 tracking-tighter">
              Experience the {pkg.title}
            </h2>
            <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
              Book now or start saving towards this package with your TourKings Vault.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg" onClick={() => setShowBooking(true)}>
                Book Now &mdash; {formatCurrency(pkg.price, pkg.currency)}
              </Button>
              <Button variant="tonal" size="lg" onClick={handleVaultSave}>
                <Wallet size={18} className="mr-2" /> Add to The Vault
              </Button>
            </div>
          </div>
        </section>
      </FadeIn>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-headline font-bold text-on-surface">Book This Package</h3>
              <button onClick={() => setShowBooking(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Number of Travelers</label>
                <input
                  type="number"
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, Math.min(pkg.groupSize, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={pkg.groupSize}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="bg-surface-container-low rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">{formatCurrency(pkg.price, pkg.currency)} x {travelers} traveler{travelers > 1 ? "s" : ""}</span>
                  <span className="font-bold text-on-surface">{formatCurrency(pkg.price * travelers, pkg.currency)}</span>
                </div>
                <div className="border-t border-outline-variant/15 pt-2 flex justify-between">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="text-xl font-headline font-extrabold text-primary">{formatCurrency(pkg.price * travelers, pkg.currency)}</span>
                </div>
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={handleBookNow} isLoading={bookingLoading}>
                Proceed to Payment
              </Button>
              <p className="text-xs text-center text-on-surface-variant">You will be redirected to our secure payment partner</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
