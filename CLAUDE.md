# ShapeShyft App

React frontend application for ShapeShyft - an LLM structured output platform.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State**: Zustand (via shapeshyft_lib)
- **Data Fetching**: TanStack Query (via shapeshyft_client)
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
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   ├── dashboard/    # Dashboard-specific components
│   └── providers/    # Context providers
├── context/          # React context definitions
├── hooks/            # Custom React hooks
├── config/           # App configuration
└── utils/            # Utility functions
public/
└── locales/          # i18n translation files
```

## Commands

```bash
bun run dev          # Start Vite dev server
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

## Key Dependencies

Internal packages:
- `@sudobility/shapeshyft_client` - API client hooks
- `@sudobility/shapeshyft_lib` - Business logic stores
- `@sudobility/shapeshyft_types` - TypeScript types
- `@sudobility/components` - Shared UI components
- `@sudobility/design` - Design tokens
- `@sudobility/auth-components` - Auth UI
- `@sudobility/subscription-components` - Subscription UI

External packages:
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `react-router-dom` - Routing
- `recharts` - Charts for analytics
- `firebase` - Authentication

## Environment Variables

Configure in `.env.local`:
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_*` - Firebase config
- `VITE_REVENUECAT_*` - RevenueCat config

## Routing

- `/` - Home page
- `/login` - Authentication
- `/pricing` - Subscription plans
- `/docs` - Documentation
- `/dashboard/*` - Protected dashboard routes
