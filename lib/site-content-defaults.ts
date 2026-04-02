export type PublicSiteContent = {
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    image_url: string;
    badge: string;
  };
  about: {
    title: string;
    description: string;
    story_title: string;
    story_p1: string;
    story_p2: string;
    stat_travelers: string;
    stat_years: string;
    stat_countries: string;
  };
  stats: {
    years: string;
    paths: string;
    voyagers: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
  };
  testimonials: {
    items: Array<{
      name: string;
      location: string;
      text: string;
      rating: number;
      image: string;
    }>;
  };
  contact: {
    email: string;
    email_bookings: string;
    phone: string;
    phone2: string;
    address_line1: string;
    address_line2: string;
    hours_weekday: string;
    hours_sat: string;
  };
};

const DEFAULTS: PublicSiteContent = {
  hero: {
    badge: "Experience Ghanaian Heritage",
    title: "Discovering Your Next Adventure.",
    subtitle:
      "From the mist-covered canopies of Kakum to the vibrant rhythms of Accra, we craft premium journeys that bridge the gap between tradition and luxury.",
    cta_text: "Start Your Journey",
    image_url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&q=80",
  },
  about: {
    title: "Crafting Unforgettable Journeys Since 2015",
    description:
      "TourKings was born from a simple dream: to share the beauty and richness of Ghana with the world.",
    story_title: "Crafting Unforgettable Journeys Since 2015",
    story_p1:
      "TourKings was born from a simple dream: to share the beauty and richness of Ghana with the world. Founded in Accra, we started as a small team of passionate travelers who believed that everyone deserves to experience the magic of Africa.",
    story_p2:
      "Today, we've grown into Ghana's premier tour company, serving thousands of travelers from across the globe. Our unique wallet savings feature allows customers to save towards their dream vacation at their own pace, making travel accessible to everyone.",
    stat_travelers: "5000",
    stat_years: "10",
    stat_countries: "15",
  },
  stats: {
    years: "15+",
    paths: "200+",
    voyagers: "5k+",
    heading: "Ghanaian Owned, Global Reach.",
    paragraph1:
      "Founded on the principles of hospitality and cultural pride, TourKings is more than a travel agency. We are the custodians of your adventures, committed to showcasing the hidden gems of West Africa alongside the world's most iconic wonders.",
    paragraph2:
      "Our roots in Ghana define our service—warm, authentic, and regal. We believe every traveler should feel like a king, whether they are trekking through our ancestral forests or dining in the skyscrapers of the West.",
  },
  testimonials: {
    items: [
      {
        name: "Kwame Asante",
        location: "Accra, Ghana",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
        text: "TourKings made our family vacation absolutely unforgettable. The Cape Coast tour was perfectly organized, and our guide was incredibly knowledgeable about Ghana's history.",
      },
      {
        name: "Sarah Johnson",
        location: "London, UK",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
        text: "As a solo traveler, I felt completely safe and welcomed. The Volta Region adventure was the highlight of my Africa trip. TourKings is simply the best!",
      },
      {
        name: "David Mensah",
        location: "Kumasi, Ghana",
        rating: 5,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
        text: "The wallet savings feature is brilliant! I saved gradually and got to experience the premium Dubai package. The team is professional and truly cares about their customers.",
      },
    ],
  },
  contact: {
    email: "info@tourkings.com",
    email_bookings: "bookings@tourkings.com",
    phone: "+233 20 123 4567",
    phone2: "+233 30 123 4567",
    address_line1: "15 Independence Ave",
    address_line2: "Accra, Ghana",
    hours_weekday: "Mon - Fri: 8AM - 6PM",
    hours_sat: "Sat: 9AM - 3PM",
  },
};

/** Default hero photo when CMS `hero.image_url` is missing or returns 404 (removed Unsplash asset). */
export const FALLBACK_HERO_IMAGE_URL = DEFAULTS.hero.image_url;

/** Unsplash photo IDs that return 404 from images.unsplash.com (removed or invalid). */
const DEAD_UNSPLASH_IDS = ["photo-1569949381669-ecf31ae8f613"] as const;

