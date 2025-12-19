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
  Logo,
  type TopbarNavItem,
} from '@sudobility/components';
import { useAuth } from '../../context/AuthContext';
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
  const { isAuthenticated, user, signOut, openAuthModal } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <TopbarProvider variant={variant === 'transparent' ? 'transparent' : 'default'} sticky>
      <Topbar variant={variant === 'transparent' ? 'transparent' : 'default'} sticky zIndex="highest">
        <TopbarLeft>
          <TopbarNavigation
            items={navItems}
            collapseBelow="lg"
            LinkComponent={LinkWrapper}
          >
            <TopbarLogo onClick={handleLogoClick}>
              <Logo size="md" logoText={CONSTANTS.APP_NAME} />
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

            {/* Auth Button / User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user.displayName, user.email)}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-theme-bg-primary border border-theme-border rounded-lg shadow-lg z-50">
                      <div className="px-4 py-2 border-b border-theme-border">
                        <p className="text-sm font-medium truncate">
                          {user.displayName || user.email}
                        </p>
                        {user.displayName && user.email && (
                          <p className="text-xs text-theme-text-secondary truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-theme-hover-bg transition-colors"
                      >
                        {t('auth.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('auth.login')}
              </button>
            )}
          </TopbarActions>
        </TopbarRight>
      </Topbar>
    </TopbarProvider>
  );
}

export default TopBar;
