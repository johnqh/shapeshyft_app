import { Outlet, NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/layout/ScreenContainer';
import { isLanguageSupported } from '../../config/constants';

function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang && isLanguageSupported(lang) ? lang : 'en';

  const navItems = [
    { label: t('navigation.projects'), path: `/${currentLang}/dashboard` },
    { label: t('navigation.apiKeys'), path: `/${currentLang}/dashboard/keys` },
    { label: t('navigation.analytics'), path: `/${currentLang}/dashboard/analytics` },
  ];

  return (
    <ScreenContainer footerVariant="compact" showFooter={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-theme-text-primary">
            {t('title')}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-theme-border mb-8">
          <nav className="flex gap-8 -mb-px">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${currentLang}/dashboard`}
                className={({ isActive }) =>
                  `pb-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-border'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content */}
        <Outlet />
      </div>
    </ScreenContainer>
  );
}

export default DashboardPage;
