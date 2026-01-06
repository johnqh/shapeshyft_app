/**
 * Analytics Hook
 * Access Firebase Analytics tracking from the AnalyticsContext
 */

import { useContext } from 'react';
import { AnalyticsContext, type AnalyticsContextValue } from '../context/analyticsContextDef';

/**
 * Hook to access analytics context
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export type { AnalyticsContextValue };
