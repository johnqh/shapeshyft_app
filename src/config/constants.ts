import packageJson from "../../package.json";

// App Constants
export const CONSTANTS = {
  // Branding
  APP_NAME: import.meta.env.VITE_APP_NAME || "ShapeShyft",
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || "shapeshyft.ai",
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || "Sudobility",
  APP_VERSION: packageJson.version,
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || "support@shapeshyft.com",

  // API
  API_URL: import.meta.env.VITE_SHAPESHYFT_API_URL || "http://localhost:8787",
  DEV_MODE: import.meta.env.VITE_DEV_MODE === "true",

  // Testnet/Sandbox Mode
  TESTNET_ONLY: import.meta.env.VITE_TESTNET_ONLY === "true",

  // RevenueCat API key (selects sandbox when testnet mode enabled)
  REVENUECAT_API_KEY:
    import.meta.env.VITE_TESTNET_ONLY === "true"
      ? import.meta.env.VITE_REVENUECAT_API_KEY_SANDBOX || ""
      : import.meta.env.VITE_REVENUECAT_API_KEY || "",

  // Social handles (without @ or full URL)
  TWITTER_HANDLE: import.meta.env.VITE_TWITTER_HANDLE || "",
  DISCORD_INVITE: import.meta.env.VITE_DISCORD_INVITE || "",
  LINKEDIN_COMPANY: import.meta.env.VITE_LINKEDIN_COMPANY || "",
  GITHUB_ORG: import.meta.env.VITE_GITHUB_ORG || "",

  // Social links (full URLs)
  SOCIAL_LINKS: {
    twitter: import.meta.env.VITE_TWITTER_URL || "",
    reddit: import.meta.env.VITE_REDDIT_URL || "",
    discord: import.meta.env.VITE_DISCORD_URL || "",
    linkedin: import.meta.env.VITE_LINKEDIN_URL || "",
    farcaster: import.meta.env.VITE_FARCASTER_URL || "",
    telegram: import.meta.env.VITE_TELEGRAM_URL || "",
    github: import.meta.env.VITE_GITHUB_URL || "",
  },

  // External pages
  STATUS_PAGE_URL: import.meta.env.VITE_STATUS_PAGE_URL || "",
  STATUS_PAGE_API_URL: import.meta.env.VITE_STATUS_PAGE_URL
    ? `${import.meta.env.VITE_STATUS_PAGE_URL}/api/v2/status.json`
    : "",

  // Navigation items
  NAV_ITEMS: [
    { label: "home", href: "/" },
    { label: "docs", href: "/docs" },
    { label: "pricing", href: "/pricing" },
    { label: "dashboard", href: "/dashboard", protected: true },
  ],
} as const;

// Supported languages for i18n
export const SUPPORTED_LANGUAGES = [
  "en",
  "ar",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pt",
  "ru",
  "sv",
  "th",
  "uk",
  "vi",
  "zh",
  "zh-hant",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const isLanguageSupported = (
  lang: string,
): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};
