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

## Phase 1: Project Foundation

### 1.1 Initialize Vite Project
```bash
cd ./shapeshyft_app
bun create vite . --template react-ts
```

### 1.2 Configure Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.90.0",
    "i18next": "^24.0.0",
    "react-i18next": "^15.0.0",
    "i18next-http-backend": "^3.0.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "firebase": "^12.0.0",
    "zustand": "^5.0.0",
    "@sudobility/types": "^1.9.31",
    "@sudobility/di": "^1.5.5",
    "@sudobility/design": "^1.1.15",
    "@sudobility/components": "^4.0.84",
    "@sudobility/shapeshyft_types": "^1.0.1",
    "@sudobility/shapeshyft_client": "^0.0.1",
    "@sudobility/shapeshyft_lib": "^0.0.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}
```

### 1.3 Configure Tailwind (tailwind.config.js)
- Copy from `~/0xmail/mail_box/tailwind.config.js`
- Update content paths for shapeshyft_app
- Keep CSS variable theme colors and darkMode: 'class'

### 1.4 Environment Variables (.env)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_SHAPESHYFT_API_URL=http://localhost:8787
VITE_APP_NAME=ShapeShyft
```

---

## Phase 2: Core Infrastructure

### 2.1 Entry Point (src/main.tsx)
```typescript
import { initializeStorageService, initializeNetworkService } from '@sudobility/di';
initializeStorageService();
initializeNetworkService();
import './i18n';
import App from './App';
// ... render
```
Reference: `~/0xmail/mail_box/src/main.tsx`

### 2.2 Firebase Config (src/config/firebase.ts)
- Copy pattern from `~/sudojo/sudojo_app/src/config/firebase.ts`
- Export `auth`, `app`, `isFirebaseConfigured()`

### 2.3 Auth Context (src/context/AuthContext.tsx)
- Google OAuth + Email/Password
- useAuth hook with: user, loading, isAuthenticated, signIn*, signOut
- AuthModal controls
Reference: `~/sudojo/sudojo_app/src/context/AuthContext.tsx`

### 2.4 Theme Context (src/context/ThemeContext.tsx)
- Dark/Light/System modes
- Use @sudobility/components storage patterns
Reference: `~/0xmail/mail_box/src/context/ThemeContext.tsx`

### 2.5 i18n Setup (src/i18n.ts)
- 16 languages: en, ar, de, es, fr, it, ja, ko, pt, ru, sv, th, uk, vi, zh, zh-hant
- HTTP backend for async loading
- Path-based language detection

---

## Phase 3: Layout Components

### 3.1 TopBar (src/components/layout/TopBar.tsx)
```typescript
import {
  TopbarProvider, Topbar, TopbarLeft, TopbarCenter, TopbarRight,
  TopbarNavigation, TopbarLogo, TopbarActions, Logo
} from '@sudobility/components';
```
- Logo on left
- Navigation: Home, Docs, Pricing, Dashboard (collapseBelow="lg")
- Right: LanguageSelector + Login button / User menu
Reference: `~/0xmail/mail_box/src/components/TopBar.tsx`

### 3.2 Footer (src/components/layout/Footer.tsx)
- `variant="full"` for Home, Pricing, Docs pages
- `variant="compact" sticky` for Dashboard pages
Reference: `~/0xmail/mail_box/src/components/Footer.tsx`

### 3.3 ScreenContainer (src/components/layout/ScreenContainer.tsx)
- Wraps pages with TopBar + Footer
- Props: footerVariant, showBreadcrumb, breadcrumbItems

### 3.4 ProtectedRoute (src/components/layout/ProtectedRoute.tsx)
- Check isAuthenticated from useAuth
- Redirect to home with login modal if not authenticated

### 3.5 Language Routing
- `LanguageRedirect.tsx` - Detect language, redirect to /:lang
- `LanguageValidator.tsx` - Validate :lang param
- `LocalizedLink.tsx` - Language-aware Link component
Reference: `~/0xmail/mail_box/src/hooks/useLocalizedNavigate.ts`

---

## Phase 4: Public Pages

### 4.1 HomePage (src/pages/HomePage.tsx)
- Hero section: "Transform LLM outputs into structured APIs"
- Feature cards: Structured Output, Multi-Provider, Analytics
- Use cases section: Classification, Extraction, Generation
- CTA: "Get Started" → opens auth modal
- Full footer

