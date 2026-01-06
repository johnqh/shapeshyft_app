import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import { CONSTANTS } from '../config/constants';

function PrivacyPage() {
  const { t } = useTranslation('privacy');
  const appName = CONSTANTS.APP_NAME;

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/privacy"
        title={t('seo.title', { appName })}
        description={t('seo.description', { appName })}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
            {t('title')}
          </h1>
          <p className="text-theme-text-secondary mb-8">
            {t('lastUpdated', { date: new Date().toLocaleDateString() })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.introduction.title')}
              </h2>
              <p className="text-theme-text-secondary">
                {t('sections.introduction.content', { appName })}
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.collection.title')}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t('sections.collection.description')}
              </p>
              <ul className="list-disc list-inside text-theme-text-secondary space-y-2">
                {(t('sections.collection.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.usage.title')}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t('sections.usage.description')}
              </p>
              <ul className="list-disc list-inside text-theme-text-secondary space-y-2">
                {(t('sections.usage.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.security.title')}
              </h2>
              <p className="text-theme-text-secondary">
                {t('sections.security.content')}
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.retention.title')}
              </h2>
              <p className="text-theme-text-secondary">
                {t('sections.retention.content')}
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.rights.title')}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t('sections.rights.description')}
              </p>
              <ul className="list-disc list-inside text-theme-text-secondary space-y-2">
                {(t('sections.rights.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.cookies.title')}
              </h2>
              <p className="text-theme-text-secondary">
                {t('sections.cookies.content')}
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.changes.title')}
              </h2>
              <p className="text-theme-text-secondary">
                {t('sections.changes.content')}
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t('sections.contact.title')}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t('sections.contact.description')}
              </p>
              <div className="bg-theme-bg-secondary p-4 rounded-lg">
                <p className="text-theme-text-primary">
                  Email:{' '}
                  <a
                    href={`mailto:${CONSTANTS.SUPPORT_EMAIL}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {CONSTANTS.SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </ScreenContainer>
  );
}

export default PrivacyPage;
