import { SavedTripDoc } from "@/types/trip";
import { Compass, Calendar, MapPin } from "lucide-react";

interface DashboardMetricsProps {
  trips: SavedTripDoc[];
}

export function DashboardMetrics({ trips }: DashboardMetricsProps) {
  const totalTrips = trips.length;
  const totalDays = trips.reduce((acc, t) => acc + (t.tripDetails.duration || 0), 0);
  const uniqueDestinations = new Set(
    trips.map((t) => t.tripDetails.destination.split(",")[0].trim())
  ).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      <div className="p-5 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Total Trips
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalTrips}
          </span>
        </div>
      </div>

      <div className="p-5 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Total Days Planned
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalDays} Days
          </span>
        </div>
      </div>

      <div className="p-5 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Destinations Visited
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {uniqueDestinations}
          </span>
        </div>
      </div>

    </div>
  );
}
