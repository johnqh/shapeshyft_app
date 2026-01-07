import { useLocalizedNavigate as useSharedLocalizedNavigate } from "@sudobility/components";
import { isLanguageSupported } from "../config/constants";
import type { SupportedLanguage } from "../config/constants";

export const useLocalizedNavigate = () => {
  const result = useSharedLocalizedNavigate({
    isLanguageSupported,
    defaultLanguage: "en",
    storageKey: "language",
  });

  return {
    navigate: result.navigate,
    switchLanguage: result.switchLanguage as (
      newLanguage: SupportedLanguage,
      currentPath?: string,
    ) => void,
    currentLanguage: result.currentLanguage as SupportedLanguage,
  };
};

export default useLocalizedNavigate;
