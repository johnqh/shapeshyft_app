/**
 * @fileoverview Members Page
 * @description Page for managing entity members and invitations
 */

import { useParams } from 'react-router-dom';
import { MembersManagementPage } from '@sudobility/entity_pages';
import { useEntities } from '@sudobility/entity_client';
import { entityClient } from '../../config/entityClient';
import { useAuthStatus } from '@sudobility/auth-components';

function MembersPage() {
  const { entitySlug = '' } = useParams<{ entitySlug: string }>();
  const { data: entities, isLoading } = useEntities(entityClient);
  const { user } = useAuthStatus();

  const currentEntity = entities?.find(e => e.entitySlug === entitySlug);

  if (isLoading || !currentEntity) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.uid) {
    return null;
  }

  return (
    <MembersManagementPage
      client={entityClient}
      entity={currentEntity}
      currentUserId={user.uid}
    />
  );
}

export default MembersPage;
