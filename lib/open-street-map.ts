import { LocationOption } from "@/types/index";

// In-Memory Cache to minimize Nominatim API calls and observe rate limits
const nominatimSearchCache = new Map<string, LocationOption[]>();
const nominatimGeocodeCache = new Map<string, { lat: number; lng: number }>();

export interface NominatimPlaceResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

/**
 * Free Place Autocomplete & Search using OpenStreetMap Nominatim API
 */
export async function searchPlacesNominatim(query: string): Promise<LocationOption[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (nominatimSearchCache.has(trimmed)) {
    return nominatimSearchCache.get(trimmed)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&limit=6&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "WanderAI-TravelPlanner/1.0",
        },
      }
    );

    if (!response.ok) return [];

    const data: NominatimPlaceResult[] = await response.json();
    const results: LocationOption[] = data.map((item) => ({
      label: item.display_name,
      value: item.display_name,
      placeId: String(item.place_id),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    nominatimSearchCache.set(trimmed, results);
    return results;
  } catch (err) {
    console.error("Nominatim search error:", err);
    return [];
  }
}

/**
 * Free Geocoding helper using OpenStreetMap Nominatim API
 */
export async function geocodeLocationNominatim(
  placeName: string
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = placeName.trim().toLowerCase();
  if (!trimmed) return null;

  if (nominatimGeocodeCache.has(trimmed)) {
    return nominatimGeocodeCache.get(trimmed)!;
  }

  try {
    const results = await searchPlacesNominatim(trimmed);
    if (results.length > 0 && results[0].lat && results[0].lng) {
      const coords = { lat: results[0].lat, lng: results[0].lng };
      nominatimGeocodeCache.set(trimmed, coords);
      return coords;
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

/**
 * Generate OpenStreetMap Directions & Location URL
 */
export function getOpenStreetMapUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
}
