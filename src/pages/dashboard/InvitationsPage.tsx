/**
 * @fileoverview Invitations Page
 * @description Page for viewing and responding to pending invitations
 */

import { InvitationsPage as InvitationsPageComponent } from '@sudobility/entity_pages';
import { entityClient } from '../../config/entityClient';
import { useQueryClient } from '@tanstack/react-query';

function InvitationsPage() {
  const queryClient = useQueryClient();

  const handleInvitationAccepted = () => {
    // Refresh entities list after accepting an invitation
    queryClient.invalidateQueries({ queryKey: ['entities'] });
  };

  return (
    <InvitationsPageComponent
      client={entityClient}
      onInvitationAccepted={handleInvitationAccepted}
    />
  );
}

export default InvitationsPage;
