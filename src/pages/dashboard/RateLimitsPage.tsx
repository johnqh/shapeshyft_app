import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RateLimitsPage as RateLimitsPageComponent,
  RateLimitHistoryPage,
} from "@sudobility/ratelimit-pages";
import { useApi } from "../../hooks/useApi";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";

type TabType = "limits" | "history";

function RateLimitsPage() {
  const { t } = useTranslation("dashboard");
  const { networkClient, baseUrl, token } = useApi();
  const { navigate } = useLocalizedNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("limits");

  const handleUpgradeClick = () => {
    navigate("/dashboard/subscription");
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab("limits")}
            className={`py-3 text-sm font-medium transition-colors ${
              activeTab === "limits"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t("rateLimits.tabs.currentLimits")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t("rateLimits.tabs.usageHistory")}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "limits" && (
        <RateLimitsPageComponent
          networkClient={networkClient}
          baseUrl={baseUrl}
          token={token}
          onUpgradeClick={handleUpgradeClick}
          upgradeButtonLabel={t("rateLimits.upgradeButton")}
          autoFetch={true}
          labels={{
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
          }}
        />
      )}

      {activeTab === "history" && (
        <RateLimitHistoryPage
          networkClient={networkClient}
          baseUrl={baseUrl}
          token={token}
          autoFetch={true}
          chartHeight={350}
          labels={{
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
          }}
        />
      )}
    </div>
  );
}

export default RateLimitsPage;
