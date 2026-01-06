import { useEffect } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isLanguageSupported } from "../../config/constants";

function LanguageValidator() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Validate language parameter
    if (!lang || !isLanguageSupported(lang)) {
      navigate("/en", { replace: true });
      return;
    }

    // Update i18n language if different
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    // Save to localStorage
    try {
      localStorage.setItem("language", lang);
    } catch {
      // Ignore localStorage errors
    }
  }, [lang, i18n, navigate]);

  // Don't render if language is invalid
  if (!lang || !isLanguageSupported(lang)) {
    return null;
  }

  return <Outlet />;
}

export default LanguageValidator;
