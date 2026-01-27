import { useTranslation } from "react-i18next";
import { useAuthStatus } from "@sudobility/auth-components";
import {
  AppPricingPage,
  type PricingPageLabels,
  type PricingPageFormatters,
  type FAQItem,
} from "@sudobility/building_blocks";
import { useSafeSubscriptionContext } from "../components/providers/SafeSubscriptionContext";
import { useCurrentEntity } from "../hooks/useCurrentEntity";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import AISearchOptimization from "../components/seo/AISearchOptimization";
import { useLocalizedNavigate } from "../hooks/useLocalizedNavigate";
import { useToast } from "../hooks/useToast";
import { CONSTANTS } from "../config/constants";
import {
  getProductFeatures,
  getFreeTierFeatures,
} from "../config/subscription-config";
import { refreshSubscription } from "@sudobility/subscription_lib";

function PricingPage() {
  const { t } = useTranslation("pricing");
  const { t: tSub } = useTranslation("subscription");
  const { user } = useAuthStatus();
  const { purchase } = useSafeSubscriptionContext();
  const { currentEntitySlug } = useCurrentEntity();
  const { navigate } = useLocalizedNavigate();
  const { success, error: showError } = useToast();
  const appName = CONSTANTS.APP_NAME;

  const isAuthenticated = !!user;

  const handlePlanClick = async (planIdentifier: string) => {
    if (isAuthenticated) {
      // Directly initiate purchase flow
      try {
        const result = await purchase(planIdentifier);
        if (result) {
          // Refresh subscription_lib data to sync state
          await refreshSubscription();
          success(
            tSub("purchase.success", "Subscription activated successfully!"),
          );
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
      navigate("/login");
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
      navigate("/login");
    }
  };

  // Use shared product features helper
  const getFeatures = (packageId: string): string[] => {
    return getProductFeatures(packageId, tSub);
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
    freeTierFeatures: getFreeTierFeatures(tSub),

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
    getProductFeatures: getFeatures,
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
        isAuthenticated={isAuthenticated}
        labels={labels}
        formatters={formatters}
        onPlanClick={handlePlanClick}
        onFreePlanClick={handleFreePlanClick}
        faqItems={faqItems}
        offerId={import.meta.env.VITE_REVENUECAT_OFFER_ID}
      />
    </ScreenContainer>
  );
}

export default PricingPage;
