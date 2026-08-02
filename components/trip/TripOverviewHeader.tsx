"use client";

import { useState } from "react";
import { GeneratedItinerary } from "@/types/trip";
import { formatDualCurrency } from "@/services/currencyService";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Compass,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  PieChart,
  ChevronDown,
  ChevronUp,
  Hotel,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
} from "lucide-react";

interface TripOverviewHeaderProps {
  itinerary: GeneratedItinerary;
  onSaveTrip?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function TripOverviewHeader({
  itinerary,
  onSaveTrip,
  isSaving = false,
  isSaved = false,
}: TripOverviewHeaderProps) {
  const { tripDetails, costBreakdown, destinationCurrency, homeCurrency, exchangeRateToHome } = itinerary;

  const [copied, setCopied] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trip to ${tripDetails.destination}`,
          text: `Check out my ${tripDetails.duration}-day travel itinerary for ${tripDetails.destination}!`,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format dual currency total cost
  const totalCost = costBreakdown
    ? formatDualCurrency(
        costBreakdown.totalDestCurrency,
        destinationCurrency || "USD",
        homeCurrency || "INR",
        exchangeRateToHome
      )
    : formatDualCurrency(800, destinationCurrency || "USD", homeCurrency || "INR");

  return (
    <div className="relative overflow-hidden rounded-3xl glass-card bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Top Banner Gradient Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pink-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Verified AI Itinerary
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {tripDetails.destination}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl border border-pink-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Share Itinerary"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
          </button>

          {onSaveTrip && (
            <button
              onClick={onSaveTrip}
              disabled={isSaving || isSaved}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow ${
                isSaved
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                  : "pink-gradient-button"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>{isSaved ? "Saved to Profile" : isSaving ? "Saving..." : "Save Trip"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Parameter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700/60 flex items-center gap-3">
          <Calendar className="h-4 w-4 text-pink-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Start Date</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tripDetails.startDate}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700/60 flex items-center gap-3">
          <Clock className="h-4 w-4 text-rose-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Duration</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tripDetails.duration} Days</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700/60 flex items-center gap-3">
          <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Budget Tier</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{tripDetails.budget}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700/60 flex items-center gap-3">
          <Users className="h-4 w-4 text-purple-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Travel Group</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{tripDetails.travelers}</span>
          </div>
        </div>
      </div>

      {/* Dual Currency Total Estimated Cost Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-90 block">
              Estimated Total Trip Cost
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold mt-0.5">
              {totalCost.fullFormatted}
            </div>
          </div>

          {costBreakdown && (
            <button
              onClick={() => setShowCostBreakdown(!showCostBreakdown)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold text-white transition-all self-start sm:self-auto"
            >
              <PieChart className="h-4 w-4" />
              <span>{showCostBreakdown ? "Hide Cost Breakdown" : "View Cost Breakdown"}</span>
              {showCostBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Itemized Cost Breakdown Dropdown */}
        {showCostBreakdown && costBreakdown && (
          <div className="pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in text-xs">
            
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md space-y-1">
              <span className="text-white/80 font-medium flex items-center gap-1">
                <Hotel className="h-3.5 w-3.5" /> Accommodation
              </span>
              <p className="font-bold text-sm">
                {formatDualCurrency(costBreakdown.accommodation, destinationCurrency, homeCurrency, exchangeRateToHome).fullFormatted}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md space-y-1">
              <span className="text-white/80 font-medium flex items-center gap-1">
                <Utensils className="h-3.5 w-3.5" /> Food & Dining
              </span>
              <p className="font-bold text-sm">
                {formatDualCurrency(costBreakdown.food, destinationCurrency, homeCurrency, exchangeRateToHome).fullFormatted}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md space-y-1">
              <span className="text-white/80 font-medium flex items-center gap-1">
                <Car className="h-3.5 w-3.5" /> Transport
              </span>
              <p className="font-bold text-sm">
                {formatDualCurrency(costBreakdown.transport, destinationCurrency, homeCurrency, exchangeRateToHome).fullFormatted}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md space-y-1">
              <span className="text-white/80 font-medium flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5" /> Activities & Tickets
              </span>
              <p className="font-bold text-sm">
                {formatDualCurrency(costBreakdown.activities, destinationCurrency, homeCurrency, exchangeRateToHome).fullFormatted}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md space-y-1">
              <span className="text-white/80 font-medium flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" /> Shopping & Misc
              </span>
              <p className="font-bold text-sm">
                {formatDualCurrency(costBreakdown.shopping + costBreakdown.miscellaneous, destinationCurrency, homeCurrency, exchangeRateToHome).fullFormatted}
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
