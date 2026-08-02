"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Check, Globe, Loader2 } from "lucide-react";
import { LocationOption } from "@/types/index";
import { searchPlacesNominatim } from "@/lib/open-street-map";

const POPULAR_DESTINATIONS: LocationOption[] = [
  // Top Indian Destinations
  { label: "Goa, India", value: "Goa, India", placeId: "goa-in", lat: 15.2993, lng: 74.124 },
  { label: "Jaipur, Rajasthan, India", value: "Jaipur, Rajasthan, India", placeId: "jaipur-in", lat: 26.9124, lng: 75.7873 },
  { label: "Kerala (Munnar), India", value: "Kerala, India", placeId: "kerala-in", lat: 10.0889, lng: 77.0595 },
  { label: "Manali, Himachal Pradesh, India", value: "Manali, Himachal Pradesh, India", placeId: "manali-in", lat: 32.2432, lng: 77.1892 },
  { label: "Udaipur, Rajasthan, India", value: "Udaipur, Rajasthan, India", placeId: "udaipur-in", lat: 24.5854, lng: 73.7125 },
  { label: "Taj Mahal (Agra), India", value: "Agra, Uttar Pradesh, India", placeId: "agra-in", lat: 27.1751, lng: 78.0421 },
  { label: "Varanasi, Uttar Pradesh, India", value: "Varanasi, India", placeId: "varanasi-in", lat: 25.3176, lng: 82.9739 },
  { label: "Ladakh, India", value: "Ladakh, India", placeId: "ladakh-in", lat: 34.1526, lng: 77.5771 },
  { label: "Mumbai, Maharashtra, India", value: "Mumbai, India", placeId: "mumbai-in", lat: 19.076, lng: 72.8777 },
  { label: "New Delhi, India", value: "New Delhi, India", placeId: "delhi-in", lat: 28.6139, lng: 77.209 },

  // International Destinations
  { label: "Paris, France", value: "Paris, France", placeId: "paris-fr", lat: 48.8566, lng: 2.3522 },
  { label: "Tokyo, Japan", value: "Tokyo, Japan", placeId: "tokyo-jp", lat: 35.6762, lng: 139.6503 },
  { label: "New York, USA", value: "New York, USA", placeId: "ny-usa", lat: 40.7128, lng: -74.006 },
  { label: "Bali, Indonesia", value: "Bali, Indonesia", placeId: "bali-id", lat: -8.4095, lng: 115.1889 },
  { label: "Rome, Italy", value: "Rome, Italy", placeId: "rome-it", lat: 41.9028, lng: 12.4964 },
  { label: "London, UK", value: "London, UK", placeId: "london-uk", lat: 51.5074, lng: -0.1278 },
  { label: "Dubai, UAE", value: "Dubai, UAE", placeId: "dubai-uae", lat: 25.2048, lng: 55.2708 },
];

interface DestinationAutocompleteProps {
  value: LocationOption | null;
  onChange: (location: LocationOption) => void;
  error?: string;
}

export function DestinationAutocomplete({
  value,
  onChange,
  error,
}: DestinationAutocompleteProps) {
  const [query, setQuery] = useState(value?.label || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<LocationOption[]>(POPULAR_DESTINATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.label);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);

    if (!text.trim()) {
      setFilteredOptions(POPULAR_DESTINATIONS);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesNominatim(text);
        if (results.length > 0) {
          setFilteredOptions(results);
        } else {
          const fallbackFiltered = POPULAR_DESTINATIONS.filter((item) =>
            item.label.toLowerCase().includes(text.toLowerCase())
          );
          if (!fallbackFiltered.some((item) => item.label.toLowerCase() === text.toLowerCase())) {
            fallbackFiltered.unshift({ label: text, value: text });
          }
          setFilteredOptions(fallbackFiltered);
        }
      } catch {
        const fallbackFiltered = POPULAR_DESTINATIONS.filter((item) =>
          item.label.toLowerCase().includes(text.toLowerCase())
        );
        if (!fallbackFiltered.some((item) => item.label.toLowerCase() === text.toLowerCase())) {
          fallbackFiltered.unshift({ label: text, value: text });
        }
        setFilteredOptions(fallbackFiltered);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelect = (option: LocationOption) => {
    setQuery(option.label);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        Destination City / Country (India & International)
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="h-5 w-5 text-pink-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search destination (e.g. Goa, India or Paris, France)"
          className={`w-full pl-10 pr-10 py-3 rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-rose-400 focus:ring-rose-400/40"
              : "border-slate-200 dark:border-slate-800 focus:ring-pink-500/40 focus:border-pink-500"
          }`}
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-pink-600 dark:text-pink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {!isLoading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 py-2 rounded-2xl glass-card bg-white/95 dark:bg-slate-900/95 border border-pink-200/80 dark:border-slate-800 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Popular Destinations</span>
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <button
                key={`${option.value}-${idx}`}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-pink-50 dark:hover:bg-pink-950/40 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{option.label}</span>
                </div>
                {value?.value === option.value && (
                  <Check className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500">No destinations found</div>
          )}
        </div>
      )}
    </div>
  );
}
