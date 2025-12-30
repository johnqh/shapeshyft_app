# API Key & IP Allowlist Security Features

## Overview

Add security features to ShapeShyft:
1. **API Key per Project** - Auto-generated, encrypted, refreshable, prefixed key (e.g., `sk_live_abc123...`)
2. **IP Allowlist per Endpoint** - Optional IPv4 allowlist, returns 403 if caller IP not in list

---

## 1. Database Schema Changes

**File:** `shapeshyft_api/src/db/schema.ts`

### Projects Table - Add columns:
```typescript
apiKey: text('api_key'),           // Encrypted API key (AES-256-CBC)
apiKeyPrefix: text('api_key_prefix'), // First 8 chars for display (sk_live_...)
apiKeyCreatedAt: timestamp('api_key_created_at'),
```

### Endpoints Table - Add column:
```typescript
ipAllowlist: text('ip_allowlist'), // JSON array of IPv4 addresses, null = allow all
```

### Migration:
- Create migration file for new columns
- Run migration on database

---

## 2. API Key Generation & Encryption

**File:** `shapeshyft_api/src/lib/api-key.ts` (new)

```typescript
// Functions:
generateApiKey(): { key: string; prefix: string }
  - Generate 32-byte random key
  - Format: sk_live_<base64url-encoded-random-bytes>
  - Return full key and prefix (first 12 chars)

encryptApiKey(key: string): string
  - Use existing encryption.ts utilities
  - AES-256-CBC encryption

decryptApiKey(encrypted: string): string
  - Use existing encryption.ts utilities

validateApiKey(providedKey: string, encryptedKey: string): boolean
  - Decrypt stored key and compare
```

---

## 3. API Routes Changes

### 3.1 Projects Routes
**File:** `shapeshyft_api/src/routes/projects.ts`

**New endpoint:** `POST /projects/:id/api-key/refresh`
- Authenticated (Firebase)
- Generate new API key
- Encrypt and store
- Return new key (only time full key is returned)

**Modify:** `GET /projects/:id`
- Include `apiKeyPrefix` and `apiKeyCreatedAt` in response
- Add new endpoint: `GET /projects/:id/api-key` - Returns decrypted full key (authenticated)

**Modify:** `POST /projects`
- Auto-generate API key on project creation
- Store encrypted key and prefix

### 3.2 Endpoints Routes
**File:** `shapeshyft_api/src/routes/endpoints.ts`

**Modify:** `PUT /endpoints/:id`
- Accept `ipAllowlist` field (array of IPv4 strings)
- Validate IPv4 format
- Store as JSON string

**Modify:** `GET /endpoints/:id`
- Include `ipAllowlist` in response (parsed JSON)

### 3.3 AI Routes - Add Authentication
**File:** `shapeshyft_api/src/routes/ai.ts`

**New middleware:** `validateApiKeyMiddleware`
- Extract API key from:
  1. Query param: `?api_key=sk_live_...`
  2. Header: `Authorization: Bearer sk_live_...`
- Look up project by decrypting all project keys (or use prefix for optimization)
- Return 401 if invalid/missing

**New middleware:** `validateIpAllowlistMiddleware`
- Get caller IP from request
- Check against endpoint's `ipAllowlist`
- Return 403 if IP not in allowlist (when allowlist is set)
- Allow all if `ipAllowlist` is null/empty

**Apply to:** `POST /:organizationPath/:projectPath/:endpointPath/prompt`

---

## 4. Type Definitions

**File:** `shapeshyft_types/src/index.ts`

### Update Project type:
```typescript
export interface Project {
  // ... existing fields
  apiKeyPrefix?: string;
  apiKeyCreatedAt?: string;
}
```

### Update Endpoint type:
```typescript
export interface Endpoint {
  // ... existing fields
  ipAllowlist?: string[]; // Array of IPv4 addresses
}
```

### New types:
```typescript
export interface RefreshApiKeyResponse {
  apiKey: string;        // Full key (only returned on refresh)
  apiKeyPrefix: string;
  apiKeyCreatedAt: string;
}

export interface GetApiKeyResponse {
  apiKey: string;        // Full decrypted key
}
```

---

## 5. Client Library Updates