/** Swap known-dead Unsplash URLs so Next/Image does not 404 (CMS may still store old links). */
function replaceDeadUnsplashUrl(url: string, fallback: string): string {
  if (!url || !url.includes("unsplash.com")) return url || fallback;
  for (const id of DEAD_UNSPLASH_IDS) {
    if (url.includes(id)) return fallback;
  }
  return url;
}

function asString(v: unknown, fallback: string): string {
  if (typeof v === "string") return v;
  if (v != null && typeof v === "object" && "toString" in v) return String(v);
  return fallback;
}

export function mergePublicSiteContent(
  grouped: Record<string, Record<string, unknown>>
): PublicSiteContent {
  const hero = { ...DEFAULTS.hero, ...(grouped.hero as Record<string, string>) };
  const about = { ...DEFAULTS.about, ...(grouped.about as Record<string, string>) };
  const stats = { ...DEFAULTS.stats, ...(grouped.stats as Record<string, string>) };
  const contact = { ...DEFAULTS.contact, ...(grouped.contact as Record<string, string>) };

  let testimonialItems = DEFAULTS.testimonials.items;
  const raw = grouped.testimonials?.items;
  if (Array.isArray(raw)) {
    testimonialItems = raw as PublicSiteContent["testimonials"]["items"];
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) testimonialItems = parsed as PublicSiteContent["testimonials"]["items"];
    } catch {
      /* keep defaults */
    }
  }

  const avatarFallback = DEFAULTS.testimonials.items[0]?.image ?? FALLBACK_HERO_IMAGE_URL;
  testimonialItems = testimonialItems.map((item) => ({
    ...item,
    image: replaceDeadUnsplashUrl(item.image, avatarFallback),
  }));

  return {
    hero: {
      badge: asString(hero.badge, DEFAULTS.hero.badge),
      title: asString(hero.title, DEFAULTS.hero.title),
      subtitle: asString(hero.subtitle, DEFAULTS.hero.subtitle),
      cta_text: asString(hero.cta_text, DEFAULTS.hero.cta_text),
      image_url: replaceDeadUnsplashUrl(
        asString(hero.image_url, DEFAULTS.hero.image_url),
        FALLBACK_HERO_IMAGE_URL
      ),
    },
    about: {
      title: asString(about.title, DEFAULTS.about.title),
      description: asString(about.description, DEFAULTS.about.description),
      story_title: asString(about.story_title, DEFAULTS.about.story_title),
      story_p1: asString(about.story_p1, DEFAULTS.about.story_p1),
      story_p2: asString(about.story_p2, DEFAULTS.about.story_p2),
      stat_travelers: asString(about.stat_travelers, DEFAULTS.about.stat_travelers),
      stat_years: asString(about.stat_years, DEFAULTS.about.stat_years),
      stat_countries: asString(about.stat_countries, DEFAULTS.about.stat_countries),
    },
    stats: {
      years: asString(stats.years, DEFAULTS.stats.years),
      paths: asString(stats.paths, DEFAULTS.stats.paths),
      voyagers: asString(stats.voyagers, DEFAULTS.stats.voyagers),
      heading: asString(stats.heading, DEFAULTS.stats.heading),
      paragraph1: asString(stats.paragraph1, DEFAULTS.stats.paragraph1),
      paragraph2: asString(stats.paragraph2, DEFAULTS.stats.paragraph2),
    },
    testimonials: { items: testimonialItems },
    contact: {
      email: asString(contact.email, DEFAULTS.contact.email),
      email_bookings: asString(contact.email_bookings, DEFAULTS.contact.email_bookings),
      phone: asString(contact.phone, DEFAULTS.contact.phone),
      phone2: asString(contact.phone2, DEFAULTS.contact.phone2),
      address_line1: asString(contact.address_line1, DEFAULTS.contact.address_line1),
      address_line2: asString(contact.address_line2, DEFAULTS.contact.address_line2),
      hours_weekday: asString(contact.hours_weekday, DEFAULTS.contact.hours_weekday),
      hours_sat: asString(contact.hours_sat, DEFAULTS.contact.hours_sat),
    },
  };
}
