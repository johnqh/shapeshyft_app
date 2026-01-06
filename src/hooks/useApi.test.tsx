import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useApi, useApiReady } from "./useApi";
import { ApiContext, type ApiContextValue } from "../context/apiContextDef";
import type { ReactNode } from "react";

describe("useApi", () => {
  it("throws error when used outside ApiProvider", () => {
    expect(() => {
      renderHook(() => useApi());
    }).toThrow("useApi must be used within an ApiProvider");
  });

  it("returns context value when used within ApiProvider", () => {
    const mockContextValue: ApiContextValue = {
      networkClient: {} as ApiContextValue["networkClient"],
      baseUrl: "https://api.example.com",
      userId: "user-123",
      token: "test-token",
      isReady: true,
      isLoading: false,
      refreshToken: async () => "new-token",
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiContext.Provider value={mockContextValue}>
        {children}
      </ApiContext.Provider>
    );

    const { result } = renderHook(() => useApi(), { wrapper });
    expect(result.current).toBe(mockContextValue);
    expect(result.current.userId).toBe("user-123");
    expect(result.current.token).toBe("test-token");
  });
});

describe("useApiReady", () => {
  it("throws error when used outside ApiProvider", () => {
    expect(() => {
      renderHook(() => useApiReady());
    }).toThrow("useApi must be used within an ApiProvider");
  });

  it("throws error when API is not ready", () => {
    const mockContextValue: ApiContextValue = {
      networkClient: {} as ApiContextValue["networkClient"],
      baseUrl: "https://api.example.com",
      userId: null,
      token: null,
      isReady: false,
      isLoading: true,
      refreshToken: async () => null,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiContext.Provider value={mockContextValue}>
        {children}
      </ApiContext.Provider>
    );

    expect(() => {
      renderHook(() => useApiReady(), { wrapper });
    }).toThrow(
      "useApiReady called before API is ready. Ensure user is authenticated.",
    );
  });

  it("returns context value when API is ready", () => {
    const mockContextValue: ApiContextValue = {
      networkClient: {} as ApiContextValue["networkClient"],
      baseUrl: "https://api.example.com",
      userId: "user-123",
      token: "test-token",
      isReady: true,
      isLoading: false,
      refreshToken: async () => "new-token",
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiContext.Provider value={mockContextValue}>
        {children}
      </ApiContext.Provider>
    );

    const { result } = renderHook(() => useApiReady(), { wrapper });
    expect(result.current.userId).toBe("user-123");
    expect(result.current.token).toBe("test-token");
  });
});
