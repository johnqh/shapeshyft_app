import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SubscriptionLayout,
  SubscriptionTile,
  SegmentedControl,
  useSubscriptionContext,
} from '@sudobility/subscription-components';
import { getInfoService } from '@sudobility/di';
import { InfoType, type RateLimitTier } from '@sudobility/types';
import { useRateLimits } from '@sudobility/shapeshyft_client';
import { useToast } from '../../hooks/useToast';
import { useApi } from '../../hooks/useApi';

type BillingPeriod = 'monthly' | 'yearly';

function SubscriptionPage() {
  const { t } = useTranslation('subscription');
  const { success } = useToast();
  const { networkClient, baseUrl, token, isReady } = useApi();
  const {
    products,
    currentSubscription,
    isLoading,
    error,
    purchase,
    restore,
    clearError,
  } = useSubscriptionContext();

  const {
    config: rateLimitsConfig,
    refreshConfig: refreshRateLimits,
  } = useRateLimits(networkClient, baseUrl);

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch rate limits on mount
  useEffect(() => {
    if (isReady && token) {
      refreshRateLimits(token);
    }
  }, [isReady, token, refreshRateLimits]);

  // Show error via InfoInterface
  useEffect(() => {
    if (error) {
      getInfoService().show(t('common.error'), error, InfoType.ERROR, 5000);
      clearError();
    }
  }, [error, clearError, t]);

  // Filter products by billing period and sort by price
  const filteredProducts = products
    .filter(product => {
      if (!product.period) return false;
      const isYearly = product.period.includes('Y') || product.period.includes('year');
      return billingPeriod === 'yearly' ? isYearly : !isYearly;
    })
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  const handlePeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
    setSelectedPlan(null); // Clear selection when switching periods
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setIsPurchasing(true);
    clearError();

    try {
      const result = await purchase(selectedPlan);
      if (result) {
        success(t('purchase.success'));
        setSelectedPlan(null);
      }
    } catch (err) {
      getInfoService().show(t('common.error'), err instanceof Error ? err.message : t('purchase.error'), InfoType.ERROR, 5000);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    clearError();

    try {
      const result = await restore();
      if (result) {
        success(t('restore.success'));
      } else {
        getInfoService().show(t('common.error'), t('restore.noPurchases'), InfoType.WARNING, 5000);
      }
    } catch (err) {
      getInfoService().show(t('common.error'), err instanceof Error ? err.message : t('restore.error'), InfoType.ERROR, 5000);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatExpirationDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getPeriodLabel = (period?: string) => {
    if (!period) return '';
    if (period.includes('Y') || period.includes('year')) return t('periods.year');
    if (period.includes('M') || period.includes('month')) return t('periods.month');
    if (period.includes('W') || period.includes('week')) return t('periods.week');
    return '';
  };

  const getTrialLabel = (trialPeriod?: string) => {
    if (!trialPeriod) return undefined;
    const num = trialPeriod.replace(/\D/g, '') || '1';
    if (trialPeriod.includes('W')) {
      return t('trial.weeks', { count: parseInt(num, 10) });
    }
    if (trialPeriod.includes('M')) {
      return t('trial.months', { count: parseInt(num, 10) });
    }
    // Default to days
    return t('trial.days', { count: parseInt(num, 10) });
  };

  /**
   * Get the rate limit tier that matches a product's entitlement
   */
  const getRateLimitTierForProduct = (entitlement?: string): RateLimitTier | undefined => {
    if (!rateLimitsConfig?.tiers) return undefined;

    // Use the entitlement from the product (set in RevenueCat offering metadata)
    if (entitlement) {
      return rateLimitsConfig.tiers.find(tier => tier.entitlement === entitlement);
    }

    // Fallback to free tier if no entitlement specified
    return rateLimitsConfig.tiers.find(tier => tier.entitlement === 'none');
  };

  /**
   * Format rate limit value for display
   */
  const formatRateLimit = (limit: number | null): string => {
    if (limit === null) return t('rateLimits.unlimited', 'Unlimited');
    return limit.toLocaleString();
  };

  /**
   * Get rate limit features as strings for a product
   */
  const getRateLimitFeatures = (entitlement?: string): string[] => {
    const tier = getRateLimitTierForProduct(entitlement);
    if (!tier) return [];

    const features: string[] = [];

    if (tier.limits.hourly !== null) {
      features.push(t('rateLimits.hourly', '{{limit}} requests/hour', { limit: formatRateLimit(tier.limits.hourly) }));
    }
    if (tier.limits.daily !== null) {
      features.push(t('rateLimits.daily', '{{limit}} requests/day', { limit: formatRateLimit(tier.limits.daily) }));
    }
    if (tier.limits.monthly !== null) {
      features.push(t('rateLimits.monthly', '{{limit}} requests/month', { limit: formatRateLimit(tier.limits.monthly) }));
    }

    // If all limits are null, show unlimited
    if (tier.limits.hourly === null && tier.limits.daily === null && tier.limits.monthly === null) {
      features.push(t('rateLimits.unlimitedRequests', 'Unlimited API requests'));
    }

    return features;
  };

  const getProductFeatures = (entitlement?: string): string[] => {
    // Only show rate limit features from the API based on product entitlement
    return getRateLimitFeatures(entitlement);
  };

  const billingPeriodOptions = [
    { value: 'monthly' as const, label: t('billingPeriod.monthly') },
    { value: 'yearly' as const, label: t('billingPeriod.yearly') },
  ];

  return (
    <SubscriptionLayout
      title={t('title')}
      error={error}
      currentStatusLabel={t('currentStatus.label')}
      currentStatus={{
        isActive: currentSubscription?.isActive ?? false,
        activeContent: currentSubscription?.isActive
          ? {
              title: t('currentStatus.active'),
              fields: [
                {
                  label: t('currentStatus.plan'),
                  value: currentSubscription.productIdentifier || t('currentStatus.premium'),
                },
                {
                  label: t('currentStatus.expires'),
                  value: formatExpirationDate(currentSubscription.expirationDate),
                },
                {
                  label: t('currentStatus.willRenew'),
                  value: currentSubscription.willRenew ? t('common.yes') : t('common.no'),
                },
                // Rate limit usage fields
                ...(rateLimitsConfig ? [
                  {
                    label: t('currentStatus.monthlyUsage', 'Monthly Usage'),
                    value: `${rateLimitsConfig.currentUsage.monthly.toLocaleString()} / ${formatRateLimit(rateLimitsConfig.currentLimits.monthly)}`,
                  },
                  {
                    label: t('currentStatus.dailyUsage', 'Daily Usage'),
                    value: `${rateLimitsConfig.currentUsage.daily.toLocaleString()} / ${formatRateLimit(rateLimitsConfig.currentLimits.daily)}`,
                  },
                ] : []),
              ],
            }
          : undefined,
        inactiveContent: !currentSubscription?.isActive
          ? {
              title: t('currentStatus.inactive'),
              message: t('currentStatus.inactiveMessage'),
            }
          : undefined,
      }}
      aboveProducts={
        !isLoading && products.length > 0 ? (
          <div className="flex justify-center mb-6">
            <SegmentedControl
              options={billingPeriodOptions}
              value={billingPeriod}
              onChange={handlePeriodChange}
            />
          </div>
        ) : null
      }
      primaryAction={{
        label: isPurchasing ? t('buttons.purchasing') : t('buttons.subscribe'),
        onClick: handlePurchase,
        disabled: !selectedPlan || isPurchasing || isRestoring,
        loading: isPurchasing,
      }}
      secondaryAction={{
        label: isRestoring ? t('buttons.restoring') : t('buttons.restore'),
        onClick: handleRestore,
        disabled: isPurchasing || isRestoring,
        loading: isRestoring,
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-theme-text-secondary">
          {t('noProducts')}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-theme-text-secondary">
          {t('noProductsForPeriod')}
        </div>
      ) : (
        filteredProducts.map((product) => (
          <SubscriptionTile
            key={product.identifier}
            id={product.identifier}
            title={product.title}
            price={product.priceString}
            periodLabel={getPeriodLabel(product.period)}
            features={getProductFeatures(product.entitlement)}
            isSelected={selectedPlan === product.identifier}
            onSelect={() => setSelectedPlan(product.identifier)}
            isBestValue={product.entitlement === 'pro'}
            discountBadge={
              product.period?.includes('Y')
                ? { text: t('badges.saveYearly'), isBestValue: true }
                : undefined
            }
            introPriceNote={
              product.freeTrialPeriod
                ? getTrialLabel(product.freeTrialPeriod)
                : product.introPrice
                  ? t('intro.note', { price: product.introPrice })
                  : undefined
            }
            disabled={isPurchasing || isRestoring}
          />
        ))
      )}
    </SubscriptionLayout>
  );
}

export default SubscriptionPage;
