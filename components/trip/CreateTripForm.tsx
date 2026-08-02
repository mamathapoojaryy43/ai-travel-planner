"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripFormSchema, TripFormData } from "@/types/trip";
import { DestinationAutocomplete } from "@/components/trip/DestinationAutocomplete";
import { BudgetSelector } from "@/components/trip/BudgetSelector";
import { TravelerSelector } from "@/components/trip/TravelerSelector";
import { TravelStyleSelector } from "@/components/trip/TravelStyleSelector";
import { SUPPORTED_CURRENCIES } from "@/services/currencyService";
import { Calendar, Clock, Sparkles, MapPin, DollarSign, Coins } from "lucide-react";

interface CreateTripFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading?: boolean;
}

export function CreateTripForm({ onSubmit, isLoading = false }: CreateTripFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      startDate: new Date().toISOString().split("T")[0],
      duration: 3,
      budget: "moderate",
      travelers: "couple",
      travelStyle: "balanced",
      homeCurrency: "INR",
    },
  });

  const selectedDestination = watch("destination");
  const selectedBudget = watch("budget");
  const selectedTravelers = watch("travelers");
  const selectedTravelStyle = watch("travelStyle");
  const selectedHomeCurrency = watch("homeCurrency");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-6 sm:p-10 rounded-3xl glass-card bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-slate-800 shadow-xl relative z-10"
    >
      <div className="space-y-2 border-b border-pink-100 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Travel Architect</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Plan Your Next Adventure
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Provide your travel choices below to generate a 100% unique, non-repeating itinerary.
        </p>
      </div>

      {/* Row 1: Destination Autocomplete */}
      <DestinationAutocomplete
        value={selectedDestination ? { label: selectedDestination, value: selectedDestination } : null}
        onChange={(location) => setValue("destination", location.value, { shouldValidate: true })}
        error={errors.destination?.message}
      />

      {/* Row 2: Dates, Duration & Home Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Start Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-500">
              <Calendar className="h-5 w-5" />
            </div>
            <input
              type="date"
              {...register("startDate")}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.startDate
                  ? "border-rose-400 focus:ring-rose-400/40"
                  : "border-slate-200 dark:border-slate-800 focus:ring-pink-500/40 focus:border-pink-500"
              }`}
            />
          </div>
          {errors.startDate && (
            <p className="text-xs text-rose-500 font-medium">{errors.startDate.message}</p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Trip Duration (Days)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-500">
              <Clock className="h-5 w-5" />
            </div>
            <input
              type="number"
              min={1}
              max={14}
              {...register("duration", { valueAsNumber: true })}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.duration
                  ? "border-rose-400 focus:ring-rose-400/40"
                  : "border-slate-200 dark:border-slate-800 focus:ring-pink-500/40 focus:border-pink-500"
              }`}
            />
          </div>
          {errors.duration && (
            <p className="text-xs text-rose-500 font-medium">{errors.duration.message}</p>
          )}
        </div>

        {/* Home Currency Selection */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Home Currency
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
              <Coins className="h-5 w-5" />
            </div>
            <select
              value={selectedHomeCurrency}
              onChange={(e) => setValue("homeCurrency", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Row 3: Budget Selector */}
      <BudgetSelector
        value={selectedBudget}
        onChange={(val) => setValue("budget", val, { shouldValidate: true })}
        error={errors.budget?.message}
      />

      {/* Row 4: Travelers Selector */}
      <TravelerSelector
        value={selectedTravelers}
        onChange={(val) => setValue("travelers", val, { shouldValidate: true })}
        error={errors.travelers?.message}
      />

      {/* Row 5: Travel Style Selector */}
      <TravelStyleSelector
        value={selectedTravelStyle}
        onChange={(val) => setValue("travelStyle", val, { shouldValidate: true })}
        error={errors.travelStyle?.message}
      />

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl pink-gradient-button font-extrabold text-base flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5" />
          <span>{isLoading ? "Generating Unique AI Itinerary..." : "Generate AI Travel Itinerary"}</span>
        </button>
      </div>

    </form>
  );
}
