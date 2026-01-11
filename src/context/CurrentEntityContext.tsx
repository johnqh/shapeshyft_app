/**
 * @fileoverview Current Entity Context Provider
 * @description Provides the current entity context using entity_client's provider
 *
 * This wraps the entity_client's CurrentEntityProvider and automatically
 * connects it to the app's authentication state.
 */

import { type ReactNode } from "react";
import { CurrentEntityProvider as EntityClientProvider } from "@sudobility/entity_client";
import { useAuthStatus } from "@sudobility/auth-components";
import { entityClient } from "../config/entityClient";

interface CurrentEntityProviderProps {
  children: ReactNode;
}

/**
 * App-level CurrentEntityProvider that automatically connects to Firebase auth.
 *
 * Features:
 * - Automatically fetches entities when user logs in
 * - Auto-selects personal entity by default
 * - Clears entity state on logout
 * - Persists last selected entity to localStorage
 */
export function CurrentEntityProvider({ children }: CurrentEntityProviderProps) {
  const { user } = useAuthStatus();

  // Map Firebase user to AuthUser interface
  const authUser = user
    ? {
        uid: user.uid,
        email: user.email,
      }
    : null;

  return (
    <EntityClientProvider client={entityClient} user={authUser}>
      {children}
    </EntityClientProvider>
  );
}
