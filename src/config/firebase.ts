import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from "firebase/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "appId"];
  return requiredFields.every(
    (field) => firebaseConfig[field as keyof typeof firebaseConfig],
  );
};

// Check if analytics is configured (requires measurementId)
export const isAnalyticsConfigured = (): boolean => {
  return isFirebaseConfigured() && !!firebaseConfig.measurementId;
};

// Development mode - disable analytics when not configured
export const IS_DEVELOPMENT = !isAnalyticsConfigured();

// Initialize Firebase app (avoid duplicate initialization)
const app = isFirebaseConfigured()
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

// Initialize Firebase Auth
export const auth = app ? getAuth(app) : null;

// Initialize Firebase Analytics (only in browser and when configured)
let analytics: Analytics | null = null;

const initAnalytics = async (): Promise<Analytics | null> => {
  if (!app || IS_DEVELOPMENT) return null;

  try {
    const supported = await isAnalyticsSupported();
    if (supported) {
      analytics = getAnalytics(app);
      return analytics;
    }
  } catch {
    // Analytics not supported in this environment
  }
  return null;
};

// Initialize analytics immediately
if (typeof window !== "undefined") {
  initAnalytics();
}

export const getFirebaseAnalytics = (): Analytics | null => analytics;

export { app, analytics };
export default app;
