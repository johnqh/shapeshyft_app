import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import { useTheme } from '../context/ThemeContext';
import { Theme, FontSize } from '@sudobility/types';

function SettingsPage() {
  const { t } = useTranslation('settings');
  const { theme, fontSize, setTheme, setFontSize } = useTheme();

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/settings"
        title={t('seo.title')}
        description={t('seo.description')}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold text-theme-text-primary mb-8">
            {t('title')}
          </h1>

          {/* Appearance Section */}
          <div className="bg-theme-bg-secondary rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t('appearance.title')}
            </h2>
            <p className="text-sm text-theme-text-secondary mb-6">
              {t('appearance.description')}
            </p>

            <div className="space-y-6">
              {/* Theme Setting */}
              <div className="space-y-2">
                <label
                  htmlFor="theme-select"
                  className="block text-sm font-medium text-theme-text-primary"
                >
                  {t('theme.label')}
                </label>
                <select
                  id="theme-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={Theme.LIGHT}>{t('theme.light')}</option>
                  <option value={Theme.DARK}>{t('theme.dark')}</option>
                  <option value={Theme.SYSTEM}>{t('theme.system')}</option>
                </select>
                <p className="text-xs text-theme-text-secondary">
                  {t('theme.description')}
                </p>
              </div>

              {/* Font Size Setting */}
              <div className="space-y-2">
                <label
                  htmlFor="font-size-select"
                  className="block text-sm font-medium text-theme-text-primary"
                >
                  {t('fontSize.label')}
                </label>
                <select
                  id="font-size-select"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as FontSize)}
                  className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={FontSize.SMALL}>{t('fontSize.small')}</option>
                  <option value={FontSize.MEDIUM}>{t('fontSize.medium')}</option>
                  <option value={FontSize.LARGE}>{t('fontSize.large')}</option>
                </select>
                <p className="text-xs text-theme-text-secondary">
                  {t('fontSize.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              {t('info.title')}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('info.description')}
            </p>
          </div>
        </div>
      </main>
    </ScreenContainer>
  );
}

export default SettingsPage;
