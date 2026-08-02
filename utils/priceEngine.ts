import { GeneratedItinerary, ActivityItem, HotelRecommendation } from "@/types/trip";

/**
 * Deterministic Pricing Engine for AI Travel Planner
 * Money values are generated EXCLUSIVELY by this engine, never by AI.
 */

type BudgetTier = "cheap" | "moderate" | "luxury";

interface CategoryPriceConfig {
  cheap: [number, number];
  moderate: [number, number];
  luxury: [number, number];
}

interface RegionPricingTable {
  currency: string;
  symbol: string;
  hotel: CategoryPriceConfig;
  breakfast: CategoryPriceConfig;
  lunch: CategoryPriceConfig;
  dinner: CategoryPriceConfig;
  cafe: CategoryPriceConfig;
  museum: CategoryPriceConfig;
  temple: CategoryPriceConfig;
  fort: CategoryPriceConfig;
  nature: CategoryPriceConfig;
  park: CategoryPriceConfig;
  adventure: CategoryPriceConfig;
  dailyTransport: CategoryPriceConfig;
  dailyShopping: CategoryPriceConfig;
  dailyMisc: CategoryPriceConfig;
}

const REGION_PRICING: Record<string, RegionPricingTable> = {
  // India (INR)
  INR: {
    currency: "INR",
    symbol: "₹",
    hotel: {
      cheap: [1500, 4000],
      moderate: [4000, 9000],
      luxury: [9000, 25000],
    },
    breakfast: {
      cheap: [100, 250],
      moderate: [250, 500],
      luxury: [500, 1200],
    },
    lunch: {
      cheap: [200, 400],
      moderate: [400, 900],
      luxury: [900, 1800],
    },
    dinner: {
      cheap: [300, 700],
      moderate: [700, 1500],
      luxury: [1500, 3500],
    },
    cafe: {
      cheap: [100, 200],
      moderate: [200, 400],
      luxury: [400, 800],
    },
    museum: {
      cheap: [50, 150],
      moderate: [150, 300],
      luxury: [300, 500],
    },
    temple: {
      cheap: [0, 0],
      moderate: [0, 0],
      luxury: [0, 0],
    },
    fort: {
      cheap: [50, 150],
      moderate: [150, 300],
      luxury: [300, 500],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 50],
      luxury: [50, 100],
    },
    park: {
      cheap: [20, 80],
      moderate: [80, 180],
      luxury: [180, 300],
    },
    adventure: {
      cheap: [500, 1200],
      moderate: [1200, 2500],
      luxury: [2500, 5000],
    },
    dailyTransport: {
      cheap: [300, 600],
      moderate: [600, 1200],
      luxury: [1200, 2500],
    },
    dailyShopping: {
      cheap: [400, 800],
      moderate: [800, 1800],
      luxury: [1800, 4000],
    },
    dailyMisc: {
      cheap: [200, 400],
      moderate: [400, 800],
      luxury: [800, 1500],
    },
  },

  // Europe (EUR) - Paris, France, Germany, Italy, Netherlands, Spain
  EUR: {
    currency: "EUR",
    symbol: "€",
    hotel: {
      cheap: [35, 75],
      moderate: [75, 160],
      luxury: [160, 450],
    },
    breakfast: {
      cheap: [4, 8],
      moderate: [8, 15],
      luxury: [15, 28],
    },
    lunch: {
      cheap: [10, 18],
      moderate: [18, 32],
      luxury: [32, 65],
    },
    dinner: {
      cheap: [15, 28],
      moderate: [28, 55],
      luxury: [55, 120],
    },
    cafe: {
      cheap: [3, 6],
      moderate: [6, 12],
      luxury: [12, 22],
    },
    museum: {
      cheap: [5, 12],
      moderate: [12, 22],
      luxury: [22, 35],
    },
    temple: {
      cheap: [0, 0],
      moderate: [0, 5],
      luxury: [5, 10],
    },
    fort: {
      cheap: [6, 12],
      moderate: [12, 20],
      luxury: [20, 35],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 5],
      luxury: [5, 10],
    },
    park: {
      cheap: [0, 4],
      moderate: [4, 10],
      luxury: [10, 18],
    },
    adventure: {
      cheap: [18, 35],
      moderate: [35, 70],
      luxury: [70, 140],
    },
    dailyTransport: {
      cheap: [6, 12],
      moderate: [12, 25],
      luxury: [25, 60],
    },
    dailyShopping: {
      cheap: [15, 30],
      moderate: [30, 70],
      luxury: [70, 180],
    },
    dailyMisc: {
      cheap: [8, 15],
      moderate: [15, 30],
      luxury: [30, 60],
    },
  },

  // Japan (JPY) - Tokyo, Kyoto, Osaka
  JPY: {
    currency: "JPY",
    symbol: "¥",
    hotel: {
      cheap: [4500, 9000],
      moderate: [9000, 20000],
      luxury: [20000, 60000],
    },
    breakfast: {
      cheap: [400, 800],
      moderate: [800, 1500],
      luxury: [1500, 2800],
    },
    lunch: {
      cheap: [800, 1400],
      moderate: [1400, 2500],
      luxury: [2500, 5000],
    },
    dinner: {
      cheap: [1200, 2500],
      moderate: [2500, 5000],
      luxury: [5000, 12000],
    },
    cafe: {
      cheap: [350, 700],
      moderate: [700, 1200],
      luxury: [1200, 2200],
    },
    museum: {
      cheap: [300, 800],
      moderate: [800, 1500],
      luxury: [1500, 3000],
    },
    temple: {
      cheap: [0, 0],
      moderate: [0, 500],
      luxury: [300, 500],
    },
    fort: {
      cheap: [400, 800],
      moderate: [800, 1500],
      luxury: [1500, 2500],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 300],
      luxury: [200, 500],
    },
    park: {
      cheap: [0, 300],
      moderate: [300, 800],
      luxury: [800, 1500],
    },
    adventure: {
      cheap: [1500, 3500],
      moderate: [3500, 5000],
      luxury: [5000, 10000],
    },
    dailyTransport: {
      cheap: [500, 1000],
      moderate: [1000, 2000],
      luxury: [2000, 4500],
    },
    dailyShopping: {
      cheap: [1000, 2500],
      moderate: [2500, 6000],
      luxury: [6000, 15000],
    },
    dailyMisc: {
      cheap: [500, 1000],
      moderate: [1000, 2000],
      luxury: [2000, 4000],
    },
  },

  // USA / Global (USD) - New York, Los Angeles, London, Global
  USD: {
    currency: "USD",
    symbol: "$",
    hotel: {
      cheap: [40, 80],
      moderate: [80, 170],
      luxury: [170, 450],
    },
    breakfast: {
      cheap: [5, 10],
      moderate: [10, 18],
      luxury: [18, 32],
    },
    lunch: {
      cheap: [10, 18],
      moderate: [18, 35],
      luxury: [35, 75],
    },
    dinner: {
      cheap: [15, 30],
      moderate: [30, 60],
      luxury: [60, 130],
    },
    cafe: {
      cheap: [4, 8],
      moderate: [8, 14],
      luxury: [14, 24],
    },
    museum: {
      cheap: [5, 15],
      moderate: [15, 25],
      luxury: [25, 40],
    },
    temple: {
      cheap: [0, 0],
      moderate: [0, 5],
      luxury: [5, 10],
    },
    fort: {
      cheap: [5, 15],
      moderate: [15, 25],
      luxury: [25, 40],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 5],
      luxury: [5, 10],
    },
    park: {
      cheap: [0, 5],
      moderate: [5, 12],
      luxury: [12, 20],
    },
    adventure: {
      cheap: [20, 45],
      moderate: [45, 85],
      luxury: [85, 160],
    },
    dailyTransport: {
      cheap: [8, 15],
      moderate: [15, 30],
      luxury: [30, 70],
    },
    dailyShopping: {
      cheap: [15, 35],
      moderate: [35, 80],
      luxury: [80, 200],
    },
    dailyMisc: {
      cheap: [8, 15],
      moderate: [15, 30],
      luxury: [30, 60],
    },
  },

  // Thailand (THB) - Bangkok, Phuket, Chiang Mai
  THB: {
    currency: "THB",
    symbol: "฿",
    hotel: {
      cheap: [600, 1500],
      moderate: [1500, 3500],
      luxury: [3500, 10000],
    },
    breakfast: {
      cheap: [50, 120],
      moderate: [120, 250],
      luxury: [250, 500],
    },
    lunch: {
      cheap: [80, 180],
      moderate: [180, 400],
      luxury: [400, 900],
    },
    dinner: {
      cheap: [120, 300],
      moderate: [300, 700],
      luxury: [700, 1800],
    },
    cafe: {
      cheap: [50, 100],
      moderate: [100, 200],
      luxury: [200, 400],
    },
    museum: {
      cheap: [50, 150],
      moderate: [150, 300],
      luxury: [300, 500],
    },
    temple: {
      cheap: [0, 50],
      moderate: [50, 100],
      luxury: [100, 200],
    },
    fort: {
      cheap: [50, 150],
      moderate: [150, 300],
      luxury: [300, 500],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 100],
      luxury: [100, 200],
    },
    park: {
      cheap: [20, 50],
      moderate: [50, 150],
      luxury: [150, 300],
    },
    adventure: {
      cheap: [300, 800],
      moderate: [800, 1800],
      luxury: [1800, 3500],
    },
    dailyTransport: {
      cheap: [100, 250],
      moderate: [250, 600],
      luxury: [600, 1200],
    },
    dailyShopping: {
      cheap: [200, 500],
      moderate: [500, 1200],
      luxury: [1200, 3000],
    },
    dailyMisc: {
      cheap: [100, 200],
      moderate: [200, 500],
      luxury: [500, 1000],
    },
  },

  // Singapore (SGD)
  SGD: {
    currency: "SGD",
    symbol: "S$",
    hotel: {
      cheap: [50, 110],
      moderate: [110, 240],
      luxury: [240, 600],
    },
    breakfast: {
      cheap: [4, 8],
      moderate: [8, 15],
      luxury: [15, 28],
    },
    lunch: {
      cheap: [7, 14],
      moderate: [14, 28],
      luxury: [28, 55],
    },
    dinner: {
      cheap: [12, 25],
      moderate: [25, 50],
      luxury: [50, 120],
    },
    cafe: {
      cheap: [4, 8],
      moderate: [8, 14],
      luxury: [14, 22],
    },
    museum: {
      cheap: [5, 12],
      moderate: [12, 22],
      luxury: [22, 35],
    },
    temple: {
      cheap: [0, 0],
      moderate: [0, 0],
      luxury: [0, 5],
    },
    fort: {
      cheap: [5, 12],
      moderate: [12, 20],
      luxury: [20, 35],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 5],
      luxury: [5, 10],
    },
    park: {
      cheap: [0, 5],
      moderate: [5, 14],
      luxury: [14, 25],
    },
    adventure: {
      cheap: [18, 35],
      moderate: [35, 75],
      luxury: [75, 150],
    },
    dailyTransport: {
      cheap: [5, 10],
      moderate: [10, 22],
      luxury: [22, 50],
    },
    dailyShopping: {
      cheap: [15, 35],
      moderate: [35, 80],
      luxury: [80, 200],
    },
    dailyMisc: {
      cheap: [8, 15],
      moderate: [15, 30],
      luxury: [30, 60],
    },
  },

  // Dubai / UAE (AED)
  AED: {
    currency: "AED",
    symbol: "AED ",
    hotel: {
      cheap: [140, 300],
      moderate: [300, 650],
      luxury: [650, 1800],
    },
    breakfast: {
      cheap: [15, 30],
      moderate: [30, 60],
      luxury: [60, 110],
    },
    lunch: {
      cheap: [25, 55],
      moderate: [55, 110],
      luxury: [110, 220],
    },
    dinner: {
      cheap: [40, 90],
      moderate: [90, 180],
      luxury: [180, 450],
    },
    cafe: {
      cheap: [15, 30],
      moderate: [30, 55],
      luxury: [55, 90],
    },
    museum: {
      cheap: [15, 35],
      moderate: [35, 70],
      luxury: [70, 140],
    },
    temple: {
      cheap: [0, 0],
      moderate: [0, 15],
      luxury: [15, 30],
    },
    fort: {
      cheap: [15, 35],
      moderate: [35, 70],
      luxury: [70, 120],
    },
    nature: {
      cheap: [0, 0],
      moderate: [0, 15],
      luxury: [15, 30],
    },
    park: {
      cheap: [5, 20],
      moderate: [20, 50],
      luxury: [50, 90],
    },
    adventure: {
      cheap: [60, 140],
      moderate: [140, 280],
      luxury: [280, 550],
    },
    dailyTransport: {
      cheap: [20, 45],
      moderate: [45, 90],
      luxury: [90, 220],
    },
    dailyShopping: {
      cheap: [50, 120],
      moderate: [120, 280],
      luxury: [280, 700],
    },
    dailyMisc: {
      cheap: [25, 50],
      moderate: [50, 100],
      luxury: [100, 200],
    },
  },
};