### 4.2 PricingPage (src/pages/PricingPage.tsx)
- Free tier: 1000 requests/month, 1 project, 3 endpoints
- Pro tier: Unlimited requests, projects, endpoints
- Enterprise: Custom pricing, SLA
- Full footer

### 4.3 DocsPage (src/pages/DocsPage.tsx)
- Getting started guide
- API reference (link to API docs)
- Code examples
- Full footer

---

## Phase 5: Authentication UI

### 5.1 AuthModal (src/components/auth/AuthModal.tsx)
- Modal with tabs: Login / Sign Up
- Google OAuth button
- Email/Password forms
Reference: `~/sudojo/sudojo_app/src/components/auth/AuthModal.tsx`

### 5.2 Forms
- `LoginForm.tsx` - Email, password, forgot password link
- `SignupForm.tsx` - Display name, email, password

---

## Phase 6: Dashboard Layout

### 6.1 DashboardPage (src/pages/dashboard/DashboardPage.tsx)
- Sidebar or tabs: Projects, API Keys, Analytics
- Nested routes via Outlet
- Compact sticky footer

### 6.2 Dashboard Routes
```
/dashboard → ProjectsPage (default)
/dashboard/projects/:projectId → ProjectDetailPage
/dashboard/projects/:projectId/endpoints/:endpointId → EndpointDetailPage
/dashboard/keys → KeysPage
/dashboard/analytics → AnalyticsPage
```

---

## Phase 7: Dashboard - Projects

### 7.1 ProjectsPage (src/pages/dashboard/ProjectsPage.tsx)
- Use `useProjectsManager` from @sudobility/shapeshyft_lib
- Grid of project cards
- "Create Project" button → ProjectForm modal
- "Use Template" button → TemplateSelector

### 7.2 Components
- `ProjectCard.tsx` - Display project with edit/delete actions
- `ProjectForm.tsx` - Create/edit: project_name, display_name, description
- `TemplateSelector.tsx` - 5 templates from shapeshyft_lib

### 7.3 ProjectDetailPage (src/pages/dashboard/ProjectDetailPage.tsx)
- Project header with edit button
- Endpoints list below
- "Create Endpoint" button

---

## Phase 8: Dashboard - Endpoints

### 8.1 EndpointList (src/components/dashboard/EndpointList.tsx)
- Use `useEndpointsManager` from @sudobility/shapeshyft_lib
- Filter by endpoint type
- Grid of endpoint cards

