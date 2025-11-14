
"use client"

import { getAuth, signInWithPopup, GoogleAuthProvider, type User, Auth, updateProfile } from "firebase/auth";
import { useFirebase } from "../provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { doc, setDoc, increment, getFirestore, serverTimestamp, updateDoc } from "firebase/firestore";
import { errorEmitter } from "../error-emitter";
import { FirestorePermissionError } from "../errors";
import { updateDocumentNonBlocking } from "../non-blocking-updates";


// Hook for accessing current user
export function useUser() {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, loading: isUserLoading, isUserLoading, userError };
}

// Redirect hook for login/logout navigation
export function useAuthRedirect() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard"); // ✅ go to dashboard if logged in
      } else {
        router.push("/login");     // ❌ go to login if logged out
      }
    }
  }, [user, loading, router]);
}

// Login with Google
export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    // The onAuthStateChanged listener in the FirebaseProvider will handle the user state update.
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    // This can happen if the user closes the login flow. We can often ignore it.
    if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
       console.error("Sign in with Google popup error:", error);
    }
  }
}

// Logout
export async function signOut() {
  const auth = getAuth();
  localStorage.removeItem('loginTime');

  try {
    // Sign out from Firebase Auth
    await auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }
}
