"use client";

import { useState } from "react";
import Link from "next/link";
import { SavedTripDoc } from "@/types/trip";
import { MapPin, Calendar, Clock, DollarSign, Trash2, ArrowRight, Hotel, Compass } from "lucide-react";

interface TripCardProps {
  trip: SavedTripDoc;
  onDelete: (tripId: string) => Promise<void>;
}

export function TripCard({ trip, onDelete }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { tripDetails, hotels, id } = trip;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (err) {
      console.error("Failed to delete trip card:", err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
      
      {/* Top Banner Accent */}
      <div className="h-3 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        
        {/* Destination & Meta */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-xl flex items-center gap-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              <MapPin className="h-5 w-5 text-indigo-500 shrink-0" />
              <span className="truncate">{tripDetails.destination}</span>
            </h3>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              title="Delete Trip"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-purple-500" />
              {tripDetails.startDate}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              {tripDetails.duration} Days
            </span>
            <span className="flex items-center gap-1 font-medium capitalize">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              {tripDetails.budget}
            </span>
          </div>
        </div>

        {/* Content Highlights Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <Hotel className="h-4 w-4 text-sky-500" />
            {hotels.length} Hotel Recommendations
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold capitalize">
            {tripDetails.travelStyle}
          </span>
        </div>

        {/* Actions Footer */}
        <div className="pt-2">
          <Link
            href={`/trip/${id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow hover:opacity-90 transition-all"
          >
            <span>View Full Itinerary</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="p-6 rounded-3xl glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Delete Trip?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete your trip to <strong>{tripDetails.destination}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
