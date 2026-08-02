import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GeneratedItinerary, SavedTripDoc } from "@/types/trip";

const TRIPS_COLLECTION = "trips";

/**
 * Friendly error transformer for Firestore database exceptions
 */
function formatFirestoreError(error: any, defaultMsg: string): Error {
  const code = error?.code || "";
  const msg = error?.message || "";

  if (code === "permission-denied" || msg.includes("permission-denied")) {
    return new Error("Access denied. You do not have permission to access or modify this trip.");
  }
  if (code === "unavailable" || msg.includes("unavailable") || msg.includes("offline")) {
    return new Error("Firestore is currently offline or unavailable. Please check your internet connection.");
  }
  if (code === "unauthenticated" || msg.includes("unauthenticated")) {
    return new Error("Authentication required. Please sign in to continue.");
  }

  return new Error(msg || defaultMsg);
}

/**
 * Save or Update AI Generated Trip to Firestore `trips` collection under current user's ID.
 * Automatically handles update for existing trips to prevent duplicate document creation.
 */
export async function saveTrip(
  userId: string,
  itinerary: GeneratedItinerary,
  existingTripId?: string | null
): Promise<string> {
  if (!userId) {
    throw new Error("User must be authenticated to save a trip.");
  }

  try {
    const isUpdate = Boolean(existingTripId);
    const tripRef = isUpdate ? doc(db, TRIPS_COLLECTION, existingTripId!) : doc(collection(db, TRIPS_COLLECTION));
    const tripId = tripRef.id;

    // Collect map locations from hotels and daily activities
    const mapLocations = [
      ...itinerary.hotels.map((h) => ({
        title: h.name,
        type: "Hotel",
        lat: Number(h.geoCoordinates?.lat) || 0,
        lng: Number(h.geoCoordinates?.lng) || 0,
      })),
      ...itinerary.itinerary.flatMap((d) =>
        d.plan.map((a) => ({
          title: a.placeName,
          type: a.category === "Lunch" || a.category === "Dinner" || a.category === "Cafe" ? "Restaurant" : "Attraction",
          lat: Number(a.geoCoordinates?.lat) || 0,
          lng: Number(a.geoCoordinates?.lng) || 0,
        }))
      ),
    ];

    const destinationParts = (itinerary.tripDetails.destination || "").split(",");
    const country = destinationParts.length > 1 ? destinationParts[destinationParts.length - 1].trim() : destinationParts[0]?.trim() || "Worldwide";

    const payload: Record<string, any> = {
      tripId,
      id: tripId,
      userId,
      destination: itinerary.tripDetails.destination,
      country,
      startDate: itinerary.tripDetails.startDate,
      duration: itinerary.tripDetails.duration,
      budget: itinerary.tripDetails.budget,
      travelGroup: itinerary.tripDetails.travelers,
      travelStyle: itinerary.tripDetails.travelStyle,
      currency: itinerary.homeCurrency || "INR",
      totalCost: itinerary.costBreakdown?.totalHomeCurrency || 0,
      itinerary: itinerary.itinerary,
      mapLocations,
      tripDetails: itinerary.tripDetails,
      destinationCurrency: itinerary.destinationCurrency,
      destinationCurrencySymbol: itinerary.destinationCurrencySymbol,
      homeCurrency: itinerary.homeCurrency,
      homeCurrencySymbol: itinerary.homeCurrencySymbol,
      exchangeRateToHome: itinerary.exchangeRateToHome,
      costBreakdown: itinerary.costBreakdown,
      hotels: itinerary.hotels,
      travelTips: itinerary.travelTips || [],
      updatedAt: serverTimestamp(),
    };

    if (!isUpdate) {
      payload.createdAt = serverTimestamp();
      payload.createdIso = new Date().toISOString();
      console.log(`[WanderAI Firestore] Creating new trip document in 'trips' collection with tripId: ${tripId}`);
    } else {
      console.log(`[WanderAI Firestore] Updating existing trip document in 'trips' collection for tripId: ${tripId}`);
    }

    await setDoc(tripRef, payload, { merge: true });
    return tripId;
  } catch (error: any) {
    console.error("Error saving trip to Firestore:", error);
    throw formatFirestoreError(error, "Failed to save trip to database.");
  }
}

/**
 * Retrieve all saved trips for a specific user from `trips` collection
 */
