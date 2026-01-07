/**
 * @fileoverview Firebase Analytics Configuration
 *
 * Auth is now handled by @sudobility/auth_lib.
 * This file only handles Firebase Analytics.
 */

import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from "firebase/analytics";
import {
  getFirebaseApp,
  getFirebaseConfig,
  isFirebaseConfigured,
} from "@sudobility/auth_lib";

// Check if analytics is configured (requires measurementId)
export const isAnalyticsConfigured = (): boolean => {
  return isFirebaseConfigured() && !!getFirebaseConfig()?.measurementId;
};

// Development mode - disable analytics when not configured
export const IS_DEVELOPMENT = !isAnalyticsConfigured();

// Initialize Firebase Analytics (only in browser and when configured)
let analytics: Analytics | null = null;

const initAnalytics = async (): Promise<Analytics | null> => {
  const app = getFirebaseApp();
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
