# ShapeShyft App

React frontend application for ShapeShyft - an LLM structured output platform.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Bun
- **Framework**: React 19
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State**: Zustand (via shapeshyft_lib)
- **Auth**: Firebase
- **i18n**: i18next
- **Subscriptions**: RevenueCat

## Project Structure

```
src/
├── main.tsx          # Entry point
├── App.tsx           # Root component with routing
├── index.css         # Global styles (Tailwind)
├── i18n.ts           # i18next configuration
├── pages/            # Route pages
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── DocsPage.tsx
│   ├── PricingPage.tsx
│   └── dashboard/    # Protected dashboard pages
│       ├── DashboardPage.tsx
│       ├── ProjectsPage.tsx
│       ├── EndpointsPage.tsx
│       ├── KeysPage.tsx
│       ├── AnalyticsPage.tsx
│       └── SettingsPage.tsx
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components (TopBar, Footer, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   └── providers/    # Context providers
├── context/          # React context definitions
├── hooks/            # Custom React hooks
├── config/           # App configuration
│   └── constants.ts  # App constants and env vars
└── utils/            # Utility functions
public/
└── locales/          # i18n translation files
    ├── en/
    └── ...
```

## Commands

```bash
bun run dev          # Start Vite dev server (http://localhost:5173)
bun run build        # Build for production (tsc + vite)
bun run preview      # Preview production build
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run typecheck    # TypeScript type check
bun run format       # Format with Prettier
```

## Configuration Files

- `vite.config.ts` - Vite bundler config
- `tailwind.config.js` - Tailwind CSS config
- `postcss.config.js` - PostCSS config
- `tsconfig.json` - TypeScript config
- `eslint.config.js` - ESLint flat config

## Internal Dependencies

- `@sudobility/shapeshyft_client` - API client hooks
- `@sudobility/shapeshyft_lib` - Business logic stores
- `@sudobility/shapeshyft_types` - TypeScript types
- `@sudobility/components` - Shared UI components
- `@sudobility/design` - Design tokens
- `@sudobility/auth_lib` - Auth utilities
- `@sudobility/auth-components` - Auth UI components
- `@sudobility/subscription-components` - Subscription UI
- `@sudobility/entity_client` - Entity management hooks
- `@sudobility/entity_pages` - Entity management pages
- `@sudobility/ratelimit_client` - Rate limit hooks
- `@sudobility/ratelimit_pages` - Rate limit pages

## External Dependencies

- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `react-router-dom` - Routing
- `recharts` - Charts for analytics
- `firebase` - Authentication
- `i18next` - Internationalization

## Environment Variables

Configure in `.env.local` (see `.env.example` for full documentation):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# RevenueCat (subscriptions)
VITE_REVENUECAT_API_KEY=
VITE_REVENUECAT_API_KEY_SANDBOX=

# API Configuration
VITE_SHAPESHYFT_API_URL=https://api.shapeshyft.ai

# Branding
VITE_APP_NAME=ShapeShyft
VITE_APP_DOMAIN=shapeshyft.ai
VITE_COMPANY_NAME=
VITE_SUPPORT_EMAIL=
VITE_TWITTER_HANDLE=
VITE_DISCORD_INVITE=
VITE_LINKEDIN_COMPANY=
VITE_GITHUB_ORG=

# Social Media Links (full URLs)
VITE_TWITTER_URL=
VITE_REDDIT_URL=
VITE_DISCORD_URL=
VITE_LINKEDIN_URL=
VITE_FARCASTER_URL=
VITE_TELEGRAM_URL=
VITE_GITHUB_URL=
VITE_STATUS_PAGE_URL=

# Feature Flags
VITE_DEV_MODE=false
VITE_SHOW_PERFORMANCE_MONITOR=false
```

## Routing

| Path                      | Page            | Auth Required |
| ------------------------- | --------------- | ------------- |
| `/`                       | Home            | No            |
| `/login`                  | Login           | No            |
| `/pricing`                | Pricing         | No            |
| `/docs`                   | Documentation   | No            |
| `/dashboard`              | Dashboard       | Yes           |
| `/dashboard/projects`     | Projects        | Yes           |
| `/dashboard/projects/:id` | Project Details | Yes           |
| `/dashboard/keys`         | API Keys        | Yes           |
| `/dashboard/analytics`    | Analytics       | Yes           |
| `/dashboard/settings`     | Settings        | Yes           |

## Code Patterns

### Protected Routes

```tsx
<Route
  path="/dashboard/*"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
/>
```

### Data Fetching

```tsx
// Use hooks from shapeshyft_client
const { projects, isLoading, refresh } = useProjects(networkClient, baseUrl);

useEffect(() => {
  if (token) refresh(entitySlug, token);
}, [token, entitySlug]);
```

### State Management

```tsx
// Use stores from shapeshyft_lib
const projects = useProjectsStore((state) => state.getProjects(entitySlug));
```
