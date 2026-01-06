import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import LocalizedLink from '../components/layout/LocalizedLink';
import { SUPPORTED_LANGUAGES, CONSTANTS, type SupportedLanguage } from '../config/constants';

// Language display names and flags
const LANGUAGE_INFO: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  pt: { name: 'Português', flag: '🇧🇷' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  th: { name: 'ไทย', flag: '🇹🇭' },
  uk: { name: 'Українська', flag: '🇺🇦' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  zh: { name: '简体中文', flag: '🇨🇳' },
  'zh-hant': { name: '繁體中文', flag: '🇹🇼' },
};

interface SitemapSection {
  title: string;
  icon?: React.ReactNode;
  links: {
    path: string;
    label: string;
    description?: string;
  }[];
}

// Icon components
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const ScaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
  </svg>
);

const LanguageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

function SitemapPage() {
  const { t } = useTranslation('sitemap');
  const appName = CONSTANTS.APP_NAME;

  // Sort languages by their native name
  const sortedLanguages = useMemo(() => {
    return [...SUPPORTED_LANGUAGES]
      .map(code => ({
        code,
        name: LANGUAGE_INFO[code]?.name || code.toUpperCase(),
        flag: LANGUAGE_INFO[code]?.flag || '🌐',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const sections: SitemapSection[] = [
    {
      title: t('sections.main', 'Main Pages'),
      icon: <HomeIcon className="w-5 h-5" />,
      links: [
        {
          path: '/',
          label: t('links.home', 'Home'),
          description: t('descriptions.home', 'Landing page'),
        },
        {
          path: '/pricing',
          label: t('links.pricing', 'Pricing'),
          description: t('descriptions.pricing', 'Subscription plans'),
        },
        {
          path: '/settings',
          label: t('links.settings', 'Settings'),
          description: t('descriptions.settings', 'App settings'),
        },
      ],
    },
    {
      title: t('sections.documentation', 'Documentation'),
      icon: <DocumentTextIcon className="w-5 h-5" />,
      links: [
        {
          path: '/docs',
          label: t('links.docs', 'Documentation'),
          description: t('descriptions.docs', { defaultValue: `Learn how to use ${appName}`, appName }),
        },
        {
          path: '/docs/getting-started',
          label: t('links.gettingStarted', 'Getting Started'),
          description: t('descriptions.gettingStarted', 'Quick start guide'),
        },
        {
          path: '/docs/concepts',
          label: t('links.concepts', 'Core Concepts'),
          description: t('descriptions.concepts', 'Understand key concepts'),
        },
        {
          path: '/docs/api-reference',
          label: t('links.apiReference', 'API Reference'),
          description: t('descriptions.apiReference', 'Complete API documentation'),
        },
      ],
    },
    {
      title: t('sections.useCases', 'Use Cases'),
      icon: <LightBulbIcon className="w-5 h-5" />,
      links: [
        {
          path: '/use-cases',
          label: t('links.useCases', 'Use Cases'),
          description: t('descriptions.useCases', 'Explore possibilities'),
        },
        {
          path: '/use-cases/text',
          label: t('links.textClassification', 'Text Classification'),
          description: t('descriptions.textClassification', 'Sentiment, intent, topic analysis'),
        },
        {
          path: '/use-cases/data',
          label: t('links.dataExtraction', 'Data Extraction'),
          description: t('descriptions.dataExtraction', 'Extract structured data'),
        },
        {
          path: '/use-cases/content',
          label: t('links.contentGeneration', 'Content Generation'),
          description: t('descriptions.contentGeneration', 'Generate structured content'),
        },
      ],
    },
    {
      title: t('sections.company', 'Company'),
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      links: [
        {
          path: '/about',
          label: t('links.about', 'About'),
          description: t('descriptions.about', { defaultValue: `About ${appName}`, appName }),
        },
        {
          path: '/contact',
          label: t('links.contact', 'Contact'),
          description: t('descriptions.contact', 'Get in touch'),
        },
      ],
    },
    {
      title: t('sections.legal', 'Legal'),
      icon: <ScaleIcon className="w-5 h-5" />,
      links: [
        {
          path: '/privacy',
          label: t('links.privacy', 'Privacy Policy'),
          description: t('descriptions.privacy', 'Privacy and data protection'),
        },
        {
          path: '/terms',
          label: t('links.terms', 'Terms of Service'),
          description: t('descriptions.terms', 'Terms and conditions'),
        },
      ],
    },
  ];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        title={t('seo.title', { defaultValue: `Sitemap - ${appName}`, appName })}
        description={t('seo.description', { defaultValue: `Navigate all pages and features available on ${appName}`, appName })}
        canonical="/sitemap"
        keywords={`sitemap, navigation, ${appName} pages`}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
              {t('title', 'Sitemap')}
            </h1>
            <p className="text-xl text-theme-text-secondary">
              {t('subtitle', { defaultValue: `Explore all pages and features available on ${appName}`, appName })}
            </p>
          </div>

          {/* Language Section */}
          <div className="mb-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-theme-text-primary mb-4 flex items-center">
              <LanguageIcon className="w-6 h-6 mr-2" />
              {t('sections.languages', 'Languages')}
            </h2>
            <p className="text-theme-text-secondary mb-6">
              {t('languageDescription', { defaultValue: `${appName} is available in multiple languages. Select your preferred language:`, appName })}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sortedLanguages.map(lang => (
                <LocalizedLink
                  key={lang.code}
                  to="/"
                  language={lang.code as SupportedLanguage}
                  className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow border border-theme-border"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium text-theme-text-primary">{lang.name}</span>
                </LocalizedLink>
              ))}
            </div>
          </div>

          {/* Sitemap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-theme-bg-secondary rounded-xl border border-theme-border p-6">
                <h2 className="text-lg font-semibold text-theme-text-primary mb-4 flex items-center">
                  {section.icon && <span className="mr-2">{section.icon}</span>}
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <LocalizedLink
                        to={link.path}
                        className="group flex items-start text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ChevronRightIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <div>
                          <span className="font-medium text-theme-text-secondary group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {link.label}
                          </span>
                          {link.description && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {link.description}
                            </span>
                          )}
                        </div>
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Links Section */}
          <div className="mt-12 p-6 bg-theme-bg-secondary rounded-xl border border-theme-border">
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t('quickLinks.title', 'Quick Links')}
            </h3>
            <div className="flex flex-wrap gap-3">
              <LocalizedLink
                to="/docs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                {t('quickLinks.viewDocs', 'View Documentation')}
              </LocalizedLink>
              <LocalizedLink
                to="/pricing"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('quickLinks.viewPricing', 'View Pricing')}
              </LocalizedLink>
              <LocalizedLink
                to="/use-cases"
                className="inline-flex items-center px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors"
              >
                <LightBulbIcon className="w-5 h-5 mr-2" />
                {t('quickLinks.exploreUseCases', 'Explore Use Cases')}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </main>
    </ScreenContainer>
  );
}

export default SitemapPage;
