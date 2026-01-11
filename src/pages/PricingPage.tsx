import { useTranslation } from "react-i18next";
import { useAuthStatus } from "@sudobility/auth-components";
import {
  AppPricingPage,
  type PricingPageLabels,
  type PricingPageFormatters,
  type PricingProduct,
  type FAQItem,
  type EntitlementMap,
  type EntitlementLevels,
} from "@sudobility/building_blocks";
import { useSafeSubscriptionContext } from "../components/providers/SafeSubscriptionContext";
import { useCurrentEntity } from "../hooks/useCurrentEntity";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import AISearchOptimization from "../components/seo/AISearchOptimization";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import { useToast } from "../hooks/useToast";
import { CONSTANTS } from "../config/constants";

// Package ID to entitlement mapping (from RevenueCat configuration)
const PACKAGE_ENTITLEMENT_MAP: EntitlementMap = {
  ultra_yearly: "bandwidth_ultra",
  ultra_monthly: "bandwidth_ultra",
  pro_yearly: "bandwidth_pro",
  pro_monthly: "bandwidth_pro",
  dev_yearly: "bandwidth_dev",
  dev_monthly: "bandwidth_dev",
};

// Entitlement to level mapping (higher = better tier)
const ENTITLEMENT_LEVELS: EntitlementLevels = {
  none: 0,
  bandwidth_dev: 1,
  bandwidth_pro: 2,
  bandwidth_ultra: 3,
};

