"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Compass, Sparkles, AlertCircle, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, signInAsGuest, user, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (user && !loading) {
    router.push("/create-trip");
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsAuthenticating(true);
      await signInWithGoogle();
      router.push("/create-trip");
    } catch (err: any) {
      console.error("Authentication failed:", err);
      const errMsg = err?.message || "";
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (
        err?.code === "auth/api-key-not-valid" ||
        err?.code === "auth/invalid-api-key" ||
        errMsg.includes("api-key-not-valid") ||
        errMsg.includes("invalid-api-key")
      ) {
        setError(
          "Firebase API Key is currently unconfigured or set to placeholder in .env.local. Please add your real Firebase API key from Firebase Console, or click 'Continue as Guest Demo' below to test the app!"
        );
      } else {
        setError(errMsg || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
    router.push("/create-trip");
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 rounded-3xl glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6 text-center">
          
          {/* Logo Badge */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25">
            <Compass className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome to Wander<span className="gradient-text-soft">AI</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in with Google to create, save, and access your custom AI travel itineraries.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 text-left leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons Stack */}
          <div className="space-y-3">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating || loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? "Signing in..." : "Continue with Google"}</span>
            </button>

            {/* Guest Demo Mode Button */}
            <button
              onClick={handleGuestSignIn}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
            >
              <UserCheck className="h-4 w-4" />
              <span>Continue as Guest (Demo)</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Privacy Note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Instant access or Google Auth</span>
          </div>

        </div>
      </div>
    </div>
  );
}