export async function getUserTrips(userId: string): Promise<SavedTripDoc[]> {
  if (!userId) return [];

  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const q = query(tripsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    const trips: SavedTripDoc[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      trips.push({
        id: docSnap.id,
        tripId: data.tripId || docSnap.id,
        userId: data.userId,
        destination: data.destination || data.tripDetails?.destination || "Destination",
        country: data.country || "Worldwide",
        startDate: data.startDate || data.tripDetails?.startDate || "",
        duration: data.duration || data.tripDetails?.duration || 1,
        budget: data.budget || data.tripDetails?.budget || "moderate",
        travelGroup: data.travelGroup || data.tripDetails?.travelers || "couple",
        travelStyle: data.travelStyle || data.tripDetails?.travelStyle || "balanced",
        currency: data.currency || data.homeCurrency || "INR",
        totalCost: data.totalCost || data.costBreakdown?.totalHomeCurrency || 0,
        mapLocations: data.mapLocations || [],
        tripDetails: data.tripDetails || {
          destination: data.destination || "Destination",
          startDate: data.startDate || "",
          duration: data.duration || 1,
          budget: data.budget || "moderate",
          travelers: data.travelGroup || "couple",
          travelStyle: data.travelStyle || "balanced",
          homeCurrency: data.currency || "INR",
        },
        destinationCurrency: data.destinationCurrency || "USD",
        destinationCurrencySymbol: data.destinationCurrencySymbol || "$",
        homeCurrency: data.homeCurrency || "INR",
        homeCurrencySymbol: data.homeCurrencySymbol || "₹",
        exchangeRateToHome: data.exchangeRateToHome || 1.0,
        costBreakdown: data.costBreakdown || {
          accommodation: 0,
          food: 0,
          transport: 0,
          activities: 0,
          shopping: 0,
          miscellaneous: 0,
          totalDestCurrency: 0,
          totalHomeCurrency: data.totalCost || 0,
        },
        hotels: data.hotels || [],
        itinerary: data.itinerary || [],
        travelTips: data.travelTips || [],
        createdAt: data.createdIso || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    // Sort by newest created date first
    return trips.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error: any) {
    console.error("Error fetching user trips from Firestore:", error);
    throw formatFirestoreError(error, "Failed to retrieve user trips.");
  }
}

/**
 * Fetch single saved trip by ID
 */
export async function getTripById(tripId: string): Promise<SavedTripDoc | null> {
  if (!tripId) return null;

  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const docSnap = await getDoc(tripRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        tripId: data.tripId || docSnap.id,
        userId: data.userId,
        destination: data.destination || data.tripDetails?.destination || "Destination",
        country: data.country || "Worldwide",
        startDate: data.startDate || data.tripDetails?.startDate || "",
        duration: data.duration || data.tripDetails?.duration || 1,
        budget: data.budget || data.tripDetails?.budget || "moderate",
        travelGroup: data.travelGroup || data.tripDetails?.travelers || "couple",
        travelStyle: data.travelStyle || data.tripDetails?.travelStyle || "balanced",
        currency: data.currency || data.homeCurrency || "INR",
        totalCost: data.totalCost || data.costBreakdown?.totalHomeCurrency || 0,
        mapLocations: data.mapLocations || [],
        tripDetails: data.tripDetails || {
          destination: data.destination || "Destination",
          startDate: data.startDate || "",
          duration: data.duration || 1,
          budget: data.budget || "moderate",
          travelers: data.travelGroup || "couple",
          travelStyle: data.travelStyle || "balanced",
          homeCurrency: data.currency || "INR",
        },
        destinationCurrency: data.destinationCurrency || "USD",
        destinationCurrencySymbol: data.destinationCurrencySymbol || "$",
        homeCurrency: data.homeCurrency || "INR",
        homeCurrencySymbol: data.homeCurrencySymbol || "₹",
        exchangeRateToHome: data.exchangeRateToHome || 1.0,
        costBreakdown: data.costBreakdown || {
          accommodation: 0,
          food: 0,
          transport: 0,
          activities: 0,
          shopping: 0,
          miscellaneous: 0,
          totalDestCurrency: 0,
          totalHomeCurrency: data.totalCost || 0,
        },
        hotels: data.hotels || [],
        itinerary: data.itinerary || [],
        travelTips: data.travelTips || [],
        createdAt: data.createdIso || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching trip by ID:", error);
    throw formatFirestoreError(error, "Failed to retrieve trip details.");
  }
}

/**
 * Delete trip document from `trips` collection
 */
export async function deleteTrip(tripId: string): Promise<void> {
  if (!tripId) return;

  try {
    console.log(`[WanderAI Firestore] Deleting trip document from 'trips' collection: ${tripId}`);
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripRef);
  } catch (error: any) {
    console.error("Error deleting trip from Firestore:", error);
    throw formatFirestoreError(error, "Failed to delete trip.");
  }
}
