import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SubscriptionLayout,
  SubscriptionTile,
  useSubscriptionContext,
} from '@sudobility/subscription-components';
import { useToast } from '../../hooks/useToast';

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

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

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

  return (
    <div className="p-6">
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
        ) : (
          products.map((product, index) => (
            <SubscriptionTile
              key={product.identifier}
              id={product.identifier}
              title={product.title}
              price={product.priceString}
              periodLabel={getPeriodLabel(product.period)}
              features={product.description ? [product.description] : []}
              isSelected={selectedPlan === product.identifier}
              onSelect={() => setSelectedPlan(product.identifier)}
              topBadge={
                index === 1
                  ? { text: t('badges.popular'), color: 'purple' }
                  : undefined
              }
              discountBadge={
                product.period?.includes('Y')
                  ? { text: t('badges.saveYearly'), isBestValue: true }
                  : undefined
              }
              introPriceNote={
                product.freeTrialPeriod
                  ? t('trial.note', { days: product.freeTrialPeriod.replace(/\D/g, '') })
                  : product.introPrice
                    ? t('intro.note', { price: product.introPrice })
                    : undefined
              }
              disabled={isPurchasing || isRestoring}
            />
          ))
        )}
      </SubscriptionLayout>
    </div>
  );
}

export default SubscriptionPage;
