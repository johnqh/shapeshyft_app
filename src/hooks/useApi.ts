import { useContext } from "react";
import { ApiContext, type ApiContextValue } from "../context/apiContextDef";

export function useApi(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}

/**
 * Hook that returns API context only when ready.
 * Throws if not authenticated.
 */
export function useApiReady(): Omit<
  ApiContextValue,
  "isReady" | "isLoading"
> & {
  userId: string;
  token: string;
} {
  const api = useApi();
  if (!api.isReady) {
    throw new Error(
      "useApiReady called before API is ready. Ensure user is authenticated.",
    );
  }
  return api as Omit<ApiContextValue, "isReady" | "isLoading"> & {
    userId: string;
    token: string;
  };
}
