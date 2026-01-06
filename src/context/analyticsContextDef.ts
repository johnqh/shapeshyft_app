/**
 * Analytics Context Definition
 * Defines the context and types for Firebase Analytics
 */

import { createContext } from "react";
import type { AnalyticsEvent, AnalyticsEventParams } from "../utils/analytics";

export interface AnalyticsContextValue {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (pagePath: string, pageTitle?: string) => void;
  trackButtonClick: (
    buttonName: string,
    additionalParams?: AnalyticsEventParams,
  ) => void;
  trackError: (errorMessage: string, errorCode?: string) => void;
  setUserProperty: (name: string, value: string) => void;
  isAnalyticsEnabled: boolean;
  userHash: string | null;
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(
  null,
);
