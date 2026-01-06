# Organization/Entity System Design

Multi-tenant organization support for ShapeShyft and Whisperly applications.

---

## Overview

**Goal:** Add organization support with a new "entity" concept that can be:

- **Personal**: Auto-created on user login (one per user)
- **Organization**: User-created, supports multiple members with roles

**Key Decisions:**

- Auto-migrate existing users to personal entities
- Pending invitations auto-accept when user signs up
- Shared `entity_service` library for both APIs
- Entity slugs: 8-12 character alphanumeric

---

## Database Schema

### New Tables

```sql
-- entities: Personal workspaces and organizations
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_slug VARCHAR(12) NOT NULL UNIQUE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('personal', 'organization')),
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- entity_members: Many-to-many user-entity with roles
CREATE TABLE entity_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, user_id)
);

-- entity_invitations: Pending invites with auto-accept on signup
CREATE TABLE entity_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invited_by_user_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ
);
```

### Modify Existing Tables

```sql
-- Add entity_id to projects (replaces user_id ownership)
ALTER TABLE projects ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
-- Migration will populate entity_id from user's personal entity

-- Add entity_id to llm_api_keys (entity-owned, shared within org)
ALTER TABLE llm_api_keys ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
-- Migration will populate entity_id from user's personal entity
```

---

## Role Permissions

| Permission           | Admin | Manager | Viewer |
| -------------------- | ----- | ------- | ------ |
| View entity          | ✓     | ✓       | ✓      |
| Edit entity settings | ✓     | ✗       | ✗      |
| Delete entity        | ✓     | ✗       | ✗      |
| Manage members       | ✓     | ✗       | ✗      |
| Invite members       | ✓     | ✗       | ✗      |
| Create/edit projects | ✓     | ✓       | ✗      |
| View projects        | ✓     | ✓       | ✓      |
| Create/edit API keys | ✓     | ✓       | ✗      |
| View/use API keys    | ✓     | ✓       | ✓      |

---

## New Packages

### 1. Types (`~/0xmail/types/src/types/entity/`)

```
entity/
├── index.ts
├── entity.ts        # Entity, EntityMember, EntityInvitation interfaces
├── requests.ts      # CreateEntityRequest, InviteMemberRequest, etc.
├── responses.ts     # EntityResponse, EntityListResponse, etc.
└── permissions.ts   # EntityRole enum, ROLE_PERMISSIONS map
```

### 2. Backend Service (`./entity_service/`)

```
entity_service/
├── src/
│   ├── index.ts
│   ├── schema/
│   │   └── entities.ts          # Table factories (createEntitiesTable, etc.)
│   ├── helpers/
│   │   ├── EntityHelper.ts      # Entity CRUD, getOrCreatePersonalEntity
│   │   ├── EntityMemberHelper.ts # Member management
│   │   ├── InvitationHelper.ts  # Invitations, processNewUserInvitations
│   │   └── PermissionHelper.ts  # Permission checks
│   ├── middleware/
│   │   └── hono.ts              # createEntityContextMiddleware
│   └── utils/
│       └── slug-generator.ts    # generateEntitySlug, generateInvitationToken
```

### 3. Frontend Client (`./entity_client/`)

```
entity_client/
├── src/
│   ├── network/
│   │   └── EntityClient.ts      # HTTP client class
│   └── hooks/
│       ├── useEntities.ts       # List user's entities
│       ├── useCurrentEntity.ts  # Current entity context
│       ├── useEntityMembers.ts  # Member management
│       └── useInvitations.ts    # Invitation management
```

### 4. UI Components (`~/0xmail/mail_box_components/packages/entity-components/`)

```
entity-components/
├── src/components/
│   ├── EntityCard.tsx
│   ├── EntityList.tsx
│   ├── EntitySelector.tsx       # Dropdown to switch entities
│   ├── MemberList.tsx
│   ├── MemberRoleSelector.tsx
│   ├── InvitationForm.tsx
│   └── InvitationList.tsx
```

### 5. Page Containers (`./entity_pages/`)

```
entity_pages/
├── src/pages/
│   ├── EntityListPage.tsx       # All user's entities
│   ├── EntitySettingsPage.tsx   # Edit entity details
│   ├── MembersManagementPage.tsx
│   └── InvitationsPage.tsx
```

---

## API Endpoints

### Entity Routes

