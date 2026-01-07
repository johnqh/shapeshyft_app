/**
 * Analytics utilities for Firebase Analytics
 * Implements privacy-preserving user tracking with hashed user IDs
 */

// Re-export hashUserId from shared components
export { hashUserId } from "@sudobility/components";

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
  const normalizedPath = path.replace(/^\/[a-z]{2}(-[a-z]+)?(?=\/|$)/, "");

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
