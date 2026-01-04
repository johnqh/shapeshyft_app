import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import LocalizedLink from '../components/layout/LocalizedLink';

function AboutPage() {
  const { t } = useTranslation('about');

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/about"
        title={t('seo.title')}
        description={t('seo.description')}
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              {t('story.title')}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-theme-text-secondary mb-6">
                {t('story.paragraph1')}
              </p>
              <p className="text-theme-text-secondary mb-6">
                {t('story.paragraph2')}
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              {t('mission.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              {t('mission.description')}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                {t('values.title')}
              </h3>
              <ul className="space-y-3 text-blue-800 dark:text-blue-200">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{t('values.reliability.title')}</strong> {t('values.reliability.description')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{t('values.simplicity.title')}</strong> {t('values.simplicity.description')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{t('values.transparency.title')}</strong> {t('values.transparency.description')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{t('values.innovation.title')}</strong> {t('values.innovation.description')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              {t('cta.description')}
            </p>
            <LocalizedLink
              to="/docs"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('cta.button')}
            </LocalizedLink>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
}

export default AboutPage;