/**
 * Detect Region & Currency from Destination Name or Currency string
 */
function getRegionConfig(destCurrency?: string, destination?: string): RegionPricingTable {
  const code = (destCurrency || "").toUpperCase().trim();
  if (code && REGION_PRICING[code]) {
    return REGION_PRICING[code];
  }

  const destLower = (destination || "").toLowerCase();

  if (
    destLower.includes("india") ||
    destLower.includes("goa") ||
    destLower.includes("jaipur") ||
    destLower.includes("manali") ||
    destLower.includes("udaipur") ||
    destLower.includes("delhi") ||
    destLower.includes("mumbai") ||
    destLower.includes("kerala") ||
    destLower.includes("agra") ||
    destLower.includes("taj mahal") ||
    destLower.includes("varanasi") ||
    destLower.includes("ladakh") ||
    destLower.includes("shimla") ||
    destLower.includes("bengaluru")
  ) {
    return REGION_PRICING.INR;
  }

  if (
    destLower.includes("paris") ||
    destLower.includes("france") ||
    destLower.includes("italy") ||
    destLower.includes("rome") ||
    destLower.includes("spain") ||
    destLower.includes("germany") ||
    destLower.includes("amsterdam") ||
    destLower.includes("europe")
  ) {
    return REGION_PRICING.EUR;
  }

  if (
    destLower.includes("tokyo") ||
    destLower.includes("japan") ||
    destLower.includes("kyoto") ||
    destLower.includes("osaka")
  ) {
    return REGION_PRICING.JPY;
  }

  if (
    destLower.includes("thailand") ||
    destLower.includes("bangkok") ||
    destLower.includes("phuket") ||
    destLower.includes("chiang mai")
  ) {
    return REGION_PRICING.THB;
  }

  if (destLower.includes("singapore")) {
    return REGION_PRICING.SGD;
  }

  if (
    destLower.includes("dubai") ||
    destLower.includes("uae") ||
    destLower.includes("abu dhabi")
  ) {
    return REGION_PRICING.AED;
  }

  return REGION_PRICING.USD;
}