```
GET    /api/v1/entities                              # List user's entities
POST   /api/v1/entities                              # Create organization
GET    /api/v1/entities/:entitySlug                  # Get entity
PUT    /api/v1/entities/:entitySlug                  # Update entity
DELETE /api/v1/entities/:entitySlug                  # Delete (org only)
```

### Member Routes

```
GET    /api/v1/entities/:entitySlug/members          # List members
PUT    /api/v1/entities/:entitySlug/members/:userId  # Update role
DELETE /api/v1/entities/:entitySlug/members/:userId  # Remove member
```

### Invitation Routes

```
GET    /api/v1/entities/:entitySlug/invitations      # List invitations
POST   /api/v1/entities/:entitySlug/invitations      # Create invitation
DELETE /api/v1/entities/:entitySlug/invitations/:id  # Cancel invitation
GET    /api/v1/invitations                           # My pending invites
POST   /api/v1/invitations/:token/accept             # Accept
POST   /api/v1/invitations/:token/decline            # Decline
```

### Updated Project Routes (entity-centric)

```
GET    /api/v1/entities/:entitySlug/projects         # List projects
POST   /api/v1/entities/:entitySlug/projects         # Create project
# ... etc (replaces /api/v1/users/:userId/projects)
```

### Public API URL

```
/{entity_slug}/{project_name}/{endpoint_name}
# e.g., /abc12xyz/my-project/translate
```

---

## Implementation Phases

| Phase | Description                                        | Est. |
| ----- | -------------------------------------------------- | ---- |
| **1** | Types package (`~/0xmail/types/src/types/entity/`) | 0.5d |
| **2** | entity_service backend library                     | 2d   |
| **3** | Database migration script                          | 0.5d |
| **4** | whisperly_api integration                          | 1d   |
| **5** | entity_client frontend library                     | 1d   |
| **6** | entity-components UI library                       | 1d   |
| **7** | entity_pages page containers                       | 1d   |
| **8** | whisperly_app integration                          | 1d   |
| **9** | shapeshyft_api + shapeshyft_app integration        | 1d   |

**Total: ~9 days**

---

## Critical Files to Modify

| File                                                       | Change                    |
| ---------------------------------------------------------- | ------------------------- |
| `~/0xmail/types/src/types/entity/`                         | **NEW** - Entity types    |
| `./entity_service/`                                        | **NEW** - Backend service |
| `./entity_client/`                                         | **NEW** - Frontend client |
| `./entity_pages/`                                          | **NEW** - Page containers |
| `~/0xmail/mail_box_components/packages/entity-components/` | **NEW** - UI components   |
| `~/whisperly/whisperly_api/src/db/schema.ts`               | Add entity tables         |
| `~/whisperly/whisperly_api/src/routes/`                    | Add entity routes         |
| `~/shapeshyft/shapeshyft_api/src/db/schema.ts`             | Add entity tables         |
| `~/shapeshyft/shapeshyft_api/src/routes/`                  | Add entity routes         |

---

## Key Implementation Details

### Personal Entity Auto-Creation

```typescript
// In getOrCreateUser (called on login)
async function getOrCreateUser(firebaseUid: string, email?: string) {
  let user = await getUserByFirebaseUid(firebaseUid);

  if (!user) {
    user = await createUser(firebaseUid, email);
  }

  // Ensure personal entity exists
  await entityHelper.getOrCreatePersonalEntity(user.id, email);

  // Auto-accept pending invitations
  if (email) {
    await invitationHelper.processNewUserInvitations(user.id, email);
  }

  return user;
}
```

### Entity Slug Generation

```typescript
const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function generateEntitySlug(length = 8): string {
  return Array.from(
    { length },
    () => SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)],
  ).join("");
}
```

### Migration Strategy

1. For each existing user:
   - Create personal entity (use existing org_path as slug if available)
   - Add user as admin member
   - Update user's projects to reference the entity

2. Backward compatibility:
   - Keep `/api/v1/users/:userId/projects` working (maps to personal entity)
   - Add deprecation headers

---

## Constraints

- **Personal entity**: Cannot be deleted, user always admin, no other members
- **Organization**: At least one admin required, owner cannot be removed
- **Invitations**: 7-day expiry, unique token, auto-accept on signup
- **Entity slug**: 8-12 lowercase alphanumeric, globally unique
