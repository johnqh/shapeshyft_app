import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { SUPPORTED_LANGUAGES, isLanguageSupported } from "./config/constants";

// Detect language from URL path first, then localStorage
const detectLanguageFromPath = (): string => {
  // Check if window is defined (not in test/SSR environment)
  if (typeof window === "undefined") {
    return "en";
  }

  // Check URL path first
  const pathLang = window.location.pathname.split("/")[1];
  if (pathLang && isLanguageSupported(pathLang)) {
    return pathLang;
  }

  // Fall back to localStorage (user's saved preference)
  try {
    const stored = localStorage.getItem("language");
    if (stored && isLanguageSupported(stored)) {
      return stored;
    }
  } catch {
    // localStorage may throw in Safari private browsing
  }

  return "en";
};

let initialized = false;

/**
 * Initialize i18n with all plugins and configuration.
 * Safe to call multiple times - will only initialize once.
 */
export function initializeI18n(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: detectLanguageFromPath(),
      fallbackLng: {
        zh: ["zh", "en"],
        "zh-hant": ["zh-hant", "zh", "en"],
        default: ["en"],
      },
      initImmediate: false, // Don't block - load async
      supportedLngs: [...SUPPORTED_LANGUAGES],
      debug: false,
      nonExplicitSupportedLngs: true,

      interpolation: {
        escapeValue: false,
      },

      backend: {
        loadPath: `/locales/{{lng}}/{{ns}}.json`,
      },

      detection: {
        order: ["path", "localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "language",
        lookupFromPathIndex: 0,
      },

      load: "languageOnly",
      preload: [],
      cleanCode: false,
      lowerCaseLng: false,

      defaultNS: "common",
      ns: [
        "common",
        "home",
        "pricing",
        "docs",
        "dashboard",
        "auth",
        "about",
        "contact",
        "privacy",
        "terms",
        "settings",
      ],
    });
}

export default i18n;
