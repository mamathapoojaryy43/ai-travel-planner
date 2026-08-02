"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Compass, Sparkles, AlertCircle, ShieldCheck, Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  message = "Please sign in to generate your personalized AI travel itinerary.",
}: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setError(null);
    setIsAuthenticating(false);
  };

  const handleTabChange = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatFirebaseError = (err: any): string => {
    const code = err?.code || "";
    const msg = err?.message || "";

    if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
      return "Email/Password sign-in is not enabled in Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable the Email/Password provider.";
    }
    if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
      return "An account with this email address already exists. Please sign in instead.";
    }
    if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (code === "auth/weak-password" || msg.includes("weak-password")) {
      return "Password should be at least 6 characters long.";
    }
    if (
      code === "auth/user-not-found" ||
      code === "auth/wrong-password" ||
      code === "auth/invalid-credential" ||
      msg.includes("user-not-found") ||
      msg.includes("wrong-password") ||
      msg.includes("invalid-credential")
    ) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign-in popup was closed before completing.";
    }
    if (
      code === "auth/api-key-not-valid" ||
      code === "auth/invalid-api-key" ||
      msg.includes("api-key-not-valid")
    ) {
      return "Firebase API Key is unconfigured or invalid. Please check your environment variables.";
    }
    return msg || "Authentication failed. Please try again.";
  };

  // 1. Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsAuthenticating(true);
      await signInWithGoogle();
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(formatFirebaseError(err));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 2. Email Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsAuthenticating(true);
      await signInWithEmail(email.trim(), password);
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Email sign in error:", err);
      setError(formatFirebaseError(err));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 3. Email Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }

    try {
      setIsAuthenticating(true);
      await signUpWithEmail(email.trim(), password, fullName.trim());
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Email sign up error:", err);
      setError(formatFirebaseError(err));
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header Badge */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/25">
          <Compass className="h-6 w-6" />
        </div>

        <DialogHeader className="space-y-1 text-center sm:text-center">
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sign in Required
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
            Create a free account to generate personalized AI travel itineraries, save trips, and access them anytime.
          </DialogDescription>
        </DialogHeader>

        {/* Custom Context Message Banner */}
        {message && (
          <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-2 text-left shadow-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Switcher Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => handleTabChange("signin")}
            disabled={isAuthenticating}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "signin"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("signup")}
            disabled={isAuthenticating}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "signup"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 text-left leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === "signin" && (
          <form onSubmit={handleSignInSubmit} className="space-y-3 pt-1">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In with Email</span>
              )}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold">OR</span>
              </div>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all duration-200 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP FORM */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3 pt-1">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
        )}

        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isAuthenticating}
          className="w-full py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        {/* Privacy Note */}
        <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Secure Firebase Authentication</span>
        </div>

      </DialogContent>
    </Dialog>
  );
}
