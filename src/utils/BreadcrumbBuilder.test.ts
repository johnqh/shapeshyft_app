import { describe, it, expect, beforeEach } from 'vitest';
import { BreadcrumbBuilder } from './BreadcrumbBuilder';

describe('BreadcrumbBuilder', () => {
  let builder: BreadcrumbBuilder;
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'breadcrumbs.home': 'Home',
      'breadcrumbs.dashboard': 'Dashboard',
      'breadcrumbs.pricing': 'Pricing',
      'breadcrumbs.docs': 'Documentation',
      'breadcrumbs.providers': 'Providers',
      'breadcrumbs.analytics': 'Analytics',
      'breadcrumbs.budgets': 'Budgets',
      'breadcrumbs.subscription': 'Subscription',
      'breadcrumbs.settings': 'Settings',
      'breadcrumbs.dashboardSettings': 'Settings',
      'breadcrumbs.projectDetail': 'Project',
      'breadcrumbs.endpointDetail': 'Endpoint',
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    builder = BreadcrumbBuilder.getInstance();
  });

  describe('getInstance', () => {
    it('returns the same instance (singleton)', () => {
      const instance1 = BreadcrumbBuilder.getInstance();
      const instance2 = BreadcrumbBuilder.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('localizedBreadcrumb', () => {
    it('returns translated title for known paths', () => {
      expect(builder.localizedBreadcrumb('/', mockT)).toBe('Home');
      expect(builder.localizedBreadcrumb('/dashboard', mockT)).toBe('Dashboard');
      expect(builder.localizedBreadcrumb('/pricing', mockT)).toBe('Pricing');
      expect(builder.localizedBreadcrumb('/docs', mockT)).toBe('Documentation');
    });

    it('handles paths with language prefix', () => {
      expect(builder.localizedBreadcrumb('/en/dashboard', mockT)).toBe('Dashboard');
      expect(builder.localizedBreadcrumb('/de/pricing', mockT)).toBe('Pricing');
      expect(builder.localizedBreadcrumb('/ja/docs', mockT)).toBe('Documentation');
    });

    it('handles dashboard sub-paths', () => {
      expect(builder.localizedBreadcrumb('/dashboard/providers', mockT)).toBe('Providers');
      expect(builder.localizedBreadcrumb('/dashboard/analytics', mockT)).toBe('Analytics');
      expect(builder.localizedBreadcrumb('/dashboard/budgets', mockT)).toBe('Budgets');
      expect(builder.localizedBreadcrumb('/en/dashboard/settings', mockT)).toBe('Settings');
    });

    it('uses dynamic titles when provided', () => {
      const dynamicTitles = {
        '/dashboard/projects/123': 'My Project',
      };
      expect(
        builder.localizedBreadcrumb('/dashboard/projects/123', mockT, dynamicTitles)
      ).toBe('My Project');
    });

    it('falls back to capitalized segment for unknown paths', () => {
      expect(builder.localizedBreadcrumb('/unknown-path', mockT)).toBe('Unknown-path');
      expect(builder.localizedBreadcrumb('/foo/bar', mockT)).toBe('Bar');
    });

    it('handles trailing slashes', () => {
      expect(builder.localizedBreadcrumb('/dashboard/', mockT)).toBe('Dashboard');
      expect(builder.localizedBreadcrumb('/pricing/', mockT)).toBe('Pricing');
    });
  });

  describe('localizedBreadcrumbs', () => {
    it('returns empty array for undefined path', () => {
      expect(builder.localizedBreadcrumbs(undefined, mockT)).toEqual([]);
    });

    it('returns only Home for root path', () => {
      const result = builder.localizedBreadcrumbs('/', mockT);
      expect(result).toEqual([{ title: 'Home', path: '/en' }]);
    });

    it('builds breadcrumb trail for simple paths', () => {
      const result = builder.localizedBreadcrumbs('/en/dashboard', mockT);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ title: 'Home', path: '/en' });
      expect(result[1]).toEqual({ title: 'Dashboard', path: '/en/dashboard' });
    });

    it('builds breadcrumb trail for nested paths', () => {
      const result = builder.localizedBreadcrumbs('/en/dashboard/providers', mockT);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ title: 'Home', path: '/en' });
      expect(result[1]).toEqual({ title: 'Dashboard', path: '/en/dashboard' });
      expect(result[2]).toEqual({ title: 'Providers', path: '/en/dashboard/providers' });
    });

    it('handles language prefix correctly', () => {
      const result = builder.localizedBreadcrumbs('/de/pricing', mockT);
      expect(result[0]).toEqual({ title: 'Home', path: '/de' });
      expect(result[1]).toEqual({ title: 'Pricing', path: '/de/pricing' });
    });

    it('skips intermediate project segments', () => {
      const dynamicTitles = {
        '/dashboard/projects/123': 'My Project',
      };
      const result = builder.localizedBreadcrumbs(
        '/en/dashboard/projects/123',
        mockT,
        dynamicTitles
      );
      // Should skip /dashboard/projects and go directly to the project
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Home');
      expect(result[1].title).toBe('Dashboard');
      expect(result[2].title).toBe('My Project');
    });
  });

  describe('getLocalizedBreadcrumbItems', () => {
    it('formats breadcrumbs for component use', () => {
      const result = builder.getLocalizedBreadcrumbItems('/en/dashboard/providers', mockT);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ label: 'Home', href: '/en', current: false });
      expect(result[1]).toEqual({ label: 'Dashboard', href: '/en/dashboard', current: false });
      expect(result[2]).toEqual({ label: 'Providers', href: undefined, current: true });
    });

    it('marks only the last item as current', () => {
      const result = builder.getLocalizedBreadcrumbItems('/en/dashboard', mockT);
      expect(result[0].current).toBe(false);
      expect(result[1].current).toBe(true);
    });

    it('omits href for the current (last) item', () => {
      const result = builder.getLocalizedBreadcrumbItems('/en/docs', mockT);
      expect(result[0].href).toBe('/en');
      expect(result[1].href).toBeUndefined();
    });
  });
});
