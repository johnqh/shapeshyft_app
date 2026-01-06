/**
 * @fileoverview Workspaces Page
 * @description Page for listing and managing user's workspaces
 */

import { EntityListPage } from "@sudobility/entity_pages";
import { entityClient } from "../../config/entityClient";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";
import type { EntityWithRole } from "@sudobility/entity_client";

const LAST_ENTITY_KEY = "shapeshyft_last_entity";

function WorkspacesPage() {
  const { navigate } = useLocalizedNavigate();

  const handleSelectEntity = (entity: EntityWithRole) => {
    localStorage.setItem(LAST_ENTITY_KEY, entity.entitySlug);
    navigate(`/dashboard/${entity.entitySlug}`);
  };

  return (
    <EntityListPage client={entityClient} onSelectEntity={handleSelectEntity} />
  );
}

export default WorkspacesPage;
