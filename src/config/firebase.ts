/**
 * @fileoverview Firebase Analytics Configuration
 *
 * Auth is now handled by @sudobility/auth_lib.
 * This file only handles Firebase Analytics.
 *
 * Provides a singleton analytics service that can be called directly
 * without needing React context or callbacks.
 */

import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
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

// Initialize Firebase Analytics at module load time
let analytics: Analytics | undefined = undefined;

if (typeof window !== "undefined" && !IS_DEVELOPMENT) {
  try {
    const app = getFirebaseApp();
    if (app) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Error initializing Firebase Analytics:", error);
  }
}

// Export analytics instance directly
export { analytics };

// Export configured status
export const isConfigured = isFirebaseConfigured();

// ============================================================================
// Analytics Service Singleton - Call directly without context
// ============================================================================

export interface AnalyticsEventParams {
  [key: string]: unknown;
}

/**
 * Analytics service singleton - call directly from anywhere
 * Usage: analyticsService.trackEvent('button_click', { button_name: 'submit' })
 */
export const analyticsService = {
  /**
   * Track a custom event
   */
  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (IS_DEVELOPMENT || !analytics) return;
    logEvent(analytics, eventName, {
      ...params,
      timestamp: Date.now(),
    });
  },

  /**
   * Track a page view
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (IS_DEVELOPMENT || !analytics) return;
    logEvent(analytics, "page_view", {
      page_path: pagePath,
      page_title: pageTitle,
      timestamp: Date.now(),
    });
  },

  /**
   * Track a button click
   */
  trackButtonClick(buttonName: string, params?: AnalyticsEventParams): void {
    if (IS_DEVELOPMENT || !analytics) return;
    logEvent(analytics, "button_click", {
      button_name: buttonName,
      ...params,
      timestamp: Date.now(),
    });
  },

  /**
   * Track an error
   */
  trackError(errorMessage: string, errorCode?: string): void {
    if (IS_DEVELOPMENT || !analytics) return;
    logEvent(analytics, "error_occurred", {
      error_message: errorMessage,
      error_code: errorCode,
      timestamp: Date.now(),
    });
  },

  /**
   * Set the user ID (hashed for privacy)
   */
  setUserId(userId: string): void {
    if (IS_DEVELOPMENT || !analytics) return;
    setUserId(analytics, userId);
  },

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, string>): void {
    if (IS_DEVELOPMENT || !analytics) return;
    setUserProperties(analytics, properties);
  },

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return !IS_DEVELOPMENT && !!analytics;
  },
};
