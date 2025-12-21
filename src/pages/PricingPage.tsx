import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import { useSubscriptionContext } from '@sudobility/subscription-components';
import ScreenContainer from '../components/layout/ScreenContainer';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

function PricingPage() {
  const { t } = useTranslation('pricing');
  const { user, openModal } = useAuthStatus();
  const { currentSubscription } = useSubscriptionContext();
  const { navigate } = useLocalizedNavigate();

  const isAuthenticated = !!user;
  const hasActiveSubscription = currentSubscription?.isActive ?? false;

  const handlePlanClick = (plan: string) => {
    if (plan === 'enterprise') {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = 'mailto:sales@sudobility.com';
      return;
    }

    if (isAuthenticated) {
      // If user has a subscription, go to subscription management
      // Otherwise go to dashboard where they can subscribe
      navigate(hasActiveSubscription ? '/dashboard/subscription' : '/dashboard');
    } else {
      openModal();
    }
  };

  const plans = [
    {
      key: 'free',
      popular: false,
    },
    {
      key: 'pro',
      popular: true,
    },
    {
      key: 'enterprise',
      popular: false,
    },
  ];

  return (
    <ScreenContainer footerVariant="full">
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
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div
                key={plan.key}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 ring-offset-theme-bg-primary'
                    : 'bg-theme-bg-secondary border border-theme-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      plan.popular ? 'text-white' : 'text-theme-text-primary'
                    }`}
                  >
                    {t(`plans.${plan.key}.name`)}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        plan.popular ? 'text-white' : 'text-theme-text-primary'
                      }`}
                    >
                      {t(`plans.${plan.key}.price`)}
                    </span>
                    <span
                      className={
                        plan.popular ? 'text-blue-100' : 'text-theme-text-secondary'
                      }
                    >
                      {t(`plans.${plan.key}.period`)}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      plan.popular ? 'text-blue-100' : 'text-theme-text-secondary'
                    }`}
                  >
                    {t(`plans.${plan.key}.description`)}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {(t(`plans.${plan.key}.features`, { returnObjects: true }) as string[]).map(
                    (feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${
                            plan.popular ? 'text-blue-200' : 'text-green-500'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span
                          className={`text-sm ${
                            plan.popular ? 'text-white' : 'text-theme-text-primary'
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan.key)}
                  className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {t(`plans.${plan.key}.cta`)}
                </button>
              </div>
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
