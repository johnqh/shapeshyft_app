import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSubscriptionContext } from "@sudobility/subscription-components";
import {
  EntitySubscriptionsPage,
  type SubscriptionPageLabels,
  type SubscriptionPageFormatters,
} from "@sudobility/entity_pages";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useRateLimits } from "@sudobility/shapeshyft_client";
import { useToast } from "../../hooks/useToast";
import { useApi } from "../../hooks/useApi";
import { useCurrentEntity } from "../../hooks/useCurrentEntity";

function SubscriptionPage() {
  const { t } = useTranslation("subscription");
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { success } = useToast();
  const { networkClient, baseUrl, token, testMode, isReady } = useApi();
  const { entityId } = useCurrentEntity();
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
      unlimitedRequests: t("rateLimits.unlimitedRequests", "Unlimited API requests"),

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
      freeTierFeatures: [
        t("freeTier.schemaValidation", "JSON Schema-validated outputs"),
        t("freeTier.allProviders", "All LLM providers (OpenAI, Anthropic, Google)"),
        t("freeTier.endpointTesting", "Built-in endpoint testing"),
        t("freeTier.analytics", "Basic usage analytics"),
      ],

      // Badges
      currentPlanBadge: t("badges.currentPlan", "Current Plan"),
    }),
    [t],
  );

  // Memoize formatters to prevent unnecessary re-renders
  const formatters: SubscriptionPageFormatters = useMemo(
    () => ({
      formatHourlyLimit: (limit: string) =>
        t("rateLimits.hourly", "{{limit}} requests/hour", { limit }),
      formatDailyLimit: (limit: string) =>
        t("rateLimits.daily", "{{limit}} requests/day", { limit }),
      formatMonthlyLimit: (limit: string) =>
        t("rateLimits.monthly", "{{limit}} requests/month", { limit }),
      formatTrialDays: (count: number) =>
        t("trial.days", { count }),
      formatTrialWeeks: (count: number) =>
        t("trial.weeks", { count }),
      formatTrialMonths: (count: number) =>
        t("trial.months", { count }),
      formatSavePercent: (percent: number) =>
        t("badges.savePercent", "Save {{percent}}%", { percent }),
      formatIntroNote: (price: string) =>
        t("intro.note", { price }),
    }),
    [t],
  );

  return (
    <EntitySubscriptionsPage
      subscription={subscriptionContext}
      rateLimitsConfig={rateLimitsConfig}
      subscriptionUserId={entityId ?? undefined}
      labels={labels}
      formatters={formatters}
      onPurchaseSuccess={handlePurchaseSuccess}
      onRestoreSuccess={handleRestoreSuccess}
      onError={handleError}
      onWarning={handleWarning}
    />
  );
}

export default SubscriptionPage;
