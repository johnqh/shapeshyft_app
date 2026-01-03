import { type ReactNode, Suspense, lazy, useMemo } from 'react';
import { useAuthStatus } from '@sudobility/auth-components';

// Lazy load the actual subscription provider - this defers the 600KB RevenueCat SDK
const SubscriptionProviderWrapper = lazy(() => import('./SubscriptionProviderWrapper'));

interface LazySubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Lazy wrapper for SubscriptionProvider that only loads RevenueCat SDK
 * when the user is authenticated. This saves ~600KB on initial load.
 */
export function LazySubscriptionProvider({ children }: LazySubscriptionProviderProps) {
  const { user } = useAuthStatus();

  // Only load subscription provider for authenticated users
  const isAuthenticated = useMemo(() => {
    return !!user && !user.isAnonymous;
  }, [user]);

  if (!isAuthenticated) {
    // For unauthenticated users, just render children without subscription context
    return <>{children}</>;
  }

  // For authenticated users, load the subscription provider
  return (
    <Suspense fallback={<>{children}</>}>
      <SubscriptionProviderWrapper>{children}</SubscriptionProviderWrapper>
    </Suspense>
  );
}
