import { useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import {
  ToastContext,
  type ToastType,
  type Toast,
  type ToastContextValue,
} from "./toastContextDef";

export {
  type ToastType,
  type Toast,
  type ToastContextValue,
} from "./toastContextDef";

const DEFAULT_DURATION = 5000;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      addToast("success", message, duration),
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast("error", message, duration),
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addToast("warning", message, duration),
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast("info", message, duration),
    [addToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, success, error, warning, info],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
