import { createContext, useContext } from "react";
import type { SubscriptionContextValue } from "@sudobility/subscription-components";

// Stub value for unauthenticated users
export const STUB_SUBSCRIPTION_VALUE: SubscriptionContextValue = {
  products: [],
  currentSubscription: null,
  isLoading: false,
  error: null,
  initialize: async () => {},
  purchase: async () => false,
  restore: async () => false,
  refresh: async () => {},
  clearError: () => {},
};

// Shared context that both stub and real providers use
export const SafeSubscriptionContext = createContext<SubscriptionContextValue>(
  STUB_SUBSCRIPTION_VALUE,
);

/**
 * Safe subscription hook that returns stub values when not in a real provider.
 * Use this instead of useSubscriptionContext from the package.
 */
export function useSafeSubscriptionContext(): SubscriptionContextValue {
  return useContext(SafeSubscriptionContext);
}
