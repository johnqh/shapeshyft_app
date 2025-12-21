import { useEffect, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { networkClient } from '@sudobility/di';
import { useAuthStatus } from '@sudobility/auth-components';
import { auth } from '../config/firebase';
import { CONSTANTS } from '../config/constants';
import { ApiContext, type ApiContextValue } from './apiContextDef';

export { ApiContext, type ApiContextValue } from './apiContextDef';

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { user, loading: authLoading } = useAuthStatus();
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const baseUrl = CONSTANTS.API_URL;

  // Fetch token when user changes
  useEffect(() => {
    let mounted = true;

    const fetchToken = async () => {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        setToken(null);
        return;
      }

      setTokenLoading(true);
      try {
        const idToken = await currentUser.getIdToken();
        if (mounted) {
          setToken(idToken);
        }
      } catch (error) {
        console.error('Failed to get ID token:', error);
        if (mounted) {
          setToken(null);
        }
      } finally {
        if (mounted) {
          setTokenLoading(false);
        }
      }
    };

    fetchToken();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Refresh token function for when token expires
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth?.currentUser;
    if (!currentUser) return null;
    try {
      const newToken = await currentUser.getIdToken(true); // Force refresh
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh ID token:', error);
      setToken(null);
      return null;
    }
  }, []);

  const value = useMemo<ApiContextValue>(
    () => ({
      networkClient,
      baseUrl,
      userId: user?.uid ?? null,
      token,
      isReady: !!user && !!token,
      isLoading: authLoading || tokenLoading,
      refreshToken,
    }),
    [baseUrl, user, token, authLoading, tokenLoading, refreshToken]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
