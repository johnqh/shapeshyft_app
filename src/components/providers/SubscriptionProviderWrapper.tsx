import { type ReactNode, useEffect, useRef } from 'react';
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from '@sudobility/subscription-components';
import { useAuthStatus } from '@sudobility/auth-components';
import { getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || 'premium';

interface SubscriptionProviderWrapperProps {
  children: ReactNode;
}

/**
 * Inner component that auto-initializes subscription when user is available
 */
function SubscriptionInitializer({ children }: { children: ReactNode }) {
  const { user } = useAuthStatus();
  const { initialize } = useSubscriptionContext();
  const initializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize once per user
    if (user && !user.isAnonymous && user.uid !== userIdRef.current) {
      userIdRef.current = user.uid;
      if (!initializedRef.current) {
        initializedRef.current = true;
        initialize(user.uid, user.email || undefined);
      }
    } else if (!user || user.isAnonymous) {
      // Reset when user logs out
      initializedRef.current = false;
      userIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally using specific properties to avoid re-render loops
  }, [user?.uid, user?.isAnonymous, user?.email, initialize]);

  return <>{children}</>;
}

// Stable error handler
const handleSubscriptionError = (error: Error) => {
  getInfoService().show('Subscription Error', error.message, InfoType.ERROR, 5000);
};

/**
 * Wrapper component that integrates @sudobility/subscription-components
 * with the app's auth system and auto-initializes when user is available
 */
export function SubscriptionProviderWrapper({ children }: SubscriptionProviderWrapperProps) {
  return (
    <SubscriptionProvider
      apiKey={REVENUECAT_API_KEY}
      entitlementId={ENTITLEMENT_ID}
      onError={handleSubscriptionError}
    >
      <SubscriptionInitializer>{children}</SubscriptionInitializer>
    </SubscriptionProvider>
  );
}

export default SubscriptionProviderWrapper;