/**
 * Deterministic Price Generator using hash/index offset for consistent repeat runs
 */
function getDeterministicPrice(range: [number, number], seedOffset: number = 0): number {
  const [min, max] = range;
  if (min >= max) return min;
  const spread = max - min;
  const hash = Math.abs(seedOffset * 31 + 17) % (spread + 1);
  const val = min + hash;
  // Round nicely
  if (max > 1000) return Math.round(val / 100) * 100 || val;
  if (max > 100) return Math.round(val / 50) * 50 || val;
  if (max > 10) return Math.round(val / 5) * 5 || val;
  return val;
}

/**
 * Identify activity sub-category for price calculations
 */
function getActivityCategoryKey(
  category: string,
  placeName: string
): keyof Omit<RegionPricingTable, "currency" | "symbol"> {
  const catLower = category.toLowerCase();
  const nameLower = placeName.toLowerCase();

  if (catLower === "breakfast") return "breakfast";
  if (catLower === "lunch") return "lunch";
  if (catLower === "dinner") return "dinner";
  if (catLower === "cafe") return "cafe";

  // Temple / Place of worship check
  if (
    nameLower.includes("temple") ||
    nameLower.includes("shrine") ||
    nameLower.includes("gurudwara") ||
    nameLower.includes("church") ||
    nameLower.includes("cathedral") ||
    nameLower.includes("mosque") ||
    nameLower.includes("basilica")
  ) {
    return "temple";
  }

  // Nature / Beach check
  if (
    nameLower.includes("beach") ||
    nameLower.includes("waterfall") ||
    nameLower.includes("lake") ||
    nameLower.includes("viewpoint") ||
    nameLower.includes("promenade") ||
    nameLower.includes("cliff") ||
    nameLower.includes("forest") ||
    nameLower.includes("stepwell")
  ) {
    return "nature";
  }

  // Park check
  if (nameLower.includes("park") || nameLower.includes("garden")) {
    return "park";
  }

  // Fort check
  if (nameLower.includes("fort") || nameLower.includes("palace") || nameLower.includes("castle")) {
    return "fort";
  }

  // Adventure check
  if (
    nameLower.includes("adventure") ||
    nameLower.includes("ropeway") ||
    nameLower.includes("atv") ||
    nameLower.includes("water sports") ||
    nameLower.includes("rafting") ||
    nameLower.includes("safari") ||
    nameLower.includes("cruise") ||
    nameLower.includes("teamlab") ||
    nameLower.includes("skytree")
  ) {
    return "adventure";
  }

  return "museum";
}

