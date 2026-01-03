import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Zap,
  Globe,
  Check,
  AlertTriangle,
  Rocket,
  RefreshCw,
} from 'lucide-react';

type VitalsRating = 'good' | 'needsImprovement' | 'poor';

function PerformancePage() {
  const { t } = useTranslation('dashboard');
  const [webVitalsScore, setWebVitalsScore] = useState({
    lcp: 0,
    fid: 0,
    cls: 0,
  });
  const [apiLatency, setApiLatency] = useState(0);

  // Simulate performance metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setWebVitalsScore({
        lcp: Math.random() * 4000,
        fid: Math.random() * 300,
        cls: Math.random() * 0.25,
      });
      setApiLatency(Math.random() * 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getVitalsRating = (metric: string, value: number): VitalsRating => {
    switch (metric) {
      case 'lcp':
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needsImprovement';
        return 'poor';
      case 'fid':
        if (value <= 100) return 'good';
        if (value <= 300) return 'needsImprovement';
        return 'poor';
      case 'cls':
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needsImprovement';
        return 'poor';
      default:
        return 'good';
    }
  };

  const getRatingClasses = (rating: VitalsRating): string => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'needsImprovement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full mb-4">
          <Rocket className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-green-800 dark:text-green-300 font-semibold">
            {t('performance.badge', 'Performance & Optimization')}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          {t('performance.title', 'Performance Monitoring')}
        </h1>

        <p className="text-theme-text-secondary max-w-2xl mx-auto">
          {t('performance.description', 'Monitor Core Web Vitals, bundle performance, and API latency to ensure optimal user experience.')}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-6">
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
              Lazy Load
            </div>
            <div className="text-sm text-theme-text-tertiary">Code Splitting</div>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
              Service Worker
            </div>
            <div className="text-sm text-theme-text-tertiary">Offline Cache</div>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-1">
              Preloading
            </div>
            <div className="text-sm text-theme-text-tertiary">Route Prefetch</div>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-1">
              &lt; 2.5s
            </div>
            <div className="text-sm text-theme-text-tertiary">LCP Target</div>
          </div>
        </div>
      </div>

      {/* Core Web Vitals & Bundle Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals */}
        <div className="bg-theme-bg-primary border border-theme-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-theme-border">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-theme-text-primary">
                {t('performance.webVitals.title', 'Core Web Vitals')}
              </h2>
            </div>
            <p className="text-sm text-theme-text-secondary mt-1">
              {t('performance.webVitals.description', 'Real-time monitoring of Core Web Vitals metrics.')}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* LCP */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
              <div>
                <h4 className="font-medium text-theme-text-primary">Largest Contentful Paint</h4>
                <p className="text-sm text-theme-text-tertiary">Time to render largest element</p>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${getRatingClasses(getVitalsRating('lcp', webVitalsScore.lcp))}`}>
                {Math.round(webVitalsScore.lcp)}ms
              </div>
            </div>

            {/* FID */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
              <div>
                <h4 className="font-medium text-theme-text-primary">First Input Delay</h4>
                <p className="text-sm text-theme-text-tertiary">Time to interactive response</p>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${getRatingClasses(getVitalsRating('fid', webVitalsScore.fid))}`}>
                {Math.round(webVitalsScore.fid)}ms
              </div>
            </div>

            {/* CLS */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
              <div>
                <h4 className="font-medium text-theme-text-primary">Cumulative Layout Shift</h4>
                <p className="text-sm text-theme-text-tertiary">Visual stability score</p>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${getRatingClasses(getVitalsRating('cls', webVitalsScore.cls))}`}>
                {webVitalsScore.cls.toFixed(3)}
              </div>
            </div>

            <div className="mt-4 bg-theme-bg-secondary p-4 rounded-lg">
              <pre className="text-xs text-theme-text-secondary overflow-x-auto font-mono">
{`// Web Vitals targets
LCP: < 2500ms (good), < 4000ms (needs improvement)
FID: < 100ms (good), < 300ms (needs improvement)
CLS: < 0.1 (good), < 0.25 (needs improvement)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Bundle Optimization */}
        <div className="bg-theme-bg-primary border border-theme-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-theme-border">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-theme-text-primary">
                {t('performance.bundle.title', 'Bundle Optimization')}
              </h2>
            </div>
            <p className="text-sm text-theme-text-secondary mt-1">
              {t('performance.bundle.description', 'Code splitting and lazy loading for reduced initial bundle size.')}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">Lazy Loading States</h4>
              <div className="space-y-2">
                <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Component loading...
                  </p>
                </div>
                <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Component loaded
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">Bundle Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                  <span className="font-medium">React:</span> ~207KB
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                  <span className="font-medium">Firebase:</span> ~161KB
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                  <span className="font-medium">UI Components:</span> ~219KB
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded">
                  <span className="font-medium">Charts:</span> ~368KB
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Performance */}
      <div className="bg-theme-bg-primary border border-theme-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-theme-text-primary">
              {t('performance.api.title', 'API Performance')}
            </h2>
          </div>
          <p className="text-sm text-theme-text-secondary mt-1">
            {t('performance.api.description', 'Monitor API response times and caching effectiveness.')}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">Current API Latency</h4>
              <div className="space-y-3">
                <div className={`p-3 rounded ${apiLatency < 200 ? 'bg-green-50 dark:bg-green-900/20' : apiLatency < 400 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-text-primary">Average Response Time</span>
                    <span className="font-medium">{Math.round(apiLatency)}ms</span>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-theme-text-primary mb-3 mt-6">Cache Status</h4>
              <div className="space-y-2">
                <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="text-green-700 dark:text-green-300 font-medium">Fresh Data</span>
                  <span className="text-green-600 dark:text-green-400"> - Recently fetched</span>
                </div>
                <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">Stale Data</span>
                  <span className="text-yellow-600 dark:text-yellow-400"> - Needs refresh</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">Caching Strategy</h4>
              <div className="bg-theme-bg-secondary p-4 rounded-lg">
                <pre className="text-xs text-theme-text-secondary overflow-x-auto font-mono">
{`// Service Worker Caching
Static Assets: Cache First (1 year)
HTML Pages: Network First
API Calls: Network Only
Locales: Stale While Revalidate`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-theme-bg-primary border border-theme-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-theme-text-primary">
              {t('performance.bestPractices.title', 'Performance Best Practices')}
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-theme-text-primary mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Do This
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Use code splitting for dashboard features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Implement lazy loading for images and components</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Cache API responses with TanStack Query</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Preload routes on hover for instant navigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Monitor Core Web Vitals in production</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Use service worker for offline support</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-theme-text-primary mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Avoid This
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Loading all components eagerly on initial page load</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Making redundant API calls without caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Causing layout shifts with dynamic content</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Using blocking rendering for non-critical features</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Ignoring network conditions for resource loading</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">Importing large libraries without tree-shaking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformancePage;
