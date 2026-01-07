/**
 * Hook to provide a resilient network client with automatic token refresh and logout handling.
 *
 * - On 401 (Unauthorized): Force refresh Firebase token and retry once
 * - On 403 (Forbidden): Log the user out
 */

import { useMemo } from "react";
import { getNetworkService } from "@sudobility/di";
import { signOut } from "firebase/auth";
import type {
  NetworkClient,
  NetworkResponse,
  NetworkRequestOptions,
  Optional,
} from "@sudobility/types";
import { auth as firebaseAuth } from "../config/firebase";

/**
 * Get a fresh Firebase ID token with force refresh.
 * Returns empty string if not authenticated.
 */
async function getAuthToken(forceRefresh = false): Promise<string> {
  const user = firebaseAuth?.currentUser;
  if (!user) return "";

  try {
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.error("[useResilientNetworkClient] Failed to get ID token:", err);
    return "";
  }
}

/**
 * Log the user out via Firebase.
 */
async function logoutUser(): Promise<void> {
  if (!firebaseAuth) return;
  try {
    await signOut(firebaseAuth);
  } catch (err) {
    console.error("[useResilientNetworkClient] Failed to sign out:", err);
  }
}

/**
 * Create a network client adapter that wraps the platform network client
 * with 401 retry and 403 logout handling.
 */
function createResilientNetworkClient(): NetworkClient {
  const platformNetwork = getNetworkService();

  const parseResponse = async <T>(
    response: Response
  ): Promise<NetworkResponse<T>> => {
    let data: T | undefined;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      try {
        data = (await response.json()) as T;
      } catch {
        // JSON parse failed, leave data undefined
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
  };

  /**
   * Execute request with retry logic:
   * - On 401: Force refresh token and retry once
   * - On 403: Log user out (no retry)
   */
  const executeWithRetry = async <T>(
    url: string,
    requestInit: RequestInit
  ): Promise<NetworkResponse<T>> => {
    const response = await platformNetwork.request(url, requestInit);

    // On 401, get fresh token and retry once
    if (response.status === 401) {
      const freshToken = await getAuthToken(true);
      if (freshToken) {
        const retryHeaders = {
          ...(requestInit.headers as Record<string, string>),
          Authorization: `Bearer ${freshToken}`,
        };
        const retryResponse = await platformNetwork.request(url, {
          ...requestInit,
          headers: retryHeaders,
        });
        return parseResponse<T>(retryResponse);
      }
    }

    // On 403, log the user out
    if (response.status === 403) {
      console.warn(
        "[useResilientNetworkClient] 403 Forbidden - logging user out"
      );
      await logoutUser();
      // Return the original response so the UI can handle it
    }

    return parseResponse<T>(response);
  };

  return {
    async request<T>(
      url: string,
      options?: Optional<NetworkRequestOptions>
    ): Promise<NetworkResponse<T>> {
      const requestInit: RequestInit = {
        method: options?.method ?? "GET",
        headers: options?.headers ?? undefined,
        body: options?.body ?? undefined,
        signal: options?.signal ?? undefined,
      };
      return executeWithRetry<T>(url, requestInit);
    },

    async get<T>(
      url: string,
      options?: Optional<Omit<NetworkRequestOptions, "method" | "body">>
    ): Promise<NetworkResponse<T>> {
      const requestInit: RequestInit = {
        method: "GET",
        headers: options?.headers ?? undefined,
        signal: options?.signal ?? undefined,
      };
      return executeWithRetry<T>(url, requestInit);
    },

    async post<T>(
      url: string,
      body?: Optional<unknown>,
      options?: Optional<Omit<NetworkRequestOptions, "method">>
    ): Promise<NetworkResponse<T>> {
      const requestInit: RequestInit = {
        method: "POST",
        headers: options?.headers ?? undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? undefined,
      };
      return executeWithRetry<T>(url, requestInit);
    },

    async put<T>(
      url: string,
      body?: Optional<unknown>,
      options?: Optional<Omit<NetworkRequestOptions, "method">>
    ): Promise<NetworkResponse<T>> {
      const requestInit: RequestInit = {
        method: "PUT",
        headers: options?.headers ?? undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? undefined,
      };
      return executeWithRetry<T>(url, requestInit);
    },

    async delete<T>(
      url: string,
      options?: Optional<Omit<NetworkRequestOptions, "method" | "body">>
    ): Promise<NetworkResponse<T>> {
      const requestInit: RequestInit = {
        method: "DELETE",
        headers: options?.headers ?? undefined,
        signal: options?.signal ?? undefined,
      };
      return executeWithRetry<T>(url, requestInit);
    },
  };
}

/**
 * Hook to get a resilient network client with automatic 401 retry and 403 logout.
 */
export function useResilientNetworkClient(): NetworkClient {
  return useMemo(() => createResilientNetworkClient(), []);
}