/**
 * Strict Bound Validator & Replacer
 */
function validateAndCapPrice(
  val: number,
  catKey: string,
  currency: string
): number {
  if (currency === "INR") {
    if (catKey === "breakfast" && val >= 1500) return 350;
    if (catKey === "lunch" && val >= 2500) return 650;
    if (catKey === "dinner" && val >= 5000) return 1200;
    if (catKey === "cafe" && val >= 1500) return 300;
    if (catKey === "museum" && val >= 3000) return 350;
    if (catKey === "fort" && val >= 3000) return 350;
    if (catKey === "temple" && val > 500) return 0;
    if (catKey === "nature" && val > 300) return 0;
  }
  return val;
}

/**
 * MAIN ENTRYPOINT: Apply Pricing Engine to complete itinerary
 * Strips all AI money values and calculates prices deterministically.
 */
export function applyPricingEngine(itinerary: GeneratedItinerary): GeneratedItinerary {
  const destination = itinerary.tripDetails?.destination || "";
  const budget = (itinerary.tripDetails?.budget || "moderate") as BudgetTier;
  const duration = itinerary.tripDetails?.duration || 3;
  const region = getRegionConfig(itinerary.destinationCurrency, destination);

  const symbol = region.symbol;
  const currency = region.currency;

  // 1. Calculate Hotel Recommendations Prices
  const calculatedHotels: HotelRecommendation[] = itinerary.hotels.map((hotel, idx) => {
    const range = region.hotel[budget] || region.hotel.moderate;
    const priceVal = getDeterministicPrice(range, idx * 7 + hotel.name.length);
    const validatedPrice = validateAndCapPrice(priceVal, "hotel", currency);

    return {
      ...hotel,
      price: `${symbol}${validatedPrice.toLocaleString()}/night`,
      priceValue: validatedPrice,
    };
  });

  // 2. Calculate Activity & Meal Prices per Day
  let placeSeedCounter = 1;
  const calculatedItinerary = itinerary.itinerary.map((day) => {
    const calculatedPlan: ActivityItem[] = day.plan.map((item) => {
      placeSeedCounter++;
      const catKey = getActivityCategoryKey(item.category, item.placeName);
      const range = region[catKey]?.[budget] || region.museum[budget];
      const rawPrice = getDeterministicPrice(range, placeSeedCounter + item.placeName.length);
      const finalPrice = validateAndCapPrice(rawPrice, catKey as string, currency);

      const priceString = finalPrice === 0 ? "Free" : `${symbol}${finalPrice.toLocaleString()}`;

      return {
        ...item,
        ticketPricing: priceString,
        ticketPricingValue: finalPrice,
      };
    });

    const breakfast = calculatedPlan.find((i) => i.category === "Breakfast");
    const morningAttraction = calculatedPlan.find((i) => i.category === "Attraction");
    const lunch = calculatedPlan.find((i) => i.category === "Lunch");
    const afternoonAttraction = calculatedPlan.filter((i) => i.category === "Attraction")[1] || morningAttraction;
    const cafe = calculatedPlan.find((i) => i.category === "Cafe");
    const eveningAttraction = calculatedPlan.filter((i) => i.category === "Attraction")[2] || afternoonAttraction;
    const dinner = calculatedPlan.find((i) => i.category === "Dinner");

    const dailySum = calculatedPlan.reduce((acc, curr) => acc + (curr.ticketPricingValue || 0), 0);

    return {
      ...day,
      estimatedDailyCost: `${symbol}${dailySum.toLocaleString()}`,
      estimatedDailyCostValue: dailySum,
      breakfast,
      morningAttraction,
      lunch,
      afternoonAttraction,
      cafe,
      eveningAttraction,
      dinner,
      plan: calculatedPlan,
    };
  });

  // 3. Compute Itemized Trip Costs (Deterministically Summed)
  const avgHotelPrice = calculatedHotels[0]?.priceValue || getDeterministicPrice(region.hotel[budget], 5);
  const accommodationTotal = avgHotelPrice * duration;

  let foodTotalDaily = 0;
  let activitiesTotalDaily = 0;

  calculatedItinerary.forEach((d) => {
    d.plan.forEach((item) => {
      if (item.category === "Breakfast" || item.category === "Lunch" || item.category === "Dinner" || item.category === "Cafe") {
        foodTotalDaily += item.ticketPricingValue || 0;
      } else {
        activitiesTotalDaily += item.ticketPricingValue || 0;
      }
    });
  });

  const transportDailyRange = region.dailyTransport[budget];
  const shoppingDailyRange = region.dailyShopping[budget];
  const miscDailyRange = region.dailyMisc[budget];

  const transportTotal = getDeterministicPrice(transportDailyRange, 12) * duration;
  const shoppingTotal = getDeterministicPrice(shoppingDailyRange, 18) * duration;
  const miscTotal = getDeterministicPrice(miscDailyRange, 24) * duration;

  const grandTotal = accommodationTotal + foodTotalDaily + activitiesTotalDaily + transportTotal + shoppingTotal + miscTotal;
  const exchangeRate = itinerary.exchangeRateToHome || (currency === "INR" ? 1.0 : 83.5);

  return {
    ...itinerary,
    destinationCurrency: currency,
    destinationCurrencySymbol: symbol,
    costBreakdown: {
      accommodation: accommodationTotal,
      food: foodTotalDaily,
      transport: transportTotal,
      activities: activitiesTotalDaily,
      shopping: shoppingTotal,
      miscellaneous: miscTotal,
      totalDestCurrency: grandTotal,
      totalHomeCurrency: Math.round(grandTotal * exchangeRate),
    },
    hotels: calculatedHotels,
    itinerary: calculatedItinerary,
  };
}
