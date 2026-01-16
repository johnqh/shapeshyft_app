/**
 * Analytics Context Provider
 * Provides Firebase Analytics tracking throughout the app
 * Uses hashed user IDs for privacy-preserving analytics
 *
 * Pattern follows mail_box: Import analytics instance directly from firebase.ts
 */

import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { analytics, IS_DEVELOPMENT } from "../config/firebase";
import {
  hashUserId,
  AnalyticsEvents,
  sanitizePathForTracking,
  type AnalyticsEvent,
  type AnalyticsEventParams,
} from "../utils/analytics";
import { useApi } from "../hooks/useApi";
import {
  AnalyticsContext,
  type AnalyticsContextValue,
} from "./analyticsContextDef";

export {
  AnalyticsContext,
  type AnalyticsContextValue,
} from "./analyticsContextDef";

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { userId, testMode } = useApi();
  const [userHash, setUserHash] = useState<string | null>(null);

  // Hash user ID when it changes
  useEffect(() => {
    const updateUserHash = async () => {
      if (userId) {
        const hash = await hashUserId(userId);
        setUserHash(hash);

        // Set Firebase user ID with hashed value
        if (analytics && !IS_DEVELOPMENT) {
          setUserId(analytics, hash);
          setUserProperties(analytics, {
            user_hash: hash,
            test_mode: testMode ? "true" : "false",
          });
        }
      } else {
        setUserHash(null);
      }
    };

    updateUserHash();
  }, [userId, testMode]);

  /**
   * Track an analytics event
   */
  const trackEvent = useCallback(
    (event: AnalyticsEvent) => {
      if (IS_DEVELOPMENT || !analytics) {
        return;
      }

      const parameters: AnalyticsEventParams = {
        ...event.parameters,
        user_hash: userHash ?? undefined,
        test_mode: testMode,
        timestamp: Date.now(),
      };

      logEvent(analytics, event.event as string, parameters);
    },
    [userHash, testMode],
  );

  /**
   * Track a page view
   * Sanitizes the path to remove IDs (entity slugs, UUIDs) for privacy
   */
  const trackPageView = useCallback(
    (pagePath: string, pageTitle?: string) => {
      // Sanitize path to remove IDs before tracking
      const sanitizedPath = sanitizePathForTracking(pagePath);
      trackEvent({
        event: AnalyticsEvents.PAGE_VIEW,
        parameters: {
          page_path: sanitizedPath,
          page_title: pageTitle,
        },
      });
    },
    [trackEvent],
  );

  /**
   * Track a button click
   */
  const trackButtonClick = useCallback(
    (buttonName: string, additionalParams?: AnalyticsEventParams) => {
      trackEvent({
        event: AnalyticsEvents.BUTTON_CLICK,
        parameters: {
          button_name: buttonName,
          ...additionalParams,
        },
      });
    },
    [trackEvent],
  );

  /**
   * Track an error
   */
  const trackError = useCallback(
    (errorMessage: string, errorCode?: string) => {
      trackEvent({
        event: AnalyticsEvents.ERROR_OCCURRED,
        parameters: {
          error_message: errorMessage,
          error_code: errorCode,
        },
      });
    },
    [trackEvent],
  );

  /**
   * Set a user property
   */
  const setUserProperty = useCallback((name: string, value: string) => {
    if (IS_DEVELOPMENT || !analytics) {
      return;
    }

    setUserProperties(analytics, { [name]: value });
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      trackEvent,
      trackPageView,
      trackButtonClick,
      trackError,
      setUserProperty,
      isAnalyticsEnabled: !IS_DEVELOPMENT && !!analytics,
      userHash,
    }),
    [
      trackEvent,
      trackPageView,
      trackButtonClick,
      trackError,
      setUserProperty,
      userHash,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
