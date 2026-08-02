import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { TripFormData, GeneratedItinerary, ActivityItem, HotelRecommendation, DayItinerary } from "@/types/trip";
import { applyPricingEngine } from "@/utils/priceEngine";
import { geocodeDestination, fetchNearbyOsmPlaces, OsmPlaceItem, OsmLocationResult, haversineDistanceKm, isForeignCityName } from "@/services/osmPlacesService";

const apiKey = (process.env.GEMINI_API_KEY || "").trim();

// Check if a non-placeholder GEMINI_API_KEY is configured
const hasConfiguredKey = Boolean(
  apiKey &&
    apiKey !== "your_gemini_api_key" &&
    apiKey !== "your_gemini_api_key_here" &&
    apiKey.length > 5
);

const geoCoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const hotelRecommendationSchema = z.object({
  name: z.string(),
  address: z.string(),
  price: z.string().optional().default("₹0/night"),
  priceValue: z.number().optional().default(0),
  imageUrl: z.string().optional(),
  geoCoordinates: geoCoordinatesSchema,
  rating: z.number(),
  description: z.string(),
  roomType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  distanceFromCenter: z.string().optional(),
});

const activityItemSchema = z.object({
  placeName: z.string(),
  category: z.enum(["Breakfast", "Attraction", "Lunch", "Cafe", "Dinner", "Nightlife", "Shopping"]),
  placeDetails: z.string(),
  imageUrl: z.string().optional(),
  geoCoordinates: geoCoordinatesSchema,
  ticketPricing: z.string().optional().default("Free"),
  ticketPricingValue: z.number().optional().default(0),
  timeToTravel: z.string(),
  bestTimeToVisit: z.string(),
  openingHours: z.string().optional(),
  timeRequired: z.string().optional(),
  distanceFromPrevious: z.string().optional(),
  rating: z.number().optional(),
  address: z.string().optional(),
});

const dayItinerarySchema = z.object({
  day: z.number(),
  theme: z.string(),
  estimatedDailyCost: z.string().optional().default("₹0"),
  estimatedDailyCostValue: z.number().optional().default(0),
  breakfast: activityItemSchema.optional(),
  morningAttraction: activityItemSchema.optional(),
  lunch: activityItemSchema.optional(),
  afternoonAttraction: activityItemSchema.optional(),
  cafe: activityItemSchema.optional(),
  eveningAttraction: activityItemSchema.optional(),
  dinner: activityItemSchema.optional(),
  nightActivity: activityItemSchema.optional(),
  plan: z.array(activityItemSchema),
});

const costBreakdownSchema = z.object({
  accommodation: z.number().optional().default(0),
  food: z.number().optional().default(0),
  transport: z.number().optional().default(0),
  activities: z.number().optional().default(0),
  shopping: z.number().optional().default(0),
  miscellaneous: z.number().optional().default(0),
  totalDestCurrency: z.number().optional().default(0),
  totalHomeCurrency: z.number().optional().default(0),
});

export const generatedItinerarySchema = z.object({
  tripDetails: z.object({
    destination: z.string(),
    startDate: z.string(),
    duration: z.number(),
    budget: z.enum(["cheap", "moderate", "luxury"]),
    travelers: z.enum(["just_me", "solo", "couple", "family", "friends"]),
    travelStyle: z.enum(["balanced", "cultural", "adventure", "relaxation", "foodie"]),
    homeCurrency: z.string().optional(),
  }),
  destinationCurrency: z.string(),
  destinationCurrencySymbol: z.string(),
  homeCurrency: z.string(),
  homeCurrencySymbol: z.string(),
  exchangeRateToHome: z.number(),
  costBreakdown: costBreakdownSchema,
  hotels: z.array(hotelRecommendationSchema),
  itinerary: z.array(dayItinerarySchema),
  travelTips: z.array(z.string()).optional(),
});

// Official Free Gemini Models List
const FREE_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
];

/**
 * MANDATORY POST-VALIDATION SANITIZER
 * Verifies every hotel, attraction, restaurant, cafe, and map marker.
 * Rejects any place > 35 km away from destination center or containing foreign city names.
 */
