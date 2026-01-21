import { useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useAnalyticsManager } from "@sudobility/shapeshyft_lib";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useApi } from "@sudobility/building_blocks/firebase";

// Lazy load chart components to defer recharts (~360KB) until needed
const RequestDistributionChart = lazy(
  () => import("../../components/dashboard/analytics/RequestDistributionChart"),
);
const EndpointRequestsChart = lazy(
  () => import("../../components/dashboard/analytics/EndpointRequestsChart"),
);
const TokenDistributionChart = lazy(
  () => import("../../components/dashboard/analytics/TokenDistributionChart"),
);

// Chart loading fallback
const ChartSkeleton = () => (
  <div className="h-64 flex items-center justify-center">
    <div className="animate-pulse bg-theme-bg-tertiary rounded w-full h-full" />
  </div>
);

function AnalyticsPage() {
  const { t } = useTranslation("dashboard");
  const {
    networkClient,
    baseUrl,
    userId,
    token,
    testMode,
    isReady,
    isLoading: apiLoading,
  } = useApi();

  const { analytics, isLoading, error, refresh, clearError } =
    useAnalyticsManager({
      baseUrl,
      networkClient,
      userId: userId ?? "",
      token,
      testMode,
    });

  // Show error via InfoInterface
  useEffect(() => {
    if (error) {
      getInfoService().show(t("common.error"), error, InfoType.ERROR, 5000);
      clearError();
    }
  }, [error, clearError, t]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading state
  if (apiLoading || (isReady && isLoading && !analytics)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No data
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          {t("analytics.noData")}
        </h3>
        <p className="text-theme-text-secondary">
          {t("analytics.noDataDescription")}
        </p>
      </div>
    );
  }

  const agg = analytics.aggregate;
  const successRate =
    agg.total_requests > 0
      ? ((agg.successful_requests / agg.total_requests) * 100).toFixed(1)
      : "0.0";

  return (
    <div>
      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => refresh()}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover-bg rounded-lg transition-colors disabled:opacity-50"
        >
          {t("common.refresh")}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Requests */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t("analytics.metrics.totalRequests")}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            {formatNumber(agg.total_requests)}
          </p>
        </div>

        {/* Success Rate */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t("analytics.metrics.successRate")}
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {successRate}%
          </p>
        </div>

        {/* Avg Latency */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t("analytics.metrics.avgLatency")}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            {agg.average_latency_ms}ms
          </p>
        </div>

        {/* Total Cost */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t("analytics.metrics.totalCost")}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            ${(agg.total_estimated_cost_cents / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Request Distribution Chart */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t("analytics.metrics.requestDistribution")}
          </h3>
          <Suspense fallback={<ChartSkeleton />}>
            <RequestDistributionChart
              successful={agg.successful_requests}
              failed={agg.failed_requests}
            />
          </Suspense>
        </div>

        {/* Token Distribution Chart */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t("analytics.metrics.tokensUsed")}
          </h3>
          <Suspense fallback={<ChartSkeleton />}>
            <TokenDistributionChart
              inputTokens={agg.total_tokens_input}
              outputTokens={agg.total_tokens_output}
            />
          </Suspense>
        </div>
      </div>

      {/* By Endpoint Chart */}
      {analytics.by_endpoint.length > 0 && (
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t("analytics.charts.byEndpoint")}
          </h3>
          <Suspense fallback={<ChartSkeleton />}>
            <EndpointRequestsChart endpoints={analytics.by_endpoint} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
