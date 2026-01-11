/**
 * @fileoverview Current Entity Hook
 * @description Re-exports useCurrentEntity from entity_client for app-wide use
 *
 * This module provides access to the current entity context throughout the app.
 * The hook returns the currently selected entity, all user's entities, and
 * methods to select a different entity.
 *
 * @example
 * ```tsx
 * function DashboardHeader() {
 *   const { currentEntity, currentEntitySlug, entities, selectEntity } = useCurrentEntity();
 *
 *   return (
 *     <div>
 *       <h1>{currentEntity?.displayName}</h1>
 *       <EntitySwitcher
 *         entities={entities}
 *         currentSlug={currentEntitySlug}
 *         onSelect={selectEntity}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

// Re-export from entity_client
export {
  useCurrentEntity,
  useCurrentEntityOptional,
  type CurrentEntityContextValue,
} from "@sudobility/entity_client";
