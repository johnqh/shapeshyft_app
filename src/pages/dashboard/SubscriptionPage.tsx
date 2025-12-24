import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SubscriptionTile,
  useSubscriptionContext,
} from '@sudobility/subscription-components';
import { useToast } from '../../hooks/useToast';

type BillingPeriod = 'monthly' | 'yearly';

function SubscriptionPage() {
  const { t } = useTranslation('subscription');
  const { success, error: showError } = useToast();
  const {
    products,
    currentSubscription,
    isLoading,
    error,
    purchase,
    restore,
    clearError,
  } = useSubscriptionContext();

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

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
      showError(err instanceof Error ? err.message : t('purchase.error'));
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
        showError(t('restore.noPurchases'));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('restore.error'));
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

  const getProductFeatures = (identifier: string): string[] => {
    // Extract tier from product identifier (e.g., "shapeshyft_developer_monthly" -> "developer")
    const lowerIdentifier = identifier.toLowerCase();
    if (lowerIdentifier.includes('enterprise')) {
      return t('features.enterprise', { returnObjects: true }) as string[];
    }
    if (lowerIdentifier.includes('pro')) {
      return t('features.pro', { returnObjects: true }) as string[];
    }
    if (lowerIdentifier.includes('developer')) {
      return t('features.developer', { returnObjects: true }) as string[];
    }
    // Fallback to description if no tier match
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Current Status */}
      <div className="p-4 bg-theme-bg-secondary rounded-lg border border-theme-border">
        <h3 className="text-sm font-medium text-theme-text-secondary mb-2">
          {t('currentStatus.label')}
        </h3>
        {currentSubscription?.isActive ? (
          <div>
            <p className="font-semibold text-theme-text-primary mb-2">
              {t('currentStatus.active')}
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-theme-text-secondary">{t('currentStatus.plan')}:</span>{' '}
                <span className="text-theme-text-primary">
                  {currentSubscription.productIdentifier || t('currentStatus.premium')}
                </span>
              </p>
              <p>
                <span className="text-theme-text-secondary">{t('currentStatus.expires')}:</span>{' '}
                <span className="text-theme-text-primary">
                  {formatExpirationDate(currentSubscription.expirationDate)}
                </span>
              </p>
              <p>
                <span className="text-theme-text-secondary">{t('currentStatus.willRenew')}:</span>{' '}
                <span className="text-theme-text-primary">
                  {currentSubscription.willRenew ? t('common.yes') : t('common.no')}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-theme-text-primary mb-1">
              {t('currentStatus.inactive')}
            </p>
            <p className="text-sm text-theme-text-secondary">
              {t('currentStatus.inactiveMessage')}
            </p>
          </div>
        )}
      </div>

      {/* Billing Period Segmented Control */}
      {!isLoading && products.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-theme-bg-secondary p-1">
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              {t('billingPeriod.monthly')}
            </button>
            <button
              onClick={() => handlePeriodChange('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              {t('billingPeriod.yearly')}
            </button>
          </div>
        </div>
      )}

      {/* Subscription Tiles */}
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
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {filteredProducts.map((product, index) => (
            <SubscriptionTile
              key={product.identifier}
              id={product.identifier}
              title={product.title}
              price={product.priceString}
              periodLabel={getPeriodLabel(product.period)}
              features={getProductFeatures(product.identifier)}
              isSelected={selectedPlan === product.identifier}
              onSelect={() => setSelectedPlan(product.identifier)}
              isBestValue={product.identifier.toLowerCase().includes('pro')}
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
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={handlePurchase}
          disabled={!selectedPlan || isPurchasing || isRestoring}
          className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPurchasing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('buttons.purchasing')}
            </span>
          ) : (
            t('buttons.subscribe')
          )}
        </button>
        <button
          onClick={handleRestore}
          disabled={isPurchasing || isRestoring}
          className="px-4 py-3 border border-theme-border text-theme-text-primary font-medium rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
        >
          {isRestoring ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('buttons.restoring')}
            </span>
          ) : (
            t('buttons.restore')
          )}
        </button>
      </div>
    </div>
  );
}

export default SubscriptionPage;
