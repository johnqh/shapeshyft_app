import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLanguageSupported } from '../../config/constants';

// Detect user's preferred language
const detectLanguage = (): string => {
  // Check localStorage first
  try {
    const stored = localStorage.getItem('language');
    if (stored && isLanguageSupported(stored)) {
      return stored;
    }
  } catch {
    // localStorage may throw in Safari private browsing
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (isLanguageSupported(browserLang)) {
    return browserLang;
  }

  // Check for Chinese variants
  if (navigator.language.startsWith('zh')) {
    if (
      navigator.language.includes('TW') ||
      navigator.language.includes('HK') ||
      navigator.language.includes('Hant')
    ) {
      return 'zh-hant';
    }
    return 'zh';
  }

  return 'en';
};

function LanguageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const lang = detectLanguage();
    navigate(`/${lang}`, { replace: true });
  }, [navigate]);

  return null;
}

export default LanguageRedirect;
