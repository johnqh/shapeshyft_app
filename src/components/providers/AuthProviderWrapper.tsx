import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "@sudobility/auth-components";
import { auth } from "../../config/firebase";
import {
  createAuthTexts,
  createAuthErrorTexts,
} from "../../config/auth-config";
import { getFirebaseErrorMessage } from "../../utils/auth";

interface AuthProviderWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that integrates @sudobility/auth-components
 * with i18n translations and Firebase config
 */
export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  const { t } = useTranslation();

  // Memoize texts - must be called before any conditional returns
  const texts = useMemo(() => createAuthTexts(t), [t]);
  const errorTexts = useMemo(() => createAuthErrorTexts(), []);

  // If Firebase is not configured, render children without auth
  if (!auth) {
    return <>{children}</>;
  }

  return (
    <AuthProvider
      firebaseConfig={{ type: "instance", auth }}
      providerConfig={{
        providers: ["google", "email"],
        enableAnonymous: false,
      }}
      texts={texts}
      errorTexts={errorTexts}
      resolveErrorMessage={getFirebaseErrorMessage}
    >
      {children}
    </AuthProvider>
  );
}
