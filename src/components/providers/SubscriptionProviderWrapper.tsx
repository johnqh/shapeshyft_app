/**
 * Subscription Provider Wrapper
 *
 * Integrates subscription-components with auth and sets up RevenueCat user
 * for subscription_lib when authenticated.
 */

import { type ReactNode, useEffect, useRef } from "react";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@sudobility/subscription-components";
import { useAuthStatus } from "@sudobility/auth-components";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import {
  setRevenueCatUser,
  clearRevenueCatUser,
  refreshSubscription,
} from "@sudobility/subscription_lib";
import { SafeSubscriptionContext } from "./SafeSubscriptionContext";
import { CONSTANTS } from "../../config/constants";

interface SubscriptionProviderWrapperProps {
  children: ReactNode;
  entityId?: string;
}

const handleSubscriptionError = (error: Error) => {
  getInfoService().show("Subscription Error", error.message, InfoType.ERROR, 5000);
};

/**
 * Bridge that provides context and configures RevenueCat user.
 */
function SubscriptionBridge({
  children,
  entityId,
}: {
  children: ReactNode;
  entityId?: string;
}) {
  const { user } = useAuthStatus();
  const context = useSubscriptionContext();
  const entityIdRef = useRef<string | null>(null);

  useEffect(() => {
    const shouldSetUser = user && !user.isAnonymous && entityId;

    if (shouldSetUser && entityId !== entityIdRef.current) {
      entityIdRef.current = entityId;
      // Set user for both subscription-components and subscription_lib
      context.initialize(entityId, user.email || undefined);
      setRevenueCatUser(entityId, user.email || undefined).then(() => {
        // Refresh subscription_lib data after user is set so hooks get fresh data
        refreshSubscription();
      });
    } else if (!shouldSetUser && entityIdRef.current) {
      entityIdRef.current = null;
      clearRevenueCatUser();
    }
  }, [user, entityId, context]);

  return (
    <SafeSubscriptionContext.Provider value={context}>
      {children}
    </SafeSubscriptionContext.Provider>
  );
}

export function SubscriptionProviderWrapper({
  children,
  entityId,
}: SubscriptionProviderWrapperProps) {
  const { user } = useAuthStatus();

  return (
    <SubscriptionProvider
      apiKey={CONSTANTS.REVENUECAT_API_KEY}
      userEmail={user?.email || undefined}
      onError={handleSubscriptionError}
    >
      <SubscriptionBridge entityId={entityId}>{children}</SubscriptionBridge>
    </SubscriptionProvider>
  );
}

export default SubscriptionProviderWrapper;
