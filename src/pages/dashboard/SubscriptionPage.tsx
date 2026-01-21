import { useEffect, useMemo, useCallback } from "react";
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
import { useApi } from "@sudobility/building_blocks/firebase";
import { useCurrentEntity } from "../../hooks/useCurrentEntity";
import {
  getFreeTierFeatures,
  getSharedSubscriptionFormatters,
  getProductFeatures,
} from "../../config/subscription-config";
import { refreshSubscription } from "@sudobility/subscription_lib";

function SubscriptionPage() {
  const { t } = useTranslation("subscription");
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { success } = useToast();
  const { networkClient, baseUrl, token, testMode, isReady } = useApi();
  const { currentEntityId } = useCurrentEntity();
  const { purchase, restore } = useSubscriptionContext();

  const { config: rateLimitsConfig, refreshConfig: refreshRateLimits } =
    useRateLimits(networkClient, baseUrl, testMode);

  // Fetch rate limits on mount
  useEffect(() => {
    if (isReady && token && entitySlug) {
      refreshRateLimits(token, entitySlug);
    }
  }, [isReady, token, entitySlug, refreshRateLimits]);

  // Purchase handler - wraps the subscription context purchase
  const handlePurchase = useCallback(
    async (packageId: string): Promise<boolean> => {
      return purchase(packageId, currentEntityId ?? undefined);
    },
    [purchase, currentEntityId],
  );

  // Restore handler - wraps the subscription context restore
  const handleRestore = useCallback(async (): Promise<boolean> => {
    return restore(currentEntityId ?? undefined);
  }, [restore, currentEntityId]);

  const handlePurchaseSuccess = async () => {
    // Refresh subscription_lib data to sync state
    await refreshSubscription();
    success(t("purchase.success"));
  };

  const handleRestoreSuccess = async () => {
    // Refresh subscription_lib data to sync state
    await refreshSubscription();
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
      buttonUpgrade: t("buttons.upgrade", "Upgrade Now"),
      buttonUpgrading: t("buttons.upgrading", "Upgrading..."),
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
      offerId="api"
      rateLimitsConfig={rateLimitsConfig}
      labels={labels}
      formatters={formatters}
      onPurchase={handlePurchase}
      onRestore={handleRestore}
      onPurchaseSuccess={handlePurchaseSuccess}
      onRestoreSuccess={handleRestoreSuccess}
      onError={handleError}
      onWarning={handleWarning}
    />
  );
}

export default SubscriptionPage;
