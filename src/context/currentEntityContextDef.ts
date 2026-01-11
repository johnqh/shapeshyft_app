/**
 * @fileoverview Current Entity Context Definition
 * @description Re-exports the CurrentEntityContext from entity_client for use in the app
 *
 * This module re-exports the entity context from @sudobility/entity_client,
 * providing a centralized way to access the current entity throughout the app.
 */

// Re-export types and context from entity_client
export type {
  CurrentEntityContextValue,
  CurrentEntityProviderProps,
  AuthUser,
} from "@sudobility/entity_client";

// Note: The actual context is created in entity_client.
// We don't need to create our own context here anymore.
// Components should use useCurrentEntity from entity_client or from our local hook.
