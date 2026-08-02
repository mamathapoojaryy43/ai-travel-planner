import axios from "axios";

/**
 * OpenStreetMap Nominatim & Overpass POI Service
 * Provides worldwide destination validation, geocoding, and real POI fetching.
 */

export interface OsmLocationResult {
  lat: number;
  lng: number;
  displayName: string;
  country: string;
  state?: string;
  city?: string;
  placeType?: string;
}

export interface OsmPlaceItem {
  name: string;
  category: "Breakfast" | "Attraction" | "Lunch" | "Cafe" | "Dinner" | "Nightlife" | "Shopping" | "Hotel";
  lat: number;
  lng: number;
  address?: string;
  tags?: Record<string, string>;
  distanceKm?: number;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// Major world & Indian cities list for cross-city contamination checks
const MAJOR_CITIES_KEYWORDS = [
  "jaipur", "udaipur", "jodhpur", "jaisalmer", "delhi", "mumbai", "bengaluru", "bangalore",
  "chennai", "hyderabad", "kolkata", "pune", "ahmedabad", "mysuru", "mysore", "mangaluru",
  "mangalore", "kochi", "cochin", "trivandrum", "thiruvananthapuram", "goa", "ooty", "munnar",
  "manali", "shimla", "leh", "srinagar", "darjeeling", "varanasi", "rishikesh", "hampi",
  "pondicherry", "puducherry", "agra", "paris", "london", "rome", "venice", "florence",
  "barcelona", "madrid", "amsterdam", "brussels", "prague", "vienna", "tokyo", "kyoto",
  "osaka", "seoul", "bangkok", "phuket", "singapore", "dubai", "bali", "new york",
  "los angeles", "chicago", "toronto", "vancouver", "sydney", "melbourne", "cape town", "cairo"
];

/**
 * Haversine formula to compute exact distance in kilometers between two GPS coordinates
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Detects if a place name explicitly mentions a foreign city different from the target destination
 */
export function isForeignCityName(placeName: string, targetDestination: string): boolean {
  const nameLower = placeName.toLowerCase();
  const destLower = targetDestination.toLowerCase();

  for (const city of MAJOR_CITIES_KEYWORDS) {
    if (destLower.includes(city)) continue; // Target city is fine
    // If target destination is Udaipur, but place name explicitly contains "jaipur", reject!
    if (nameLower.includes(city)) {
      console.warn(`[Cross-City Contamination Blocked] Rejected "${placeName}" containing foreign city "${city}" for target "${targetDestination}"`);
      return true;
    }
  }
  return false;
}

/**
 * 1. Validate & Geocode any destination worldwide using OpenStreetMap Nominatim API
 */
export async function geocodeDestination(destination: string): Promise<OsmLocationResult | null> {
  const query = destination.trim();
  if (!query) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "TripPlannerAI/1.0 (https://tripplanner.ai)",
      },
      timeout: 8000,
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      const first = response.data[0];
      const lat = parseFloat(first.lat);
      const lng = parseFloat(first.lon);
      const address = first.address || {};

      const detectedCity = address.city || address.town || address.village || address.municipality || address.county || destination;

      return {
        lat,
        lng,
        displayName: first.display_name,
        country: address.country || "",
        state: address.state || address.region || address.county || "",
        city: detectedCity,
        placeType: first.type || first.class || "city",
      };
    }
  } catch (err: any) {
    console.warn(`[OSM Nominatim Geocoding Warning] Failed to geocode "${destination}":`, err?.message || err);
  }

  return null;
}

/**
 * 2. Fetch real POIs strictly within destination radius (max 35 km) using OpenStreetMap Overpass API
 */
