import Link from "next/link";
import { Compass, Sparkles, MapPin, Calendar, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-pink-50/40 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
      
      {/* Pink Glow Ambient Background Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-pink-300/30 dark:bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center relative z-10 space-y-8 max-w-4xl">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/90 dark:bg-slate-900/90 border border-pink-200/80 dark:border-slate-800 text-pink-600 dark:text-pink-400 text-xs font-bold shadow-sm">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Next-Gen AI Travel Architect</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Plan Your Next Adventure <br />
          <span className="gradient-text-soft">100% Unique Every Day</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Generate customized travel itineraries in seconds. Non-repeating daily attractions, live dual-currency pricing, and interactive OpenStreetMap.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/create-trip"
            className="w-full sm:w-auto px-8 py-4 rounded-full pink-gradient-button font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-300"
          >
            <Compass className="h-5 w-5" />
            <span>Generate Free Itinerary</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/my-trips"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-card bg-white/90 dark:bg-slate-900/90 border border-pink-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>View Saved Dashboard</span>
          </Link>
        </div>

        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          
          <div className="p-5 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-pink-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Unique Daily Themes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Zero repeated attractions or dining spots across different days.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-pink-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">100% Free Maps</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              OpenStreetMap + Leaflet integration with place directions.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-pink-100 dark:border-slate-800 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Dual Currency System</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instant cost conversion between destination & home currencies.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
