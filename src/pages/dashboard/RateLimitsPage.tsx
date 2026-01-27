import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RateLimitsDashboard } from "@sudobility/ratelimit_pages";
import { useApi } from "@sudobility/building_blocks/firebase";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";

function RateLimitsPage() {
  const { t } = useTranslation("dashboard");
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token, testMode } = useApi();
  const { navigate } = useLocalizedNavigate();

  const handleUpgradeClick = () => {
    navigate("/dashboard/subscription");
  };

  return (
    <RateLimitsDashboard
      networkClient={networkClient}
      baseUrl={baseUrl}
      token={token}
      entitySlug={entitySlug}
      onUpgradeClick={handleUpgradeClick}
      upgradeButtonLabel={t("rateLimits.upgradeButton")}
      testMode={testMode}
      labels={{
        currentLimitsTab: t("rateLimits.tabs.currentLimits"),
        usageHistoryTab: t("rateLimits.tabs.usageHistory"),
        limitsPage: {
          title: t("rateLimits.usage.title"),
          loadingText: t("rateLimits.loading"),
          errorText: t("rateLimits.error"),
          retryText: t("rateLimits.retry"),
          usageTitle: t("rateLimits.usage.currentUsage"),
          tiersTitle: t("rateLimits.usage.planComparison"),
          usedLabel: t("rateLimits.usage.used"),
          limitLabel: t("rateLimits.usage.limit"),
          unlimitedLabel: t("rateLimits.usage.unlimited"),
          remainingLabel: t("rateLimits.usage.remaining"),
          hourlyLabel: t("rateLimits.periods.hourly"),
          dailyLabel: t("rateLimits.periods.daily"),
          monthlyLabel: t("rateLimits.periods.monthly"),
          currentTierBadge: t("rateLimits.currentTier"),
        },
        historyPage: {
          title: t("rateLimits.history.title"),
          loadingText: t("rateLimits.loading"),
          errorText: t("rateLimits.error"),
          retryText: t("rateLimits.retry"),
          chartTitle: "",
          requestsLabel: t("rateLimits.history.requests"),
          limitLabel: t("rateLimits.usage.limit"),
          noDataLabel: t("rateLimits.history.noData"),
          hourlyTab: t("rateLimits.periods.hourly"),
          dailyTab: t("rateLimits.periods.daily"),
          monthlyTab: t("rateLimits.periods.monthly"),
        },
      }}
    />
  );
}

export default RateLimitsPage;
