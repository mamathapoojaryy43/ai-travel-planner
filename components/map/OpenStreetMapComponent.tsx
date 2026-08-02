"use client";

import dynamic from "next/dynamic";
import { HotelRecommendation, ActivityItem } from "@/types/trip";
import { haversineDistanceKm, isForeignCityName } from "@/services/osmPlacesService";
import { Compass } from "lucide-react";

export interface MapMarkerItem {
  id: string;
  title: string;
  type: "Hotel" | "Attraction" | "Restaurant";
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  price?: string;
  details?: string;
  imageUrl?: string;
}

interface OpenStreetMapComponentProps {
  hotels: HotelRecommendation[];
  activities: ActivityItem[];
  destinationName?: string;
}

// Inner Leaflet Map loaded dynamically client-side only (SSR = false)
const DynamicLeafletMap = dynamic(
  () => import("@/components/map/LeafletMapInner").then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-900 text-center space-y-3">
        <Compass className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Loading OpenStreetMap Canvas...
        </p>
      </div>
    ),
  }
);

export function OpenStreetMapComponent({
  hotels,
  activities,
  destinationName = "Destination",
}: OpenStreetMapComponentProps) {
  // Collect base destination center from first available hotel or activity
  const centerLat = Number(hotels[0]?.geoCoordinates?.lat || activities[0]?.geoCoordinates?.lat) || 20.5937;
  const centerLng = Number(hotels[0]?.geoCoordinates?.lng || activities[0]?.geoCoordinates?.lng) || 78.9629;

  // Filter markers strictly within 35 km radius and reject foreign city names
  const rawMarkers: MapMarkerItem[] = [
    ...hotels.map((h, i) => ({
      id: `hotel-${i}`,
      title: h.name,
      type: "Hotel" as const,
      lat: Number(h.geoCoordinates?.lat) || centerLat,
      lng: Number(h.geoCoordinates?.lng) || centerLng,
      address: h.address,
      rating: h.rating,
      price: h.price,
      details: h.description,
      imageUrl: h.imageUrl,
    })),
    ...activities.map((a, i) => {
      const isDining = a.placeName.toLowerCase().includes("restaurant") || 
                       a.placeName.toLowerCase().includes("cafe") || 
                       a.placeName.toLowerCase().includes("dining") ||
                       a.placeName.toLowerCase().includes("bistro");
      return {
        id: `activity-${i}`,
        title: a.placeName,
        type: isDining ? ("Restaurant" as const) : ("Attraction" as const),
        lat: Number(a.geoCoordinates?.lat) || centerLat,
        lng: Number(a.geoCoordinates?.lng) || centerLng,
        details: a.placeDetails,
        price: a.ticketPricing,
        imageUrl: a.imageUrl,
      };
    }),
  ];

  const validMarkers = rawMarkers.filter((m) => {
    const dist = haversineDistanceKm(centerLat, centerLng, m.lat, m.lng);
    const isForeign = isForeignCityName(m.title, destinationName);
    return dist <= 35 && !isForeign;
  });

  return (
    <div className="relative w-full h-[450px] rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xl">
      <DynamicLeafletMap markers={validMarkers.length > 0 ? validMarkers : rawMarkers.slice(0, 1)} />
    </div>
  );
}
