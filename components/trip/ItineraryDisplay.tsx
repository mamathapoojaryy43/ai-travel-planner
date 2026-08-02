"use client";

import { GeneratedItinerary } from "@/types/trip";
import { TripOverviewHeader } from "@/components/trip/TripOverviewHeader";
import { HotelCard } from "@/components/trip/HotelCard";
import { DailyTimeline } from "@/components/trip/DailyTimeline";
import { TravelTipsCard } from "@/components/trip/TravelTipsCard";
import { OpenStreetMapComponent } from "@/components/map/OpenStreetMapComponent";
import { Hotel, ArrowLeft, Map } from "lucide-react";

interface ItineraryDisplayProps {
  itinerary: GeneratedItinerary;
  onReset?: () => void;
  onSaveTrip?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function ItineraryDisplay({
  itinerary,
  onReset,
  onSaveTrip,
  isSaving = false,
  isSaved = false,
}: ItineraryDisplayProps) {
  // Collect all activities across all days for map display
  const allActivities = itinerary.itinerary.flatMap((d) => d.plan);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Reset / New Trip Action Bar */}
      {onReset && (
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Edit Trip Parameters</span>
          </button>
        </div>
      )}

      {/* Overview Header */}
      <TripOverviewHeader
        itinerary={itinerary}
        onSaveTrip={onSaveTrip}
        isSaving={isSaving}
        isSaved={isSaved}
      />

      {/* Interactive OpenStreetMap Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="h-5.5 w-5.5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive OpenStreetMap</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {itinerary.hotels.length + allActivities.length} Location Pins
          </span>
        </div>

        <OpenStreetMapComponent
          hotels={itinerary.hotels}
          activities={allActivities}
          destinationName={itinerary.tripDetails.destination}
        />
      </div>

      {/* Recommended Hotels Section */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Hotel className="h-6 w-6 text-sky-500" />
            <span>Recommended Accommodations</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Handpicked stay options matching your {itinerary.tripDetails.budget} budget tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {itinerary.hotels.map((hotel, idx) => (
            <HotelCard
              key={`${hotel.name}-${idx}`}
              hotel={hotel}
              destCurrency={itinerary.destinationCurrency}
              homeCurrency={itinerary.homeCurrency}
              exchangeRate={itinerary.exchangeRateToHome}
            />
          ))}
        </div>
      </div>



      {/* Day-by-Day Timeline Section */}
      <DailyTimeline
        itinerary={itinerary.itinerary}
        destCurrency={itinerary.destinationCurrency}
        homeCurrency={itinerary.homeCurrency}
        exchangeRate={itinerary.exchangeRateToHome}
      />

      {/* Travel Tips & Advice Section */}
      <TravelTipsCard destination={itinerary.tripDetails.destination} />

    </div>
  );
}