export function validateAndCleanItinerary(
  itinerary: GeneratedItinerary,
  destLocation: OsmLocationResult,
  realPlaces: OsmPlaceItem[]
): GeneratedItinerary {
  const centerLat = destLocation.lat;
  const centerLng = destLocation.lng;
  const targetCity = destLocation.city || destLocation.displayName.split(",")[0]?.trim() || "Destination";
  const MAX_RADIUS_KM = 35;

  console.log(`[WanderAI Sanitizer] Validating itinerary against center (${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}) for "${targetCity}"...`);

  // Pools of verified OSM POIs by category
  const osmHotels = realPlaces.filter((p) => p.category === "Hotel");
  const osmAttractions = realPlaces.filter((p) => p.category === "Attraction");
  const osmLunch = realPlaces.filter((p) => p.category === "Lunch");
  const osmCafes = realPlaces.filter((p) => p.category === "Cafe");
  const osmDinner = realPlaces.filter((p) => p.category === "Dinner");

  const seenPlaceNames = new Set<string>();

  // 1. Clean & Validate Hotels
  const cleanedHotels: HotelRecommendation[] = itinerary.hotels.map((hotel, idx) => {
    const lat = Number(hotel.geoCoordinates?.lat) || centerLat;
    const lng = Number(hotel.geoCoordinates?.lng) || centerLng;
    const distKm = haversineDistanceKm(centerLat, centerLng, lat, lng);
    const isForeign = isForeignCityName(hotel.name, targetCity) || isForeignCityName(hotel.address || "", targetCity);

    if (distKm <= MAX_RADIUS_KM && !isForeign) {
      seenPlaceNames.add(hotel.name.toLowerCase());
      return hotel;
    }

    console.warn(`[Sanitizer Alert] Hotel "${hotel.name}" failed validation (Distance: ${distKm.toFixed(1)}km, Foreign: ${isForeign}). Replacing...`);

    const osmReplacement = osmHotels[idx % Math.max(1, osmHotels.length)];
    if (osmReplacement && !seenPlaceNames.has(osmReplacement.name.toLowerCase())) {
      seenPlaceNames.add(osmReplacement.name.toLowerCase());
      return {
        ...hotel,
        name: osmReplacement.name,
        address: `${osmReplacement.name}, ${targetCity}`,
        geoCoordinates: { lat: osmReplacement.lat, lng: osmReplacement.lng },
      };
    }

    // Dynamic localized fallback hotel
    const cleanName = `${targetCity} ${idx === 0 ? "Grand Heritage Hotel" : idx === 1 ? "Palace View Resort" : "Boutique Stays"}`;
    seenPlaceNames.add(cleanName.toLowerCase());
    return {
      ...hotel,
      name: cleanName,
      address: `Central Promenade, ${targetCity}`,
      geoCoordinates: {
        lat: centerLat + (idx * 0.008 + 0.003),
        lng: centerLng + (idx * 0.006 + 0.004),
      },
    };
  });

  // 2. Clean & Validate Daily Itinerary Activities
  const cleanedDays: DayItinerary[] = itinerary.itinerary.map((day) => {
    const cleanedPlan: ActivityItem[] = day.plan.map((act, actIdx) => {
      const lat = Number(act.geoCoordinates?.lat) || centerLat;
      const lng = Number(act.geoCoordinates?.lng) || centerLng;
      const distKm = haversineDistanceKm(centerLat, centerLng, lat, lng);
      const isForeign = isForeignCityName(act.placeName, targetCity);

      if (distKm <= MAX_RADIUS_KM && !isForeign && !seenPlaceNames.has(act.placeName.toLowerCase())) {
        seenPlaceNames.add(act.placeName.toLowerCase());
        return act;
      }

      console.warn(`[Sanitizer Alert] Activity "${act.placeName}" in Day ${day.day} failed validation (Dist: ${distKm.toFixed(1)}km, Foreign: ${isForeign}). Replacing...`);

      let pool = osmAttractions;
      if (act.category === "Lunch") pool = osmLunch.length ? osmLunch : osmAttractions;
      else if (act.category === "Cafe") pool = osmCafes.length ? osmCafes : osmAttractions;
      else if (act.category === "Dinner") pool = osmDinner.length ? osmDinner : osmLunch;

      const replacement = pool[actIdx % Math.max(1, pool.length)];
      if (replacement && !seenPlaceNames.has(replacement.name.toLowerCase())) {
        seenPlaceNames.add(replacement.name.toLowerCase());
        return {
          ...act,
          placeName: replacement.name,
          address: `${replacement.name}, ${targetCity}`,
          geoCoordinates: { lat: replacement.lat, lng: replacement.lng },
        };
      }

      // Localized clean fallback activity name
      const fallbackName = `${targetCity} ${act.category} ${actIdx + 1}`;
      seenPlaceNames.add(fallbackName.toLowerCase());
      return {
        ...act,
        placeName: fallbackName,
        address: `${fallbackName}, ${targetCity}`,
        geoCoordinates: {
          lat: centerLat + (day.day * 0.005 + actIdx * 0.003),
          lng: centerLng + (day.day * 0.004 + actIdx * 0.002),
        },
      };
    });

    // Sync individual slots with cleaned plan
    return {
      ...day,
      breakfast: cleanedPlan[0] || day.breakfast,
      morningAttraction: cleanedPlan[1] || day.morningAttraction,
      lunch: cleanedPlan[2] || day.lunch,
      afternoonAttraction: cleanedPlan[3] || day.afternoonAttraction,
      cafe: cleanedPlan[4] || day.cafe,
      eveningAttraction: cleanedPlan[5] || day.eveningAttraction,
      dinner: cleanedPlan[6] || day.dinner,
      plan: cleanedPlan,
    };
  });

  console.log(`[WanderAI Sanitizer] Successfully sanitized 100% of itinerary items for "${targetCity}".`);

  return {
    ...itinerary,
    hotels: cleanedHotels,
    itinerary: cleanedDays,
  };
}

