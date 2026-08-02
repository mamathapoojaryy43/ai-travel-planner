"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserTrips, deleteTrip as deleteTripApi } from "@/services/tripService";
import { SavedTripDoc } from "@/types/trip";

export function useTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<SavedTripDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userTrips = await getUserTrips(user.uid);
      setTrips(userTrips);
    } catch (err: any) {
      console.error("useTrips fetch error:", err);
      setError(err?.message || "Failed to load saved trips.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const removeTrip = async (tripId: string) => {
    try {
      setError(null);
      await deleteTripApi(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      console.error("useTrips delete error:", err);
      setError(err?.message || "Failed to delete trip.");
      throw err;
    }
  };

  return {
    trips,
    loading,
    error,
    refreshTrips: fetchTrips,
    removeTrip,
  };
}
