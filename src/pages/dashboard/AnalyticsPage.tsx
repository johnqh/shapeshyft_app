import { useTranslation } from 'react-i18next';
import { useAnalyticsManager } from '@sudobility/shapeshyft_lib';
import { useApi } from '../../hooks/useApi';
import RequestDistributionChart from '../../components/dashboard/analytics/RequestDistributionChart';
import EndpointRequestsChart from '../../components/dashboard/analytics/EndpointRequestsChart';
import TokenDistributionChart from '../../components/dashboard/analytics/TokenDistributionChart';

function AnalyticsPage() {
  const { t } = useTranslation('dashboard');
  const { networkClient, baseUrl, userId, token, isReady, isLoading: apiLoading } = useApi();

  const {
    analytics,
    isLoading,
    error,
    refresh,
    clearError,
  } = useAnalyticsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
  });

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

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-theme-text-secondary mb-4">{error}</p>
        <button
          onClick={() => { clearError(); refresh(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  // No data
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          {t('analytics.noData')}
        </h3>
        <p className="text-theme-text-secondary">
          {t('analytics.noDataDescription')}
        </p>
      </div>
    );
  }

  const agg = analytics.aggregate;
  const successRate = agg.total_requests > 0
    ? ((agg.successful_requests / agg.total_requests) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          {t('analytics.title')}
        </h2>
        <button
          onClick={() => refresh()}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover-bg rounded-lg transition-colors disabled:opacity-50"
        >
          {t('common.refresh')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Requests */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t('analytics.metrics.totalRequests')}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            {formatNumber(agg.total_requests)}
          </p>
        </div>

        {/* Success Rate */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t('analytics.metrics.successRate')}
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {successRate}%
          </p>
        </div>

        {/* Avg Latency */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t('analytics.metrics.avgLatency')}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            {agg.average_latency_ms}ms
          </p>
        </div>

        {/* Total Cost */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t('analytics.metrics.totalCost')}
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
            {t('analytics.metrics.requestDistribution')}
          </h3>
          <RequestDistributionChart
            successful={agg.successful_requests}
            failed={agg.failed_requests}
          />
        </div>

        {/* Token Distribution Chart */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t('analytics.metrics.tokensUsed')}
          </h3>
          <TokenDistributionChart
            inputTokens={agg.total_tokens_input}
            outputTokens={agg.total_tokens_output}
          />
        </div>
      </div>

      {/* By Endpoint Chart */}
      {analytics.by_endpoint.length > 0 && (
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t('analytics.charts.byEndpoint')}
          </h3>
          <EndpointRequestsChart endpoints={analytics.by_endpoint} />
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
