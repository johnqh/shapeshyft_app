/**
 * Page Tracking Hook
 * Automatically tracks page views when route changes
 * Uses analyticsService singleton directly
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { analyticsService } from "../config/analytics";
import { getPageName, sanitizePathForTracking } from "../utils/analytics";

/**
 * Hook that automatically tracks page views on route changes
 */
export function usePageTracking(): void {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsService.isEnabled()) {
      return;
    }

    const currentPath = location.pathname;

    // Skip if same path (e.g., just hash or search change)
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    // Get normalized page name and sanitized path
    const pageName = getPageName(currentPath);
    const sanitizedPath = sanitizePathForTracking(currentPath);

    // Track page view
    analyticsService.trackPageView(sanitizedPath, pageName);
  }, [location.pathname]);
}

/**
 * Component that enables page tracking
 * Use this in your app layout to enable automatic page view tracking
 * Note: User identity is set via onSignIn callback in AuthProviderWrapper
 */
export function PageTracker(): null {
  usePageTracking();
  return null;
}
