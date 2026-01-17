/**
 * RevenueCat adapter for subscription_lib
 *
 * This adapter wraps the RevenueCat web SDK directly.
 * Initialized at app startup in main.tsx.
 */

import type {
  SubscriptionAdapter,
  AdapterOfferings,
  AdapterCustomerInfo,
  AdapterPurchaseParams,
  AdapterPurchaseResult,
} from "@sudobility/subscription_lib";

// RevenueCat SDK types (lazy loaded)
type Purchases = import("@revenuecat/purchases-js").Purchases;
type Package = import("@revenuecat/purchases-js").Package;

// Module state
let purchasesInstance: Purchases | null = null;
let currentUserId: string | null = null;
let apiKey: string | null = null;

/**
 * Configure the RevenueCat adapter with API key.
 * Call this in main.tsx before initializing subscription_lib.
 */
export function configureRevenueCatAdapter(revenueCatApiKey: string): void {
  apiKey = revenueCatApiKey;
}

/**
 * Set the current user for RevenueCat.
 * Call this when user logs in.
 */
export async function setRevenueCatUser(
  userId: string,
  email?: string
): Promise<void> {
  if (!apiKey) {
    console.warn("[subscription] RevenueCat not configured");
    return;
  }

  // Skip if same user
  if (currentUserId === userId && purchasesInstance) {
    return;
  }

  currentUserId = userId;

  const SDK = await import("@revenuecat/purchases-js");

  // Close existing instance
  if (purchasesInstance) {
    purchasesInstance.close();
  }

  // Configure new instance with user
  purchasesInstance = SDK.Purchases.configure({
    apiKey,
    appUserId: userId,
  });

  // Set email attribute
  if (email) {
    try {
      await purchasesInstance.setAttributes({ email });
    } catch {
      // Ignore attribute errors
    }
  }
}

/**
 * Clear the current user (on logout).
 */
export function clearRevenueCatUser(): void {
  if (purchasesInstance) {
    purchasesInstance.close();
    purchasesInstance = null;
  }
  currentUserId = null;
}

/**
 * Check if RevenueCat has a user configured.
 */
export function hasRevenueCatUser(): boolean {
  return currentUserId !== null && purchasesInstance !== null;
}

/**
 * Create the subscription adapter for subscription_lib.
 */