function PricingPage() {
  const { t } = useTranslation("pricing");
  const { t: tSub } = useTranslation("subscription");
  const { user, openModal } = useAuthStatus();
  const { products: rawProducts, currentSubscription, purchase } =
    useSafeSubscriptionContext();
  const { currentEntitySlug, currentEntityId } = useCurrentEntity();
  const { navigate } = useLocalizedNavigate();
  const { success, error: showError } = useToast();
  const appName = CONSTANTS.APP_NAME;

  const isAuthenticated = !!user;
  const hasActiveSubscription = currentSubscription?.isActive ?? false;

  // Map products to the format expected by AppPricingPage
  const products: PricingProduct[] = rawProducts.map((p) => ({
    identifier: p.identifier,
    title: p.title,
    price: p.price,
    priceString: p.priceString,
    period: p.period,
  }));

  const handlePlanClick = async (planIdentifier: string) => {
    if (isAuthenticated) {
      // Directly initiate purchase flow
      try {
        const result = await purchase(planIdentifier);
        if (result) {
          success(tSub("purchase.success", "Subscription activated successfully!"));
          // Navigate to dashboard after successful purchase
          if (currentEntitySlug) {
            navigate(`/dashboard/${currentEntitySlug}`);
          } else {
            navigate("/dashboard");
          }
        }
      } catch (err) {
        showError(
          err instanceof Error
            ? err.message
            : tSub("purchase.error", "Failed to complete purchase"),
        );
      }
    } else {
      openModal();
    }
  };

  const handleFreePlanClick = () => {
    if (isAuthenticated) {
      if (currentEntitySlug) {
        navigate(`/dashboard/${currentEntitySlug}`);
      } else {
        navigate("/dashboard");
      }
    } else {
      openModal();
    }
  };

  // Static feature lists for pricing page (rate limits shown after sign-in on subscription page)
  const getProductFeatures = (packageId: string): string[] => {
    const entitlement = PACKAGE_ENTITLEMENT_MAP[packageId];
    if (entitlement === "bandwidth_ultra") {
      return [
        tSub("rateLimits.unlimitedRequests", "Unlimited API requests"),
        tSub("freeTier.schemaValidation", "JSON Schema-validated outputs"),
        tSub(
          "freeTier.allProviders",
          "All LLM providers (OpenAI, Anthropic, Google)",
        ),
      ];
    }
    if (entitlement === "bandwidth_pro") {
      return [
        t("features.highLimits", "High rate limits"),
        tSub("freeTier.schemaValidation", "JSON Schema-validated outputs"),
        tSub(
          "freeTier.allProviders",
          "All LLM providers (OpenAI, Anthropic, Google)",
        ),
      ];
    }
    if (entitlement === "bandwidth_dev") {
      return [
        t("features.increasedLimits", "Increased rate limits"),
        tSub("freeTier.schemaValidation", "JSON Schema-validated outputs"),
        tSub(
          "freeTier.allProviders",
          "All LLM providers (OpenAI, Anthropic, Google)",
        ),
      ];
    }
    return [];
  };

  // Build labels object from translations
  const labels: PricingPageLabels = {
    // Header
    title: t("title"),
    subtitle: t("subtitle"),

    // Periods
    periodYear: tSub("periods.year"),
    periodMonth: tSub("periods.month"),
    periodWeek: tSub("periods.week"),

    // Billing period toggle
    billingMonthly: tSub("billingPeriod.monthly", "Monthly"),
    billingYearly: tSub("billingPeriod.yearly", "Yearly"),

    // Free tier
    freeTierTitle: "Free",
    freeTierPrice: "$0",
    freeTierFeatures: [
      tSub("freeTier.schemaValidation", "JSON Schema-validated outputs"),
      tSub(
        "freeTier.allProviders",
        "All LLM providers (OpenAI, Anthropic, Google)",
      ),
      tSub("freeTier.endpointTesting", "Built-in endpoint testing"),
      tSub("freeTier.analytics", "Basic usage analytics"),
    ],

    // Badges
    currentPlanBadge: t("badges.currentPlan", "Current Plan"),
    mostPopularBadge: t("badges.mostPopular", "Most Popular"),

    // CTA buttons
    ctaLogIn: t("cta.logIn", "Log in to Continue"),
    ctaTryFree: t("cta.tryFree", "Try it for Free"),
    ctaUpgrade: t("cta.upgrade", "Upgrade"),

    // FAQ
    faqTitle: t("faq.title"),
  };

  // Build formatters object
  const formatters: PricingPageFormatters = {
    formatSavePercent: (percent: number) =>
      tSub("badges.savePercent", "Save {{percent}}%", { percent }),
    getProductFeatures,
  };

  // Get FAQ items from translations
  const faqItems: FAQItem[] = t("faq.items", {
    returnObjects: true,
    appName,
  }) as FAQItem[];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        title="Pricing"
        description={`${CONSTANTS.APP_NAME} pricing plans. Start free, scale as you grow. Flexible plans for developers, teams, and enterprises building AI-powered APIs.`}
        canonical="/pricing"
        keywords="LLM API pricing, AI API cost, structured output pricing, API pricing plans"
      />
      <AISearchOptimization
        pageType="pricing"
        pageName={`${CONSTANTS.APP_NAME} Pricing`}
        description="Flexible pricing plans for building structured LLM APIs. Start free, scale as you grow."
        keywords={[
          "LLM API pricing",
          "AI API cost",
          "structured output pricing",
        ]}
        faqs={[
          {
            question: "Is there a free tier?",
            answer: `Yes, ${CONSTANTS.APP_NAME} offers a free tier with limited requests per month to get started.`,
          },
          {
            question: "What payment methods are accepted?",
            answer:
              "We accept all major credit cards through our secure payment processor.",
          },
          {
            question: "Can I upgrade or downgrade my plan?",
            answer:
              "Yes, you can change your plan at any time. Changes take effect on your next billing cycle.",
          },
        ]}
      />
      <AppPricingPage
        products={products}
        isAuthenticated={isAuthenticated}
        hasActiveSubscription={hasActiveSubscription}
        currentProductIdentifier={currentSubscription?.productIdentifier}
        subscriptionUserId={currentEntityId ?? undefined}
        labels={labels}
        formatters={formatters}
        entitlementMap={PACKAGE_ENTITLEMENT_MAP}
        entitlementLevels={ENTITLEMENT_LEVELS}
        onPlanClick={handlePlanClick}
        onFreePlanClick={handleFreePlanClick}
        faqItems={faqItems}
      />
    </ScreenContainer>
  );
}

export default PricingPage;
