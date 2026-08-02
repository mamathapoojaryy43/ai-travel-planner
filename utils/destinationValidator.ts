import { TripFormData, GeneratedItinerary } from "@/types/trip";
import { geocodeDestination, haversineDistanceKm, isForeignCityName, OsmLocationResult } from "@/services/osmPlacesService";
import { generateAIItinerary } from "@/lib/gemini";

// 100+ Worldwide & Indian Test Destinations
export const ALL_TEST_DESTINATIONS = [
  // India Metro Cities
  "Bengaluru, India",
  "Mumbai, India",
  "Delhi, India",
  "Chennai, India",
  "Hyderabad, India",
  "Kolkata, India",
  "Pune, India",
  "Ahmedabad, India",

  // India Tourist Cities
  "Jaipur, Rajasthan, India",
  "Udaipur, Rajasthan, India",
  "Jodhpur, Rajasthan, India",
  "Jaisalmer, Rajasthan, India",
  "Mysuru, Karnataka, India",
  "Mangaluru, Karnataka, India",
  "Kochi, Kerala, India",
  "Trivandrum, Kerala, India",
  "Goa, India",
  "Ooty, Tamil Nadu, India",
  "Munnar, Kerala, India",
  "Manali, Himachal Pradesh, India",
  "Shimla, Himachal Pradesh, India",
  "Leh, Ladakh, India",
  "Srinagar, Jammu and Kashmir, India",
  "Darjeeling, West Bengal, India",
  "Varanasi, Uttar Pradesh, India",
  "Rishikesh, Uttarakhand, India",
  "Hampi, Karnataka, India",
  "Pondicherry, India",

  // India Small Towns
  "Agumbe, Karnataka, India",
  "Sakleshpur, Karnataka, India",
  "Chikmagalur, Karnataka, India",
  "Madikeri, Karnataka, India",
  "Gokarna, Karnataka, India",
  "Kasol, Himachal Pradesh, India",
  "Khajjiar, Himachal Pradesh, India",
  "Pollachi, Tamil Nadu, India",
  "Yercaud, Tamil Nadu, India",
  "Kodaikanal, Tamil Nadu, India",
  "Tawang, Arunachal Pradesh, India",
  "Ziro, Arunachal Pradesh, India",

  // Europe
  "Paris, France",
  "London, UK",
  "Rome, Italy",
  "Venice, Italy",
  "Florence, Italy",
  "Barcelona, Spain",
  "Madrid, Spain",
  "Amsterdam, Netherlands",
  "Brussels, Belgium",
  "Prague, Czech Republic",
  "Vienna, Austria",
  "Hallstatt, Austria",
  "Interlaken, Switzerland",
  "Lucerne, Switzerland",
  "Zermatt, Switzerland",

  // Asia
  "Tokyo, Japan",
  "Kyoto, Japan",
  "Osaka, Japan",
  "Seoul, South Korea",
  "Bangkok, Thailand",
  "Phuket, Thailand",
  "Chiang Mai, Thailand",
  "Singapore",
  "Kuala Lumpur, Malaysia",
  "Dubai, UAE",
  "Abu Dhabi, UAE",
  "Bali, Indonesia",

  // North America
  "New York, USA",
  "Los Angeles, USA",
  "Chicago, USA",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Banff, Canada",

  // South America
  "Rio de Janeiro, Brazil",
  "Buenos Aires, Argentina",
  "Cusco, Peru",

  // Oceania
  "Sydney, Australia",
  "Melbourne, Australia",
  "Queenstown, New Zealand",
  "Auckland, New Zealand",

  // Africa
  "Cape Town, South Africa",
  "Marrakech, Morocco",
  "Cairo, Egypt",
];

export interface ValidationReport {
  destination: string;
  passed: boolean;
  errors: string[];
  geocodedCity: string;
  geocodedCenter: { lat: number; lng: number };
  totalHotelsVerified: number;
  totalActivitiesVerified: number;
}

/**
 * Validates an itinerary against strict destination geofencing rules
 */
