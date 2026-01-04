import { isLanguageSupported } from '../config/constants';

const DEFAULT_LANGUAGE = 'en';

export interface BreadcrumbPath {
  title: string;
  path: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

/**
 * Extract language prefix from path
 * Returns language code if valid, otherwise undefined
 */
function extractLanguageFromPath(path: string): string | undefined {
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && isLanguageSupported(segments[0])) {
    return segments[0];
  }
  return undefined;
}

/**
 * Remove language prefix from path
 */
function removeLanguageFromPath(path: string): string {
  const lang = extractLanguageFromPath(path);
  if (!lang) return path;

  const withoutLang = path.replace(new RegExp(`^/${lang}/?`), '/');
  return withoutLang || '/';
}

/**
 * Path to translation key mapping for shapeshyft routes
 */
const pathTranslationKeys: Record<string, string> = {
  // Root paths
  '': 'breadcrumbs.home',
  '/': 'breadcrumbs.home',
  '/pricing': 'breadcrumbs.pricing',
  '/docs': 'breadcrumbs.docs',
  '/about': 'breadcrumbs.about',
  '/contact': 'breadcrumbs.contact',
  '/privacy': 'breadcrumbs.privacy',
  '/terms': 'breadcrumbs.terms',
  '/settings': 'breadcrumbs.settings',
  '/login': 'breadcrumbs.login',

  // Dashboard paths
  '/dashboard': 'breadcrumbs.dashboard',
  '/dashboard/providers': 'breadcrumbs.providers',
  '/dashboard/analytics': 'breadcrumbs.analytics',
  '/dashboard/budgets': 'breadcrumbs.budgets',
  '/dashboard/subscription': 'breadcrumbs.subscription',
  '/dashboard/settings': 'breadcrumbs.dashboardSettings',
  '/dashboard/rate-limits': 'breadcrumbs.rateLimits',
  '/dashboard/workspaces': 'breadcrumbs.workspaces',
  '/dashboard/members': 'breadcrumbs.members',
  '/dashboard/invitations': 'breadcrumbs.invitations',
  '/dashboard/performance': 'breadcrumbs.performance',
};

/**
 * BreadcrumbBuilder - Singleton class for building breadcrumb trails
 */
export class BreadcrumbBuilder {
  private static instance: BreadcrumbBuilder;

  private constructor() {}

  public static getInstance(): BreadcrumbBuilder {
    if (!BreadcrumbBuilder.instance) {
      BreadcrumbBuilder.instance = new BreadcrumbBuilder();
    }
    return BreadcrumbBuilder.instance;
  }

  /**
   * Get translation key for a path, or return formatted path segment
   */
  private getTranslationKey(path: string): string | null {
    const pathWithoutLang = removeLanguageFromPath(path);
    let normalizedPath = pathWithoutLang;
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.replace(/\/+$/, '');
    }
    normalizedPath = normalizedPath.toLowerCase();

    return pathTranslationKeys[normalizedPath] || null;
  }

  /**
   * Maps a path to a human-readable title using the provided translation function
   */
  public localizedBreadcrumb(
    path: string,
    t: (key: string) => string,
    dynamicTitles?: Record<string, string>
  ): string {
    const pathWithoutLang = removeLanguageFromPath(path);
    let normalizedPath = pathWithoutLang;
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.replace(/\/+$/, '');
    }

    // Check for dynamic titles (e.g., project names, endpoint names)
    if (dynamicTitles?.[normalizedPath]) {
      return dynamicTitles[normalizedPath];
    }

    // Check for static translation
    const translationKey = this.getTranslationKey(path);
    if (translationKey) {
      return t(translationKey);
    }

    // Handle dynamic segments like /dashboard/projects/:projectId
    const segments = normalizedPath.split('/').filter(Boolean);

    // Check if this is a dynamic route
    if (segments.length >= 3 && segments[0] === 'dashboard' && segments[1] === 'projects') {
      // /dashboard/projects/:projectId
      if (segments.length === 3) {
        return dynamicTitles?.[normalizedPath] || t('breadcrumbs.projectDetail');
      }
      // /dashboard/projects/:projectId/endpoints/:endpointId
      if (segments.length >= 5 && segments[3] === 'endpoints') {
        return dynamicTitles?.[normalizedPath] || t('breadcrumbs.endpointDetail');
      }
    }

    // Fallback: capitalize the last segment
    const lastSegment = segments[segments.length - 1] || '';
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  /**
   * Builds a complete breadcrumb trail for a given path
   */
  public localizedBreadcrumbs(
    path: string | undefined,
    t: (key: string) => string,
    dynamicTitles?: Record<string, string>
  ): BreadcrumbPath[] {
    if (!path) return [];

    let cleanPath = path;
    if (cleanPath !== '/' && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.replace(/\/+$/, '');
    }

    const lang = extractLanguageFromPath(cleanPath) || DEFAULT_LANGUAGE;
    const pathWithoutLang = removeLanguageFromPath(cleanPath);

    // If we're at the home page, return Home only
    if (!pathWithoutLang || pathWithoutLang === '/') {
      return [
        {
          title: t('breadcrumbs.home'),
          path: `/${lang}`,
        },
      ];
    }

    const segments = pathWithoutLang.split('/').filter(Boolean);
    const result: BreadcrumbPath[] = [];

    // Always start with Home
    result.push({
      title: t('breadcrumbs.home'),
      path: `/${lang}`,
    });

    // Build up the path for each segment
    let currentPath = `/${lang}`;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Skip intermediate segments that don't have meaning (like 'projects' in /dashboard/projects/:id)
      const pathForTitle = removeLanguageFromPath(currentPath);

      // Check if this is an intermediate segment that should be skipped
      // Skip /dashboard/projects when followed by a projectId
      if (pathForTitle === '/dashboard/projects' && i < segments.length - 1) {
        continue;
      }
      // Skip /dashboard/projects/:id/endpoints when followed by an endpointId
      if (segments[i] === 'endpoints' && i < segments.length - 1) {
        continue;
      }

      const title = this.localizedBreadcrumb(currentPath, t, dynamicTitles);
      result.push({
        title,
        path: currentPath,
      });
    }

    return result;
  }

  /**
   * Get breadcrumbs formatted for the Breadcrumb component
   */
  public getLocalizedBreadcrumbItems(
    path: string,
    t: (key: string) => string,
    dynamicTitles?: Record<string, string>
  ): BreadcrumbItem[] {
    const breadcrumbs = this.localizedBreadcrumbs(path, t, dynamicTitles);

    return breadcrumbs.map((breadcrumb, index) => ({
      label: breadcrumb.title,
      href: index === breadcrumbs.length - 1 ? undefined : breadcrumb.path,
      current: index === breadcrumbs.length - 1,
    }));
  }
}
