import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MasterDetailLayout } from '@sudobility/components';
import { useProjectsManager, useKeysManager, useEndpointsManager } from '@sudobility/shapeshyft_lib';
import ScreenContainer from '../../components/layout/ScreenContainer';
import DashboardMasterList from '../../components/dashboard/DashboardMasterList';
import { useApi } from '../../hooks/useApi';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const { navigate } = useLocalizedNavigate();
  const { entitySlug = '', projectId, endpointId } = useParams<{
    entitySlug: string;
    projectId: string;
    endpointId: string;
  }>();
  const { networkClient, baseUrl, token, testMode, isReady } = useApi();

  // Mobile view state
  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');

  // Animation ref
  const animationRef = useRef<{ triggerTransition: (onContentChange: () => void) => void } | null>(null);

  // Fetch projects and keys for the master list
  const { projects } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  const { keys } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  // Fetch endpoints for the current project (for detail title)
  const { endpoints } = useEndpointsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId && !!entitySlug,
  });

  // Determine detail title based on current route
  const getDetailTitle = () => {
    const pathname = location.pathname;

    if (pathname.includes('/endpoints/') && endpointId) {
      const endpoint = endpoints.find(e => e.uuid === endpointId);
      return endpoint?.display_name ?? t('endpoints.detail');
    }
    if (pathname.includes('/projects/templates')) {
      return t('templates.title');
    }
    if (pathname.includes('/projects/') && projectId) {
      const project = projects.find(p => p.uuid === projectId);
      return project?.display_name ?? t('projects.detail');
    }
    if (pathname.includes('/providers')) {
      return t('keys.title');
    }
    if (pathname.includes('/analytics')) {
      return t('analytics.title');
    }
    if (pathname.includes('/budgets')) {
      return t('budgets.title');
    }
    if (pathname.includes('/subscription')) {
      return t('subscription.title');
    }
    if (pathname.includes('/settings')) {
      return t('settings.title');
    }
    if (pathname.includes('/rate-limits')) {
      return t('rateLimits.title');
    }
    return t('projects.title');
  };

  // Auto-switch to content view when navigating on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Show content view when we're on a specific route
      const pathname = location.pathname;
      const hasSpecificContent = pathname.includes('/projects/') ||
                                  pathname.includes('/providers') ||
                                  pathname.includes('/analytics') ||
                                  pathname.includes('/budgets') ||
                                  pathname.includes('/subscription') ||
                                  pathname.includes('/rate-limits') ||
                                  pathname.includes('/settings');
      if (hasSpecificContent) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMobileView('content');
      }
    }
  }, [location.pathname]);

  const handleBackToNavigation = () => {
    setMobileView('navigation');
    navigate(`/dashboard/${entitySlug}`);
  };

  const handleNavigate = () => {
    setMobileView('content');
  };

  // Master content (navigation sidebar)
  const masterContent = (
    <DashboardMasterList
      projects={projects}
      keys={keys}
      onNavigate={handleNavigate}
    />
  );

  // Detail content
  const detailContent = (
    <div className="min-h-[400px]">
      <Outlet />
    </div>
  );

  return (
    <ScreenContainer footerVariant="compact" showFooter={true} showBreadcrumbs={true}>
      <main className="flex-1">
        <MasterDetailLayout
          masterTitle={t('title')}
          backButtonText={t('title')}
          masterContent={masterContent}
          detailContent={detailContent}
          detailTitle={getDetailTitle()}
          mobileView={mobileView}
          onBackToNavigation={handleBackToNavigation}
          animationRef={animationRef}
          enableAnimations={true}
          animationDuration={150}
          masterWidth={280}
          stickyTopOffset={80}
        />
      </main>
    </ScreenContainer>
  );
}

export default DashboardPage;
