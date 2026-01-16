import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * RTL (Right-to-Left) languages
 */
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

/**
 * Hook that syncs the document's lang and dir attributes with i18n language.
 * This is essential for:
 * - SEO: Search engines use the lang attribute
 * - Accessibility: Screen readers use the lang attribute
 * - RTL support: The dir attribute enables proper text direction
 */
export function useDocumentLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language || "en";
    const isRTL = RTL_LANGUAGES.includes(currentLang);

    // Set the lang attribute on the html element
    document.documentElement.lang = currentLang;

    // Set the dir attribute for RTL languages
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

    // Also set a data attribute for CSS targeting
    document.documentElement.dataset.lang = currentLang;
    document.documentElement.dataset.dir = isRTL ? "rtl" : "ltr";
  }, [i18n.language]);

  return {
    language: i18n.language || "en",
    isRTL: RTL_LANGUAGES.includes(i18n.language || "en"),
    direction: RTL_LANGUAGES.includes(i18n.language || "en") ? "rtl" : "ltr",
  };
}

export default useDocumentLanguage;
