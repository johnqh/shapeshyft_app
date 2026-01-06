# ShapeShyft App Implementation Plan

## Overview

Create a TypeScript React 19 app for developers to define APIs that use LLMs to provide structured response payloads.

**Location:** `./shapeshyft_app`
**Branding:** ShapeShyft (product) / Sudobility (company)

## Requirements Summary

- Auth for dashboard only (public marketing pages)
- Full i18n (16 languages like mail_box)
- Navigation: Home, Docs, Pricing, Dashboard
- Dark/Light/System theme
- Project templates included
- Pricing with free tier + paid plans

---

## Current Status Summary

| Phase | Description                  | Status                                                |
| ----- | ---------------------------- | ----------------------------------------------------- |
| 1     | Project Foundation           | ✅ Complete                                           |
| 2     | Core Infrastructure          | ✅ Complete                                           |
| 3     | Layout Components            | ✅ Complete                                           |
| 4     | Public Pages                 | ✅ Complete                                           |
| 5     | Authentication UI            | ✅ Complete (migrated to @sudobility/auth-components) |
| 6     | Dashboard Layout             | ✅ Complete                                           |
| 7     | Dashboard - Projects         | ⚠️ UI exists, needs API integration                   |
| 8     | Dashboard - Endpoints        | ⚠️ UI exists, needs API integration                   |
| 9     | Dashboard - API Keys         | ⚠️ UI exists, needs API integration                   |
| 10    | Dashboard - Endpoint Testing | ⚠️ UI exists, needs API integration                   |
| 11    | Dashboard - Analytics        | ⚠️ UI exists, needs API integration                   |
| 12    | Routing Structure            | ✅ Complete                                           |

---

## Available API Hooks (from dependencies)

### From @sudobility/shapeshyft_client

```typescript
// Low-level hooks with manual token/userId management
useProjects(networkClient, baseUrl); // CRUD for projects
useEndpoints(networkClient, baseUrl); // CRUD for endpoints
useKeys(networkClient, baseUrl); // CRUD for LLM API keys
useAnalytics(networkClient, baseUrl); // Fetch usage analytics
useAiExecute(networkClient, baseUrl); // Execute AI endpoints
```

### From @sudobility/shapeshyft_lib

```typescript
// Higher-level manager hooks with caching and autoFetch
useProjectsManager({
  baseUrl,
  networkClient,
  userId,
  token,
  autoFetch,
  params,
});
useEndpointsManager({
  baseUrl,
  networkClient,
  userId,
  token,
  projectId,
  autoFetch,
});
useKeysManager({ baseUrl, networkClient, userId, token, autoFetch });
useAnalyticsManager({ baseUrl, networkClient, userId, token, period });
useEndpointTester(networkClient, baseUrl); // Test endpoints + generate sample input
useProjectTemplates(); // Get pre-built templates
useBudgetTracker({ networkClient, baseUrl, userId, token }); // Budget management
```

### Available Templates (from useProjectTemplates)

1. `textClassifierTemplate` - Text classification
2. `sentimentAnalyzerTemplate` - Sentiment analysis
3. `dataExtractorTemplate` - Data extraction
4. `contentGeneratorTemplate` - Content generation
5. `localizationTemplate` - Localization/translation

---

## Remaining Work: API Integration

### Phase A: Create API Integration Layer

#### A.1 Create API Context (src/context/ApiContext.tsx)

Provides networkClient, baseUrl, and authenticated user context to all dashboard components.

```typescript
import { createContext, useContext, useMemo } from "react";
import { getNetworkService } from "@sudobility/di";
import { useAuth } from "@sudobility/auth-components";
import type { NetworkClient } from "@sudobility/shapeshyft_types";

interface ApiContextValue {
  networkClient: NetworkClient;
  baseUrl: string;
  userId: string | null;
  token: string | null;
  isReady: boolean;
}

// Provides networkClient + auth state to dashboard hooks
```

**File:** `src/context/ApiContext.tsx`
**Status:** ❌ Not created

---

### Phase B: Projects Page - Full API Integration

#### B.1 Update ProjectsPage.tsx

Replace mock data with real API calls.

**Changes needed:**

```typescript
// REMOVE: const mockProjects = [...]

// ADD:
import {
  useProjectsManager,
  useProjectTemplates,
} from "@sudobility/shapeshyft_lib";
import { useApiContext } from "../../context/ApiContext";

function ProjectsPage() {
  const { networkClient, baseUrl, userId, token } = useApiContext();

  const { projects, isLoading, error, createProject, deleteProject, refresh } =
    useProjectsManager({
      baseUrl,
      networkClient,
      userId: userId!,
      token,
      autoFetch: true,
    });

  const { templates, applyTemplate } = useProjectTemplates();

  // ... rest of component using real data
}
```

**Status:** ❌ Uses mockProjects

#### B.2 Create ProjectForm Component (src/components/dashboard/ProjectForm.tsx)

Modal form for creating/editing projects.

**Required fields:**

