"use client";

import { motion } from "framer-motion";
import { HotelRecommendation } from "@/types/trip";
import { getOpenStreetMapUrl } from "@/lib/open-street-map";
import { formatDualCurrency } from "@/services/currencyService";
import {
  Building2,
  Star,
  MapPin,
  ExternalLink,
  BedDouble,
  Compass,
  CheckCircle2,
} from "lucide-react";

interface HotelCardProps {
  hotel: HotelRecommendation;
  destCurrency?: string;
  homeCurrency?: string;
  exchangeRate?: number;
}

export function HotelCard({
  hotel,
  destCurrency = "INR",
  homeCurrency = "INR",
  exchangeRate,
}: HotelCardProps) {
  const mapsSearchUrl = getOpenStreetMapUrl(
    hotel.geoCoordinates?.lat || 48.8566,
    hotel.geoCoordinates?.lng || 2.3522
  );

  const priceVal = hotel.priceValue || parseInt(hotel.price.replace(/[^0-9]/g, ""), 10) || 120;
  const dualPrice = formatDualCurrency(priceVal, destCurrency, homeCurrency, exchangeRate);

  const roomType = hotel.roomType || "Deluxe Suite";
  const amenities = hotel.amenities && hotel.amenities.length > 0
    ? hotel.amenities
    : ["Free Wi-Fi", "Breakfast Included", "City View", "Air Conditioning"];
  const distanceFromCenter = hotel.distanceFromCenter || "Central Location";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full rounded-3xl glass-card bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-slate-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 space-y-4 group relative overflow-hidden"
    >
      {/* Decorative Pink Accent Glow Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600" />

      {/* Header Bar with Icon & Rating */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 shadow-sm border border-pink-200/60 dark:border-pink-800/40">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 block">
              Recommended Stay
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
              🏨 {hotel.name}
            </h3>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1 shrink-0 shadow-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{hotel.rating}</span>
        </div>
      </div>

      {/* Address & Distance Metrics */}
      <div className="space-y-1.5 pt-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
          <span className="truncate font-medium">{hotel.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Compass className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span className="font-medium">📌 {distanceFromCenter}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
        {hotel.description}
      </p>

      {/* Room Type & Amenities Tags */}
      <div className="space-y-2 pt-2 border-t border-pink-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <BedDouble className="h-4 w-4 text-pink-500" />
          <span>🛏 Room Type: {roomType}</span>
        </div>

        {/* Amenity Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {amenities.slice(0, 4).map((amenity, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-pink-50 dark:bg-slate-800 text-[11px] font-medium text-pink-700 dark:text-pink-300 border border-pink-100 dark:border-slate-700 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3 text-pink-500" />
              <span>{amenity}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Price Tag Footer & Directions Link */}
      <div className="pt-3 border-t border-pink-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Price per night</span>
          <span className="text-sm font-extrabold text-pink-600 dark:text-pink-400">
            💰 {dualPrice.fullFormatted} / night
          </span>
        </div>

        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${hotel.name} on OpenStreetMap`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 dark:bg-slate-800 text-xs font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <span>View on Map</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
