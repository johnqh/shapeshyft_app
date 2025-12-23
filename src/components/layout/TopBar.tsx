import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TopbarProvider,
  Topbar,
  TopbarLeft,
  TopbarRight,
  TopbarNavigation,
  TopbarLogo,
  TopbarActions,
  type TopbarNavItem,
} from '@sudobility/components';
import { AuthAction, useAuthStatus } from '@sudobility/auth-components';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { CONSTANTS, SUPPORTED_LANGUAGES, isLanguageSupported } from '../../config/constants';
import LocalizedLink from './LocalizedLink';

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  ru: 'Русский',
  sv: 'Svenska',
  th: 'ไทย',
  uk: 'Українська',
  vi: 'Tiếng Việt',
  zh: '简体中文',
  'zh-hant': '繁體中文',
};

interface TopBarProps {
  variant?: 'default' | 'transparent';
}

// Custom Link wrapper for TopbarNavigation
const LinkWrapper = ({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) => (
  <LocalizedLink to={href} {...props}>
    {children}
  </LocalizedLink>
);

function TopBar({ variant = 'default' }: TopBarProps) {
  const { t } = useTranslation('common');
  const { navigate, switchLanguage, currentLanguage } = useLocalizedNavigate();
  const { user } = useAuthStatus();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isAuthenticated = !!user;

  // Build navigation items
  const navItems: TopbarNavItem[] = [
    { id: 'home', label: t('navigation.home'), href: '/' },
    { id: 'docs', label: t('navigation.docs'), href: '/docs' },
    { id: 'pricing', label: t('navigation.pricing'), href: '/pricing' },
  ];

  // Add dashboard if authenticated
  if (isAuthenticated) {
    navItems.push({ id: 'dashboard', label: t('navigation.dashboard'), href: '/dashboard' });
  }

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLanguageChange = (newLang: string) => {
    if (isLanguageSupported(newLang)) {
      switchLanguage(newLang);
      setShowLangMenu(false);
    }
  };

  return (
    <>
      <TopbarProvider variant={variant === 'transparent' ? 'transparent' : 'default'} sticky>
        <Topbar variant={variant === 'transparent' ? 'transparent' : 'default'} sticky zIndex="highest">
          <TopbarLeft>
            <TopbarNavigation
              items={navItems}
              collapseBelow="lg"
              LinkComponent={LinkWrapper}
            >
              <TopbarLogo onClick={handleLogoClick}>
                <img src="/logo.png" alt={CONSTANTS.APP_NAME} className="h-8" />
              </TopbarLogo>
            </TopbarNavigation>
          </TopbarLeft>

          <TopbarRight>
            <TopbarActions gap="md">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-theme-hover-bg transition-colors"
                  aria-label="Select language"
                >
                  <span className="hidden sm:inline">
                    {LANGUAGE_NAMES[currentLanguage] || 'English'}
                  </span>
                  <span className="sm:hidden">{currentLanguage.toUpperCase()}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showLangMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLangMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-theme-bg-primary border border-theme-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {SUPPORTED_LANGUAGES.map(langCode => (
                        <button
                          key={langCode}
                          onClick={() => handleLanguageChange(langCode)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-theme-hover-bg transition-colors ${
                            langCode === currentLanguage
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : ''
                          }`}
                        >
                          {LANGUAGE_NAMES[langCode]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Auth Action (handles login button and user dropdown) */}
              <AuthAction
                avatarSize={32}
                dropdownAlign="right"
                onLoginClick={() => navigate('/login')}
              />
            </TopbarActions>
          </TopbarRight>
        </Topbar>
      </TopbarProvider>
    </>
  );
}

export default TopBar;
