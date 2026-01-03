import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { useCallback, useRef } from 'react';

type PreloadFn = () => Promise<unknown>;

interface PreloadLinkProps extends LinkProps {
  preload?: PreloadFn;
  preloadDelay?: number;
}

const preloadedModules = new Set<string>();

const routeModules: Record<string, () => Promise<unknown>> = {
  '/': () => import('../../pages/HomePage'),
  '/login': () => import('../../pages/LoginPage'),
  '/pricing': () => import('../../pages/PricingPage'),
  '/docs': () => import('../../pages/DocsPage'),
  '/dashboard': () => import('../../pages/dashboard/DashboardPage'),
  '/projects': () => import('../../pages/dashboard/ProjectsPage'),
  '/projects/new': () => import('../../pages/dashboard/ProjectNewPage'),
  '/projects/templates': () => import('../../pages/dashboard/TemplatesPage'),
  '/providers': () => import('../../pages/dashboard/KeysPage'),
  '/analytics': () => import('../../pages/dashboard/AnalyticsPage'),
  '/subscription': () => import('../../pages/dashboard/SubscriptionPage'),
  '/budgets': () => import('../../pages/dashboard/BudgetsPage'),
  '/settings': () => import('../../pages/dashboard/SettingsPage'),
  '/rate-limits': () => import('../../pages/dashboard/RateLimitsPage'),
  '/workspaces': () => import('../../pages/dashboard/WorkspacesPage'),
  '/members': () => import('../../pages/dashboard/MembersPage'),
  '/invitations': () => import('../../pages/dashboard/InvitationsPage'),
  '/performance': () => import('../../pages/dashboard/PerformancePage'),
};

function getRouteModule(to: string): PreloadFn | undefined {
  // Normalize path - remove language prefix and entity slug
  const normalizedPath = to
    .replace(/^\/[a-z]{2}\//, '/') // Remove /en/, /es/, etc.
    .replace(/\/dashboard\/[^/]+/, '/dashboard'); // Remove entity slug

  // Check for exact match first
  if (routeModules[normalizedPath]) {
    return routeModules[normalizedPath];
  }

  // Check for partial matches (e.g., /dashboard/xxx/projects -> /projects)
  for (const [route, preloadFn] of Object.entries(routeModules)) {
    if (normalizedPath.endsWith(route)) {
      return preloadFn;
    }
  }

  return undefined;
}

export function PreloadLink({
  preload,
  preloadDelay = 50,
  to,
  children,
  onMouseEnter,
  onFocus,
  ...props
}: PreloadLinkProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePreload = useCallback(() => {
    const toPath = typeof to === 'string' ? to : to.pathname || '';

    if (preloadedModules.has(toPath)) {
      return;
    }

    const preloadFn = preload || getRouteModule(toPath);
    if (preloadFn) {
      timeoutRef.current = setTimeout(() => {
        preloadFn().then(() => {
          preloadedModules.add(toPath);
        });
      }, preloadDelay);
    }
  }, [preload, preloadDelay, to]);

  const clearPreload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      handlePreload();
      onMouseEnter?.(e);
    },
    [handlePreload, onMouseEnter]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLAnchorElement>) => {
      handlePreload();
      onFocus?.(e);
    },
    [handlePreload, onFocus]
  );

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={clearPreload}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </Link>
  );
}

export default PreloadLink;