/**
 * Generate AI Travel Itinerary using Google Gemini SDK Free Tier Models
 */
export async function generateAIItinerary(formData: TripFormData): Promise<GeneratedItinerary> {
  const homeCurrency = formData.homeCurrency || "INR";

  // 1. OpenStreetMap Destination Validation & Geocoding
  console.log(`[WanderAI OSM Geocoding] Validating destination: "${formData.destination}"...`);
  const location = await geocodeDestination(formData.destination);
  if (!location) {
    throw new Error("We couldn't find this destination. Please check the spelling or try a nearby city.");
  }

  console.log(`[WanderAI OSM POIs] Fetching real nearby POIs for ${formData.destination} (${location.lat}, ${location.lng})...`);
  const realPlaces = await fetchNearbyOsmPlaces(location.lat, location.lng, formData.destination);

  if (!hasConfiguredKey) {
    console.warn("[WanderAI Gemini] GEMINI_API_KEY is missing or unconfigured. Using fallback itinerary generator with OSM data.");
    const fallback = await generateFallbackItinerary(formData, location, realPlaces);
    return validateAndCleanItinerary(fallback, location, realPlaces);
  }

  const targetCity = location.city || formData.destination;

  const realAttractionsStr = realPlaces
    .filter((p) => p.category === "Attraction")
    .map((p) => `${p.name} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`)
    .slice(0, 30)
    .join(", ");

  const realDiningStr = realPlaces
    .filter((p) => p.category === "Lunch" || p.category === "Dinner" || p.category === "Cafe" || p.category === "Breakfast")
    .map((p) => `${p.name} [${p.category}]`)
    .slice(0, 20)
    .join(", ");

  const realHotelsStr = realPlaces
    .filter((p) => p.category === "Hotel")
    .map((p) => p.name)
    .slice(0, 10)
    .join(", ");

  const systemInstruction = `You are a world-class Senior AI Travel Architect.
Generate a detailed 100% UNIQUE travel itinerary for ${formData.destination} (${location.displayName}).

STRICT GEOFENCING MANDATE:
- Target City Coordinates: Lat ${location.lat}, Lng ${location.lng} (${location.country})
- All places MUST belong EXCLUSIVELY to ${targetCity}.
- NEVER include places, hotels, or attractions from neighboring or distant cities (e.g. NEVER include Jaipur for Udaipur, NEVER include Delhi for Mumbai).

REAL DESTINATION CONTEXT FROM OPENSTREETMAP:
- Real Nearby Attractions: ${realAttractionsStr || "Scenic landmarks & cultural sites in " + targetCity}
- Real Nearby Eateries & Cafes: ${realDiningStr || "Popular cafes & restaurants in " + targetCity}
- Real Nearby Accommodations: ${realHotelsStr || "Top rated hotels in " + targetCity}

STRICT CRITICAL RULES:
1. DO NOT GENERATE PRICE NUMBERS OR MONEY VALUES. Set prices to default dummy values; all money values will be computed exclusively by the application Pricing Engine.
2. USE REAL PLACES: Prefer using the real OpenStreetMap attractions, dining, and hotels provided above.
3. REALISTIC HOTELS: Generate real, famous, destination-specific hotel recommendations for ${targetCity} matching the ${formData.budget} budget tier. Include roomType, amenities array, and distanceFromCenter.
4. STRICT ZERO REPEATS: NO attraction, restaurant, cafe, or activity should repeat across any day of the trip. Every single place name MUST be unique.
5. UNIQUE THEMES: Every day MUST have a distinct unique theme.
6. NO PLACE IMAGES: Do not generate fake image URLs. Focus on precise ratings, address, details, and opening hours.
7. Output ONLY raw valid JSON matching the required schema format. Do not surround with markdown blocks.`;

  const promptText = `${systemInstruction}

Travel Parameters:
${JSON.stringify({
  destination: formData.destination,
  durationDays: formData.duration,
  startDate: formData.startDate,
  budgetTier: formData.budget,
  travelersGroup: formData.travelers,
  travelStyle: formData.travelStyle,
  homeCurrency: homeCurrency,
})}`;

  let lastError: any = null;

  // Try official free models in sequence
  for (const modelName of FREE_GEMINI_MODELS) {
    try {
      console.log(`[WanderAI Gemini Stage 1: Request] Calling Gemini API (Model: ${modelName}) for "${formData.destination}"...`);

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptText,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      console.log(`[WanderAI Gemini Stage 2: Response] Received Gemini response text of length: ${responseText.length}`);

      // Clean any markdown backticks if returned
      let cleanJsonStr = responseText.trim();
      if (cleanJsonStr.startsWith("```")) {
        cleanJsonStr = cleanJsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      console.log(`[WanderAI Gemini Stage 3: JSON Parsing] Parsing cleaned JSON string...`);
      const rawJson = JSON.parse(cleanJsonStr);

      console.log(`[WanderAI Gemini Stage 4: Zod Validation] Validating JSON against Zod schema...`);
      const validatedData = generatedItinerarySchema.parse({
        ...rawJson,
        tripDetails: {
          ...formData,
          homeCurrency,
        },
      });

      // Pass through mandatory sanitizer & pricing engine
      const sanitized = validateAndCleanItinerary(validatedData as GeneratedItinerary, location, realPlaces);
      return applyPricingEngine(sanitized);
    } catch (error: any) {
      console.warn(`[WanderAI Gemini Warning] Model ${modelName} failed. Reason:`, error?.message || error);
      lastError = error;
    }
  }

  console.error("[WanderAI Gemini Error] All free Gemini models failed or rate-limited. Falling back safely to OSM location generator.", lastError);
  const fallback = await generateFallbackItinerary(formData, location, realPlaces);
  return validateAndCleanItinerary(fallback, location, realPlaces);
}

/**
 * Intelligent Fallback Generator for Worldwide Destinations using OSM Data
 */
export async function generateFallbackItinerary(
  formData: TripFormData,
  locationInput?: any,
  realPlacesInput?: OsmPlaceItem[]
): Promise<GeneratedItinerary> {
  const homeCurrency = formData.homeCurrency || "INR";

  let location: OsmLocationResult | null = locationInput;
  if (!location) {
    location = await geocodeDestination(formData.destination);
  }

  if (!location) {
    throw new Error("We couldn't find this destination. Please check the spelling or try a nearby city.");
  }

  let realPlaces = realPlacesInput || [];
  if (realPlaces.length === 0) {
    realPlaces = await fetchNearbyOsmPlaces(location.lat, location.lng, formData.destination);
  }

  const isIndia = location.country.toLowerCase().includes("india") || (location.displayName && location.displayName.toLowerCase().includes("india"));
  const destCurrency = isIndia ? "INR" : "USD";
  const destSymbol = isIndia ? "₹" : "$";
  const homeSymbol = homeCurrency === "INR" ? "₹" : homeCurrency === "EUR" ? "€" : "$";
  const exchangeRate = isIndia
    ? (homeCurrency === "INR" ? 1.0 : homeCurrency === "EUR" ? 0.011 : 0.012)
    : (homeCurrency === "INR" ? 83.5 : 1.0);

  const isCheap = formData.budget === "cheap";
  const isLuxury = formData.budget === "luxury";

  const baseLat = location.lat;
  const baseLng = location.lng;
  const targetCity = location.city || formData.destination;

  // Real Hotel Generator per Destination
  const osmHotels = realPlaces.filter((p) => p.category === "Hotel");

  let chosenHotels: HotelRecommendation[] = [];

  for (let i = 0; i < 3; i++) {
    const osmH = osmHotels[i];
    const hotelPrice = isIndia ? (isCheap ? 1800 + i * 400 : isLuxury ? 16000 + i * 2500 : 4500 + i * 800) : (isCheap ? 45 + i * 10 : isLuxury ? 350 + i * 50 : 120 + i * 25);
    const hotelName = osmH ? osmH.name : `${targetCity} ${i === 0 ? "Grand Heritage Hotel & Suites" : i === 1 ? "Boutique Palace Stay" : "Central Park Lodge"}`;
    const hLat = osmH ? osmH.lat : baseLat + (i * 0.006 + 0.002);
    const hLng = osmH ? osmH.lng : baseLng + (i * 0.005 + 0.003);

    chosenHotels.push({
      name: hotelName,
      address: `${hotelName}, ${targetCity}`,
      price: `${destSymbol}${hotelPrice.toLocaleString()}/night`,
      priceValue: hotelPrice,
      geoCoordinates: { lat: hLat, lng: hLng },
      rating: Number((4.6 + (i % 3) * 0.1).toFixed(1)),
      description: `Premier accommodation situated in the heart of ${targetCity} featuring modern amenities and city views.`,
      roomType: isLuxury ? "Executive Suite with City View" : isCheap ? "Deluxe Standard Room" : "Superior City Room",
      amenities: ["Free Wi-Fi", "Air Conditioning", "Breakfast Included", "24/7 Room Service"],
      distanceFromCenter: `${(0.8 + i * 0.6).toFixed(1)} km from ${targetCity} center`,
    });
  }

  // Real Place Pools
  const osmAttractions = realPlaces.filter((p) => p.category === "Attraction");
  const osmLunch = realPlaces.filter((p) => p.category === "Lunch");
  const osmCafes = realPlaces.filter((p) => p.category === "Cafe");
  const osmDinner = realPlaces.filter((p) => p.category === "Dinner");

  const ticketPrice = (base: number) => (isIndia ? `₹${base}` : `$${Math.round(base / 75)}`);

  const uniqueDays: DayItinerary[] = Array.from({ length: formData.duration }, (_, idx) => {
    const dayNum = idx + 1;

    const themeTitles = [
      `Historical Landmarks & Cultural Heritage of ${targetCity}`,
      `Scenic Wonders & Iconic City Views`,
      `Local Flavors, Markets & Culinary Delights`,
      `Nature, Gardens & Hidden Gems`,
      `Architectural Splendors & Museums`,
      `Arts, Craft Centers & Local Shopping`,
      `Relaxing Panoramic Sunset Tour`,
    ];
    const theme = themeTitles[idx % themeTitles.length];

    const getPlace = (pool: OsmPlaceItem[], fallbackName: string, category: OsmPlaceItem["category"], offsetIdx: number) => {
      const p = pool[idx % Math.max(1, pool.length)];
      if (p) {
        return {
          name: p.name,
          lat: p.lat,
          lng: p.lng,
        };
      }
      return {
        name: `${targetCity} ${fallbackName}`,
        lat: baseLat + (idx * 0.005 + offsetIdx * 0.002),
        lng: baseLng + (idx * 0.004 + offsetIdx * 0.003),
      };
    };

    const bktP = getPlace(osmCafes, "Morning Bakery Cafe", "Cafe", 1);
    const mngP = getPlace(osmAttractions, "Central Monument & Gardens", "Attraction", 2);
    const lnchP = getPlace(osmLunch, "Traditional Cuisine Restaurant", "Lunch", 3);
    const aftP = getPlace(osmAttractions, "Heritage Museum & Art Gallery", "Attraction", 4);
    const cafeP = getPlace(osmCafes, "Panoramic Sunset Bistro", "Cafe", 5);
    const eveP = getPlace(osmAttractions, "Evening Promenade & Cultural Square", "Attraction", 6);
    const dnrP = getPlace(osmDinner.length ? osmDinner : osmLunch, "Gourmet Dinner House", "Dinner", 7);

    const bkt: ActivityItem = {
      placeName: bktP.name,
      category: "Breakfast",
      placeDetails: `Start Day ${dayNum} with fresh breakfast at ${bktP.name} in ${targetCity}.`,
      geoCoordinates: { lat: bktP.lat, lng: bktP.lng },
      ticketPricing: ticketPrice(isIndia ? 350 : 20),
      timeToTravel: "10 mins walk",
      bestTimeToVisit: "8:00 AM - 9:30 AM",
      openingHours: "7:30 AM - 11:00 AM",
      rating: 4.6,
      address: `${bktP.name}, ${targetCity}`,
    };

    const morningAttraction: ActivityItem = {
      placeName: mngP.name,
      category: "Attraction",
      placeDetails: `Explore the iconic landmark ${mngP.name} in ${targetCity}.`,
      geoCoordinates: { lat: mngP.lat, lng: mngP.lng },
      ticketPricing: ticketPrice(isIndia ? 250 : 15),
      timeToTravel: "15 mins ride",
      bestTimeToVisit: "10:00 AM - 12:30 PM",
      openingHours: "9:00 AM - 6:00 PM",
      rating: 4.8,
      address: `${mngP.name}, ${targetCity}`,
    };

    const lunch: ActivityItem = {
      placeName: lnchP.name,
      category: "Lunch",
      placeDetails: `Authentic regional lunch at ${lnchP.name}.`,
      geoCoordinates: { lat: lnchP.lat, lng: lnchP.lng },
      ticketPricing: ticketPrice(isIndia ? 600 : 35),
      timeToTravel: "10 mins walk",
      bestTimeToVisit: "1:00 PM - 2:30 PM",
      openingHours: "12:00 PM - 4:00 PM",
      rating: 4.7,
      address: `${lnchP.name}, ${targetCity}`,
    };

    const afternoonAttraction: ActivityItem = {
      placeName: aftP.name,
      category: "Attraction",
      placeDetails: `Discover rich exhibits at ${aftP.name}.`,
      geoCoordinates: { lat: aftP.lat, lng: aftP.lng },
      ticketPricing: ticketPrice(isIndia ? 200 : 12),
      timeToTravel: "12 mins ride",
      bestTimeToVisit: "3:00 PM - 5:00 PM",
      openingHours: "10:00 AM - 5:30 PM",
      rating: 4.7,
      address: `${aftP.name}, ${targetCity}`,
    };

    const cafe: ActivityItem = {
      placeName: cafeP.name,
      category: "Cafe",
      placeDetails: `Relaxing evening coffee at ${cafeP.name}.`,
      geoCoordinates: { lat: cafeP.lat, lng: cafeP.lng },
      ticketPricing: ticketPrice(isIndia ? 300 : 18),
      timeToTravel: "8 mins walk",
      bestTimeToVisit: "5:15 PM - 6:15 PM",
      openingHours: "9:00 AM - 10:00 PM",
      rating: 4.6,
      address: `${cafeP.name}, ${targetCity}`,
    };

    const eveningAttraction: ActivityItem = {
      placeName: eveP.name,
      category: "Attraction",
      placeDetails: `Sunset views and vibrant atmosphere at ${eveP.name}.`,
      geoCoordinates: { lat: eveP.lat, lng: eveP.lng },
      ticketPricing: ticketPrice(isIndia ? 150 : 10),
      timeToTravel: "10 mins walk",
      bestTimeToVisit: "6:30 PM - 7:45 PM",
      openingHours: "6:00 AM - 9:00 PM",
      rating: 4.8,
      address: `${eveP.name}, ${targetCity}`,
    };

    const dinner: ActivityItem = {
      placeName: dnrP.name,
      category: "Dinner",
      placeDetails: `Exquisite dinner experience at ${dnrP.name}.`,
      geoCoordinates: { lat: dnrP.lat, lng: dnrP.lng },
      ticketPricing: ticketPrice(isIndia ? 900 : 50),
      timeToTravel: "10 mins walk",
      bestTimeToVisit: "8:00 PM - 9:30 PM",
      openingHours: "7:00 PM - 11:30 PM",
      rating: 4.8,
      address: `${dnrP.name}, ${targetCity}`,
    };

    const allPlanItems = [
      bkt,
      morningAttraction,
      lunch,
      afternoonAttraction,
      cafe,
      eveningAttraction,
      dinner,
    ];

    const dailyTotal = Math.round(isIndia ? (isCheap ? 1800 : isLuxury ? 6500 : 3250) : (isCheap ? 90 : isLuxury ? 350 : 190));

    return {
      day: dayNum,
      theme,
      estimatedDailyCost: `${destSymbol}${dailyTotal}`,
      estimatedDailyCostValue: dailyTotal,
      breakfast: bkt,
      morningAttraction,
      lunch,
      afternoonAttraction,
      cafe,
      eveningAttraction,
      dinner,
      plan: allPlanItems,
    };
  });

  // Calculate budget realistic totals
  const avgHotelNight = chosenHotels[0]?.priceValue || (isIndia ? (isCheap ? 1800 : isLuxury ? 16000 : 4800) : (isCheap ? 45 : isLuxury ? 350 : 120));
  const hotelTotal = avgHotelNight * formData.duration;
  const foodTotal = Math.round((isIndia ? (isCheap ? 1200 : isLuxury ? 4500 : 2200) : (isCheap ? 40 : isLuxury ? 180 : 90)) * formData.duration);
  const transportTotal = Math.round((isIndia ? (isCheap ? 400 : isLuxury ? 2000 : 800) : (isCheap ? 15 : isLuxury ? 80 : 35)) * formData.duration);
  const activitiesTotal = Math.round((isIndia ? (isCheap ? 800 : isLuxury ? 3500 : 1500) : (isCheap ? 30 : isLuxury ? 150 : 65)) * formData.duration);
  const shoppingTotal = Math.round((isIndia ? (isCheap ? 600 : isLuxury ? 3000 : 1200) : (isCheap ? 25 : isLuxury ? 120 : 50)) * formData.duration);
  const miscTotal = Math.round((isIndia ? (isCheap ? 300 : isLuxury ? 1500 : 600) : (isCheap ? 10 : isLuxury ? 60 : 25)) * formData.duration);

  const grandTotal = hotelTotal + foodTotal + transportTotal + activitiesTotal + shoppingTotal + miscTotal;

  const rawFallback: GeneratedItinerary = {
    tripDetails: {
      ...formData,
      homeCurrency,
    },
    destinationCurrency: destCurrency,
    destinationCurrencySymbol: destSymbol,
    homeCurrency,
    homeCurrencySymbol: homeSymbol,
    exchangeRateToHome: exchangeRate,
    costBreakdown: {
      accommodation: hotelTotal,
      food: foodTotal,
      transport: transportTotal,
      activities: activitiesTotal,
      shopping: shoppingTotal,
      miscellaneous: miscTotal,
      totalDestCurrency: grandTotal,
      totalHomeCurrency: Math.round(grandTotal * exchangeRate),
    },
    hotels: chosenHotels,
    itinerary: uniqueDays,
    travelTips: [
      `Book top attractions in ${targetCity} in advance to avoid long entry lines.`,
      "Keep local currency cash handy for small vendors and street food stalls.",
      "Use OpenStreetMap for reliable offline navigation without cellular data roaming.",
      "Respect local dress codes and customs when visiting sacred cultural sites.",
    ],
  };

  const sanitized = validateAndCleanItinerary(rawFallback, location, realPlaces);
  return applyPricingEngine(sanitized);
}