- `project_name` (slug, auto-generated from display_name)
- `display_name` (user-facing name)
- `description` (optional)

**Features:**

- Validation (project_name must be unique, lowercase, hyphenated)
- Edit mode (pre-fill existing project data)
- Create mode (empty form)

**Status:** ❌ Not created (placeholder modal exists in ProjectsPage)

#### B.3 Create TemplateSelector Component (src/components/dashboard/TemplateSelector.tsx)

Modal for selecting and applying project templates.

**Features:**

- Grid of 5 template cards with descriptions
- Template preview (shows endpoints that will be created)
- "Apply Template" creates project + all endpoints in one flow
- Requires selecting an LLM key first

**Status:** ❌ Not created

---

### Phase C: Project Detail Page - Full API Integration

#### C.1 Update ProjectDetailPage.tsx

Replace mock data with real API calls.

**Changes needed:**

```typescript
// REMOVE: const mockProject = {...}, const mockEndpoints = [...]

// ADD:
import { useProjectsManager, useEndpointsManager } from '@sudobility/shapeshyft_lib';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const { networkClient, baseUrl, userId, token } = useApiContext();

  // Fetch single project
  const { projects } = useProjectsManager({...});
  const project = projects.find(p => p.uuid === projectId);

  // Fetch endpoints for this project
  const {
    endpoints,
    isLoading,
    createEndpoint,
    deleteEndpoint,
  } = useEndpointsManager({
    baseUrl,
    networkClient,
    userId: userId!,
    token,
    projectId: projectId!,
    autoFetch: true,
  });
}
```

**Status:** ❌ Uses mockProject, mockEndpoints

#### C.2 Create EndpointForm Component (src/components/dashboard/EndpointForm.tsx)

Modal form for creating/editing endpoints.

**Required fields:**

