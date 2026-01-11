import { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { ThemeProvider } from "./context/ThemeContext";
import { ApiProvider } from "./context/ApiContext";
import { ToastProvider } from "./context/ToastContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { CurrentEntityProvider } from "./context/CurrentEntityContext";
import { useCurrentEntity } from "./hooks/useCurrentEntity";
import { isLanguageSupported } from "./config/constants";
import { AuthProviderWrapper } from "./components/providers/AuthProviderWrapper";
import { LazySubscriptionProvider } from "./components/providers/LazySubscriptionProvider";
import ToastContainer from "./components/ui/ToastContainer";
import { PageTracker } from "./hooks/usePageTracking";
import { InfoBanner } from "@sudobility/di_web";
import { getNetworkService } from "@sudobility/di";
import { NetworkProvider } from "@sudobility/devops-components";

// Lazy load PerformancePanel - only used in dev mode
const PerformancePanel = lazy(() =>
  import("@sudobility/components").then((mod) => ({
    default: mod.PerformancePanel,
  })),
);

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PricingPageWrapper = lazy(() => import("./pages/PricingPageWrapper"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const AppSettingsPage = lazy(() => import("./pages/SettingsPage"));
const UseCasesPage = lazy(() => import("./pages/use-cases/UseCasesPage"));
const UseCasesTextPage = lazy(
  () => import("./pages/use-cases/UseCasesTextPage"),
);
const UseCasesDataPage = lazy(
  () => import("./pages/use-cases/UseCasesDataPage"),
);
const UseCasesContentPage = lazy(
  () => import("./pages/use-cases/UseCasesContentPage"),
);
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/dashboard/ProjectsPage"));
const ProjectNewPage = lazy(() => import("./pages/dashboard/ProjectNewPage"));
const TemplatesPage = lazy(() => import("./pages/dashboard/TemplatesPage"));
const ProjectDetailPage = lazy(
  () => import("./pages/dashboard/ProjectDetailPage"),
);
const EndpointNewPage = lazy(() => import("./pages/dashboard/EndpointNewPage"));
const EndpointDetailPage = lazy(
  () => import("./pages/dashboard/EndpointDetailPage"),
);
const KeysPage = lazy(() => import("./pages/dashboard/KeysPage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const SubscriptionPage = lazy(
  () => import("./pages/dashboard/SubscriptionPage"),
);
const BudgetsPage = lazy(() => import("./pages/dashboard/BudgetsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const RateLimitsPage = lazy(() => import("./pages/dashboard/RateLimitsPage"));
const WorkspacesPage = lazy(() => import("./pages/dashboard/WorkspacesPage"));
const MembersPage = lazy(() => import("./pages/dashboard/MembersPage"));
const InvitationsPage = lazy(() => import("./pages/dashboard/InvitationsPage"));
const PerformancePage = lazy(() => import("./pages/dashboard/PerformancePage"));

// Layout components
const LanguageRedirect = lazy(
  () => import("./components/layout/LanguageRedirect"),
);
const LanguageValidator = lazy(() =>
  import("@sudobility/components").then((mod) => ({
    default: () => (
      <mod.LanguageValidator
        isLanguageSupported={isLanguageSupported}
        defaultLanguage="en"
        storageKey="language"
      />
    ),
  })),
);
const ProtectedRoute = lazy(() => import("./components/layout/ProtectedRoute"));
const EntityRedirect = lazy(() => import("./components/layout/EntityRedirect"));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Wrapper that reads entity ID from context and passes to subscription provider
function EntityAwareSubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { entityId } = useCurrentEntity();
  return (
    <LazySubscriptionProvider entityId={entityId ?? undefined}>
      {children}
    </LazySubscriptionProvider>
  );
}

// Stable reference for PerformancePanel to prevent infinite re-renders
const PERFORMANCE_API_PATTERNS = ["/api/"];

function App() {
  // Get network service inside component (after main.tsx initializes it)
  const networkService = useMemo(() => getNetworkService(), []);

  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <NetworkProvider networkService={networkService}>
            <QueryClientProvider client={queryClient}>
              <ToastProvider>
                <AuthProviderWrapper>
                  <CurrentEntityProvider>
                    <ApiProvider>
                      <AnalyticsProvider>
                        <EntityAwareSubscriptionProvider>
                          <BrowserRouter>
                        <PageTracker />
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            {/* Root redirect - detect language */}
                            <Route path="/" element={<LanguageRedirect />} />

                            {/* Language-prefixed routes */}
                            <Route
                              path="/:lang"
                              element={<LanguageValidator />}
                            >
                              {/* Public pages */}
                              <Route index element={<HomePage />} />
                              <Route path="login" element={<LoginPage />} />
                              <Route path="pricing" element={<PricingPageWrapper />} />
                              <Route path="docs" element={<DocsPage />} />
                              <Route
                                path="docs/:section"
                                element={<DocsPage />}
                              />
                              <Route
                                path="use-cases"
                                element={<UseCasesPage />}
                              />
                              <Route
                                path="use-cases/text"
                                element={<UseCasesTextPage />}
                              />
                              <Route
                                path="use-cases/data"
                                element={<UseCasesDataPage />}
                              />
                              <Route
                                path="use-cases/content"
                                element={<UseCasesContentPage />}
                              />
                              <Route path="about" element={<AboutPage />} />
                              <Route path="contact" element={<ContactPage />} />
                              <Route path="privacy" element={<PrivacyPage />} />
                              <Route path="terms" element={<TermsPage />} />
                              <Route path="cookies" element={<CookiesPage />} />
                              <Route path="sitemap" element={<SitemapPage />} />
                              <Route
                                path="settings"
                                element={<AppSettingsPage />}
                              />

                              {/* Dashboard redirect - picks default entity */}
                              <Route
                                path="dashboard"
                                element={
                                  <ProtectedRoute>
                                    <EntityRedirect />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Protected dashboard routes with entity slug */}
                              <Route
                                path="dashboard/:entitySlug"
                                element={
                                  <ProtectedRoute>
                                    <DashboardPage />
                                  </ProtectedRoute>
                                }
                              >
                                <Route index element={<ProjectsPage />} />
                                <Route
                                  path="projects"
                                  element={<ProjectsPage />}
                                />
                                <Route
                                  path="projects/new"
                                  element={<ProjectNewPage />}
                                />
                                <Route
                                  path="projects/templates"
                                  element={<TemplatesPage />}
                                />
                                <Route
                                  path="projects/:projectId"
                                  element={<ProjectDetailPage />}
                                />
                                <Route
                                  path="projects/:projectId/endpoints/new"
                                  element={<EndpointNewPage />}
                                />
                                <Route
                                  path="projects/:projectId/endpoints/:endpointId"
                                  element={<EndpointDetailPage />}
                                />
                                <Route
                                  path="providers"
                                  element={<KeysPage />}
                                />
                                <Route
                                  path="analytics"
                                  element={<AnalyticsPage />}
                                />
                                <Route
                                  path="subscription"
                                  element={<SubscriptionPage />}
                                />
                                <Route
                                  path="budgets"
                                  element={<BudgetsPage />}
                                />
                                <Route
                                  path="settings"
                                  element={<SettingsPage />}
                                />
                                <Route
                                  path="rate-limits"
                                  element={<RateLimitsPage />}
                                />
                                <Route
                                  path="workspaces"
                                  element={<WorkspacesPage />}
                                />
                                <Route
                                  path="members"
                                  element={<MembersPage />}
                                />
                                <Route
                                  path="invitations"
                                  element={<InvitationsPage />}
                                />
                                <Route
                                  path="performance"
                                  element={<PerformancePage />}
                                />
                              </Route>

                              {/* Catch-all redirect to home */}
                              <Route
                                path="*"
                                element={<Navigate to="." replace />}
                              />
                            </Route>

                            {/* Catch-all without language - redirect to language detection */}
                            <Route path="*" element={<LanguageRedirect />} />
                          </Routes>
                        </Suspense>
                        <ToastContainer />
                        {/* Floating performance panel - controlled by VITE_SHOW_PERFORMANCE_MONITOR */}
                        {import.meta.env.VITE_SHOW_PERFORMANCE_MONITOR ===
                          "true" && (
                          <PerformancePanel
                            enabled={true}
                            position="bottom-right"
                            apiPatterns={PERFORMANCE_API_PATTERNS}
                          />
                        )}
                        <InfoBanner />
                          </BrowserRouter>
                        </EntityAwareSubscriptionProvider>
                      </AnalyticsProvider>
                    </ApiProvider>
                  </CurrentEntityProvider>
                </AuthProviderWrapper>
              </ToastProvider>
            </QueryClientProvider>
          </NetworkProvider>
        </ThemeProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
