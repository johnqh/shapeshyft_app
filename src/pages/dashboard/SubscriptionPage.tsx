import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSubscriptionContext } from "@sudobility/subscription-components";
import {
  AppSubscriptionsPage,
  type SubscriptionPageLabels,
  type SubscriptionPageFormatters,
} from "@sudobility/building_blocks";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useRateLimits } from "@sudobility/shapeshyft_client";
import { useToast } from "../../hooks/useToast";
import { useApi } from "../../hooks/useApi";
import { useCurrentEntity } from "../../hooks/useCurrentEntity";
import {
  getFreeTierFeatures,
  getSharedSubscriptionFormatters,
  getProductFeatures,
  PACKAGE_ENTITLEMENT_MAP,
  ENTITLEMENT_LEVELS,
} from "../../config/subscription-config";
import { CONSTANTS } from "../../config/constants";

// Test card info for RevenueCat sandbox (Stripe test cards)
const TEST_CARD = {
  number: "4242 4242 4242 4242",
  expiry: "12/34",
  cvc: "123",
  zip: "12345",
};

function TestCardBanner() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value.replace(/\s/g, ""));
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-medium text-yellow-800 dark:text-yellow-200">
          Dev Mode - Test Card Info
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[
          { label: "Card", value: TEST_CARD.number, field: "number" },
          { label: "Expiry", value: TEST_CARD.expiry, field: "expiry" },
          { label: "CVC", value: TEST_CARD.cvc, field: "cvc" },
          { label: "ZIP", value: TEST_CARD.zip, field: "zip" },
        ].map(({ label, value, field }) => (
          <button
            key={field}
            onClick={() => copyToClipboard(value, field)}
            className="flex flex-col items-start p-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {label}
            </span>
            <span className="font-mono text-gray-900 dark:text-gray-100">
              {value}
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              {copied === field ? "Copied!" : "Click to copy"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SubscriptionPage() {
  const { t } = useTranslation("subscription");
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { success } = useToast();
  const { networkClient, baseUrl, token, testMode, isReady } = useApi();
  const { currentEntityId } = useCurrentEntity();
  const subscriptionContext = useSubscriptionContext();

  const { config: rateLimitsConfig, refreshConfig: refreshRateLimits } =
    useRateLimits(networkClient, baseUrl, testMode);

  // Fetch rate limits on mount
  useEffect(() => {
    if (isReady && token && entitySlug) {
      refreshRateLimits(token, entitySlug);
    }
  }, [isReady, token, entitySlug, refreshRateLimits]);

  const handlePurchaseSuccess = () => {
    success(t("purchase.success"));
  };

  const handleRestoreSuccess = () => {
    success(t("restore.success"));
  };

  const handleError = (title: string, message: string) => {
    getInfoService().show(title, message, InfoType.ERROR, 5000);
  };

  const handleWarning = (title: string, message: string) => {
    getInfoService().show(title, message, InfoType.WARNING, 5000);
  };

  // Memoize labels to prevent unnecessary re-renders
  const labels: SubscriptionPageLabels = useMemo(
    () => ({
      title: t("title"),
      errorTitle: t("common.error"),
      purchaseError: t("purchase.error"),
      restoreError: t("restore.error"),
      restoreNoPurchases: t("restore.noPurchases"),

      // Periods
      periodYear: t("periods.year"),
      periodMonth: t("periods.month"),
      periodWeek: t("periods.week"),

      // Billing period toggle
      billingMonthly: t("billingPeriod.monthly"),
      billingYearly: t("billingPeriod.yearly"),

      // Rate limits
      unlimited: t("rateLimits.unlimited", "Unlimited"),
      unlimitedRequests: t(
        "rateLimits.unlimitedRequests",
        "Unlimited API requests",
      ),

      // Current status
      currentStatusLabel: t("currentStatus.label"),
      statusActive: t("currentStatus.active"),
      statusInactive: t("currentStatus.inactive"),
      statusInactiveMessage: t("currentStatus.inactiveMessage"),
      labelPlan: t("currentStatus.plan"),
      labelPremium: t("currentStatus.premium"),
      labelExpires: t("currentStatus.expires"),
      labelWillRenew: t("currentStatus.willRenew"),
      labelMonthlyUsage: t("currentStatus.monthlyUsage", "Monthly Usage"),
      labelDailyUsage: t("currentStatus.dailyUsage", "Daily Usage"),
      yes: t("common.yes"),
      no: t("common.no"),

      // Buttons
      buttonSubscribe: t("buttons.subscribe"),
      buttonPurchasing: t("buttons.purchasing"),
      buttonRestore: t("buttons.restore"),
      buttonRestoring: t("buttons.restoring"),

      // Empty states
      noProducts: t("noProducts"),
      noProductsForPeriod: t("noProductsForPeriod"),

      // Free tier
      freeTierTitle: t("freeTier.title"),
      freeTierPrice: t("freeTier.price"),
      freeTierFeatures: getFreeTierFeatures(t),

      // Badges
      currentPlanBadge: t("badges.currentPlan", "Current Plan"),
    }),
    [t],
  );

  // Memoize formatters to prevent unnecessary re-renders
  const formatters: SubscriptionPageFormatters = useMemo(
    () => ({
      ...getSharedSubscriptionFormatters(t),
      getProductFeatures: (packageId: string) =>
        getProductFeatures(packageId, t),
    }),
    [t],
  );

  return (
    <>
      {CONSTANTS.DEV_MODE && <TestCardBanner />}
      <AppSubscriptionsPage
        subscription={subscriptionContext}
        rateLimitsConfig={rateLimitsConfig}
        subscriptionUserId={currentEntityId ?? undefined}
        labels={labels}
        formatters={formatters}
        entitlementMap={PACKAGE_ENTITLEMENT_MAP}
        entitlementLevels={ENTITLEMENT_LEVELS}
        onPurchaseSuccess={handlePurchaseSuccess}
        onRestoreSuccess={handleRestoreSuccess}
        onError={handleError}
        onWarning={handleWarning}
      />
    </>
  );
}

export default SubscriptionPage;
