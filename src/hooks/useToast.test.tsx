import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useToast } from "./useToast";
import {
  ToastContext,
  type ToastContextValue,
} from "../context/toastContextDef";
import type { ReactNode } from "react";

describe("useToast", () => {
  it("throws error when used outside ToastProvider", () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToast must be used within a ToastProvider");
  });

  it("returns context value when used within ToastProvider", () => {
    const mockContextValue: ToastContextValue = {
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastContext.Provider value={mockContextValue}>
        {children}
      </ToastContext.Provider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current).toBe(mockContextValue);
    expect(result.current.toasts).toEqual([]);
    expect(typeof result.current.addToast).toBe("function");
    expect(typeof result.current.success).toBe("function");
    expect(typeof result.current.error).toBe("function");
  });
});
