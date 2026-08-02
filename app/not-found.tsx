import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center p-4 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-lg">
        <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '15s' }} />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Destination Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The page or trip route you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
      >
        <Home className="h-4 w-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
