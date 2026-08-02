"use client";

import { useEffect, useState, use } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getTripById } from "@/services/tripService";
import { SavedTripDoc } from "@/types/trip";
import { ItineraryDisplay } from "@/components/trip/ItineraryDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SingleTripPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const [trip, setTrip] = useState<SavedTripDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTripById(tripId);
        if (!data) {
          setError("Trip not found or has been deleted.");
        } else {
          setTrip(data);
        }
      } catch (err: any) {
        console.error("Error loading trip by ID:", err);
        setError(err?.message || "Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [tripId]);

  return (
    <ProtectedRoute>
      <div className="relative min-h-[calc(100vh-4rem)] py-12 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 space-y-8">
          
          {loading && (
            <div className="min-h-[400px] flex items-center justify-center">
              <LoadingSpinner label="Fetching trip details from Firestore..." />
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <ErrorMessage title="Trip Not Found" message={error} />
              <div className="text-center">
                <Link
                  href="/my-trips"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to My Trips</span>
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && trip && (
            <ItineraryDisplay itinerary={trip} isSaved={true} />
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
