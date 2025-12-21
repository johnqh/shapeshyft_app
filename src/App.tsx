import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { ApiProvider } from './context/ApiContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProviderWrapper } from './components/providers/AuthProviderWrapper';
import { SubscriptionProviderWrapper } from './components/providers/SubscriptionProviderWrapper';
import ToastContainer from './components/ui/ToastContainer';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/dashboard/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/dashboard/ProjectDetailPage'));
const EndpointDetailPage = lazy(() => import('./pages/dashboard/EndpointDetailPage'));
const KeysPage = lazy(() => import('./pages/dashboard/KeysPage'));
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage'));
const SubscriptionPage = lazy(() => import('./pages/dashboard/SubscriptionPage'));
const BudgetsPage = lazy(() => import('./pages/dashboard/BudgetsPage'));

// Layout components
const LanguageRedirect = lazy(() => import('./components/layout/LanguageRedirect'));
const LanguageValidator = lazy(() => import('./components/layout/LanguageValidator'));
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));

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

function App() {
  return (
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
                      <Route path="pricing" element={<PricingPage />} />
                      <Route path="docs" element={<DocsPage />} />
                      <Route path="docs/:section" element={<DocsPage />} />

                      {/* Protected dashboard routes */}
                      <Route
                        path="dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<ProjectsPage />} />
                        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                        <Route
                          path="projects/:projectId/endpoints/:endpointId"
                          element={<EndpointDetailPage />}
                        />
                        <Route path="keys" element={<KeysPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="subscription" element={<SubscriptionPage />} />
                        <Route path="budgets" element={<BudgetsPage />} />
                      </Route>

                      {/* Catch-all redirect to home */}
                      <Route path="*" element={<Navigate to="." replace />} />
                    </Route>

                    {/* Catch-all without language - redirect to language detection */}
                    <Route path="*" element={<LanguageRedirect />} />
                  </Routes>
                  </Suspense>
                  <ToastContainer />
                  </BrowserRouter>
                </SubscriptionProviderWrapper>
              </ApiProvider>
            </AuthProviderWrapper>
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
