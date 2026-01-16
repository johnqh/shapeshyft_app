/**
 * Analytics utilities for Firebase Analytics
 * Implements privacy-preserving user tracking with hashed user IDs
 */

import { stripLanguagePrefix } from "@sudobility/components";

// Re-export utilities from shared components
export { hashUserId, stripLanguagePrefix } from "@sudobility/components";

/**
 * UUID regex pattern for matching UUIDs in paths
 */
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Entity slug pattern - alphanumeric strings that appear after /dashboard/
 * These are typically 8 character slugs like "mvz596xl"
 */
const ENTITY_SLUG_PATTERN = /^[a-z0-9]{6,12}$/i;

/**
 * Strip IDs from a URL path for privacy-preserving analytics tracking.
 * Removes entity slugs and UUIDs while preserving the route structure.
 *
 * Example:
 * Input:  /en/dashboard/mvz596xl/projects/fe4d5725-2f5d-4806-9f9e-ff47deb271f3/endpoints/24106242-0a99-4b0e-be3d-be8b03f9451b
 * Output: /en/dashboard/projects/endpoints
 */
export const sanitizePathForTracking = (path: string): string => {
  // Split path into segments
  const segments = path.split("/").filter(Boolean);

  // Known route segments that should be kept
  const knownRoutes = new Set([
    "en",
    "ar",
    "de",
    "es",
    "fr",
    "it",
    "ja",
    "ko",
    "pt",
    "ru",
    "sv",
    "th",
    "uk",
    "vi",
    "zh",
    "zh-hant", // languages
    "dashboard",
    "projects",
    "endpoints",
    "providers",
    "analytics",
    "budgets",
    "subscription",
    "settings",
    "rate-limits",
    "templates",
    "new",
    "performance",
    "login",
    "pricing",
    "docs",
    "about",
    "privacy",
    "terms",
    "contact",
    "use-cases",
    "text",
    "data",
    "content",
    "sitemap",
  ]);

  // Filter segments
  const filteredSegments = segments.filter((segment) => {
    // Keep known routes
    if (knownRoutes.has(segment.toLowerCase())) {
      return true;
    }

    // Remove UUIDs
    if (UUID_PATTERN.test(segment)) {
      UUID_PATTERN.lastIndex = 0; // Reset regex state
      return false;
    }

    // Remove entity slugs (alphanumeric strings that look like IDs)
    if (ENTITY_SLUG_PATTERN.test(segment)) {
      return false;
    }

    // Keep other segments (e.g., page names)
    return true;
  });

  return "/" + filteredSegments.join("/");
};

/**
 * Analytics event names following Firebase best practices
 */
export const AnalyticsEvents = {
  // Authentication events
  USER_LOGIN: "login",
  USER_LOGOUT: "logout",
  USER_SIGNUP: "sign_up",

  // Navigation events
  PAGE_VIEW: "page_view",
  BUTTON_CLICK: "button_click",
  LINK_CLICK: "link_click",

  // Project events
  PROJECT_CREATED: "project_created",
  PROJECT_UPDATED: "project_updated",
  PROJECT_DELETED: "project_deleted",
  PROJECT_VIEWED: "project_viewed",

  // Endpoint events
  ENDPOINT_CREATED: "endpoint_created",
  ENDPOINT_UPDATED: "endpoint_updated",
  ENDPOINT_DELETED: "endpoint_deleted",
  ENDPOINT_TESTED: "endpoint_tested",
  ENDPOINT_VIEWED: "endpoint_viewed",

  // API Key events
  API_KEY_CREATED: "api_key_created",
  API_KEY_DELETED: "api_key_deleted",

  // Subscription events
  SUBSCRIPTION_VIEWED: "subscription_viewed",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_COMPLETED: "subscription_completed",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",

  // Template events
  TEMPLATE_SELECTED: "template_selected",
  TEMPLATE_APPLIED: "template_applied",

  // Error events
  ERROR_OCCURRED: "error_occurred",
  ERROR_API_CALL: "error_api_call",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Analytics event parameters
 */
export interface AnalyticsEventParams {
  user_hash?: string;
  page_path?: string;
  page_title?: string;
  button_name?: string;
  link_url?: string;
  project_id?: string;
  endpoint_id?: string;
  endpoint_name?: string;
  error_message?: string;
  error_code?: string;
  subscription_plan?: string;
  template_id?: string;
  template_name?: string;
  test_mode?: boolean;
  timestamp?: number;
  [key: string]: unknown;
}

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  event: AnalyticsEventName;
  parameters?: AnalyticsEventParams;
}

/**
 * Page name mapping for consistent page view tracking
 */
export const PAGE_NAMES: Record<string, string> = {
  "/": "home",
  "/login": "login",
  "/pricing": "pricing",
  "/docs": "documentation",
  "/about": "about",
  "/privacy": "privacy",
  "/terms": "terms",
  "/contact": "contact",
  "/use-cases": "use_cases",
  "/use-cases/text": "use_cases_text",
  "/use-cases/data": "use_cases_data",
  "/use-cases/content": "use_cases_content",
  "/sitemap": "sitemap",
  "/dashboard": "dashboard",
  "/dashboard/projects": "projects",
  "/dashboard/projects/new": "project_new",
  "/dashboard/projects/templates": "templates",
  "/dashboard/providers": "api_keys",
  "/dashboard/analytics": "analytics",
  "/dashboard/budgets": "budgets",
  "/dashboard/settings": "settings",
  "/dashboard/subscription": "subscription",
  "/dashboard/rate-limits": "rate_limits",
  "/dashboard/performance": "performance",
};

/**
 * Get normalized page name from path
 */
export const getPageName = (path: string): string => {
  // Strip language prefix (e.g., /en/about -> /about)
  const normalizedPath = stripLanguagePrefix(path);

  // Check for exact match
  if (PAGE_NAMES[normalizedPath]) {
    return PAGE_NAMES[normalizedPath];
  }

  // Check for project detail page pattern
  if (/^\/dashboard\/[^/]+\/projects\/[^/]+$/.test(normalizedPath)) {
    return "project_detail";
  }

  // Check for endpoint detail page pattern
  if (
    /^\/dashboard\/[^/]+\/projects\/[^/]+\/endpoints\/[^/]+$/.test(
      normalizedPath,
    )
  ) {
    return "endpoint_detail";
  }

  // Check for endpoint new page pattern
  if (
    /^\/dashboard\/[^/]+\/projects\/[^/]+\/endpoints\/new$/.test(normalizedPath)
  ) {
    return "endpoint_new";
  }

  // Default to path-based name
  return normalizedPath.replace(/\//g, "_").replace(/^_/, "") || "home";
};
