"use client";

import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export type SortOption = "newest" | "oldest" | "duration_desc" | "duration_asc";
export type BudgetFilter = "all" | "cheap" | "moderate" | "luxury";

interface DashboardFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  selectedBudget: BudgetFilter;
  onBudgetChange: (b: BudgetFilter) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function DashboardFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedBudget,
  onBudgetChange,
  onResetFilters,
  hasActiveFilters,
}: DashboardFiltersProps) {
  return (
    <div className="p-6 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by destination..."
            className="w-full pl-9 pr-8 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full md:w-48 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="duration_desc">Duration: Longest</option>
            <option value="duration_asc">Duration: Shortest</option>
          </select>
        </div>

      </div>

      {/* Filter Options & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        
        {/* Budget Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Budget:
          </span>
          {(["all", "cheap", "moderate", "luxury"] as BudgetFilter[]).map((b) => {
            const isActive = selectedBudget === b;
            return (
              <button
                key={b}
                onClick={() => onBudgetChange(b)}
                className={`px-3 py-1 rounded-full font-semibold capitalize transition-all shrink-0 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline self-end sm:self-auto shrink-0"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}

      </div>
    </div>
  );
}
