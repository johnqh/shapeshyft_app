/**
 * Page Tracking Hook
 * Automatically tracks page views when route changes
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';
import { getPageName } from '../utils/analytics';

/**
 * Hook that automatically tracks page views on route changes
 */
export function usePageTracking(): void {
  const location = useLocation();
  const { trackPageView, isAnalyticsEnabled } = useAnalytics();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAnalyticsEnabled) {
      return;
    }

    const currentPath = location.pathname;

    // Skip if same path (e.g., just hash or search change)
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    // Get normalized page name
    const pageName = getPageName(currentPath);

    // Track page view
    trackPageView(currentPath, pageName);
  }, [location.pathname, trackPageView, isAnalyticsEnabled]);
}

/**
 * Component that enables page tracking
 * Use this in your app layout to enable automatic page tracking
 */
export function PageTracker(): null {
  usePageTracking();
  return null;
}
