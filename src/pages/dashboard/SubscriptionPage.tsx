import { useEffect, useMemo } from "react";
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
  );
}

export default SubscriptionPage;
