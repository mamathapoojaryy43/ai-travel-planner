"use client";

import { TravelerOption } from "@/types/trip";
import { User, Heart, Users, Home, Check } from "lucide-react";

const TRAVELER_OPTIONS: TravelerOption[] = [
  {
    id: "just_me",
    title: "Just Me",
    desc: "A solo traveler on a journey of discovery.",
    icon: "🧍",
    peopleCount: "1 Person",
  },
  {
    id: "couple",
    title: "A Couple",
    desc: "Two travelers exploring together in tandem.",
    icon: "💑",
    peopleCount: "2 People",
  },
  {
    id: "family",
    title: "Family",
    desc: "A group of fun-loving family members.",
    icon: "👨‍👩‍👧",
    peopleCount: "3 to 5 People",
  },
  {
    id: "friends",
    title: "Friends",
    desc: "A bunch of thrill-seeking friends.",
    icon: "👥",
    peopleCount: "5+ People",
  },
];

interface TravelerSelectorProps {
  value: "just_me" | "solo" | "couple" | "family" | "friends";
  onChange: (value: "just_me" | "solo" | "couple" | "family" | "friends") => void;
  error?: string;
}

export function TravelerSelector({ value, onChange, error }: TravelerSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        Who are you planning to travel with?
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRAVELER_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                  : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-2xl p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {option.icon}
                </div>
                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {option.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {option.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