**File:** `shapeshyft_client/src/network/ShapeshyftClient.ts`

### New methods:
```typescript
refreshProjectApiKey(projectId: string): Promise<RefreshApiKeyResponse>
getProjectApiKey(projectId: string): Promise<GetApiKeyResponse>
```

### Update existing:
```typescript
updateEndpoint(id: string, data: UpdateEndpointRequest)
  // Ensure ipAllowlist is included in request type
```

**File:** `shapeshyft_client/src/hooks/useProject.ts`
- Add `refreshApiKey()` mutation
- Add `getApiKey()` query

**File:** `shapeshyft_client/src/hooks/useEndpoint.ts`
- Ensure `ipAllowlist` is handled in update mutations

---

## 6. App UI Changes

### 6.1 Project Settings - API Key Section
**File:** `shapeshyft_app/src/pages/ProjectSettingsPage.tsx` (or similar)

**New component:** `ApiKeySection`
- Display API key prefix: `sk_live_ab••••••••`
- "Show" button to reveal full key (calls `getProjectApiKey`)
- "Copy" button
- "Refresh" button with confirmation dialog
- Display `apiKeyCreatedAt` timestamp

### 6.2 Endpoint Settings - IP Allowlist Section
**File:** `shapeshyft_app/src/pages/EndpointSettingsPage.tsx` (or similar)

**New component:** `IpAllowlistSection`
- Tag-style input for IPv4 addresses
- Add IP: text input with IPv4 validation + "Add" button
- Remove IP: click X on tag to remove
- Display current IPs as removable tags
- Empty state: "All IP addresses allowed"
- Save button to persist changes

### 6.3 Translations
**Files:** `shapeshyft_app/public/locales/en/*.json`

Add translation keys for:
- API key section labels
- IP allowlist section labels
- Confirmation dialogs
- Error messages

---

## 7. Validation Schemas

**File:** `shapeshyft_api/src/schemas/index.ts`

```typescript
// IPv4 validation
const ipv4Schema = z.string().regex(
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  'Invalid IPv4 address'
);

const ipAllowlistSchema = z.array(ipv4Schema).optional();

// Update endpoint schema
const updateEndpointSchema = z.object({
  // ... existing fields
  ipAllowlist: ipAllowlistSchema,
});
```

---

## 8. Implementation Order

1. **Database** - Schema changes + migration
2. **API Key Utilities** - Generation, encryption functions
3. **Types** - Update shapeshyft_types
4. **API Routes** - Projects (API key), Endpoints (IP allowlist), AI (middleware)
5. **Client** - Update shapeshyft_client methods and hooks
6. **App UI** - API key section, IP allowlist section
7. **Translations** - Add all new strings
8. **Testing** - Unit tests, integration tests

---

## 9. Security Considerations

- API keys are always stored encrypted (AES-256-CBC)
- Full key only returned on generation/refresh or explicit "show" action
- IP validation uses exact IPv4 matching (no CIDR support initially)
- Rate limiting should be considered for API key validation
- Audit logging for key refresh events (future enhancement)

---

## 10. Files to Modify/Create

### shapeshyft_api:
- `src/db/schema.ts` - Add columns
- `src/db/migrations/` - New migration
- `src/lib/api-key.ts` - **NEW** - Key generation/encryption
- `src/routes/projects.ts` - API key endpoints
- `src/routes/endpoints.ts` - IP allowlist handling
- `src/routes/ai.ts` - Auth & IP middleware
- `src/schemas/index.ts` - Validation schemas

### shapeshyft_types:
- `src/index.ts` - Type updates

### shapeshyft_client:
- `src/network/ShapeshyftClient.ts` - New methods
- `src/hooks/useProject.ts` - API key hooks
- `src/hooks/useEndpoint.ts` - Ensure IP allowlist support

### shapeshyft_app:
- `src/components/ApiKeySection.tsx` - **NEW**
- `src/components/IpAllowlistInput.tsx` - **NEW**
- `src/pages/ProjectSettingsPage.tsx` - Integrate API key section
- `src/pages/EndpointSettingsPage.tsx` - Integrate IP allowlist
- `public/locales/en/*.json` - Translations
