import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/layout/ScreenContainer';
import SEO from '../../components/seo/SEO';
import LocalizedLink from '../../components/layout/LocalizedLink';
import { CONSTANTS } from '../../config/constants';

// Icons for use case cards
const TextClassificationIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const DataExtractionIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
  </svg>
);

const ContentGenerationIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

function UseCasesPage() {
  const { t } = useTranslation('useCases');
  const appName = CONSTANTS.APP_NAME;

  const useCases = [
    {
      id: 'text',
      titleKey: 'useCases.textClassification.title',
      descriptionKey: 'useCases.textClassification.description',
      icon: TextClassificationIcon,
      href: '/use-cases/text',
      examplesKey: 'useCases.textClassification.examples',
    },
    {
      id: 'data',
      titleKey: 'useCases.dataExtraction.title',
      descriptionKey: 'useCases.dataExtraction.description',
      icon: DataExtractionIcon,
      href: '/use-cases/data',
      examplesKey: 'useCases.dataExtraction.examples',
    },
    {
      id: 'content',
      titleKey: 'useCases.contentGeneration.title',
      descriptionKey: 'useCases.contentGeneration.description',
      icon: ContentGenerationIcon,
      href: '/use-cases/content',
      examplesKey: 'useCases.contentGeneration.examples',
    },
  ];

  const features = [
    { titleKey: 'main.features.customSchemas.title', descriptionKey: 'main.features.customSchemas.description' },
    { titleKey: 'main.features.anyProvider.title', descriptionKey: 'main.features.anyProvider.description' },
    { titleKey: 'main.features.validatedOutput.title', descriptionKey: 'main.features.validatedOutput.description' },
    { titleKey: 'main.features.apiFirst.title', descriptionKey: 'main.features.apiFirst.description' },
  ];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases"
        title={t('seo.main.title', { appName })}
        description={t('seo.main.description', { appName })}
        keywords={t('seo.main.keywords')}
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
              {t('main.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl mx-auto">
              {t('main.hero.subtitle', { appName })}
            </p>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase) => {
                const examples = t(useCase.examplesKey, { returnObjects: true }) as string[];
                return (
                  <LocalizedLink
                    key={useCase.id}
                    to={useCase.href}
                    className="group bg-theme-bg-secondary rounded-2xl p-8 border border-theme-border hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all"
                  >
                    <div className="text-blue-600 dark:text-blue-400 mb-4">
                      <useCase.icon />
                    </div>
                    <h2 className="text-2xl font-bold text-theme-text-primary mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t(useCase.titleKey)}
                    </h2>
                    <p className="text-theme-text-secondary mb-4">
                      {t(useCase.descriptionKey)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(examples) && examples.map((example) => (
                        <span
                          key={example}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </LocalizedLink>
                );
              })}
            </div>
          </div>
        </section>

        {/* Unlimited Possibilities Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              {t('main.flexibility.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              {t('main.flexibility.description', { appName })}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {features.map((feature) => (
                <div key={feature.titleKey} className="bg-theme-bg-primary rounded-xl p-6 border border-theme-border">
                  <h3 className="font-semibold text-theme-text-primary mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-theme-text-secondary">{t(feature.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              {t('main.cta.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              {t('main.cta.subtitle', { appName })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                to="/docs"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('nav.readDocs')}
              </LocalizedLink>
              <LocalizedLink
                to="/pricing"
                className="inline-block px-8 py-3 bg-theme-bg-secondary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
              >
                {t('nav.viewPricing')}
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
}

export default UseCasesPage;