- `endpoint_name` (slug)
- `display_name`
- `description` (optional)
- `http_method` (GET or POST)
- `endpoint_type` (dropdown: text_in_structured_out, structured_in_structured_out, text_in_text_out, structured_in_text_out)
- `llm_key_id` (select from user's keys - must fetch keys)
- `context` (system prompt textarea)
- `input_schema` (JSON schema editor)
- `output_schema` (JSON schema editor)

**Status:** ❌ Not created

#### C.3 Create SchemaEditor Component (src/components/dashboard/SchemaEditor.tsx)

Visual JSON Schema editor for input/output schemas.

**Features:**

- Add/remove properties
- Set property type (string, number, boolean, object, array)
- Set property description
- Toggle required
- Support nested objects and arrays
- Raw JSON mode toggle

**Status:** ❌ Not created

---

### Phase D: Endpoint Detail Page - Full API Integration

#### D.1 Update EndpointDetailPage.tsx

Replace mock data with real API calls.

**Changes needed:**

```typescript
// REMOVE: const mockEndpoint = {...}, simulated API call

// ADD:
import { useEndpointsManager, useEndpointTester } from '@sudobility/shapeshyft_lib';

function EndpointDetailPage() {
  const { projectId, endpointId } = useParams();

  const { endpoints } = useEndpointsManager({...});
  const endpoint = endpoints.find(e => e.uuid === endpointId);

  const {
    testResults,
    isLoading: isTesting,
    testEndpoint,
    generateSampleInput,
    validateInput,
  } = useEndpointTester(networkClient, baseUrl);

  const handleTest = async () => {
    if (!endpoint) return;
    const project = projects.find(p => p.uuid === projectId);
    await testEndpoint(project.project_name, endpoint, JSON.parse(testInput));
  };
}
```

**Status:** ❌ Uses mockEndpoint, simulated test results

---

### Phase E: API Keys Page - Full API Integration

#### E.1 Update KeysPage.tsx

Replace mock data with real API calls.

**Changes needed:**

```typescript
// REMOVE: const mockKeys = [...]

// ADD:
import { useKeysManager } from "@sudobility/shapeshyft_lib";

function KeysPage() {
  const { keys, isLoading, error, createKey, updateKey, deleteKey } =
    useKeysManager({
      baseUrl,
      networkClient,
      userId: userId!,
      token,
      autoFetch: true,
    });
}
```

**Status:** ❌ Uses mockKeys

#### E.2 Create KeyForm Component (src/components/dashboard/KeyForm.tsx)

Modal form for adding/editing LLM API keys.

**Required fields:**

- `key_name` (user-facing name)
- `provider` (dropdown: openai, anthropic, gemini, llm_server)
- `api_key` (password field - only required on create)
- `endpoint_url` (only for llm_server provider)

**Features:**

- Password field with show/hide toggle
- Provider-specific validation
- Edit mode hides api_key (shows "••••••••" placeholder)
- Delete confirmation

**Status:** ❌ Not created (placeholder modal exists in KeysPage)

---

### Phase F: Analytics Page - Full API Integration

#### F.1 Update AnalyticsPage.tsx

Replace mock data with real API calls.

**Changes needed:**

```typescript
// REMOVE: const mockAnalytics = {...}

// ADD:
import { useAnalyticsManager } from "@sudobility/shapeshyft_lib";

function AnalyticsPage() {
  const { analytics, isLoading, error, refresh } = useAnalyticsManager({
    baseUrl,
    networkClient,
    userId: userId!,
    token,
    period, // 'today' | 'week' | 'month'
  });

  // Use analytics.total_requests, analytics.successful_requests, etc.
}
```

**Status:** ❌ Uses mockAnalytics

#### F.2 Add Charts (Optional Enhancement)

Install recharts and add time-series charts.

```bash
npm install recharts
```

**Charts to add:**

- Requests over time (line chart)
- Success/failure distribution (pie chart)
- Latency distribution (histogram)
- Cost by endpoint (bar chart)

**Status:** ❌ Placeholder text ("Charts will be implemented...")

---

### Phase G: Subscription Integration

#### G.1 PricingPage Subscription Flow

Connect pricing page to RevenueCat subscription flow.

**Changes needed:**

```typescript
import { useSubscription } from "@sudobility/subscription-components";

function PricingPage() {
  const { subscribe, isSubscribed, currentPlan } = useSubscription();

  const handleSubscribe = async (planId: string) => {
    await subscribe(planId);
  };
}
```

**Status:** ⚠️ UI exists, subscription integration pending

---

## Implementation Checklist

### Priority 1: Core API Integration

- [ ] Create `src/context/ApiContext.tsx`
- [ ] Update `ProjectsPage.tsx` to use `useProjectsManager`
- [ ] Update `ProjectDetailPage.tsx` to use `useEndpointsManager`
- [ ] Update `EndpointDetailPage.tsx` to use `useEndpointTester`
- [ ] Update `KeysPage.tsx` to use `useKeysManager`
- [ ] Update `AnalyticsPage.tsx` to use `useAnalyticsManager`

### Priority 2: Forms & Modals

- [ ] Create `ProjectForm.tsx` component
- [ ] Create `TemplateSelector.tsx` component
- [ ] Create `EndpointForm.tsx` component
- [ ] Create `SchemaEditor.tsx` component
- [ ] Create `KeyForm.tsx` component

### Priority 3: Error Handling & Loading States

- [ ] Add error toasts/notifications across all pages
- [ ] Add loading skeletons for all data fetching
- [ ] Add empty state illustrations
- [ ] Add confirmation dialogs for delete actions

### Priority 4: Polish

- [ ] Add charts to AnalyticsPage (recharts)
- [ ] Connect PricingPage to subscription flow
- [ ] Add budget tracking UI (useBudgetTracker)
- [ ] Test all 16 language translations
- [ ] Responsive testing on mobile

---

## File Changes Summary

### Files to Create

```
src/context/ApiContext.tsx
src/components/dashboard/ProjectForm.tsx
src/components/dashboard/TemplateSelector.tsx
src/components/dashboard/EndpointForm.tsx
src/components/dashboard/SchemaEditor.tsx
src/components/dashboard/KeyForm.tsx
```

### Files to Update

```
src/pages/dashboard/ProjectsPage.tsx      # Remove mockProjects, add useProjectsManager
src/pages/dashboard/ProjectDetailPage.tsx # Remove mocks, add useEndpointsManager
src/pages/dashboard/EndpointDetailPage.tsx # Remove mocks, add useEndpointTester
src/pages/dashboard/KeysPage.tsx          # Remove mockKeys, add useKeysManager
src/pages/dashboard/AnalyticsPage.tsx     # Remove mockAnalytics, add useAnalyticsManager
src/pages/PricingPage.tsx                 # Add subscription integration
src/App.tsx                               # Wrap with ApiContextProvider
```

---

## Type Definitions Reference

Key types from `@sudobility/shapeshyft_types`:

```typescript
interface Project {
  uuid: string;
  user_id: string;
  project_name: string; // slug: "my-project"
  display_name: string; // "My Project"
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Endpoint {
  uuid: string;
  project_id: string;
  endpoint_name: string;
  display_name: string;
  description: string | null;
  http_method: "GET" | "POST";
  endpoint_type:
    | "text_in_structured_out"
    | "structured_in_structured_out"
    | "text_in_text_out"
    | "structured_in_text_out";
  llm_key_id: string;
  context: string; // system prompt
  input_schema: JsonSchema | null;
  output_schema: JsonSchema | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LlmApiKeySafe {
  uuid: string;
  user_id: string;
  key_name: string;
  provider: "openai" | "anthropic" | "gemini" | "llm_server";
  endpoint_url: string | null; // only for llm_server
  has_api_key: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsageAnalytics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens_input: number;
  total_tokens_output: number;
  total_estimated_cost_cents: number;
  average_latency_ms: number;
}
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Firebase (required for auth)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# RevenueCat (required for subscriptions)
VITE_REVENUECAT_API_KEY=
VITE_REVENUECAT_ENTITLEMENT_ID=premium

# API
VITE_SHAPESHYFT_API_URL=http://localhost:8787
```
