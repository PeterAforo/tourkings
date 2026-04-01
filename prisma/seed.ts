import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tourkings.com" },
    update: {},
    create: {
      email: "admin@tourkings.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "TourKings",
      role: "ADMIN",
      wallet: { create: { balance: 0, currency: "GHS" } },
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "kofi@example.com" },
    update: {},
    create: {
      email: "kofi@example.com",
      password: customerPassword,
      firstName: "Kofi",
      lastName: "Mensah",
      phone: "+233201234567",
      role: "CUSTOMER",
      wallet: { create: { balance: 1200, currency: "GHS" } },
    },
  });
  console.log(`Demo customer created: ${customer.email}`);

  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { slug: "accra" },
      update: {},
      create: {
        name: "Accra", country: "Ghana", slug: "accra",
        description: "The vibrant capital city of Ghana blending modern energy with rich traditions. From the historic Jamestown lighthouse to the modern Oxford Street, Accra offers a fascinating blend of old and new.",
        imageUrl: "https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=800&q=80",
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { slug: "cape-coast" },
      update: {},
      create: {
        name: "Cape Coast", country: "Ghana", slug: "cape-coast",
        description: "Historic coastal city home to UNESCO World Heritage castles and the stunning Kakum National Park canopy walkway.",
        imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { slug: "kumasi" },
      update: {},
      create: {
        name: "Kumasi", country: "Ghana", slug: "kumasi",
        description: "Heart of the Ashanti Kingdom with rich cultural heritage, the Manhyia Palace, and the famous Kejetia Market.",
        imageUrl: "https://images.unsplash.com/photo-1504736038806-94bd1115084e?w=800&q=80",
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { slug: "volta-region" },
      update: {},
      create: {
        name: "Volta Region", country: "Ghana", slug: "volta-region",
        description: "Breathtaking waterfalls, mountains, and lush tropical landscapes including the famous Wli Waterfalls.",
        imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
        featured: true,
      },
    }),
    prisma.destination.upsert({
      where: { slug: "northern-region" },
      update: {},
      create: {
        name: "Northern Region", country: "Ghana", slug: "northern-region",
        description: "Home to Mole National Park \u2014 Ghana's largest wildlife refuge \u2014 and ancient Islamic architecture.",
        imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
        featured: false,
      },
    }),
    prisma.destination.upsert({
      where: { slug: "dubai" },
      update: {},
      create: {
        name: "Dubai", country: "UAE", slug: "dubai",
        description: "The city of gold offering ultimate luxury, iconic skyscrapers, desert safaris, and world-class shopping.",
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        featured: false,
      },
    }),
  ]);
  console.log(`${destinations.length} destinations created`);

  // Delete existing packages so we can re-seed with enriched data
  await prisma.package.deleteMany({});

  const packages = await Promise.all([
    prisma.package.create({
      data: {
        title: "Cape Coast Heritage Tour",
        slug: "cape-coast-heritage-tour",
        description: "Embark on a journey through Ghana's most historically significant sites. Visit Cape Coast Castle, a UNESCO World Heritage Site, and walk through the haunting dungeons that once held enslaved people. Continue to Elmina Castle, the oldest European building in sub-Saharan Africa. Experience the thrill of Kakum National Park's canopy walkway, suspended 30 meters above the forest floor. This tour is a powerful blend of history, culture, and nature that will leave you forever changed.",
        destinationId: destinations[1].id,
        price: 1500, currency: "GHS", duration: "3 Days / 2 Nights", groupSize: 12,
        included: [
          "Hotel accommodation (2 nights)",
          "All entrance fees to castles & parks",
          "Professional licensed tour guide",
          "Air-conditioned transport from Accra",
          "Breakfast & lunch daily",
          "Kakum canopy walkway experience",
          "Bottled water throughout",
        ],
        excluded: [
          "International flights",
          "Travel insurance",
          "Personal expenses & souvenirs",
          "Dinner",
          "Tips for guides & hotel staff",
        ],
        images: ["https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80"],
        featured: true, active: true,
        highlights: [
          "Walk through the UNESCO World Heritage Cape Coast Castle",
          "Cross the 30-metre-high Kakum canopy walkway",
          "Explore Elmina Castle \u2014 oldest European building in sub-Saharan Africa",
          "Visit local fishing villages along the coast",
          "Taste authentic Fante cuisine",
        ],
        itinerary: [
          {
            day: 1,
            title: "Accra to Cape Coast",
            description: "Depart Accra early morning. Stop at Winneba Junction for snacks. Arrive Cape Coast and check into hotel. Afternoon visit to Cape Coast Castle with guided tour of the dungeons, museum, and ramparts.",
            activities: ["Hotel check-in", "Cape Coast Castle guided tour", "Castle museum visit", "Sunset at the ramparts"],
          },
          {
            day: 2,
            title: "Elmina Castle & Kakum National Park",
            description: "Morning visit to Elmina Castle and the surrounding fishing harbour. Afternoon drive to Kakum National Park for the famous canopy walkway \u2014 a series of seven bridges suspended 30 metres above the rainforest floor.",
            activities: ["Elmina Castle tour", "Elmina fishing harbour walk", "Kakum National Park canopy walkway", "Rainforest nature walk"],
          },
          {
            day: 3,
            title: "Coastal Villages & Return to Accra",
            description: "Morning visit to a local fishing village and the Posuban shrines of Mankessim. Enjoy a farewell Fante lunch before the scenic drive back to Accra.",
            activities: ["Fishing village visit", "Posuban shrine tour", "Fante cuisine lunch", "Scenic return drive to Accra"],
          },
        ],
        hotels: [
          {
            name: "Ridge Royal Hotel",
            rating: 4,
            location: "Cape Coast, near the castle",
            nights: 2,
            amenities: ["Air conditioning", "Free Wi-Fi", "Restaurant & bar", "Swimming pool", "24-hour reception", "Room service"],
          },
        ],
        transportation: {
          type: "Private air-conditioned minibus",
          details: "Comfortable 15-seater Toyota HiAce with reclining seats, charging ports, and onboard cooler.",
          pickup: "Any hotel in Accra (6:00 AM)",
          dropoff: "Any hotel in Accra (approx. 6:00 PM Day 3)",
        },
        amenities: [
          { category: "Comfort", items: ["Air-conditioned vehicle", "Bottled water & snacks", "Comfortable hotel rooms"] },
          { category: "Safety", items: ["Licensed tour guide", "First-aid kit on vehicle", "Travel briefing before departure"] },
          { category: "Extras", items: ["Professional photography tips", "Free souvenir postcard set", "Local SIM card assistance"] },
        ],
      },
    }),
    prisma.package.create({
      data: {
        title: "Accra City Experience",
        slug: "accra-city-experience",
        description: "Discover the heart and soul of Ghana's capital city. From the Kwame Nkrumah Memorial Park to the vibrant streets of Jamestown, experience the energy and culture of Accra like never before. Dive into local markets, taste authentic street food, explore world-class art galleries, and dance to live highlife music.",
        destinationId: destinations[0].id,
        price: 800, currency: "GHS", duration: "2 Days / 1 Night", groupSize: 15,
        included: [
          "Hotel accommodation (1 night)",
          "City tour in air-conditioned vehicle",
          "Professional local guide",
          "All entrance fees",
          "Breakfast & lunch",
          "Street food tasting tour",
          "Bottled water",
        ],
        excluded: ["International flights", "Travel insurance", "Dinner", "Personal shopping", "Tips"],
        images: ["https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=800&q=80"],
        featured: true, active: true,
        highlights: [
          "Visit the Kwame Nkrumah Memorial Park & Mausoleum",
          "Climb the Jamestown Lighthouse for panoramic ocean views",
          "Shop at the bustling Makola Market",
          "Experience the Accra Arts Centre",
          "Enjoy an authentic Ghanaian street food tasting",
        ],
        itinerary: [
          {
            day: 1,
            title: "Heart of Accra",
            description: "Start at the Kwame Nkrumah Memorial Park, then explore the colonial-era buildings of Jamestown and climb the lighthouse. Afternoon at Makola Market followed by a guided street food tasting tour through Osu.",
            activities: ["Kwame Nkrumah Memorial visit", "Jamestown Lighthouse climb", "Makola Market exploration", "Osu street food tasting tour", "Oxford Street evening walk"],
          },
          {
            day: 2,
            title: "Culture & Arts",
            description: "Morning visit to the National Museum of Ghana and the W.E.B. Du Bois Centre. Explore the Accra Arts Centre for local crafts. Afternoon at Labadi Beach before drop-off.",
            activities: ["National Museum tour", "W.E.B. Du Bois Centre visit", "Arts Centre craft shopping", "Labadi Beach relaxation"],
          },
        ],
        hotels: [
          {
            name: "Alisa Hotel North Ridge",
            rating: 4,
            location: "North Ridge, central Accra",
            nights: 1,
            amenities: ["Air conditioning", "Free Wi-Fi", "Restaurant & bar", "Fitness centre", "Business lounge", "Airport shuttle"],
          },
        ],
        transportation: {
          type: "Private air-conditioned minibus",
          details: "Modern Toyota Coaster with PA system, charging ports, and ample luggage space.",
          pickup: "Any hotel/Airbnb in Accra (8:00 AM)",
          dropoff: "Any location in Accra (approx. 4:00 PM Day 2)",
        },
        amenities: [
          { category: "Comfort", items: ["Air-conditioned vehicle", "Cold water & fruit juice", "Comfortable hotel"] },
          { category: "Experience", items: ["Local storyteller guide", "Street food voucher", "Market bargaining tips"] },
          { category: "Extras", items: ["Free city map & guidebook", "Phone charging on bus", "Wi-Fi on vehicle"] },
        ],
      },
    }),
    prisma.package.create({
      data: {
        title: "Volta Region Adventure",
        slug: "volta-region-adventure",
        description: "Experience the breathtaking Wli Waterfalls (the tallest in West Africa), hike Mount Afadja \u2014 the highest peak in Ghana, visit the Tafi Atome Monkey Sanctuary, explore charming villages along Lake Volta, and immerse yourself in the Ewe culture of the Volta Region.",
        destinationId: destinations[3].id,
        price: 2200, currency: "GHS", duration: "4 Days / 3 Nights", groupSize: 10,
        included: [
          "Lodge/hotel accommodation (3 nights)",
          "All entrance & park fees",
          "Certified hiking guide",
          "Air-conditioned transport from Accra",
          "All meals (breakfast, lunch, dinner)",
          "Hiking poles & equipment",
          "Bottled water & energy snacks",
        ],
        excluded: ["International flights", "Travel insurance", "Personal expenses", "Tips", "Alcoholic beverages"],
        images: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80"],
        featured: true, active: true,
        highlights: [
          "Witness the 80-metre Wli Waterfalls \u2014 tallest in West Africa",
          "Summit Mount Afadja (885m) \u2014 Ghana's highest peak",
          "Feed wild monkeys at Tafi Atome Monkey Sanctuary",
          "Cruise on Lake Volta \u2014 one of the world's largest man-made lakes",
          "Experience traditional Ewe drumming & dance",
        ],
        itinerary: [
          {
            day: 1,
            title: "Accra to Hohoe",
            description: "Depart Accra and drive through the scenic Akuapem Ridge. Stop at the Tafi Atome Monkey Sanctuary to interact with sacred mona monkeys. Arrive Hohoe and check into lodge.",
            activities: ["Scenic Akuapem Ridge drive", "Tafi Atome Monkey Sanctuary visit", "Lodge check-in", "Welcome dinner with local cuisine"],
          },
          {
            day: 2,
            title: "Wli Waterfalls",
            description: "Morning hike to the Lower Wli Waterfalls through tropical forest. Swim in the pool at the base. Afternoon option to hike the Upper Falls (more challenging). Evening Ewe drumming & dance performance at the lodge.",
            activities: ["Lower Wli Waterfalls hike", "Waterfall pool swim", "Upper Wli Falls hike (optional)", "Ewe drumming & dance evening"],
          },
          {
            day: 3,
            title: "Mount Afadja Summit",
            description: "Early morning ascent of Mount Afadja (885m), Ghana's highest peak. Enjoy 360-degree views from the summit. Descend and enjoy a celebratory lunch. Afternoon visit to a local Kente weaving community.",
            activities: ["Mount Afadja summit hike", "Summit photography session", "Celebratory lunch", "Kente weaving village visit"],
          },
          {
            day: 4,
            title: "Lake Volta & Return",
            description: "Morning boat cruise on Lake Volta. Visit the Akosombo Dam viewpoint. Scenic drive back to Accra with a stop at Aburi Botanical Gardens.",
            activities: ["Lake Volta boat cruise", "Akosombo Dam viewpoint", "Aburi Botanical Gardens", "Return to Accra"],
          },
        ],
        hotels: [
          {
            name: "Wli Water Heights Lodge",
            rating: 3,
            location: "Wli, near the waterfalls",
            nights: 2,
            amenities: ["Fan-cooled rooms", "Restaurant", "Garden terrace", "Bonfire area", "Hiking gear storage"],
          },
          {
            name: "Chances Hotel Hohoe",
            rating: 4,
            location: "Hohoe town centre",
            nights: 1,
            amenities: ["Air conditioning", "Free Wi-Fi", "Restaurant & bar", "Generator backup", "Laundry service"],
          },
        ],
        transportation: {
          type: "4x4 SUV + boat",
          details: "Toyota Land Cruiser for rough terrain and a motorboat for the Lake Volta cruise. All vehicles equipped with first-aid kits.",
          pickup: "Any hotel in Accra (5:30 AM Day 1)",
          dropoff: "Any hotel in Accra (approx. 7:00 PM Day 4)",
        },
        amenities: [
          { category: "Comfort", items: ["Rugged 4x4 transport", "Bottled water & energy bars", "Lodge accommodation"] },
          { category: "Adventure Gear", items: ["Hiking poles provided", "Rain ponchos", "Insect repellent"] },
          { category: "Extras", items: ["Summit certificate", "Professional group photo", "Local craft souvenir"] },
        ],
      },
    }),
    prisma.package.create({
      data: {
        title: "Kumasi Cultural Immersion",
        slug: "kumasi-cultural-immersion",
        description: "Dive deep into the heart of Ashanti culture. Visit the Manhyia Palace \u2014 seat of the Ashanti King, explore Kejetia Market (the largest open-air market in West Africa), watch master weavers create Kente cloth in Bonwire village, and discover the gold-rich history of the Ashanti Empire.",
        destinationId: destinations[2].id,
        price: 1800, currency: "GHS", duration: "3 Days / 2 Nights", groupSize: 10,
        included: [
          "Hotel accommodation (2 nights)",
          "All entrance & museum fees",
          "Cultural guide with Ashanti heritage",
          "Air-conditioned transport from Accra",
          "Breakfast & lunch",
          "Authentic Kente cloth souvenir",
          "Bottled water",
        ],
        excluded: ["International flights", "Travel insurance", "Dinner", "Personal shopping", "Tips"],
        images: ["https://images.unsplash.com/photo-1504736038806-94bd1115084e?w=800&q=80"],
        featured: false, active: true,
        highlights: [
          "Tour the Manhyia Palace \u2014 home of the Ashanti King",
          "Navigate the vast Kejetia Market with a local guide",
          "Watch Kente cloth being woven in Bonwire village",
          "Visit the Prempeh II Jubilee Museum",
          "Taste fufu and other traditional Ashanti dishes",
        ],
        itinerary: [
          {
            day: 1,
            title: "Accra to Kumasi",
            description: "Morning drive to Kumasi along the Accra-Kumasi highway. Stop at the famous Bonwire Kente weaving village en route. Arrive Kumasi, check into hotel, and enjoy an evening walk through Adum city centre.",
            activities: ["Scenic highway drive", "Bonwire Kente weaving village", "Hotel check-in", "Adum city centre walk"],
          },
          {
            day: 2,
            title: "Royal Ashanti Heritage",
            description: "Morning visit to the Manhyia Palace Museum for a deep dive into Ashanti royal history. Explore the Prempeh II Jubilee Museum. Afternoon immersion in Kejetia Market with a local guide.",
            activities: ["Manhyia Palace Museum tour", "Prempeh II Jubilee Museum", "Kejetia Market guided exploration", "Traditional fufu lunch"],
          },
          {
            day: 3,
            title: "Craft Villages & Return",
            description: "Visit Ntonso Adinkra stamping village and Ahwiaa wood carving village. Purchase authentic crafts directly from artisans. Farewell lunch and return drive to Accra.",
            activities: ["Ntonso Adinkra stamping", "Ahwiaa wood carving village", "Artisan craft shopping", "Return to Accra"],
          },
        ],
        hotels: [
          {
            name: "Golden Tulip Kumasi City",
            rating: 4,
            location: "Ahodwo, Kumasi",
            nights: 2,
            amenities: ["Air conditioning", "Free Wi-Fi", "Swimming pool", "Restaurant & bar", "Gym", "Airport shuttle", "Conference facilities"],
          },
        ],
        transportation: {
          type: "Private air-conditioned minibus",
          details: "Comfortable Mercedes Sprinter with reclining seats, USB charging, and onboard cooler.",
          pickup: "Any hotel in Accra (6:30 AM Day 1)",
          dropoff: "Any hotel in Accra (approx. 7:00 PM Day 3)",
        },
        amenities: [
          { category: "Comfort", items: ["Air-conditioned vehicle", "Bottled water & local snacks", "4-star hotel"] },
          { category: "Cultural", items: ["Ashanti heritage guide", "Kente cloth souvenir", "Adinkra print demo"] },
          { category: "Extras", items: ["Market bargaining assistance", "Local SIM card setup", "Group photo album"] },
        ],
      },
    }),
    prisma.package.create({
      data: {
        title: "Northern Ghana Safari",
        slug: "northern-ghana-safari",
        description: "Discover Mole National Park \u2014 Ghana's largest wildlife refuge \u2014 with walking safaris, jeep tours, and a chance to spot elephants, antelopes, baboons, warthogs, and over 300 bird species. Visit the ancient Larabanga Mosque (one of the oldest in West Africa) and explore the vibrant city of Tamale.",
        destinationId: destinations[4].id,
        price: 3500, currency: "GHS", duration: "5 Days / 4 Nights", groupSize: 8,
        included: [
          "Safari lodge accommodation (4 nights)",
          "Two jeep safari game drives",
          "Walking safari with armed ranger",
          "Professional wildlife guide",
          "All meals at the lodge",
          "Internal flight Accra\u2013Tamale (or VIP bus)",
          "Park entrance fees",
          "Bottled water",
        ],
        excluded: ["International flights", "Travel insurance", "Personal expenses", "Camera/drone fees at the park", "Alcoholic beverages", "Tips"],
        images: ["https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80"],
        featured: false, active: true,
        highlights: [
          "Spot elephants, antelopes, and baboons on a walking safari",
          "Sunrise & sunset jeep game drives",
          "Visit the 600-year-old Larabanga Mosque",
          "Swim in the Mole motel infinity pool overlooking the savanna",
          "Experience Northern Ghanaian hospitality in Tamale",
        ],
        itinerary: [
          {
            day: 1,
            title: "Accra to Tamale",
            description: "Early morning flight (or VIP bus) from Accra to Tamale. Arrive and tour the Tamale cultural centre and central mosque. Drive to Mole National Park, arriving at the lodge by evening.",
            activities: ["Flight to Tamale", "Tamale cultural centre visit", "Drive to Mole National Park", "Lodge check-in & sunset viewing"],
          },
          {
            day: 2,
            title: "Walking Safari & Larabanga",
            description: "Early morning walking safari with an armed ranger through the savanna. Spot elephants, antelopes, and warthogs up close. Afternoon visit to Larabanga \u2014 one of the oldest mosques in West Africa.",
            activities: ["Walking safari (3 hours)", "Wildlife spotting", "Larabanga Mosque visit", "Larabanga Mystic Stone"],
          },
          {
            day: 3,
            title: "Jeep Safari Game Drives",
            description: "Sunrise jeep game drive through the park's northern sector. Return for breakfast and pool time. Sunset game drive targeting elephants at the watering holes.",
            activities: ["Sunrise jeep game drive", "Pool & relaxation", "Bird watching session", "Sunset game drive"],
          },
          {
            day: 4,
            title: "Mole Exploration",
            description: "Morning canoe ride on the Mole reservoir. Afternoon nature walk with the park's ecologist to learn about medicinal plants. Evening bonfire with traditional Northern drumming.",
            activities: ["Reservoir canoe ride", "Medicinal plants nature walk", "Traditional drumming evening", "Stargazing session"],
          },
          {
            day: 5,
            title: "Return to Accra",
            description: "Final morning game viewing from the lodge terrace. Depart for Tamale airport. Afternoon flight back to Accra.",
            activities: ["Morning game viewing", "Drive to Tamale", "Flight to Accra"],
          },
        ],
        hotels: [
          {
            name: "Mole Motel (Zaina Lodge style)",
            rating: 3,
            location: "Inside Mole National Park, overlooking two watering holes",
            nights: 4,
            amenities: ["Fan & AC rooms available", "Infinity pool", "Restaurant with bush views", "Wildlife viewing terrace", "Gift shop", "Generator power"],
          },
        ],
        transportation: {
          type: "Domestic flight + 4x4 SUV",
          details: "Return flights Accra\u2013Tamale on Africa World Airlines. 4x4 Land Cruiser for park transfers and game drives with pop-up roof for photography.",
          pickup: "Kotoka International Airport, Accra (6:00 AM Day 1)",
          dropoff: "Kotoka International Airport, Accra (approx. 5:00 PM Day 5)",
        },
        amenities: [
          { category: "Comfort", items: ["Safari lodge with pool", "All meals included", "Bottled water & soft drinks"] },
          { category: "Safari Gear", items: ["Binoculars available", "Wildlife identification guide", "Pop-up roof 4x4"] },
          { category: "Extras", items: ["Safari certificate", "Digital photo album", "Wildlife checklist booklet"] },
        ],
      },
    }),
    prisma.package.create({
      data: {
        title: "Dubai Luxury Escape",
        slug: "dubai-luxury-escape",
        description: "Experience the opulence of Dubai with visits to Burj Khalifa (the world's tallest building), an exhilarating desert safari with dune bashing, a Dubai Marina luxury yacht cruise, world-class shopping at Dubai Mall, and a traditional Arabian dinner in Old Dubai's Al Fahidi district.",
        destinationId: destinations[5].id,
        price: 15000, currency: "GHS", duration: "7 Days / 6 Nights", groupSize: 6,
        included: [
          "5-star hotel accommodation (6 nights)",
          "Return flights Accra\u2013Dubai",
          "Private airport transfers",
          "Desert safari with BBQ dinner",
          "Burj Khalifa 'At the Top' tickets",
          "Dubai Marina yacht cruise",
          "Daily buffet breakfast",
          "Full-day city tour",
          "Dhow cruise dinner",
          "Dubai Mall & Aquarium access",
        ],
        excluded: ["UAE visa fees", "Travel insurance", "Lunch & most dinners", "Shopping expenses", "Personal expenses", "Tips & gratuities"],
        images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80"],
        featured: false, active: true,
        highlights: [
          "Visit the Burj Khalifa observation deck \u2014 124th floor views",
          "Desert safari with dune bashing, camel rides & BBQ dinner",
          "Private yacht cruise along Dubai Marina at sunset",
          "Shop at Dubai Mall \u2014 the world's largest shopping centre",
          "Traditional dhow cruise dinner on Dubai Creek",
          "Visit the Gold & Spice Souks of Old Dubai",
        ],
        itinerary: [
          {
            day: 1,
            title: "Arrival in Dubai",
            description: "Arrive at Dubai International Airport. Private transfer to your 5-star hotel. Evening at leisure to explore the JBR beach walk and have dinner with views of Ain Dubai (the world's largest observation wheel).",
            activities: ["Airport pickup & hotel transfer", "Hotel check-in", "JBR Beach Walk", "Welcome dinner"],
          },
          {
            day: 2,
            title: "Old & New Dubai City Tour",
            description: "Full-day guided city tour. Morning in Old Dubai: Al Fahidi Heritage Village, Dubai Museum, Gold Souk, and Spice Souk. Cross the creek by traditional abra boat. Afternoon: Jumeirah Mosque (exterior), Burj Al Arab photo stop, Atlantis The Palm.",
            activities: ["Al Fahidi Heritage Village", "Dubai Museum", "Gold & Spice Souk", "Abra boat ride", "Jumeirah Mosque", "Burj Al Arab photo stop"],
          },
          {
            day: 3,
            title: "Burj Khalifa & Dubai Mall",
            description: "Morning visit to Burj Khalifa 'At the Top' observation deck on the 124th floor. Spend the day at Dubai Mall \u2014 shopping, the Dubai Aquarium & Underwater Zoo, and the VR Park. Evening Dubai Fountain show.",
            activities: ["Burj Khalifa observation deck", "Dubai Mall shopping", "Dubai Aquarium", "Dubai Fountain show"],
          },
          {
            day: 4,
            title: "Desert Safari",
            description: "Morning at leisure (pool, spa). Afternoon departure for the Arabian Desert. Experience dune bashing in a 4x4, sandboarding, camel riding, henna painting, and a BBQ dinner under the stars with belly dancing.",
            activities: ["Hotel pool & spa", "Dune bashing in 4x4", "Sandboarding", "Camel riding", "BBQ dinner under the stars", "Belly dance show"],
          },
          {
            day: 5,
            title: "Dubai Marina & Yacht Cruise",
            description: "Morning walk along Dubai Marina. Afternoon private yacht cruise with refreshments, passing Palm Jumeirah and Atlantis. Evening dhow cruise dinner on Dubai Creek with traditional entertainment.",
            activities: ["Dubai Marina walk", "Private yacht cruise", "Palm Jumeirah views", "Dhow cruise dinner"],
          },
          {
            day: 6,
            title: "Free Day & Farewell",
            description: "Free day for personal exploration, shopping, or optional activities (skydiving, helicopter tour, Abu Dhabi day trip). Farewell dinner at a rooftop restaurant.",
            activities: ["Free time / optional excursions", "Last-minute shopping", "Farewell rooftop dinner"],
          },
          {
            day: 7,
            title: "Departure",
            description: "Breakfast at hotel. Private transfer to Dubai International Airport for your return flight to Accra.",
            activities: ["Hotel breakfast", "Airport transfer", "Departure flight to Accra"],
          },
        ],
        hotels: [
          {
            name: "JW Marriott Marquis Dubai",
            rating: 5,
            location: "Business Bay, near Downtown Dubai & Burj Khalifa",
            nights: 6,
            amenities: ["Luxury rooms with city views", "Free high-speed Wi-Fi", "Multiple restaurants & bars", "Infinity pool (2 pools)", "Full-service spa & gym", "Concierge & butler service", "Private beach access (shuttle)", "Kids club"],
          },
        ],
        transportation: {
          type: "Private sedan & 4x4 desert vehicle",
          details: "Airport transfers in a Mercedes E-Class. City tours in a luxury Toyota Coaster. Desert safari in a Toyota Land Cruiser. Yacht: 55-ft luxury motor yacht.",
          pickup: "Dubai International Airport (DXB)",
          dropoff: "Dubai International Airport (DXB)",
        },
        amenities: [
          { category: "Luxury", items: ["5-star hotel", "Private airport transfers", "Luxury yacht cruise", "Rooftop dining"] },
          { category: "Adventure", items: ["Desert dune bashing", "Sandboarding", "Camel riding"] },
          { category: "Dining", items: ["Daily breakfast buffet", "Desert BBQ dinner", "Dhow cruise dinner"] },
          { category: "Extras", items: ["Burj Khalifa fast-track tickets", "Dubai Aquarium access", "Professional desert photoshoot"] },
        ],
      },
    }),
  ]);

  console.log(`${packages.length} packages created`);
  console.log("\nSeed completed!");
  console.log("Admin login: admin@tourkings.com / admin123");
  console.log("Customer login: kofi@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
