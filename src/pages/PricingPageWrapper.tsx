import { Suspense, lazy } from "react";
import { useCurrentEntity } from "../hooks/useCurrentEntity";

// Lazy load both the provider and page to keep the bundle separate
const PricingSubscriptionProvider = lazy(
  () => import("../components/providers/PricingSubscriptionProvider"),
);
const PricingPage = lazy(() => import("./PricingPage"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Wrapper for PricingPage that ensures subscription context is available.
 * Uses PricingSubscriptionProvider which loads subscription data only for
 * authenticated users with an entityId.
 */
export function PricingPageWrapper() {
  const { currentEntityId } = useCurrentEntity();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PricingSubscriptionProvider entityId={currentEntityId ?? undefined}>
        <PricingPage />
      </PricingSubscriptionProvider>
    </Suspense>
  );
}

export default PricingPageWrapper;
