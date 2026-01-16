import { type ReactNode, useEffect, useRef } from "react";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@sudobility/subscription-components";
import { useAuthStatus } from "@sudobility/auth-components";
import { SafeSubscriptionContext } from "./SafeSubscriptionContext";
import { CONSTANTS } from "../../config/constants";

// Anonymous user ID for fetching products when not authenticated
const ANONYMOUS_USER_ID = "anonymous_pricing_viewer";

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
 * Initializes subscription with entityId for authenticated users,
 * or anonymous ID for non-authenticated users (to fetch products).
 */
function PricingInitializer({ children, entityId }: InitializerProps) {
  const { user } = useAuthStatus();
  const { initialize } = useSubscriptionContext();
  const subscriberIdRef = useRef<string | null>(null);

  const isAuthenticated = user && !user.isAnonymous;

  useEffect(() => {
    // Use entityId for authenticated users, anonymous ID for others
    const subscriberId =
      isAuthenticated && entityId ? entityId : ANONYMOUS_USER_ID;
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
 * Loads RevenueCat SDK and initializes with anonymous user for non-authenticated users,
 * allowing them to see product pricing.
 */
export function PricingSubscriptionProvider({
  children,
  entityId,
}: PricingSubscriptionProviderProps) {
  const { user } = useAuthStatus();
  const userEmail = user?.email || undefined;

  return (
    <SubscriptionProvider
      apiKey={CONSTANTS.REVENUECAT_API_KEY}
      userEmail={userEmail}
    >
      <SafeContextBridge>
        <PricingInitializer entityId={entityId}>{children}</PricingInitializer>
      </SafeContextBridge>
    </SubscriptionProvider>
  );
}

export default PricingSubscriptionProvider;
