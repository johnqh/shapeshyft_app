import packageJson from '../../package.json';

// App Constants
export const CONSTANTS = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ShapeShyft',
  COMPANY_NAME: 'Sudobility',
  APP_VERSION: packageJson.version,
  API_URL: import.meta.env.VITE_SHAPESHYFT_API_URL || 'http://localhost:8787',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  SUPPORT_EMAIL: 'support@shapeshyft.com',

  // Social links (add as needed)
  SOCIAL_LINKS: {
    twitter: '',
    github: '',
    discord: '',
  },

  // Navigation items
  NAV_ITEMS: [
    { label: 'home', href: '/' },
    { label: 'docs', href: '/docs' },
    { label: 'pricing', href: '/pricing' },
    { label: 'dashboard', href: '/dashboard', protected: true },
  ],
} as const;

// Supported languages for i18n
export const SUPPORTED_LANGUAGES = [
  'en',
  'ar',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'sv',
  'th',
  'uk',
  'vi',
  'zh',
  'zh-hant',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const isLanguageSupported = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};
