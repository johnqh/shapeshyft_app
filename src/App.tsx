import { Suspense, lazy, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SudobilityAppWithFirebaseAuthAndEntities } from "@sudobility/building_blocks/firebase";
import { PerformancePanel, LanguageValidator } from "@sudobility/components";
import { isLanguageSupported, CONSTANTS } from "./config/constants";
import { useDocumentLanguage } from "./hooks/useDocumentLanguage";

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
const EndpointTemplatesPage = lazy(
  () => import("./pages/dashboard/EndpointTemplatesPage"),
);
const EndpointDetailPage = lazy(
  () => import("./pages/dashboard/EndpointDetailPage"),
);
const ProvidersPage = lazy(() => import("./pages/dashboard/ProvidersPage"));
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
const ProtectedRoute = lazy(() => import("./components/layout/ProtectedRoute"));
const EntityRedirect = lazy(() => import("./components/layout/EntityRedirect"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Component that syncs document language attributes (html lang and dir)
function DocumentLanguageSync({ children }: { children: ReactNode }) {
  useDocumentLanguage();
  return <>{children}</>;
}

// Stable reference for PerformancePanel to prevent infinite re-renders
const PERFORMANCE_API_PATTERNS = ["/api/"];

// Performance panel component
function PerformancePanelComponent() {
  if (import.meta.env.VITE_SHOW_PERFORMANCE_MONITOR !== "true") {
    return null;
  }
  return (
    <PerformancePanel
      enabled={true}
      position="bottom-right"
      apiPatterns={PERFORMANCE_API_PATTERNS}
    />
  );
}

function AppRoutes() {
  return (
    <DocumentLanguageSync>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Root redirect - detect language */}
          <Route path="/" element={<LanguageRedirect />} />

          {/* Language-prefixed routes */}
          <Route
            path="/:lang"
            element={
              <LanguageValidator
                isLanguageSupported={isLanguageSupported}
                defaultLanguage="en"
                storageKey="language"
              />
            }
          >
            {/* Public pages */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="pricing" element={<PricingPageWrapper />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="docs/:section" element={<DocsPage />} />
            <Route path="use-cases" element={<UseCasesPage />} />
            <Route path="use-cases/text" element={<UseCasesTextPage />} />
            <Route path="use-cases/data" element={<UseCasesDataPage />} />
            <Route path="use-cases/content" element={<UseCasesContentPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="cookies" element={<CookiesPage />} />
            <Route path="sitemap" element={<SitemapPage />} />
            <Route path="settings" element={<AppSettingsPage />} />

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
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/new" element={<ProjectNewPage />} />
              <Route path="projects/templates" element={<TemplatesPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route
                path="projects/:projectId/endpoints/templates"
                element={<EndpointTemplatesPage />}
              />
              <Route
                path="projects/:projectId/endpoints/new"
                element={<EndpointNewPage />}
              />
              <Route
                path="projects/:projectId/endpoints/:endpointId"
                element={<EndpointDetailPage />}
              />
              <Route path="providers" element={<ProvidersPage />} />
              {CONSTANTS.DEV_MODE && (
                <Route path="analytics" element={<AnalyticsPage />} />
              )}
              <Route path="subscription" element={<SubscriptionPage />} />
              {CONSTANTS.DEV_MODE && (
                <Route path="budgets" element={<BudgetsPage />} />
              )}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="rate-limits" element={<RateLimitsPage />} />
              <Route path="workspaces" element={<WorkspacesPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="invitations" element={<InvitationsPage />} />
              <Route path="performance" element={<PerformancePage />} />
            </Route>

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="." replace />} />
          </Route>

          {/* Catch-all without language - redirect to language detection */}
          <Route path="*" element={<LanguageRedirect />} />
        </Routes>
        <PerformancePanelComponent />
      </Suspense>
    </DocumentLanguageSync>
  );
}

function App() {
  return (
    <SudobilityAppWithFirebaseAuthAndEntities
      apiUrl={CONSTANTS.API_URL}
      testMode={CONSTANTS.DEV_MODE}
      revenueCatApiKey={CONSTANTS.REVENUECAT_API_KEY}
      revenueCatApiKeySandbox={CONSTANTS.REVENUECAT_API_KEY_SANDBOX}
    >
      <AppRoutes />
    </SudobilityAppWithFirebaseAuthAndEntities>
  );
}

export default App;
