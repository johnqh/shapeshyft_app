import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/layout/ScreenContainer';
import SEO from '../../components/seo/SEO';
import LocalizedLink from '../../components/layout/LocalizedLink';
import { CONSTANTS } from '../../config/constants';

const exampleSchema = `{
  "type": "object",
  "properties": {
    "vendor": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "address": { "type": "string" },
        "taxId": { "type": "string" }
      }
    },
    "invoiceNumber": { "type": "string" },
    "date": { "type": "string", "format": "date" },
    "lineItems": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "quantity": { "type": "number" },
          "unitPrice": { "type": "number" },
          "total": { "type": "number" }
        }
      }
    },
    "subtotal": { "type": "number" },
    "tax": { "type": "number" },
    "total": { "type": "number" }
  },
  "required": ["invoiceNumber", "total"]
}`;

const exampleOutput = `{
  "vendor": {
    "name": "Acme Supplies Inc.",
    "address": "123 Business Ave, NY 10001",
    "taxId": "12-3456789"
  },
  "invoiceNumber": "INV-2024-0892",
  "date": "2024-01-15",
  "lineItems": [
    {
      "description": "Office Supplies",
      "quantity": 50,
      "unitPrice": 12.99,
      "total": 649.50
    }
  ],
  "subtotal": 649.50,
  "tax": 56.83,
  "total": 706.33
}`;

function UseCasesDataPage() {
  const { t } = useTranslation('useCases');
  const appName = CONSTANTS.APP_NAME;

  const applications = [
    {
      titleKey: 'data.applications.invoice.title',
      descriptionKey: 'data.applications.invoice.description',
      examplesKey: 'data.applications.invoice.examples',
    },
    {
      titleKey: 'data.applications.resume.title',
      descriptionKey: 'data.applications.resume.description',
      examplesKey: 'data.applications.resume.examples',
    },
    {
      titleKey: 'data.applications.contract.title',
      descriptionKey: 'data.applications.contract.description',
      examplesKey: 'data.applications.contract.examples',
    },
    {
      titleKey: 'data.applications.form.title',
      descriptionKey: 'data.applications.form.description',
      examplesKey: 'data.applications.form.examples',
    },
  ];

  const benefits = [
    {
      emoji: '🎯',
      titleKey: 'data.benefits.schemaEnforcement.title',
      descriptionKey: 'data.benefits.schemaEnforcement.description',
    },
    {
      emoji: '🔄',
      titleKey: 'data.benefits.formatFlexibility.title',
      descriptionKey: 'data.benefits.formatFlexibility.description',
    },
    {
      emoji: '⚡',
      titleKey: 'data.benefits.instantIntegration.title',
      descriptionKey: 'data.benefits.instantIntegration.description',
    },
  ];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases/data"
        title={t('seo.data.title', { appName })}
        description={t('seo.data.description')}
        keywords={t('seo.data.keywords')}
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20" />
          <div className="relative max-w-4xl mx-auto">
            <LocalizedLink
              to="/use-cases"
              className="inline-flex items-center text-sm text-theme-text-secondary hover:text-theme-text-primary mb-6"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('nav.allUseCases')}
            </LocalizedLink>
            <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
              {t('data.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl">
              {t('data.hero.subtitle', { appName })}
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              {t('data.howItWorks.title')}
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                  {t('data.howItWorks.step1.title')}
                </h3>
                <p className="text-theme-text-secondary">
                  {t('data.howItWorks.step1.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                  {t('data.howItWorks.step2.title')}
                </h3>
                <p className="text-theme-text-secondary">
                  {t('data.howItWorks.step2.description', { appName })}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                  {t('data.howItWorks.step3.title')}
                </h3>
                <p className="text-theme-text-secondary">
                  {t('data.howItWorks.step3.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Schema */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              {t('data.example.title')}
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
                  {t('data.example.schemaTitle')}
                </h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96">
                  <code>{exampleSchema}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
                  {t('data.example.outputTitle')}
                </h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96">
                  <code>{exampleOutput}</code>
                </pre>
                <p className="text-sm text-theme-text-secondary mt-4">
                  {t('data.example.note')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              {t('data.applications.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {applications.map((app) => {
                const examples = t(app.examplesKey, { returnObjects: true }) as string[];
                return (
                  <div key={app.titleKey} className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border">
                    <h3 className="text-xl font-semibold text-theme-text-primary mb-3">
                      {t(app.titleKey)}
                    </h3>
                    <p className="text-theme-text-secondary mb-4">{t(app.descriptionKey)}</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(examples) && examples.map((example) => (
                        <span
                          key={example}
                          className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              {t('data.benefits.title', { appName })}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.titleKey} className="text-center">
                  <div className="text-4xl mb-4">{benefit.emoji}</div>
                  <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-theme-text-secondary">
                    {t(benefit.descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              {t('data.cta.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              {t('data.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                to="/docs"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('nav.readDocs')}
              </LocalizedLink>
              <LocalizedLink
                to="/use-cases"
                className="inline-block px-8 py-3 bg-theme-bg-secondary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
              >
                {t('nav.exploreOther')}
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
}

export default UseCasesDataPage;
