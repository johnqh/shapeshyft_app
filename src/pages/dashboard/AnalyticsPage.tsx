import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Placeholder data
const mockAnalytics = {
  total_requests: 12450,
  successful_requests: 12100,
  failed_requests: 350,
  total_tokens_input: 2450000,
  total_tokens_output: 890000,
  total_estimated_cost_cents: 4523,
  average_latency_ms: 234,
};

function AnalyticsPage() {
  const { t } = useTranslation('dashboard');
  const [period, setPeriod] = useState('week');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const successRate = (
    (mockAnalytics.successful_requests / mockAnalytics.total_requests) *
    100
  ).toFixed(1);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          {t('analytics.title')}
        </h2>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover-bg'
              }`}
            >
              {t(`analytics.period.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Requests */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t('analytics.metrics.totalRequests')}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            {formatNumber(mockAnalytics.total_requests)}
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
            {mockAnalytics.average_latency_ms}ms
          </p>
        </div>

        {/* Total Cost */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-sm text-theme-text-secondary mb-2">
            {t('analytics.metrics.totalCost')}
          </h3>
          <p className="text-3xl font-bold text-theme-text-primary">
            ${(mockAnalytics.total_estimated_cost_cents / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Token Usage */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tokens Used */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t('analytics.metrics.tokensUsed')}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-theme-text-secondary">Input Tokens</span>
              <span className="font-semibold text-theme-text-primary">
                {formatNumber(mockAnalytics.total_tokens_input)}
              </span>
            </div>
            <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${
                    (mockAnalytics.total_tokens_input /
                      (mockAnalytics.total_tokens_input +
                        mockAnalytics.total_tokens_output)) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-text-secondary">Output Tokens</span>
              <span className="font-semibold text-theme-text-primary">
                {formatNumber(mockAnalytics.total_tokens_output)}
              </span>
            </div>
            <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    (mockAnalytics.total_tokens_output /
                      (mockAnalytics.total_tokens_input +
                        mockAnalytics.total_tokens_output)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Request Distribution */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            Request Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-theme-text-secondary">Successful</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatNumber(mockAnalytics.successful_requests)}
              </span>
            </div>
            <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${successRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-text-secondary">Failed</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatNumber(mockAnalytics.failed_requests)}
              </span>
            </div>
            <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    (mockAnalytics.failed_requests / mockAnalytics.total_requests) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for Charts */}
      <div className="mt-6 p-6 bg-theme-bg-secondary rounded-xl">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
          {t('analytics.charts.requestsOverTime')}
        </h3>
        <div className="h-64 flex items-center justify-center text-theme-text-tertiary">
          Charts will be implemented with a charting library (e.g., Recharts)
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