### 8.2 Components
- `EndpointCard.tsx` - Type badge, method badge, test button
- `EndpointForm.tsx` - Full endpoint configuration:
  - endpoint_name, display_name, description
  - http_method (GET/POST)
  - endpoint_type (4 types dropdown)
  - llm_key_id (select from user's keys)
  - input_schema, output_schema (JSON editors)
  - context (system prompt textarea)

### 8.3 EndpointDetailPage (src/pages/dashboard/EndpointDetailPage.tsx)
- Endpoint configuration view
- Embedded EndpointTester component

### 8.4 SchemaEditor (src/components/dashboard/SchemaEditor.tsx)
- Visual JSON Schema editor
- Add/remove properties
- Type selection (string, number, boolean, object, array)
- Required toggle

---

## Phase 9: Dashboard - API Keys

### 9.1 KeysPage (src/pages/dashboard/KeysPage.tsx)
- Use `useKeysManager` from @sudobility/shapeshyft_lib
- List of configured keys (masked display)
- "Add Key" button

### 9.2 Components
- `KeysList.tsx` - Display keys with provider icons
- `KeyForm.tsx` - Provider select, key_name, api_key (password field), endpoint_url (for llm_server)

---

## Phase 10: Dashboard - Endpoint Testing

### 10.1 EndpointTester (src/components/dashboard/EndpointTester.tsx)
- Use `useEndpointTester` from @sudobility/shapeshyft_lib
- "Generate Sample" button → auto-generate from input_schema
- JSON input editor
- "Test" button → execute endpoint
- Response display:
  - Output JSON
  - Token usage (input/output)
  - Latency
  - Cost estimate

---

## Phase 11: Dashboard - Analytics

### 11.1 AnalyticsPage (src/pages/dashboard/AnalyticsPage.tsx)
- Use `useAnalyticsManager` from @sudobility/shapeshyft_lib
- Date range picker
- Overall stats cards

### 11.2 Components
- `AnalyticsDashboard.tsx` - Charts (can use recharts or similar)
- `AnalyticsCard.tsx` - Single metric: total requests, success rate, avg latency, total cost

---

## Phase 12: Routing Structure (src/App.tsx)

```typescript
<Routes>
  <Route path="/" element={<LanguageRedirect />} />
  <Route path="/:lang" element={<LanguageValidator />}>
    {/* Public pages */}
    <Route index element={<HomePage />} />
    <Route path="pricing" element={<PricingPage />} />
    <Route path="docs" element={<DocsPage />} />
    <Route path="docs/:section" element={<DocsPage />} />

    {/* Protected dashboard */}
    <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
      <Route index element={<ProjectsPage />} />
      <Route path="projects/:projectId" element={<ProjectDetailPage />} />
      <Route path="projects/:projectId/endpoints/:endpointId" element={<EndpointDetailPage />} />
      <Route path="keys" element={<KeysPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="." />} />
  </Route>
</Routes>
```

---

## Project Structure

```
shapeshyft_app/
├── public/
│   └── locales/{en,ar,de,es,fr,it,ja,ko,pt,ru,sv,th,uk,vi,zh,zh-hant}/
│       ├── common.json
│       ├── home.json
│       ├── pricing.json
│       ├── docs.json
│       └── dashboard.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ScreenContainer.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── LanguageRedirect.tsx
│   │   │   ├── LanguageValidator.tsx
│   │   │   └── LocalizedLink.tsx
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   └── dashboard/
│   │       ├── ProjectCard.tsx
│   │       ├── ProjectForm.tsx
│   │       ├── TemplateSelector.tsx
│   │       ├── EndpointCard.tsx
│   │       ├── EndpointForm.tsx
│   │       ├── EndpointTester.tsx
│   │       ├── SchemaEditor.tsx
│   │       ├── KeysList.tsx
│   │       ├── KeyForm.tsx
│   │       ├── AnalyticsDashboard.tsx
│   │       └── AnalyticsCard.tsx
│   ├── config/
│   │   ├── firebase.ts
│   │   └── constants.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useLocalizedNavigate.ts
│   │   └── useBreadcrumbs.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PricingPage.tsx
│   │   ├── DocsPage.tsx
│   │   └── dashboard/
│   │       ├── DashboardPage.tsx
│   │       ├── ProjectsPage.tsx
│   │       ├── ProjectDetailPage.tsx
│   │       ├── EndpointDetailPage.tsx
│   │       ├── KeysPage.tsx
│   │       └── AnalyticsPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── i18n.ts
│   └── index.css
├── .env
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Key Reference Files

| Purpose | Reference File |
|---------|---------------|
| DI initialization | `~/0xmail/mail_box/src/main.tsx` |
| TopBar pattern | `~/0xmail/mail_box/src/components/TopBar.tsx` |
| Footer pattern | `~/0xmail/mail_box/src/components/Footer.tsx` |
| Firebase auth | `~/sudojo/sudojo_app/src/context/AuthContext.tsx` |
| Theme context | `~/0xmail/mail_box/src/context/ThemeContext.tsx` |
| Language routing | `~/0xmail/mail_box/src/hooks/useLocalizedNavigate.ts` |
| Tailwind config | `~/0xmail/mail_box/tailwind.config.js` |
| i18n setup | `~/0xmail/mail_box/src/i18n.ts` |

---

## Implementation Order

1. **Phase 1-2**: Foundation + Infrastructure (project setup, DI, Firebase, contexts)
2. **Phase 3**: Layout components (TopBar, Footer, ScreenContainer)
3. **Phase 4-5**: Public pages + Auth UI (HomePage, Pricing, Docs, AuthModal)
4. **Phase 6-7**: Dashboard + Projects (DashboardPage, ProjectsPage, ProjectForm)
5. **Phase 8**: Endpoints (EndpointList, EndpointForm, SchemaEditor)
6. **Phase 9**: API Keys (KeysPage, KeyForm)
7. **Phase 10**: Endpoint Testing (EndpointTester)
8. **Phase 11**: Analytics (AnalyticsPage, charts)
9. **Phase 12**: Polish (i18n translations, responsive testing)
