import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { reportRouteChange } from '../utils/webVitals';

/**
 * Hook to track route change performance
 * Measures time between route changes and reports to performance monitoring
 */
export const useRoutePerformance = () => {
  const location = useLocation();
  const previousLocation = useRef<string | null>(null);
  const routeStartTime = useRef<number>(0);

  useEffect(() => {
    const currentPath = location.pathname;

    // On first load, just record the path
    if (!previousLocation.current) {
      previousLocation.current = currentPath;
      routeStartTime.current = Date.now();
      return;
    }

    // Calculate time since last route change
    const duration = Date.now() - routeStartTime.current;

    // Report route change performance
    if (previousLocation.current !== currentPath) {
      reportRouteChange(previousLocation.current, currentPath, duration);

      // Update refs for next change
      previousLocation.current = currentPath;
      routeStartTime.current = Date.now();
    }
  }, [location]);
};