export function createRevenueCatAdapter(): SubscriptionAdapter {
  return {
    async getOfferings(): Promise<AdapterOfferings> {
      // If no user configured, return empty (offerings require configured SDK)
      if (!purchasesInstance) {
        return { all: {}, current: null };
      }

      try {
        const offerings = await purchasesInstance.getOfferings();

        const convertPackage = (pkg: Package) => ({
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          product: {
            identifier: pkg.rcBillingProduct.identifier,
            title: pkg.rcBillingProduct.title,
            description: pkg.rcBillingProduct.description || null,
            price: pkg.rcBillingProduct.currentPrice?.amountMicros
              ? pkg.rcBillingProduct.currentPrice.amountMicros / 1_000_000
              : 0,
            priceString:
              pkg.rcBillingProduct.currentPrice?.formattedPrice || "$0",
            currencyCode:
              pkg.rcBillingProduct.currentPrice?.currency || "USD",
            normalPeriodDuration:
              pkg.rcBillingProduct.normalPeriodDuration || null,
            subscriptionOptions: pkg.rcBillingProduct.defaultSubscriptionOption
              ? {
                  [pkg.rcBillingProduct.defaultSubscriptionOption.id]: {
                    id: pkg.rcBillingProduct.defaultSubscriptionOption.id,
                    trial: pkg.rcBillingProduct.defaultSubscriptionOption.trial
                      ? {
                          periodDuration:
                            pkg.rcBillingProduct.defaultSubscriptionOption.trial
                              .periodDuration || null,
                          price:
                            pkg.rcBillingProduct.defaultSubscriptionOption.trial
                              .price?.amountMicros
                              ? pkg.rcBillingProduct.defaultSubscriptionOption
                                  .trial.price.amountMicros / 1_000_000
                              : 0,
                          priceString:
                            pkg.rcBillingProduct.defaultSubscriptionOption.trial
                              .price?.formattedPrice || "$0",
                          cycleCount:
                            pkg.rcBillingProduct.defaultSubscriptionOption.trial
                              .cycleCount || 1,
                        }
                      : null,
                    introPrice: pkg.rcBillingProduct.defaultSubscriptionOption
                      .introPrice
                      ? {
                          periodDuration:
                            pkg.rcBillingProduct.defaultSubscriptionOption
                              .introPrice.periodDuration || null,
                          price:
                            pkg.rcBillingProduct.defaultSubscriptionOption
                              .introPrice.price?.amountMicros
                              ? pkg.rcBillingProduct.defaultSubscriptionOption
                                  .introPrice.price.amountMicros / 1_000_000
                              : 0,
                          priceString:
                            pkg.rcBillingProduct.defaultSubscriptionOption
                              .introPrice.price?.formattedPrice || "$0",
                          cycleCount:
                            pkg.rcBillingProduct.defaultSubscriptionOption
                              .introPrice.cycleCount || 1,
                        }
                      : null,
                  },
                }
              : undefined,
          },
        });

        const all: AdapterOfferings["all"] = {};

        for (const [key, offering] of Object.entries(offerings.all)) {
          all[key] = {
            identifier: offering.identifier,
            metadata: offering.metadata || null,
            availablePackages: offering.availablePackages.map(convertPackage),
          };
        }

        return {
          all,
          current: offerings.current
            ? {
                identifier: offerings.current.identifier,
                metadata: offerings.current.metadata || null,
                availablePackages:
                  offerings.current.availablePackages.map(convertPackage),
              }
            : null,
        };
      } catch (error) {
        console.error("[subscription] Failed to get offerings:", error);
        return { all: {}, current: null };
      }
    },

    async getCustomerInfo(): Promise<AdapterCustomerInfo> {
      // No user = no subscription
      if (!purchasesInstance) {
        return { activeSubscriptions: [], entitlements: { active: {} } };
      }

      try {
        const customerInfo = await purchasesInstance.getCustomerInfo();

        const active: AdapterCustomerInfo["entitlements"]["active"] = {};

        for (const [id, entitlement] of Object.entries(
          customerInfo.entitlements.active
        )) {
          active[id] = {
            identifier: entitlement.identifier,
            productIdentifier: entitlement.productIdentifier,
            expirationDate: entitlement.expirationDate?.toISOString() || null,
            willRenew: entitlement.willRenew,
          };
        }

        return {
          activeSubscriptions: Array.from(customerInfo.activeSubscriptions),
          entitlements: { active },
        };
      } catch (error) {
        console.error("[subscription] Failed to get customer info:", error);
        return { activeSubscriptions: [], entitlements: { active: {} } };
      }
    },

    async purchase(
      params: AdapterPurchaseParams
    ): Promise<AdapterPurchaseResult> {
      if (!purchasesInstance) {
        throw new Error("User not logged in");
      }

      // Find the package across all offerings
      const offerings = await purchasesInstance.getOfferings();
      let packageToPurchase: Package | undefined;

      for (const offering of Object.values(offerings.all)) {
        packageToPurchase = offering.availablePackages.find(
          (pkg) => pkg.identifier === params.packageId
        );
        if (packageToPurchase) break;
      }

      if (!packageToPurchase) {
        throw new Error(`Package not found: ${params.packageId}`);
      }

      const result = await purchasesInstance.purchase({
        rcPackage: packageToPurchase,
      });

      // Convert customer info
      const active: AdapterCustomerInfo["entitlements"]["active"] = {};
      for (const [id, entitlement] of Object.entries(
        result.customerInfo.entitlements.active
      )) {
        active[id] = {
          identifier: entitlement.identifier,
          productIdentifier: entitlement.productIdentifier,
          expirationDate: entitlement.expirationDate?.toISOString() || null,
          willRenew: entitlement.willRenew,
        };
      }

      return {
        customerInfo: {
          activeSubscriptions: Array.from(result.customerInfo.activeSubscriptions),
          entitlements: { active },
        },
      };
    },
  };
}
