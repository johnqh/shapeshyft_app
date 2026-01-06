/**
 * Analytics Context Provider
 * Provides Firebase Analytics tracking throughout the app
 * Uses hashed user IDs for privacy-preserving analytics
 */

import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from "firebase/analytics";
import { getFirebaseAnalytics, IS_DEVELOPMENT } from "../config/firebase";
import {
  hashUserId,
  AnalyticsEvents,
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
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [userHash, setUserHash] = useState<string | null>(null);

  // Initialize analytics
  useEffect(() => {
    const initAnalytics = () => {
      const analyticsInstance = getFirebaseAnalytics();
      setAnalytics(analyticsInstance);
    };

    // Small delay to ensure Firebase is initialized
    const timer = setTimeout(initAnalytics, 100);
    return () => clearTimeout(timer);
  }, []);

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
  }, [userId, analytics, testMode]);

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
    [analytics, userHash, testMode],
  );

  /**
   * Track a page view
   */
  const trackPageView = useCallback(
    (pagePath: string, pageTitle?: string) => {
      trackEvent({
        event: AnalyticsEvents.PAGE_VIEW,
        parameters: {
          page_path: pagePath,
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
  const setUserProperty = useCallback(
    (name: string, value: string) => {
      if (IS_DEVELOPMENT || !analytics) {
        return;
      }

      setUserProperties(analytics, { [name]: value });
    },
    [analytics],
  );

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
      analytics,
      userHash,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
