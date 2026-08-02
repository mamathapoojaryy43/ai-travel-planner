import axios from "axios";
import { TripFormData, GeneratedItinerary } from "@/types/trip";
import { auth } from "@/lib/firebase";

export interface ApiResponse<T> {
  success: boolean;
  source?: "openai" | "demo_fallback" | "gemini";
  data?: T;
  error?: string;
  executionTimeMs?: number;
}

export async function generateTripItinerary(
  formData: TripFormData
): Promise<GeneratedItinerary> {
  const startTime = Date.now();
  try {
    console.log(`[WanderAI AI Service] Preparing itinerary request for "${formData.destination}"...`);

    const currentUser = auth.currentUser;
    const idToken = await currentUser?.getIdToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (idToken) {
      console.log(`[WanderAI AI Service] ID Token present for user: ${currentUser?.email || currentUser?.uid}`);
      headers["Authorization"] = `Bearer ${idToken}`;
    } else {
      console.warn("[WanderAI AI Service] No authenticated user ID Token available.");
    }

    console.log("[WanderAI AI Service] Dispatching POST request to /api/generate-trip (timeout: 120,000ms)...");

    const response = await axios.post<ApiResponse<GeneratedItinerary>>(
      "/api/generate-trip",
      formData,
      {
        headers,
        timeout: 120000, // Increased timeout to 120s (2 minutes)
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[WanderAI AI Service] Response received in ${duration}ms! Success: ${response.data.success}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to generate AI trip itinerary.");
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[WanderAI AI Service Error after ${duration}ms]:`, error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const apiErrorMsg = error.response?.data?.error;

      if (status === 401 || apiErrorMsg === "Authentication required.") {
        throw new Error("Please sign in to generate your itinerary.");
      }

      if (error.code === "ECONNABORTED" || (error.message && error.message.includes("timeout"))) {
        throw new Error("We're taking longer than expected. Please try again.");
      }

      if (apiErrorMsg) {
        throw new Error(apiErrorMsg);
      }
    }

    throw new Error(error.message || "Network error while connecting to trip generator.");
  }
}
