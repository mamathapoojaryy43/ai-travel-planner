"use client";

import { TravelStyleOption } from "@/types/trip";
import { Check } from "lucide-react";

const TRAVEL_STYLE_OPTIONS: TravelStyleOption[] = [
  {
    id: "balanced",
    title: "Balanced",
    desc: "Equal mix of sightseeing, relaxation, and dining.",
    icon: "⚖️",
  },
  {
    id: "cultural",
    title: "Cultural & Historical",
    desc: "Museums, historic monuments, local heritage, and arts.",
    icon: "🏛️",
  },
  {
    id: "adventure",
    title: "Adventure & Outdoor",
    desc: "Hiking, nature trails, sports, and outdoor activities.",
    icon: "🧗",
  },
  {
    id: "relaxation",
    title: "Relaxation & Spa",
    desc: "Leisurely pace, beaches, spas, and peaceful vibes.",
    icon: "🏖️",
  },
  {
    id: "foodie",
    title: "Foodie & Culinary",
    desc: "Local street food, wine tasting, markets, and dining.",
    icon: "🍕",
  },
];

interface TravelStyleSelectorProps {
  value: string;
  onChange: (id: "balanced" | "cultural" | "adventure" | "relaxation" | "foodie") => void;
  error?: string;
}

export function TravelStyleSelector({ value, onChange, error }: TravelStyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        What is your travel style?
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TRAVEL_STYLE_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`relative cursor-pointer p-3.5 rounded-2xl border text-center transition-all duration-200 ${
                isSelected
                  ? "bg-pink-50/90 dark:bg-pink-950/50 border-pink-500 shadow-md ring-2 ring-pink-500/30"
                  : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-4.5 w-4.5 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="h-3 w-3" />
                </div>
              )}

              <div className="text-2xl mb-1.5">{option.icon}</div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {option.title}
              </h4>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
