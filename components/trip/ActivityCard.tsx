"use client";

import { motion } from "framer-motion";
import { ActivityItem } from "@/types/trip";
import { getOpenStreetMapUrl } from "@/lib/open-street-map";
import { formatDualCurrency } from "@/services/currencyService";
import {
  MapPin,
  Clock,
  ExternalLink,
  Coffee,
  Utensils,
  Landmark,
  ShoppingBag,
  Moon,
  Star,
} from "lucide-react";

interface ActivityCardProps {
  activity: ActivityItem;
  index: number;
  destCurrency?: string;
  homeCurrency?: string;
  exchangeRate?: number;
}

export function ActivityCard({
  activity,
  index,
  destCurrency = "INR",
  homeCurrency = "INR",
  exchangeRate,
}: ActivityCardProps) {
  const mapsSearchUrl = getOpenStreetMapUrl(
    activity.geoCoordinates?.lat || 48.8566,
    activity.geoCoordinates?.lng || 2.3522
  );

  const getCategoryIconDetails = (category: string) => {
    switch (category) {
      case "Breakfast":
        return {
          icon: <Utensils className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          emoji: "🍳",
          bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/50",
        };
      case "Lunch":
        return {
          icon: <Utensils className="h-5 w-5 text-pink-600 dark:text-pink-400" />,
          emoji: "🍽️",
          bg: "bg-pink-100 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800/50",
        };
      case "Dinner":
        return {
          icon: <Utensils className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
          emoji: "🍷",
          bg: "bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/50",
        };
      case "Cafe":
        return {
          icon: <Coffee className="h-5 w-5 text-amber-700 dark:text-amber-300" />,
          emoji: "☕",
          bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/50",
        };
      case "Nightlife":
        return {
          icon: <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          emoji: "🍸",
          bg: "bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/50",
        };
      case "Shopping":
        return {
          icon: <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          emoji: "🛍️",
          bg: "bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/50",
        };
      default:
        return {
          icon: <Landmark className="h-5 w-5 text-pink-600 dark:text-pink-400" />,
          emoji: "🏰",
          bg: "bg-pink-100 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800/50",
        };
    }
  };

  const categoryMeta = getCategoryIconDetails(activity.category);
  const ticketVal = activity.ticketPricingValue || parseInt(activity.ticketPricing.replace(/[^0-9]/g, ""), 10) || 0;
  const dualTicket = formatDualCurrency(ticketVal, destCurrency, homeCurrency, exchangeRate);

  const ratingVal = activity.rating || 4.8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="p-5 sm:p-6 rounded-3xl glass-card bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 space-y-4 relative overflow-hidden group"
    >
      {/* Activity Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${categoryMeta.bg} shadow-sm shrink-0 flex items-center justify-center`}>
            {categoryMeta.icon}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 block">
              {categoryMeta.emoji} {activity.category}
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              {activity.placeName}
            </h4>
          </div>
        </div>

        {/* Rating & Map Icon */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{ratingVal}</span>
          </span>

          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Search ${activity.placeName} on OpenStreetMap`}
            className="p-2 rounded-xl bg-pink-50 dark:bg-slate-800 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="View on Map"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Details Description */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {activity.placeDetails}
      </p>

      {/* Meta Grid Badges */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
        {/* Ticket Price */}
        <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1.5 shadow-sm">
          <span>💰</span>
          <span>{dualTicket.fullFormatted}</span>
        </span>

        {/* Best Time & Opening Hours */}
        <span className="px-3 py-1.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 font-medium flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-pink-500" />
          <span>🕒 {activity.bestTimeToVisit} {activity.openingHours ? `(${activity.openingHours})` : ""}</span>
        </span>

        {/* Travel Distance / Time */}
        <span className="px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-purple-500" />
          <span>📌 {activity.timeToTravel}</span>
        </span>
      </div>
    </motion.div>
  );
}
