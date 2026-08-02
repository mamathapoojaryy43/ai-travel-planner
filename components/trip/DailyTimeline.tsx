"use client";

import { useState } from "react";
import { DayItinerary } from "@/types/trip";
import { ActivityCard } from "@/components/trip/ActivityCard";
import { formatDualCurrency } from "@/services/currencyService";
import { Calendar, Compass, Sparkles, Clock } from "lucide-react";

interface DailyTimelineProps {
  itinerary: DayItinerary[];
  destCurrency?: string;
  homeCurrency?: string;
  exchangeRate?: number;
}

export function DailyTimeline({
  itinerary,
  destCurrency = "INR",
  homeCurrency = "INR",
  exchangeRate,
}: DailyTimelineProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  const activeDayPlan = itinerary.find((d) => d.day === selectedDay) || itinerary[0];

  const dailyCostVal = activeDayPlan?.estimatedDailyCostValue || 120;
  const dualDailyCost = formatDualCurrency(dailyCostVal, destCurrency, homeCurrency, exchangeRate);

  return (
    <div className="space-y-8">
      
      {/* Day Selector Pill Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {itinerary.map((dayData) => {
          const isActive = dayData.day === selectedDay;
          return (
            <button
              key={dayData.day}
              onClick={() => setSelectedDay(dayData.day)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                isActive
                  ? "pink-gradient-button shadow-lg"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-pink-100 dark:border-slate-800 hover:border-pink-300"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Day {dayData.day}</span>
            </button>
          );
        })}
      </div>

      {/* Active Day Header Banner */}
      {activeDayPlan && (
        <div className="p-6 rounded-3xl glass-card bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 text-xs font-bold mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Day {activeDayPlan.day} Focus</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeDayPlan.theme || `Day ${activeDayPlan.day} Exploration`}
              </h3>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                Estimated Day Cost
              </span>
              <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400">
                {dualDailyCost.fullFormatted}
              </span>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-4 pt-2">
            {activeDayPlan.plan.map((activity, idx) => (
              <ActivityCard
                key={`${activity.placeName}-${idx}`}
                activity={activity}
                index={idx}
                destCurrency={destCurrency}
                homeCurrency={homeCurrency}
                exchangeRate={exchangeRate}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
