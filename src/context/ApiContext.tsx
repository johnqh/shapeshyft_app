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
  const userId = user?.uid ?? null;

  // Fetch token when user changes
  useEffect(() => {
    let mounted = true;

    const fetchToken = async () => {
      if (!userId) {
        setToken(null);
        setTokenLoading(false);
        return;
      }

      setTokenLoading(true);
      try {
        const currentUser = auth?.currentUser;
        if (!currentUser) {
          setToken(null);
          return;
        }
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
  }, [userId]);

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
      userId,
      token,
      isReady: !!userId && !!token,
      isLoading: authLoading || tokenLoading,
      refreshToken,
    }),
    [baseUrl, userId, token, authLoading, tokenLoading, refreshToken]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
