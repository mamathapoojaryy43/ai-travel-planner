import { z } from "zod";

export const tripFormSchema = z.object({
  destination: z.string().min(2, "Destination city or country is required"),
  startDate: z.string().min(1, "Start date is required"),
  duration: z
    .number({ invalid_type_error: "Duration must be a number" })
    .min(1, "Trip duration must be at least 1 day")
    .max(14, "Trip duration cannot exceed 14 days"),
  budget: z.enum(["cheap", "moderate", "luxury"], {
    required_error: "Please select a budget tier",
  }),
  travelers: z.enum(["just_me", "solo", "couple", "family", "friends"], {
    required_error: "Please select number of travelers",
  }),
  travelStyle: z.enum(["balanced", "cultural", "adventure", "relaxation", "foodie"], {
    required_error: "Please select a travel style",
  }),
  homeCurrency: z.string().default("INR"),
});

export type TripFormData = z.infer<typeof tripFormSchema>;

export interface BudgetOption {
  id: "cheap" | "moderate" | "luxury";
  title: string;
  desc: string;
  icon: string;
  priceRange?: string;
}

export interface TravelerOption {
  id: "just_me" | "solo" | "couple" | "family" | "friends";
  title: string;
  desc: string;
  people?: string;
  icon?: string;
  peopleCount?: string;
}

export interface TravelStyleOption {
  id: "balanced" | "cultural" | "adventure" | "relaxation" | "foodie";
  title: string;
  desc: string;
  icon?: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface HotelRecommendation {
  name: string;
  address: string;
  price: string;
  priceValue?: number;
  imageUrl?: string;
  geoCoordinates: GeoCoordinates;
  rating: number;
  description: string;
  roomType?: string;
  amenities?: string[];
  distanceFromCenter?: string;
}

export interface ActivityItem {
  placeName: string;
  category: "Breakfast" | "Attraction" | "Lunch" | "Cafe" | "Dinner" | "Nightlife" | "Shopping";
  placeDetails: string;
  imageUrl?: string;
  geoCoordinates: GeoCoordinates;
  ticketPricing: string;
  ticketPricingValue?: number;
  timeToTravel: string;
  bestTimeToVisit: string;
  openingHours?: string;
  timeRequired?: string;
  distanceFromPrevious?: string;
  rating?: number;
  address?: string;
}

export interface DayItinerary {
  day: number;
  theme: string;
  estimatedDailyCost: string;
  estimatedDailyCostValue?: number;
  breakfast?: ActivityItem;
  morningAttraction?: ActivityItem;
  lunch?: ActivityItem;
  afternoonAttraction?: ActivityItem;
  cafe?: ActivityItem;
  eveningAttraction?: ActivityItem;
  dinner?: ActivityItem;
  nightActivity?: ActivityItem;
  plan: ActivityItem[];
}

export interface CostBreakdownItem {
  category: "Accommodation" | "Food" | "Transport" | "Activities" | "Shopping" | "Miscellaneous";
  destCurrencyFormatted: string;
  homeCurrencyFormatted: string;
}

export interface EstimatedCostBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  totalDestCurrency: number;
  totalHomeCurrency: number;
}

export interface GeneratedItinerary {
  tripDetails: TripFormData;
  destinationCurrency: string;
  destinationCurrencySymbol: string;
  homeCurrency: string;
  homeCurrencySymbol: string;
  exchangeRateToHome: number;
  costBreakdown: EstimatedCostBreakdown;
  hotels: HotelRecommendation[];
  itinerary: DayItinerary[];
  travelTips?: string[];
}

export interface SavedTripDoc extends GeneratedItinerary {
  id: string;
  tripId: string;
  userId: string;
  destination: string;
  country: string;
  startDate: string;
  duration: number;
  budget: string;
  travelGroup: string;
  travelStyle: string;
  currency: string;
  totalCost: number;
  mapLocations?: Array<{ title: string; type: string; lat: number; lng: number }>;
  createdAt: string;
  updatedAt?: string;
}
