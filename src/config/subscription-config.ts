import type { TFunction } from "i18next";

/**
 * Package ID to entitlement mapping (from RevenueCat configuration)
 * Used by getProductFeatures to determine which rate limits to display.
 */
const PACKAGE_ENTITLEMENT_MAP: Record<string, string> = {
  ultra_yearly: "bandwidth_ultra",
  ultra_monthly: "bandwidth_ultra",
  pro_yearly: "bandwidth_pro",
  pro_monthly: "bandwidth_pro",
  dev_yearly: "bandwidth_dev",
  dev_monthly: "bandwidth_dev",
};

/**
 * Rate limits for each entitlement (mirrored from API config)
 * These should match shapeshyft_api/src/middleware/rateLimit.ts
 */
const RATE_LIMITS = {
  none: { hourly: 10, daily: 120, monthly: 1800 },
  bandwidth_dev: { hourly: 100, daily: 1200, monthly: 18000 },
  bandwidth_pro: { hourly: 800, daily: 10000, monthly: 150000 },
  bandwidth_ultra: { hourly: null, daily: null, monthly: null }, // unlimited
} as const;

/**
 * Get free tier features list
 */
export const getFreeTierFeatures = (t: TFunction): string[] => [
  t("rateLimits.hourly", "{{limit}} requests/hour", {
    limit: RATE_LIMITS.none.hourly.toLocaleString(),
  }),
  t("rateLimits.daily", "{{limit}} requests/day", {
    limit: RATE_LIMITS.none.daily.toLocaleString(),
  }),
  t("rateLimits.monthly", "{{limit}} requests/month", {
    limit: RATE_LIMITS.none.monthly.toLocaleString(),
  }),
  t("freeTier.schemaValidation", "JSON Schema-validated outputs"),
  t("freeTier.allProviders", "All LLM providers (OpenAI, Anthropic, Google)"),
];

/**
 * Get product features based on package ID
 */
export const getProductFeatures = (
  packageId: string,
  tSub: TFunction,
): string[] => {
  const entitlement = PACKAGE_ENTITLEMENT_MAP[packageId];

  if (entitlement === "bandwidth_ultra") {
    return [
      tSub("rateLimits.unlimitedRequests", "Unlimited API requests"),
      tSub("freeTier.schemaValidation", "JSON Schema-validated outputs"),
      tSub(
        "freeTier.allProviders",
        "All LLM providers (OpenAI, Anthropic, Google)",
      ),
    ];
  }

  const limits = RATE_LIMITS[entitlement as keyof typeof RATE_LIMITS];
  if (!limits) {
    return [];
  }

  const features: string[] = [];

  // Add rate limit features
  if (limits.hourly !== null) {
    features.push(
      tSub("rateLimits.hourly", "{{limit}} requests/hour", {
        limit: limits.hourly.toLocaleString(),
      }),
    );
  }
  if (limits.daily !== null) {
    features.push(
      tSub("rateLimits.daily", "{{limit}} requests/day", {
        limit: limits.daily.toLocaleString(),
      }),
    );
  }
  if (limits.monthly !== null) {
    features.push(
      tSub("rateLimits.monthly", "{{limit}} requests/month", {
        limit: limits.monthly.toLocaleString(),
      }),
    );
  }

  // Add common features
  features.push(
    tSub("freeTier.schemaValidation", "JSON Schema-validated outputs"),
  );
  features.push(
    tSub(
      "freeTier.allProviders",
      "All LLM providers (OpenAI, Anthropic, Google)",
    ),
  );

  return features;
};

/**
 * Shared subscription labels
 */
export const getSharedSubscriptionLabels = (t: TFunction) => ({
  // Periods
  periodYear: t("periods.year"),
  periodMonth: t("periods.month"),
  periodWeek: t("periods.week"),

  // Billing period toggle
  billingMonthly: t("billingPeriod.monthly", "Monthly"),
  billingYearly: t("billingPeriod.yearly", "Yearly"),

  // Rate limits
  unlimited: t("rateLimits.unlimited", "Unlimited"),
  unlimitedRequests: t(
    "rateLimits.unlimitedRequests",
    "Unlimited API requests",
  ),

  // Free tier
  freeTierTitle: t("freeTier.title", "Free"),
  freeTierPrice: t("freeTier.price", "$0"),
  freeTierFeatures: getFreeTierFeatures(t),

  // Badges
  currentPlanBadge: t("badges.currentPlan", "Current Plan"),
});

/**
 * Shared subscription formatters
 */
export const getSharedSubscriptionFormatters = (t: TFunction) => ({
  formatHourlyLimit: (limit: string) =>
    t("rateLimits.hourly", "{{limit}} requests/hour", { limit }),
  formatDailyLimit: (limit: string) =>
    t("rateLimits.daily", "{{limit}} requests/day", { limit }),
  formatMonthlyLimit: (limit: string) =>
    t("rateLimits.monthly", "{{limit}} requests/month", { limit }),
  formatTrialDays: (count: number) => t("trial.days", { count }),
  formatTrialWeeks: (count: number) => t("trial.weeks", { count }),
  formatTrialMonths: (count: number) => t("trial.months", { count }),
  formatSavePercent: (percent: number) =>
    t("badges.savePercent", "Save {{percent}}%", { percent }),
  formatIntroNote: (price: string) => t("intro.note", { price }),
});