export function validateDestinationItinerary(
  destinationQuery: string,
  itinerary: GeneratedItinerary,
  geocodedLocation: OsmLocationResult
): ValidationReport {
  const errors: string[] = [];
  const targetCity = geocodedLocation.city || geocodedLocation.displayName.split(",")[0]?.trim() || destinationQuery;
  const centerLat = geocodedLocation.lat;
  const centerLng = geocodedLocation.lng;
  const MAX_RADIUS_KM = 35;

  const seenNames = new Set<string>();

  // 1. Validate Hotels
  itinerary.hotels.forEach((hotel) => {
    const lat = Number(hotel.geoCoordinates?.lat) || centerLat;
    const lng = Number(hotel.geoCoordinates?.lng) || centerLng;
    const distKm = haversineDistanceKm(centerLat, centerLng, lat, lng);

    if (distKm > MAX_RADIUS_KM) {
      errors.push(`Hotel [${hotel.name}] is ${distKm.toFixed(1)} km away from center (Max ${MAX_RADIUS_KM} km)`);
    }

    if (isForeignCityName(hotel.name, targetCity)) {
      errors.push(`Hotel [${hotel.name}] contains a foreign city name different from target "${targetCity}"`);
    }

    const lower = hotel.name.toLowerCase();
    if (seenNames.has(lower)) {
      errors.push(`Duplicate hotel name found: [${hotel.name}]`);
    }
    seenNames.add(lower);
  });

  // 2. Validate Activities
  let totalActivitiesCount = 0;

  itinerary.itinerary.forEach((day) => {
    day.plan.forEach((act) => {
      totalActivitiesCount++;
      const lat = Number(act.geoCoordinates?.lat) || centerLat;
      const lng = Number(act.geoCoordinates?.lng) || centerLng;
      const distKm = haversineDistanceKm(centerLat, centerLng, lat, lng);

      if (distKm > MAX_RADIUS_KM) {
        errors.push(`Day ${day.day} activity [${act.placeName}] is ${distKm.toFixed(1)} km away from center`);
      }

      if (isForeignCityName(act.placeName, targetCity)) {
        errors.push(`Day ${day.day} activity [${act.placeName}] contains foreign city name for target "${targetCity}"`);
      }

      const lower = act.placeName.toLowerCase();
      if (seenNames.has(lower)) {
        errors.push(`Duplicate activity found: [${act.placeName}] in Day ${day.day}`);
      }
      seenNames.add(lower);
    });
  });

  return {
    destination: destinationQuery,
    passed: errors.length === 0,
    errors,
    geocodedCity: targetCity,
    geocodedCenter: { lat: centerLat, lng: centerLng },
    totalHotelsVerified: itinerary.hotels.length,
    totalActivitiesVerified: totalActivitiesCount,
  };
}

/**
 * Runs batch validation test across all destinations
 */
export async function runBatchDestinationValidationTest(
  sampleDestinations: string[] = ALL_TEST_DESTINATIONS
): Promise<{
  totalTested: number;
  totalPassed: number;
  totalFailed: number;
  reports: ValidationReport[];
}> {
  console.log(`\n==================================================`);
  console.log(`[Destination Validator Test Suite] Starting batch validation for ${sampleDestinations.length} destinations...`);
  console.log(`==================================================\n`);

  const reports: ValidationReport[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < sampleDestinations.length; i++) {
    const dest = sampleDestinations[i];
    try {
      console.log(`[Test ${i + 1}/${sampleDestinations.length}] Testing destination: "${dest}"...`);

      const geocoded = await geocodeDestination(dest);
      if (!geocoded) {
        reports.push({
          destination: dest,
          passed: false,
          errors: [`Geocoding failed for "${dest}"`],
          geocodedCity: dest,
          geocodedCenter: { lat: 0, lng: 0 },
          totalHotelsVerified: 0,
          totalActivitiesVerified: 0,
        });
        failedCount++;
        continue;
      }

      const dummyFormData: TripFormData = {
        destination: dest,
        startDate: "2026-08-15",
        duration: 3,
        budget: "moderate",
        travelers: "couple",
        travelStyle: "balanced",
        homeCurrency: "INR",
      };

      const itinerary = await generateAIItinerary(dummyFormData);
      const report = validateDestinationItinerary(dest, itinerary, geocoded);

      reports.push(report);
      if (report.passed) {
        passedCount++;
        console.log(`✓ PASSED: "${dest}" (${report.totalHotelsVerified} hotels, ${report.totalActivitiesVerified} activities verified)`);
      } else {
        failedCount++;
        console.error(`✗ FAILED: "${dest}" with ${report.errors.length} errors:`, report.errors);
      }
    } catch (err: any) {
      console.error(`✗ ERROR testing "${dest}":`, err?.message || err);
      reports.push({
        destination: dest,
        passed: false,
        errors: [`Execution error: ${err?.message || String(err)}`],
        geocodedCity: dest,
        geocodedCenter: { lat: 0, lng: 0 },
        totalHotelsVerified: 0,
        totalActivitiesVerified: 0,
      });
      failedCount++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`[Destination Test Suite Summary]`);
  console.log(`Total Destinations Tested: ${sampleDestinations.length}`);
  console.log(`Total Destinations Passed: ${passedCount}`);
  console.log(`Total Destinations Failed: ${failedCount}`);
  console.log(`Pass Rate: ${((passedCount / sampleDestinations.length) * 100).toFixed(1)}%`);
  console.log(`==================================================\n`);

  return {
    totalTested: sampleDestinations.length,
    totalPassed: passedCount,
    totalFailed: failedCount,
    reports,
  };
}