export async function fetchNearbyOsmPlaces(
  lat: number,
  lng: number,
  destinationName: string,
  targetMinPlaces: number = 25
): Promise<OsmPlaceItem[]> {
  const MAX_RADIUS_KM = 35; // Maximum allowed search radius (35 km)
  const radiiMeters = [8000, 18000, 35000]; // Radii: 8km, 18km, 35km
  const items: OsmPlaceItem[] = [];
  const seenNames = new Set<string>();

  for (const radius of radiiMeters) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const overpassQuery = `
[out:json][timeout:12];
(
  node["tourism"~"attraction|museum|viewpoint|hotel|information|gallery"](around:${radius},${lat},${lng});
  way["tourism"~"attraction|museum|viewpoint|hotel"](around:${radius},${lat},${lng});
  node["amenity"~"restaurant|cafe|place_of_worship|fast_food|pub"](around:${radius},${lat},${lng});
  node["historic"](around:${radius},${lat},${lng});
  node["natural"~"waterfall|peak|beach|bay"](around:${radius},${lat},${lng});
  node["leisure"~"park|garden"](around:${radius},${lat},${lng});
);
out body center 100;
`;

        const response = await axios.post(endpoint, `data=${encodeURIComponent(overpassQuery)}`, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 10000,
        });

        if (response.data && Array.isArray(response.data.elements)) {
          const rawElements = response.data.elements;

          for (const el of rawElements) {
            const tags = el.tags || {};
            const name = tags.name || tags["name:en"];
            if (!name || seenNames.has(name.toLowerCase())) continue;

            // Reject places mentioning a foreign city
            if (isForeignCityName(name, destinationName)) continue;

            const elLat = el.lat || el.center?.lat || lat;
            const elLng = el.lon || el.center?.lon || lng;

            // Strict distance check: Must be within 35 km of destination center
            const distKm = haversineDistanceKm(lat, lng, elLat, elLng);
            if (distKm > MAX_RADIUS_KM) {
              console.warn(`[OSM Geofence Blocked] Rejected "${name}" (${distKm.toFixed(1)} km from ${destinationName})`);
              continue;
            }

            seenNames.add(name.toLowerCase());

            let category: OsmPlaceItem["category"] = "Attraction";
            if (tags.amenity === "cafe") category = "Cafe";
            else if (tags.amenity === "restaurant" || tags.amenity === "fast_food") category = "Lunch";
            else if (tags.pub === "pub" || tags.amenity === "pub") category = "Dinner";
            else if (tags.tourism === "hotel" || tags.tourism === "guest_house" || tags.tourism === "resort") category = "Hotel";

            items.push({
              name,
              category,
              lat: elLat,
              lng: elLng,
              address: `${name}, ${destinationName}`,
              tags,
              distanceKm: distKm,
            });
          }

          if (items.length >= targetMinPlaces) {
            console.log(`[OSM Overpass Success] Fetched ${items.length} verified POIs for "${destinationName}" at ${radius}m radius.`);
            return items;
          }
        }
      } catch (err: any) {
        console.warn(`[OSM Overpass Warning] Endpoint ${endpoint} failed for ${destinationName} at radius ${radius}m:`, err?.message || err);
      }
    }
  }

  // Secondary Nominatim search fallback if Overpass returned < 10 POIs
  if (items.length < 10) {
    try {
      console.log(`[OSM Nominatim POI Fallback] Querying POIs for "${destinationName}"...`);
      const searchTerms = [
        `attractions in ${destinationName}`,
        `places to visit in ${destinationName}`,
        `restaurants in ${destinationName}`,
        `hotels in ${destinationName}`,
      ];

      for (const st of searchTerms) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(st)}&format=json&limit=10`;
        const res = await axios.get(url, {
          headers: { "User-Agent": "TripPlannerAI/1.0 (https://tripplanner.ai)" },
          timeout: 6000,
        });

        if (Array.isArray(res.data)) {
          for (const item of res.data) {
            const rawName = item.display_name.split(",")[0]?.trim();
            if (!rawName || seenNames.has(rawName.toLowerCase()) || rawName === destinationName) continue;
            if (isForeignCityName(rawName, destinationName)) continue;

            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);

            const distKm = haversineDistanceKm(lat, lng, itemLat, itemLng);
            if (distKm > MAX_RADIUS_KM) continue;

            seenNames.add(rawName.toLowerCase());

            let category: OsmPlaceItem["category"] = "Attraction";
            if (st.includes("restaurant")) category = "Lunch";
            else if (st.includes("hotels")) category = "Hotel";

            items.push({
              name: rawName,
              category,
              lat: itemLat,
              lng: itemLng,
              address: item.display_name,
              distanceKm: distKm,
            });
          }
        }
      }
    } catch (e: any) {
      console.warn("[OSM Nominatim POI Fallback Error]", e?.message || e);
    }
  }

  console.log(`[OSM Total POIs] Found ${items.length} verified POIs for "${destinationName}".`);
  return items;
}
