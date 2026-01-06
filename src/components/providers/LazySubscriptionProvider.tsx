import { type ReactNode, Suspense, lazy, useMemo } from "react";
import { useAuthStatus } from "@sudobility/auth-components";
import {
  SafeSubscriptionContext,
  STUB_SUBSCRIPTION_VALUE,
} from "./SafeSubscriptionContext";

// Lazy load the actual subscription provider - this defers the 600KB RevenueCat SDK
const SubscriptionProviderWrapper = lazy(
  () => import("./SubscriptionProviderWrapper"),
);

function StubSubscriptionProvider({ children }: { children: ReactNode }) {
  return (
    <SafeSubscriptionContext.Provider value={STUB_SUBSCRIPTION_VALUE}>
      {children}
    </SafeSubscriptionContext.Provider>
  );
}

interface LazySubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Lazy wrapper for SubscriptionProvider that only loads RevenueCat SDK
 * when the user is authenticated. This saves ~600KB on initial load.
 * For unauthenticated users, provides a stub context so hooks don't throw.
 */
export function LazySubscriptionProvider({
  children,
}: LazySubscriptionProviderProps) {
  const { user } = useAuthStatus();

  // Only load subscription provider for authenticated users
  const isAuthenticated = useMemo(() => {
    return !!user && !user.isAnonymous;
  }, [user]);

  if (!isAuthenticated) {
    // For unauthenticated users, provide stub context
    return <StubSubscriptionProvider>{children}</StubSubscriptionProvider>;
  }

  // For authenticated users, load the subscription provider
  return (
    <Suspense
      fallback={<StubSubscriptionProvider>{children}</StubSubscriptionProvider>}
    >
      <SubscriptionProviderWrapper>{children}</SubscriptionProviderWrapper>
    </Suspense>
  );
}
