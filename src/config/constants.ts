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

  // Testnet/Sandbox Mode
  DEV_MODE: import.meta.env.VITE_DEV_MODE === "true",

  // RevenueCat API key (selects sandbox when testnet mode enabled)
  REVENUECAT_API_KEY:
    import.meta.env.VITE_DEV_MODE === "true"
      ? import.meta.env.VITE_REVENUECAT_API_KEY_SANDBOX || ""
      : import.meta.env.VITE_REVENUECAT_API_KEY || "",

  // Social handles (without @ or full URL)
  TWITTER_HANDLE: import.meta.env.VITE_TWITTER_HANDLE || "",
  DISCORD_INVITE: import.meta.env.VITE_DISCORD_INVITE || "",
  LINKEDIN_COMPANY: import.meta.env.VITE_LINKEDIN_COMPANY || "",
  GITHUB_ORG: import.meta.env.VITE_GITHUB_ORG || "",

  // Social links (full URLs) - property names must match SocialLinksConfig from building_blocks
  SOCIAL_LINKS: {
    twitterUrl: import.meta.env.VITE_TWITTER_URL || "",
    redditUrl: import.meta.env.VITE_REDDIT_URL || "",
    discordUrl: import.meta.env.VITE_DISCORD_URL || "",
    linkedinUrl: import.meta.env.VITE_LINKEDIN_URL || "",
    farcasterUrl: import.meta.env.VITE_FARCASTER_URL || "",
    telegramUrl: import.meta.env.VITE_TELEGRAM_URL || "",
    githubUrl: import.meta.env.VITE_GITHUB_URL || "",
  },

  // External pages
  STATUS_PAGE_URL: import.meta.env.VITE_STATUS_PAGE_URL || "",
  STATUS_PAGE_API_URL: import.meta.env.VITE_STATUS_PAGE_URL
    ? `${import.meta.env.VITE_STATUS_PAGE_URL}/api/v2/status.json`
    : "",

  // Founder meeting link (e.g., Cal.com, Calendly)
  MEET_FOUNDER_URL: import.meta.env.VITE_MEET_FOUNDER_URL || "",

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
