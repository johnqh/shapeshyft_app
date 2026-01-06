import { createContext } from "react";
import type { NetworkClient } from "@sudobility/types";

export interface ApiContextValue {
  networkClient: NetworkClient;
  baseUrl: string;
  userId: string | null;
  token: string | null;
  isReady: boolean;
  isLoading: boolean;
  testMode: boolean;
  refreshToken: () => Promise<string | null>;
}

export const ApiContext = createContext<ApiContextValue | null>(null);
