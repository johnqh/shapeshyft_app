import { type ReactNode, useEffect, useRef } from "react";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@sudobility/subscription-components";
import { useAuthStatus } from "@sudobility/auth-components";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { SafeSubscriptionContext } from "./SafeSubscriptionContext";
import { CONSTANTS } from "../../config/constants";

interface SubscriptionProviderWrapperProps {
  children: ReactNode;
  /** Entity ID to use as RevenueCat subscriber (personal or organizational). Optional - if not provided, subscription won't initialize until set. */
  entityId?: string;
}

/**
 * Bridge component that exposes the real subscription context to SafeSubscriptionContext
 */
function SafeContextBridge({ children }: { children: ReactNode }) {
  const subscriptionValue = useSubscriptionContext();
  return (
    <SafeSubscriptionContext.Provider value={subscriptionValue}>
      {children}
    </SafeSubscriptionContext.Provider>
  );
}

interface SubscriptionInitializerProps {
  children: ReactNode;
  entityId?: string;
}

/**
 * Inner component that auto-initializes subscription when entity is available.
 * Uses entityId as the RevenueCat subscriber ID (subscriptions are per-entity).
 */
function SubscriptionInitializer({
  children,
  entityId,
}: SubscriptionInitializerProps) {
  const { user } = useAuthStatus();
  const { initialize } = useSubscriptionContext();
  const initializedRef = useRef(false);
  const entityIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize when user is authenticated and entity is available
    if (user && !user.isAnonymous && entityId && entityId !== entityIdRef.current) {
      entityIdRef.current = entityId;
      if (!initializedRef.current) {
        initializedRef.current = true;
        // Use entityId as subscriber ID (subscriptions are per-entity)
        initialize(entityId, user.email || undefined);
      }
    } else if (!user || user.isAnonymous || !entityId) {
      // Reset when user logs out or entity changes
      initializedRef.current = false;
      entityIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally using specific properties to avoid re-render loops
  }, [user?.uid, user?.isAnonymous, user?.email, entityId, initialize]);

  return <>{children}</>;
}

// Stable error handler
const handleSubscriptionError = (error: Error) => {
  getInfoService().show(
    "Subscription Error",
    error.message,
    InfoType.ERROR,
    5000,
  );
};

/**
 * Wrapper component that integrates @sudobility/subscription-components
 * with the app's auth system and auto-initializes with entity ID.
 * Subscriptions are per-entity (personal or organizational).
 */
export function SubscriptionProviderWrapper({
  children,
  entityId,
}: SubscriptionProviderWrapperProps) {
  return (
    <SubscriptionProvider
      apiKey={CONSTANTS.REVENUECAT_API_KEY}
      onError={handleSubscriptionError}
    >
      <SafeContextBridge>
        <SubscriptionInitializer entityId={entityId}>
          {children}
        </SubscriptionInitializer>
      </SafeContextBridge>
    </SubscriptionProvider>
  );
}

export default SubscriptionProviderWrapper;
