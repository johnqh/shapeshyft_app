import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager, useEndpointsManager } from '@sudobility/shapeshyft_lib';
import { BreadcrumbBuilder, type BreadcrumbItem } from '../utils/BreadcrumbBuilder';
import { useApi } from './useApi';

/**
 * Custom hook to generate breadcrumbs based on current location
 * Includes dynamic titles for projects and endpoints
 */
export const useBreadcrumbs = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation('common');
  const { entitySlug = '', projectId } = useParams<{ entitySlug?: string; projectId?: string }>();
  const { networkClient, baseUrl, token, isReady } = useApi();
  const breadcrumbBuilder = BreadcrumbBuilder.getInstance();

  // Fetch projects for dynamic titles
  const { projects } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  // Fetch endpoints for dynamic titles (only when we have a projectId)
  const { endpoints } = useEndpointsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId && !!entitySlug,
  });

  // Build dynamic titles map
  const dynamicTitles = useMemo(() => {
    const titles: Record<string, string> = {};

    // Add project titles
    projects.forEach(project => {
      titles[`/dashboard/projects/${project.uuid}`] = project.display_name;
    });

    // Add endpoint titles
    if (projectId) {
      endpoints.forEach(endpoint => {
        titles[`/dashboard/projects/${projectId}/endpoints/${endpoint.uuid}`] = endpoint.display_name;
      });
    }

    return titles;
  }, [projects, endpoints, projectId]);

  // Memoize breadcrumbs with language as dependency
  const breadcrumbItems = useMemo(() => {
    return breadcrumbBuilder.getLocalizedBreadcrumbItems(location.pathname, t, dynamicTitles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbBuilder, location.pathname, t, i18n.language, dynamicTitles]);

  const breadcrumbPaths = useMemo(() => {
    return breadcrumbBuilder.localizedBreadcrumbs(location.pathname, t, dynamicTitles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbBuilder, location.pathname, t, i18n.language, dynamicTitles]);

  const currentTitle = useMemo(() => {
    return breadcrumbBuilder.localizedBreadcrumb(location.pathname, t, dynamicTitles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbBuilder, location.pathname, t, i18n.language, dynamicTitles]);

  return {
    items: breadcrumbItems as BreadcrumbItem[],
    paths: breadcrumbPaths,
    currentTitle,
  };
};
