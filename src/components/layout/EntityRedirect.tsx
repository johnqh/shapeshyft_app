/**
 * @fileoverview Entity Redirect Component
 * @description Redirects to the user's default entity when accessing /dashboard without an entity slug
 */

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEntities } from "@sudobility/entity_client";
import { entityClient } from "../../config/entityClient";

const LAST_ENTITY_KEY = "shapeshyft_last_entity";

/**
 * Redirects from /dashboard to /dashboard/:entitySlug
 * Picks the last used entity, personal entity, or first available entity
 */
function EntityRedirect() {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { data: entities, isLoading, error } = useEntities(entityClient);

  useEffect(() => {
    if (isLoading) return;

    if (error || !entities || entities.length === 0) {
      // No entities available - this shouldn't happen for authenticated users
      // but handle gracefully
      console.error("No entities available for user");
      return;
    }

    // Try to find the last used entity
    const lastEntitySlug = localStorage.getItem(LAST_ENTITY_KEY);
    const lastEntity = lastEntitySlug
      ? entities.find((e) => e.entitySlug === lastEntitySlug)
      : null;

    // Pick default: last used > personal > first
    const defaultEntity =
      lastEntity ||
      entities.find((e) => e.entityType === "personal") ||
      entities[0];

    if (defaultEntity) {
      // Save as last used
      localStorage.setItem(LAST_ENTITY_KEY, defaultEntity.entitySlug);
      // Redirect to the entity dashboard
      navigate(`/${lang}/dashboard/${defaultEntity.entitySlug}`, {
        replace: true,
      });
    }
  }, [entities, isLoading, error, navigate, lang]);

  // Show loading spinner while fetching entities
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default EntityRedirect;
