import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { isLanguageSupported } from '../config/constants';
import type { SupportedLanguage } from '../config/constants';

// Helper to add language prefix to path
const addLanguageToPath = (path: string, lang: string): string => {
  // Remove any existing language prefix
  const cleanPath = removeLanguageFromPath(path);
  // Add new language prefix
  return `/${lang}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
};

// Helper to remove language prefix from path
const removeLanguageFromPath = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length > 0 && isLanguageSupported(parts[0])) {
    return '/' + parts.slice(1).join('/');
  }
  return path;
};

export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const currentLanguage = (
    lang && isLanguageSupported(lang) ? lang : i18n.language
  ) as SupportedLanguage;

  const localizedNavigate = useCallback(
    (
      to: string | number,
      options?: { replace?: boolean; state?: unknown }
    ) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }
      const localizedPath = addLanguageToPath(to, currentLanguage);
      navigate(localizedPath, options);
    },
    [navigate, currentLanguage]
  );

  const switchLanguage = useCallback(
    (newLanguage: SupportedLanguage, currentPath?: string) => {
      i18n.changeLanguage(newLanguage);
      const pathWithoutLang = removeLanguageFromPath(
        currentPath || window.location.pathname
      );
      const newPath = addLanguageToPath(pathWithoutLang, newLanguage);
      navigate(newPath, { replace: true });

      // Save to localStorage
      try {
        localStorage.setItem('language', newLanguage);
      } catch {
        // Ignore localStorage errors
      }
    },
    [navigate, i18n]
  );

  return { navigate: localizedNavigate, switchLanguage, currentLanguage };
};

export default useLocalizedNavigate;
