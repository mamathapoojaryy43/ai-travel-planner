import { Compass } from "lucide-react";

interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ label = "Loading...", fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div className="h-14 w-14 rounded-full border-4 border-purple-200 dark:border-purple-900/40 border-t-purple-600 dark:border-t-purple-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Compass className="h-6 w-6 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
        {label}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingSkeleton({ className = "h-32 w-full" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse ${className}`}
    />
  );
}
