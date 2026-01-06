import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import {
  SubscriptionTile,
  SegmentedControl,
  useSubscriptionContext,
} from '@sudobility/subscription-components';
import { type RateLimitTier } from '@sudobility/types';
import { useRateLimits } from '@sudobility/shapeshyft_client';
import { useSafeSubscriptionContext } from '../components/providers/SafeSubscriptionContext';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import AISearchOptimization from '../components/seo/AISearchOptimization';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useApi } from '../hooks/useApi';

type BillingPeriod = 'monthly' | 'yearly';

// Package ID to entitlement mapping (from RevenueCat configuration)
const PACKAGE_ENTITLEMENT_MAP: Record<string, string> = {
  ultra_yearly: 'bandwidth_ultra',
  ultra_monthly: 'bandwidth_ultra',
  pro_yearly: 'bandwidth_pro',
  pro_monthly: 'bandwidth_pro',
  dev_yearly: 'bandwidth_dev',
  dev_monthly: 'bandwidth_dev',
};

function PricingPage() {
  const { t } = useTranslation('pricing');
  const { t: tSub } = useTranslation('subscription');
  const { user, openModal } = useAuthStatus();
  const { currentSubscription } = useSafeSubscriptionContext();
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, token, isReady } = useApi();

  const isAuthenticated = !!user;
  const hasActiveSubscription = currentSubscription?.isActive ?? false;

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  // Try to get products from subscription context (only works when authenticated)
  let products: ReturnType<typeof useSubscriptionContext>['products'] = [];
  try {
    const subContext = useSubscriptionContext();
    products = subContext.products;
  } catch {
    // Not authenticated, products will be empty
  }

  const { config: rateLimitsConfig, refreshConfig: refreshRateLimits } = useRateLimits(
    networkClient,
    baseUrl
  );

  // Fetch rate limits on mount
  useEffect(() => {
    if (isReady && token) {
      refreshRateLimits(token);
    }
  }, [isReady, token, refreshRateLimits]);

  // Filter products by billing period and sort by price
  const filteredProducts = products
    .filter(product => {
      if (!product.period) return false;
      const isYearly = product.period.includes('Y') || product.period.includes('year');
      return billingPeriod === 'yearly' ? isYearly : !isYearly;
    })
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  const handlePlanClick = (planIdentifier: string) => {
    if (isAuthenticated) {
      // Navigate to subscription page with the plan pre-selected
      navigate(`/dashboard/subscription?plan=${planIdentifier}`);
    } else {
      openModal();
    }
  };

  const handleFreePlanClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      openModal();
    }
  };

  // Rate limit helpers
  const formatRateLimit = (limit: number | null): string => {
    if (limit === null) return tSub('rateLimits.unlimited', 'Unlimited');
    return limit.toLocaleString();
  };

  const getRateLimitTierForProduct = (packageId: string): RateLimitTier | undefined => {
    if (!rateLimitsConfig?.tiers) return undefined;
    const entitlement = PACKAGE_ENTITLEMENT_MAP[packageId];
    if (entitlement) {
      return rateLimitsConfig.tiers.find(tier => tier.entitlement === entitlement);
    }
    return rateLimitsConfig.tiers.find(tier => tier.entitlement === 'none');
  };

  const getRateLimitFeatures = (packageId: string): string[] => {
    const tier = getRateLimitTierForProduct(packageId);
    if (!tier) return [];
    const features: string[] = [];
    if (tier.limits.hourly !== null) {
      features.push(tSub('rateLimits.hourly', '{{limit}} requests/hour', { limit: formatRateLimit(tier.limits.hourly) }));
    }
    if (tier.limits.daily !== null) {
      features.push(tSub('rateLimits.daily', '{{limit}} requests/day', { limit: formatRateLimit(tier.limits.daily) }));
    }
    if (tier.limits.monthly !== null) {
      features.push(tSub('rateLimits.monthly', '{{limit}} requests/month', { limit: formatRateLimit(tier.limits.monthly) }));
    }
    if (tier.limits.hourly === null && tier.limits.daily === null && tier.limits.monthly === null) {
      features.push(tSub('rateLimits.unlimitedRequests', 'Unlimited API requests'));
    }
    return features;
  };

  const getFreeTierFeatures = (): string[] => {
    const benefits = [
      tSub('freeTier.schemaValidation', 'JSON Schema-validated outputs'),
      tSub('freeTier.allProviders', 'All LLM providers (OpenAI, Anthropic, Google)'),
      tSub('freeTier.endpointTesting', 'Built-in endpoint testing'),
      tSub('freeTier.analytics', 'Basic usage analytics'),
    ];
    if (rateLimitsConfig?.tiers) {
      const freeTier = rateLimitsConfig.tiers.find(tier => tier.entitlement === 'none');
      if (freeTier) {
        if (freeTier.limits.hourly !== null) {
          benefits.push(tSub('rateLimits.hourly', '{{limit}} requests/hour', { limit: formatRateLimit(freeTier.limits.hourly) }));
        }
        if (freeTier.limits.daily !== null) {
          benefits.push(tSub('rateLimits.daily', '{{limit}} requests/day', { limit: formatRateLimit(freeTier.limits.daily) }));
        }
        if (freeTier.limits.monthly !== null) {
          benefits.push(tSub('rateLimits.monthly', '{{limit}} requests/month', { limit: formatRateLimit(freeTier.limits.monthly) }));
        }
      }
    }
    return benefits;
  };

  const getPeriodLabel = (period?: string) => {
    if (!period) return '';
    if (period.includes('Y') || period.includes('year')) return tSub('periods.year');
    if (period.includes('M') || period.includes('month')) return tSub('periods.month');
    if (period.includes('W') || period.includes('week')) return tSub('periods.week');
    return '';
  };

  const getYearlySavingsPercent = (yearlyPackageId: string): number | undefined => {
    const yearlyEntitlement = PACKAGE_ENTITLEMENT_MAP[yearlyPackageId];
    if (!yearlyEntitlement) return undefined;
    const yearlyProduct = products.find(p => p.identifier === yearlyPackageId);
    if (!yearlyProduct) return undefined;
    const monthlyPackageId = Object.entries(PACKAGE_ENTITLEMENT_MAP).find(
      ([pkgId, ent]) => ent === yearlyEntitlement && pkgId.includes('monthly')
    )?.[0];
    if (!monthlyPackageId) return undefined;
    const monthlyProduct = products.find(p => p.identifier === monthlyPackageId);
    if (!monthlyProduct) return undefined;
    const yearlyPrice = parseFloat(yearlyProduct.price);
    const monthlyPrice = parseFloat(monthlyProduct.price);
    if (monthlyPrice <= 0 || yearlyPrice <= 0) return undefined;
    const annualizedMonthly = monthlyPrice * 12;
    const savings = ((annualizedMonthly - yearlyPrice) / annualizedMonthly) * 100;
    return Math.round(savings);
  };

  const billingPeriodOptions = [
    { value: 'monthly' as const, label: tSub('billingPeriod.monthly', 'Monthly') },
    { value: 'yearly' as const, label: tSub('billingPeriod.yearly', 'Yearly') },
  ];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        title="Pricing"
        description="ShapeShyft pricing plans. Start free, scale as you grow. Flexible plans for developers, teams, and enterprises building AI-powered APIs."
        canonical="/pricing"
        keywords="LLM API pricing, AI API cost, structured output pricing, API pricing plans"
      />
      <AISearchOptimization
        pageType="pricing"
        pageName="ShapeShyft Pricing"
        description="Flexible pricing plans for building structured LLM APIs. Start free, scale as you grow."
        keywords={['LLM API pricing', 'AI API cost', 'structured output pricing']}
        faqs={[
          {
            question: 'Is there a free tier?',
            answer: 'Yes, ShapeShyft offers a free tier with limited requests per month to get started.',
          },
          {
            question: 'What payment methods are accepted?',
            answer: 'We accept all major credit cards through our secure payment processor.',
          },
          {
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'Yes, you can change your plan at any time. Changes take effect on your next billing cycle.',
          },
        ]}
      />
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-theme-text-secondary">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Billing Period Selector */}
          <div className="flex justify-center mb-8">
            <SegmentedControl
              options={billingPeriodOptions}
              value={billingPeriod}
              onChange={setBillingPeriod}
            />
          </div>

          {/* Subscription Tiles Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Free Tier - no CTA button or radio */}
            <SubscriptionTile
              id="free"
              title="Free"
              price="$0"
              periodLabel={tSub('periods.month', '/month')}
              features={getFreeTierFeatures()}
              isSelected={false}
              onSelect={handleFreePlanClick}
              topBadge={!hasActiveSubscription ? { text: t('badges.currentPlan', 'Current Plan'), color: 'green' } : undefined}
              hideSelectionIndicator
            />

            {/* Paid Plans with CTA buttons */}
            {filteredProducts.map(product => (
              <SubscriptionTile
                key={product.identifier}
                id={product.identifier}
                title={product.title}
                price={product.priceString}
                periodLabel={getPeriodLabel(product.period)}
                features={getRateLimitFeatures(product.identifier)}
                isSelected={false}
                onSelect={() => {}}
                isBestValue={product.identifier.includes('pro')}
                topBadge={
                  product.identifier.includes('pro')
                    ? { text: t('badges.mostPopular', 'Most Popular'), color: 'yellow' }
                    : undefined
                }
                discountBadge={
                  product.period?.includes('Y')
                    ? (() => {
                        const savings = getYearlySavingsPercent(product.identifier);
                        return savings && savings > 0
                          ? { text: tSub('badges.savePercent', 'Save {{percent}}%', { percent: savings }), isBestValue: true }
                          : undefined;
                      })()
                    : undefined
                }
                ctaButton={{
                  label: isAuthenticated ? t('cta.startNow', 'Start Now') : t('cta.signUp', 'Sign Up'),
                  onClick: () => handlePlanClick(product.identifier),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-theme-text-primary text-center mb-12">
            {t('faq.title')}
          </h2>

          <div className="space-y-6">
            {(t('faq.items', { returnObjects: true }) as { question: string; answer: string }[]).map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-theme-bg-primary p-6 rounded-xl border border-theme-border"
                >
                  <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                    {item.question}
                  </h3>
                  <p className="text-theme-text-secondary">{item.answer}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </ScreenContainer>
  );
}

export default PricingPage;
