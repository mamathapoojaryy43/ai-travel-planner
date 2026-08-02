"use client";

import { BudgetOption } from "@/types/trip";
import { DollarSign, Check } from "lucide-react";

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: "cheap",
    title: "Cheap / Economy",
    desc: "Stay conscious of costs. Hostels, street food, public transport.",
    icon: "$",
    priceRange: "$ (Budget Friendly)",
  },
  {
    id: "moderate",
    title: "Moderate",
    desc: "Keep costs balanced. 3-star hotels, local restaurants, taxis.",
    icon: "$$",
    priceRange: "$$ (Mid Range)",
  },
  {
    id: "luxury",
    title: "Luxury",
    desc: "Don't worry about cost. High-end 5-star hotels, fine dining, private tours.",
    icon: "$$$",
    priceRange: "$$$ (High End)",
  },
];

interface BudgetSelectorProps {
  value: string;
  onChange: (id: "cheap" | "moderate" | "luxury") => void;
  error?: string;
}

export function BudgetSelector({ value, onChange, error }: BudgetSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        What is your budget preference?
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BUDGET_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`relative cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "bg-purple-50/90 dark:bg-purple-950/50 border-purple-500 shadow-md ring-2 ring-purple-500/30"
                  : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-extrabold flex items-center justify-center text-sm shadow-sm">
                  {option.icon}
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5" />
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
