"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserProfile, AuthContextType } from "@/types/user";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signInAsGuest: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile to Firestore `users` collection
  const syncUserProfile = async (firebaseUser: FirebaseUser, customDisplayName?: string): Promise<UserProfile> => {
    const displayName = customDisplayName || firebaseUser.displayName || emailPrefix(firebaseUser.email);
    const provider = firebaseUser.providerData[0]?.providerId || "password";

    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName,
      photoURL: firebaseUser.photoURL,
      lastLoginAt: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log(`[WanderAI Auth] Creating new Firestore document in 'users' collection for UID: ${firebaseUser.uid}`);
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          provider,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        console.log(`[WanderAI Auth] Updating existing Firestore document in 'users' collection for UID: ${firebaseUser.uid}`);
        await setDoc(
          userRef,
          {
            displayName,
            photoURL: firebaseUser.photoURL || null,
            email: firebaseUser.email,
            provider,
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (dbError: any) {
      console.error(`[WanderAI Auth Error] Failed to sync user profile document to Firestore for UID ${firebaseUser.uid}:`, dbError?.message || dbError);
    }

    return userProfile;
  };

  function emailPrefix(email: string | null): string {
    if (!email) return "Traveler";
    return email.split("@")[0] || "Traveler";
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wanderai_guest_user");
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log(`[WanderAI Auth] Auth state changed: Logged in as ${firebaseUser.email} (${firebaseUser.uid})`);
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUser(profile);
        } catch (error) {
          console.error("[WanderAI Auth] Firestore user sync error:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || emailPrefix(firebaseUser.email),
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        console.log("[WanderAI Auth] Auth state changed: Logged out / Guest session.");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("[WanderAI Auth] Initiating Google Sign-In popup...");
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(res.user);
      console.log("[WanderAI Auth] Google Sign-In successful for:", res.user.email);
    } catch (error) {
      console.error("[WanderAI Auth] Google sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      console.log(`[WanderAI Auth] Creating new email account for: ${email}...`);
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile display name
      await updateProfile(res.user, { displayName });
      
      // Save profile to Firestore `users` collection
      const profile = await syncUserProfile(res.user, displayName);
      setUser(profile);
      console.log(`[WanderAI Auth] Account creation successful for: ${email}`);
    } catch (error) {
      console.error("[WanderAI Auth] Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log(`[WanderAI Auth] Signing in with email: ${email}...`);
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      const profile = await syncUserProfile(res.user);
      setUser(profile);
      console.log(`[WanderAI Auth] Email sign-in successful for: ${email}`);
    } catch (error) {
      console.error("[WanderAI Auth] Email sign-in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = () => {
    setUser(null);
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("wanderai_guest_user");
      }
      await signOut(auth).catch(() => {});
      setUser(null);
      console.log("[WanderAI Auth] User logged out successfully.");
    } catch (error) {
      console.error("[WanderAI Auth] Logout error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signInAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
