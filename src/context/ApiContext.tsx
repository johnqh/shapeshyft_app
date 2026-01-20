import { useEffect, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import type { PlatformNetwork } from "@sudobility/di";
import { getInfoService, getNetworkService } from "@sudobility/di";
import type { NetworkClient, NetworkRequestOptions, NetworkResponse, Optional } from "@sudobility/types";
import { InfoType } from "@sudobility/types";
import { useAuthStatus } from "@sudobility/auth-components";
import { getFirebaseAuth } from "@sudobility/auth_lib";
import { CONSTANTS } from "../config/constants";
import { ApiContext, type ApiContextValue } from "./apiContextDef";

export { ApiContext, type ApiContextValue } from "./apiContextDef";

/**
 * Parse a Response into a NetworkResponse
 */
async function parseResponse<T>(response: Response): Promise<NetworkResponse<T>> {
  let data: T | undefined;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      data = (await response.json()) as T;
    } catch {
      // Ignore JSON parse errors
    }
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers,
    data,
    success: response.ok,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a NetworkClient adapter from a PlatformNetwork.
 * Adapts PlatformNetwork (returns Response) to NetworkClient (returns NetworkResponse<T>).
 */
function createNetworkClient(network: PlatformNetwork): NetworkClient {
  return {
    async request<T>(url: string, options?: Optional<NetworkRequestOptions>): Promise<NetworkResponse<T>> {
      const init: RequestInit = { method: options?.method ?? "GET" };
      if (options?.headers) init.headers = options.headers;
      if (options?.body) init.body = options.body;
      const response = await network.request(url, init);
      return parseResponse<T>(response);
    },

    async get<T>(url: string, options?: Optional<Omit<NetworkRequestOptions, "method" | "body">>): Promise<NetworkResponse<T>> {
      const init: RequestInit = { method: "GET" };
      if (options?.headers) init.headers = options.headers;
      const response = await network.request(url, init);
      return parseResponse<T>(response);
    },

    async post<T>(url: string, body?: Optional<unknown>, options?: Optional<Omit<NetworkRequestOptions, "method">>): Promise<NetworkResponse<T>> {
      const init: RequestInit = { method: "POST" };
      if (options?.headers) init.headers = options.headers;
      if (body) init.body = JSON.stringify(body);
      const response = await network.request(url, init);
      return parseResponse<T>(response);
    },

    async put<T>(url: string, body?: Optional<unknown>, options?: Optional<Omit<NetworkRequestOptions, "method">>): Promise<NetworkResponse<T>> {
      const init: RequestInit = { method: "PUT" };
      if (options?.headers) init.headers = options.headers;
      if (body) init.body = JSON.stringify(body);
      const response = await network.request(url, init);
      return parseResponse<T>(response);
    },

    async delete<T>(url: string, options?: Optional<Omit<NetworkRequestOptions, "method" | "body">>): Promise<NetworkResponse<T>> {
      const init: RequestInit = { method: "DELETE" };
      if (options?.headers) init.headers = options.headers;
      const response = await network.request(url, init);
      return parseResponse<T>(response);
    },
  };
}

// Create a singleton NetworkClient adapter
let networkClientInstance: NetworkClient | null = null;

function getNetworkClient(): NetworkClient {
  if (!networkClientInstance) {
    networkClientInstance = createNetworkClient(getNetworkService());
  }
  return networkClientInstance;
}

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { user, loading: authLoading } = useAuthStatus();
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const networkClient = getNetworkClient();
  const auth = getFirebaseAuth();

  const baseUrl = CONSTANTS.API_URL;
  const userId = user?.uid ?? null;
  const testMode = CONSTANTS.DEV_MODE;

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
      } catch {
        getInfoService().show(
          "Authentication Error",
          "Failed to get ID token",
          InfoType.ERROR,
          5000,
        );
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
  }, [userId, auth]);

  // Refresh token function for when token expires
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth?.currentUser;
    if (!currentUser) return null;
    try {
      const newToken = await currentUser.getIdToken(true); // Force refresh
      setToken(newToken);
      return newToken;
    } catch {
      getInfoService().show(
        "Authentication Error",
        "Failed to refresh ID token",
        InfoType.ERROR,
        5000,
      );
      setToken(null);
      return null;
    }
  }, [auth]);

  const value = useMemo<ApiContextValue>(
    () => ({
      networkClient,
      baseUrl,
      userId,
      token,
      isReady: !!userId && !!token,
      isLoading: authLoading || tokenLoading,
      testMode,
      refreshToken,
    }),
    [
      networkClient,
      baseUrl,
      userId,
      token,
      authLoading,
      tokenLoading,
      testMode,
      refreshToken,
    ],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
