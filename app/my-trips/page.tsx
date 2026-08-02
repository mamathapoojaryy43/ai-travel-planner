"use client";

import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { TripCard } from "@/components/trip/TripCard";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardFilters, SortOption, BudgetFilter } from "@/components/dashboard/DashboardFilters";
import { LoadingSkeleton } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { MapPin, Plus, Compass, Search } from "lucide-react";
import Link from "next/link";

export default function MyTripsDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { trips, loading, error, removeTrip, refreshTrips } = useTrips();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>("all");

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedBudget !== "all" || sortBy !== "newest");

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setSelectedBudget("all");
  };

  // Filtered & Sorted Trips
  const processedTrips = useMemo(() => {
    let result = [...trips];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) =>
        t.tripDetails.destination.toLowerCase().includes(q) ||
        t.tripDetails.travelStyle.toLowerCase().includes(q)
      );
    }

    // 2. Budget Filter
    if (selectedBudget !== "all") {
      result = result.filter((t) => t.tripDetails.budget === selectedBudget);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "duration_desc") {
        return b.tripDetails.duration - a.tripDetails.duration;
      }
      if (sortBy === "duration_asc") {
        return a.tripDetails.duration - b.tripDetails.duration;
      }
      return 0;
    });

    return result;
  }, [trips, searchQuery, selectedBudget, sortBy]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-10 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 transition-colors duration-300">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10 space-y-8">
        
        {/* Dashboard Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Travel Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Welcome back, {user?.displayName || "Traveler"}. Manage and explore your AI-generated trips.
            </p>
          </div>

          <Link
            href="/create-trip"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 hover:scale-[1.02] transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Trip</span>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage
            title="Error Loading Dashboard"
            message={error}
            onRetry={refreshTrips}
          />
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LoadingSkeleton className="h-24 w-full" />
              <LoadingSkeleton className="h-24 w-full" />
              <LoadingSkeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <LoadingSkeleton className="h-64 w-full" />
              <LoadingSkeleton className="h-64 w-full" />
              <LoadingSkeleton className="h-64 w-full" />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Summary Metrics */}
            {trips.length > 0 && <DashboardMetrics trips={trips} />}

            {/* Filter & Controls Toolbar */}
            {trips.length > 0 && (
              <DashboardFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selectedBudget={selectedBudget}
                onBudgetChange={setSelectedBudget}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}

            {/* Trips Grid */}
            {processedTrips.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onDelete={removeTrip} />
                ))}
              </div>
            )}

            {/* Filter Empty State */}
            {trips.length > 0 && processedTrips.length === 0 && (
              <div className="p-12 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-md max-w-md mx-auto">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Search className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Trips Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    No saved itineraries match your current search query or budget filter.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-full bg-purple-600 text-white text-xs font-semibold shadow hover:bg-purple-700 transition-colors"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}

            {/* Complete Empty State (Zero Saved Trips) */}
            {trips.length === 0 && (
              <div className="p-12 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-md max-w-xl mx-auto">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Compass className="h-8 w-8 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Trips Saved Yet</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Start exploring! Generate your first customized AI travel itinerary in seconds.
                  </p>
                </div>
                <Link
                  href="/create-trip"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Plan My First Trip</span>
                </Link>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
