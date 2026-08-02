"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTripForm } from "@/components/trip/CreateTripForm";
import { GenerationLoadingState } from "@/components/trip/GenerationLoadingState";
import { ItineraryDisplay } from "@/components/trip/ItineraryDisplay";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateTripItinerary } from "@/services/aiService";
import { saveTrip } from "@/services/tripService";
import { useAuth } from "@/hooks/useAuth";
import { TripFormData, GeneratedItinerary } from "@/types/trip";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function CreateTripPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<TripFormData | null>(null);
  const [pendingFormData, setPendingFormData] = useState<TripFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>(
    "Please sign in to generate your personalized AI travel itinerary."
  );

  const executeGeneration = async (data: TripFormData) => {
    try {
      setFormData(data);
      setError(null);
      setIsGenerating(true);
      setIsSaved(false);
      setSavedTripId(null);
      setSaveSuccessMessage(null);

      const generatedData = await generateTripItinerary(data);
      setItinerary(generatedData);

      // Automatically Save Trip to Firestore for Authenticated User
      if (user?.uid) {
        try {
          setIsSaving(true);
          console.log(`[WanderAI Auto-Save] Auto-saving generated trip to Firestore for user: ${user.uid}`);
          const tripId = await saveTrip(user.uid, generatedData);
          setSavedTripId(tripId);
          setIsSaved(true);
          setSaveSuccessMessage("Trip generated and saved to your dashboard!");
        } catch (saveErr: any) {
          console.error("[WanderAI Auto-Save Error] Failed to auto-save trip to Firestore:", saveErr);
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err: any) {
      console.error("Itinerary generation error:", err);
      setError(err?.message || "Failed to generate AI travel itinerary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = async (data: TripFormData) => {
    setFormData(data);
    if (!user) {
      setPendingFormData(data);
      setAuthModalMessage("Please sign in to generate your personalized AI travel itinerary.");
      setIsAuthModalOpen(true);
      return;
    }

    await executeGeneration(data);
  };

  const handleAuthSuccess = () => {
    if (pendingFormData) {
      const dataToGenerate = pendingFormData;
      setPendingFormData(null);
      executeGeneration(dataToGenerate);
    }
  };

  const handleSaveTrip = async () => {
    if (!itinerary) return;

    if (!user) {
      setAuthModalMessage("Please sign in to save this trip to your dashboard.");
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // Save or update existing trip document to prevent duplicates
      const tripId = await saveTrip(user.uid, itinerary, savedTripId);
      setSavedTripId(tripId);
      setIsSaved(true);
      setSaveSuccessMessage("Trip saved successfully.");

      setTimeout(() => {
        router.push("/my-trips");
      }, 1400);
    } catch (err: any) {
      console.error("Save trip error:", err);
      setError(err?.message || "Failed to save trip to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
    setIsGenerating(false);
    setIsSaved(false);
    setSavedTripId(null);
    setSaveSuccessMessage(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 transition-colors duration-300">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 space-y-8">
        
        {/* Header Banner when filling form */}
        {!isGenerating && !itinerary && (
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Travel Generator</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tell us your travel <span className="gradient-text-soft">preferences</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Provide your destination, budget, trip duration, and style. Our AI will craft your custom itinerary instantly.
            </p>
          </div>
        )}

        {/* Save Success Banner */}
        {saveSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto shadow-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            title="Action Failed"
            message={error}
            onRetry={() => formData && handleFormSubmit(formData)}
          />
        )}

        {/* 1. Loading State */}
        {isGenerating && (
          <GenerationLoadingState destination={formData?.destination || "your destination"} />
        )}

        {/* 2. Generated Itinerary View */}
        {!isGenerating && itinerary && (
          <ItineraryDisplay
            itinerary={itinerary}
            onReset={handleReset}
            onSaveTrip={handleSaveTrip}
            isSaving={isSaving}
            isSaved={isSaved}
          />
        )}

        {/* 3. Form Input View */}
        {!isGenerating && !itinerary && (
          <CreateTripForm onSubmit={handleFormSubmit} isLoading={isGenerating} />
        )}

      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        message={authModalMessage}
      />
    </div>
  );
}
