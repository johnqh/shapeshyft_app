import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { ApiProvider } from './context/ApiContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProviderWrapper } from './components/providers/AuthProviderWrapper';
import { SubscriptionProviderWrapper } from './components/providers/SubscriptionProviderWrapper';
import ToastContainer from './components/ui/ToastContainer';
import { InfoBanner } from '@sudobility/di_web';
import { PerformancePanel } from '@sudobility/components';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/dashboard/ProjectsPage'));
const ProjectNewPage = lazy(() => import('./pages/dashboard/ProjectNewPage'));
const TemplatesPage = lazy(() => import('./pages/dashboard/TemplatesPage'));
const ProjectDetailPage = lazy(() => import('./pages/dashboard/ProjectDetailPage'));
const EndpointNewPage = lazy(() => import('./pages/dashboard/EndpointNewPage'));
const EndpointDetailPage = lazy(() => import('./pages/dashboard/EndpointDetailPage'));
const KeysPage = lazy(() => import('./pages/dashboard/KeysPage'));
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage'));
const SubscriptionPage = lazy(() => import('./pages/dashboard/SubscriptionPage'));
const BudgetsPage = lazy(() => import('./pages/dashboard/BudgetsPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const RateLimitsPage = lazy(() => import('./pages/dashboard/RateLimitsPage'));
const WorkspacesPage = lazy(() => import('./pages/dashboard/WorkspacesPage'));
const MembersPage = lazy(() => import('./pages/dashboard/MembersPage'));
const InvitationsPage = lazy(() => import('./pages/dashboard/InvitationsPage'));
const PerformancePage = lazy(() => import('./pages/dashboard/PerformancePage'));

// Layout components
const LanguageRedirect = lazy(() => import('./components/layout/LanguageRedirect'));
const LanguageValidator = lazy(() => import('./components/layout/LanguageValidator'));
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));
const EntityRedirect = lazy(() => import('./components/layout/EntityRedirect'));

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

// Stable reference for PerformancePanel to prevent infinite re-renders
const PERFORMANCE_API_PATTERNS = ['/api/'];

function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <AuthProviderWrapper>
                <ApiProvider>
                  <SubscriptionProviderWrapper>
                    <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Root redirect - detect language */}
                    <Route path="/" element={<LanguageRedirect />} />

                    {/* Language-prefixed routes */}
                    <Route path="/:lang" element={<LanguageValidator />}>
                      {/* Public pages */}
                      <Route index element={<HomePage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="pricing" element={<PricingPage />} />
                      <Route path="docs" element={<DocsPage />} />
                      <Route path="docs/:section" element={<DocsPage />} />

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
                        <Route path="projects/new" element={<ProjectNewPage />} />
                        <Route path="projects/templates" element={<TemplatesPage />} />
                        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                        <Route path="projects/:projectId/endpoints/new" element={<EndpointNewPage />} />
                        <Route
                          path="projects/:projectId/endpoints/:endpointId"
                          element={<EndpointDetailPage />}
                        />
                        <Route path="providers" element={<KeysPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="subscription" element={<SubscriptionPage />} />
                        <Route path="budgets" element={<BudgetsPage />} />
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
                  </Suspense>
                  <ToastContainer />
                  {/* Floating performance panel - controlled by VITE_SHOW_PERFORMANCE_MONITOR */}
                  {import.meta.env.VITE_SHOW_PERFORMANCE_MONITOR === 'true' && (
                    <PerformancePanel
                      enabled={true}
                      position="bottom-right"
                      apiPatterns={PERFORMANCE_API_PATTERNS}
                    />
                  )}
                  <InfoBanner />
                  </BrowserRouter>
                  </SubscriptionProviderWrapper>
                </ApiProvider>
              </AuthProviderWrapper>
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
