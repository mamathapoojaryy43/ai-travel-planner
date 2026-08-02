"use client";

import { useEffect, useState } from "react";
import { Compass, Sparkles, MapPin, Hotel, Calendar } from "lucide-react";

const LOADING_STEPS = [
  "Analyzing your destination & travel style...",
  "Searching top-rated hotel accommodations...",
  "Curating tourist landmarks & hidden culinary gems...",
  "Structuring hour-by-hour daily itineraries...",
  "Finalizing your personalized AI travel itinerary...",
];

export function GenerationLoadingState({ destination }: { destination: string }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const progressPercentage = Math.round(((currentStepIndex + 1) / LOADING_STEPS.length) * 100);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-center space-y-8 shadow-2xl relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Pulsing Animated Icon */}
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-purple-200 dark:border-purple-900/40 border-t-purple-600 dark:border-t-purple-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Compass className="h-10 w-10 animate-bounce" />
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-3 max-w-md relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Generating Trip for {destination}</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {LOADING_STEPS[currentStepIndex]}
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Progress {progressPercentage}% • Please keep this tab open
        </p>
      </div>

      {/* Floating Animated Features Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-md text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 justify-center">
          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
          <span>Attractions</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <Hotel className="h-3.5 w-3.5 text-sky-500" />
          <span>Hotels</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <Calendar className="h-3.5 w-3.5 text-pink-500" />
          <span>Daily Routes</span>
        </div>
      </div>

    </div>
  );
}
