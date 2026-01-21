import { type ReactNode, useEffect, useRef } from "react";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@sudobility/subscription-components";
import { useAuthStatus } from "@sudobility/auth-components";
import { SafeSubscriptionContext } from "./SafeSubscriptionContext";
import { CONSTANTS } from "../../config/constants";

interface PricingSubscriptionProviderProps {
  children: ReactNode;
  /** Entity ID for authenticated users */
  entityId?: string;
}

/**
 * Bridge component that exposes the subscription context to SafeSubscriptionContext
 */
function SafeContextBridge({ children }: { children: ReactNode }) {
  const subscriptionValue = useSubscriptionContext();
  return (
    <SafeSubscriptionContext.Provider value={subscriptionValue}>
      {children}
    </SafeSubscriptionContext.Provider>
  );
}

interface InitializerProps {
  children: ReactNode;
  entityId?: string;
}

/**
 * Initializes subscription with entityId for authenticated users.
 * Non-authenticated users will have undefined subscriberId, which means
 * RevenueCat will return empty offerings (no pricing data).
 */
function PricingInitializer({ children, entityId }: InitializerProps) {
  const { user } = useAuthStatus();
  const { initialize } = useSubscriptionContext();
  const subscriberIdRef = useRef<string | undefined>(undefined);

  const isAuthenticated = user && !user.isAnonymous;

  useEffect(() => {
    // Only use entityId for authenticated users, undefined for others
    const subscriberId = isAuthenticated && entityId ? entityId : undefined;
    const email = isAuthenticated ? user?.email || undefined : undefined;

    // Initialize if subscriber changed
    if (subscriberId !== subscriberIdRef.current) {
      subscriberIdRef.current = subscriberId;
      initialize(subscriberId, email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.isAnonymous, user?.email, entityId, isAuthenticated]);

  return <>{children}</>;
}

/**
 * Subscription provider specifically for the Pricing page.
 * Loads RevenueCat SDK. Only authenticated users with entityId will have
 * subscription data loaded. Non-authenticated users will see empty offerings.
 */
export function PricingSubscriptionProvider({
  children,
  entityId,
}: PricingSubscriptionProviderProps) {
  const { user } = useAuthStatus();
  const userEmail = user?.email || undefined;
  const apiKey = CONSTANTS.DEV_MODE
    ? CONSTANTS.REVENUECAT_API_KEY_SANDBOX
    : CONSTANTS.REVENUECAT_API_KEY;

  return (
    <SubscriptionProvider apiKey={apiKey} userEmail={userEmail}>
      <SafeContextBridge>
        <PricingInitializer entityId={entityId}>{children}</PricingInitializer>
      </SafeContextBridge>
    </SubscriptionProvider>
  );
}

export default PricingSubscriptionProvider;
