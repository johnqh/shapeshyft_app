import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartBarIcon,
  BoltIcon,
  GlobeAltIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type VitalsRating = "good" | "needsImprovement" | "poor";

function PerformancePage() {
  const { t } = useTranslation("performance");
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
      case "lcp":
        if (value <= 2500) return "good";
        if (value <= 4000) return "needsImprovement";
        return "poor";
      case "fid":
        if (value <= 100) return "good";
        if (value <= 300) return "needsImprovement";
        return "poor";
      case "cls":
        if (value <= 0.1) return "good";
        if (value <= 0.25) return "needsImprovement";
        return "poor";
      default:
        return "good";
    }
  };

  const getRatingClasses = (rating: VitalsRating): string => {
    switch (rating) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "needsImprovement":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full mb-4">
          <RocketLaunchIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-green-800 dark:text-green-300 font-semibold">
            {t("badge")}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          {t("title")}
        </h1>

        <p className="text-theme-text-secondary max-w-2xl mx-auto">
          {t("description")}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-6">
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
              {t("quickStats.lazyLoad")}
            </div>
            <div className="text-sm text-theme-text-tertiary">
              {t("quickStats.codeSplitting")}
            </div>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
              {t("quickStats.serviceWorker")}
            </div>
            <div className="text-sm text-theme-text-tertiary">
              {t("quickStats.offlineCache")}
            </div>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-1">
              {t("quickStats.preloading")}
            </div>
            <div className="text-sm text-theme-text-tertiary">
              {t("quickStats.routePrefetch")}
            </div>
          </div>
          <div className="bg-theme-bg-secondary rounded-lg p-4">
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-1">
              &lt; 2.5s
            </div>
            <div className="text-sm text-theme-text-tertiary">
              {t("quickStats.lcpTarget")}
            </div>
          </div>
        </div>
      </div>

      {/* Core Web Vitals & Bundle Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals */}
        <div className="bg-theme-bg-primary border border-theme-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-theme-border">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-theme-text-primary">
                {t("webVitals.title")}
              </h2>
            </div>
            <p className="text-sm text-theme-text-secondary mt-1">
              {t("webVitals.description")}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* LCP */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
              <div>
                <h4 className="font-medium text-theme-text-primary">
                  {t("webVitals.lcp.title")}
                </h4>
                <p className="text-sm text-theme-text-tertiary">
                  {t("webVitals.lcp.description")}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded text-sm font-medium ${getRatingClasses(getVitalsRating("lcp", webVitalsScore.lcp))}`}
              >
                {Math.round(webVitalsScore.lcp)}ms
              </div>
            </div>

            {/* FID */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
              <div>
                <h4 className="font-medium text-theme-text-primary">
                  {t("webVitals.fid.title")}
                </h4>
                <p className="text-sm text-theme-text-tertiary">
                  {t("webVitals.fid.description")}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded text-sm font-medium ${getRatingClasses(getVitalsRating("fid", webVitalsScore.fid))}`}
              >
                {Math.round(webVitalsScore.fid)}ms
              </div>
            </div>

            {/* CLS */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
              <div>
                <h4 className="font-medium text-theme-text-primary">
                  {t("webVitals.cls.title")}
                </h4>
                <p className="text-sm text-theme-text-tertiary">
                  {t("webVitals.cls.description")}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded text-sm font-medium ${getRatingClasses(getVitalsRating("cls", webVitalsScore.cls))}`}
              >
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
              <BoltIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-theme-text-primary">
                {t("bundle.title")}
              </h2>
            </div>
            <p className="text-sm text-theme-text-secondary mt-1">
              {t("bundle.description")}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">
                {t("bundle.lazyLoadingStates")}
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    {t("bundle.componentLoading")}
                  </p>
                </div>
                <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    {t("bundle.componentLoaded")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">
                {t("bundle.bundleAnalysis")}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                  <span className="font-medium">{t("bundle.react")}</span>{" "}
                  ~207KB
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                  <span className="font-medium">{t("bundle.firebase")}</span>{" "}
                  ~161KB
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                  <span className="font-medium">
                    {t("bundle.uiComponents")}
                  </span>{" "}
                  ~219KB
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded">
                  <span className="font-medium">{t("bundle.charts")}</span>{" "}
                  ~368KB
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
            <GlobeAltIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-theme-text-primary">
              {t("api.title")}
            </h2>
          </div>
          <p className="text-sm text-theme-text-secondary mt-1">
            {t("api.description")}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">
                {t("api.currentLatency")}
              </h4>
              <div className="space-y-3">
                <div
                  className={`p-3 rounded ${apiLatency < 200 ? "bg-green-50 dark:bg-green-900/20" : apiLatency < 400 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-theme-text-primary">
                      {t("api.averageResponseTime")}
                    </span>
                    <span className="font-medium">
                      {Math.round(apiLatency)}ms
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-theme-text-primary mb-3 mt-6">
                {t("api.cacheStatus")}
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {t("api.freshData")}
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {" "}
                    - {t("api.recentlyFetched")}
                  </span>
                </div>
                <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                    {t("api.staleData")}
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {" "}
                    - {t("api.needsRefresh")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-theme-text-primary mb-3">
                {t("api.cachingStrategy")}
              </h4>
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
            <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-theme-text-primary">
              {t("bestPractices.title")}
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-theme-text-primary mb-4 flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                {t("bestPractices.doThis")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.do.codeSplitting")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.do.lazyLoading")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.do.cacheApi")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.do.preloadRoutes")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.do.monitorVitals")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.do.serviceWorker")}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-theme-text-primary mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                {t("bestPractices.avoidThis")}
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.avoid.eagerLoading")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.avoid.redundantCalls")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.avoid.layoutShifts")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.avoid.blockingRender")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.avoid.ignoreNetwork")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-secondary">
                    {t("bestPractices.avoid.noTreeShaking")}
                  </span>
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
