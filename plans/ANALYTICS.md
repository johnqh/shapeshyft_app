# Analytics Simplification Plan

## Goal

Unify Firebase Analytics across all apps by creating a shared singleton service in `building_blocks` that can be called directly without React context or callback wiring.

## Current State

| Repository | Pattern | Issues |
|------------|---------|--------|
| `building_blocks` | `onTrack` callback props | Requires manual wiring in every component |
| `shapeshyft_app` | `AnalyticsContext` + `useAnalytics()` | Unnecessary context overhead |
| `mail_box` | `FirebaseContext` + `useFirebase()` | Complex, mixes analytics with FCM/RemoteConfig |
| `sudojo_app` | `useFirebaseAnalytics()` hook | Good, but still requires hook in each component |
| `whisperly_app` | `useFirebaseAnalytics()` hook | Good, but still requires hook in each component |

## Target State

All apps use a shared `analyticsService` singleton from `building_blocks`:

```typescript
import { analyticsService } from '@sudobility/building_blocks';

// Direct call from anywhere - no hooks, no context, no callbacks
analyticsService.trackButtonClick('submit', { form: 'login' });
```

---

## Phase 1: Update `building_blocks`

### 1.1 Create Analytics Service

**File:** `~/0xmail/building_blocks/src/services/analytics-service.ts`

```typescript
import { logEvent, setUserId, setUserProperties, type Analytics } from 'firebase/analytics';

export interface AnalyticsEventParams {
  [key: string]: unknown;
}

let analytics: Analytics | undefined;
let isEnabled = false;

export const analyticsService = {
  /**
   * Initialize with Firebase Analytics instance (call once at app startup)
   */
  initialize(analyticsInstance: Analytics | undefined): void {
    analytics = analyticsInstance;
    isEnabled = !!analytics;
  },

  isEnabled(): boolean {
    return isEnabled;
  },

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (!isEnabled || !analytics) return;
    logEvent(analytics, eventName, { ...params, timestamp: Date.now() });
  },

  trackPageView(pagePath: string, pageTitle?: string): void {
    this.trackEvent('page_view', { page_path: pagePath, page_title: pageTitle });
  },

  trackButtonClick(buttonName: string, params?: AnalyticsEventParams): void {
    this.trackEvent('button_click', { button_name: buttonName, ...params });
  },

  trackLinkClick(linkUrl: string, linkText?: string, params?: AnalyticsEventParams): void {
    this.trackEvent('link_click', { link_url: linkUrl, link_text: linkText, ...params });
  },

  trackError(errorMessage: string, errorCode?: string): void {
    this.trackEvent('error_occurred', { error_message: errorMessage, error_code: errorCode });
  },

  setUserId(userId: string): void {
    if (!isEnabled || !analytics) return;
    setUserId(analytics, userId);
  },

  setUserProperties(properties: Record<string, string>): void {
    if (!isEnabled || !analytics) return;
    setUserProperties(analytics, properties);
  },
};
```

### 1.2 Export from Index

**File:** `~/0xmail/building_blocks/src/index.ts`

```typescript
export { analyticsService, type AnalyticsEventParams } from './services/analytics-service';
```

### 1.3 Update Components to Use Service Directly

Update these components to call `analyticsService` internally instead of requiring `onTrack` prop:

- `AppPricingPage` - track subscription actions
- `AppSubscriptionsPage` - track subscription actions
- `GlobalSettingsPage` - track settings changes
- `AppFooter` - track link clicks
- `AppFooterForHomePage` - track link clicks

**Keep `onTrack` prop as optional override** for backwards compatibility, but default to `analyticsService`:

```typescript
// In component
const track = useCallback((label: string, params?: Record<string, unknown>) => {
  if (onTrack) {
    // Legacy callback mode
    onTrack({ eventType: 'button_click', componentName: 'AppPricingPage', label, params });
  } else {
    // New direct mode
    analyticsService.trackButtonClick(label, { component: 'AppPricingPage', ...params });
  }
}, [onTrack]);
```

---

## Phase 2: Update Apps

### 2.1 shapeshyft_app

**Initialize service in `main.tsx`:**
```typescript
import { analyticsService } from '@sudobility/building_blocks';
import { getAnalytics } from 'firebase/analytics';
import { getFirebaseApp } from '@sudobility/auth_lib';

// After Firebase init
const app = getFirebaseApp();
if (app) {
  try {
    const analytics = getAnalytics(app);
    analyticsService.initialize(analytics);
  } catch (e) {
    // Analytics not supported
  }
}
```

**Delete files:**
- `src/context/AnalyticsContext.tsx`
- `src/context/analyticsContextDef.ts`
- `src/hooks/useAnalytics.ts`

**Update files:**
- `src/App.tsx` - Remove `<AnalyticsProvider>`
- `src/hooks/usePageTracking.ts` - Use `analyticsService.trackPageView()` directly
- `src/context/ApiContext.tsx` - Add user ID tracking with `analyticsService.setUserId()`

### 2.2 mail_box

**Initialize service in `main.tsx` or `App.tsx`:**
```typescript
import { analyticsService } from '@sudobility/building_blocks';
import { analytics } from './config/firebase';

analyticsService.initialize(analytics);
```

**Simplify `FirebaseContext.tsx`:**
- Remove analytics methods (`trackEvent`, `setUserProperty`, `setAnalyticsUserId`)
- Keep only FCM and RemoteConfig functionality
- Components use `analyticsService` directly instead of `useFirebase().trackEvent()`

**Update files:**
- `src/utils/analytics.ts` - Simplify to use `analyticsService`
- `src/middleware/pageTracking.ts` - Use `analyticsService.trackPageView()`

### 2.3 sudojo_app

**Initialize service in `main.tsx`:**
```typescript
import { analyticsService } from '@sudobility/building_blocks';
// ... Firebase init
analyticsService.initialize(analytics);
```

**Delete files:**
- `src/hooks/useFirebaseAnalytics.ts`
- `src/hooks/useBuildingBlocksAnalytics.ts`

**Update files:**
- Components using `useFirebaseAnalytics()` → use `analyticsService` directly
- Components using `useBuildingBlocksAnalytics()` → remove `onTrack` prop (auto-tracked)

### 2.4 whisperly_app

Same changes as sudojo_app:
- Initialize `analyticsService` in `main.tsx`
- Delete `useFirebaseAnalytics.ts` and `useBuildingBlocksAnalytics.ts`
- Update components to use `analyticsService` directly or rely on auto-tracking

---

## Phase 3: Verification

### Per-App Verification

```bash
# For each app
bun run typecheck
bun run build
bun run test  # if tests exist
```

### Manual Testing

1. Open browser DevTools → Network tab
2. Filter by "analytics" or "collect" or "google-analytics"
3. Navigate between pages → verify `page_view` events
4. Click buttons/links → verify `button_click`/`link_click` events
5. Log in → verify user ID is set

---

## Files Summary

### building_blocks
| Action | File |
|--------|------|
| CREATE | `src/services/analytics-service.ts` |
| MODIFY | `src/index.ts` (add export) |
| MODIFY | `src/components/subscription/AppPricingPage.tsx` |
| MODIFY | `src/components/subscription/AppSubscriptionsPage.tsx` |
| MODIFY | `src/components/settings/global-settings-page.tsx` |
| MODIFY | `src/components/footer/app-footer.tsx` |
| MODIFY | `src/components/footer/app-footer-for-home-page.tsx` |

### shapeshyft_app
| Action | File |
|--------|------|
| MODIFY | `src/main.tsx` (initialize service) |
| DELETE | `src/context/AnalyticsContext.tsx` |
| DELETE | `src/context/analyticsContextDef.ts` |
| DELETE | `src/hooks/useAnalytics.ts` |
| MODIFY | `src/App.tsx` (remove provider) |
| MODIFY | `src/hooks/usePageTracking.ts` |
| MODIFY | `src/context/ApiContext.tsx` (user ID tracking) |
| MODIFY | `src/config/firebase.ts` (simplify) |

### mail_box
| Action | File |
|--------|------|
| MODIFY | `src/App.tsx` or `src/main.tsx` (initialize service) |
| MODIFY | `src/context/FirebaseContext.tsx` (remove analytics methods) |
| MODIFY | `src/utils/analytics.ts` |
| MODIFY | `src/middleware/pageTracking.ts` |

### sudojo_app
| Action | File |
|--------|------|
| MODIFY | `src/main.tsx` (initialize service) |
| DELETE | `src/hooks/useFirebaseAnalytics.ts` |
| DELETE | `src/hooks/useBuildingBlocksAnalytics.ts` |
| MODIFY | Pages using analytics hooks |

### whisperly_app
| Action | File |
|--------|------|
| MODIFY | `src/main.tsx` (initialize service) |
| DELETE | `src/hooks/useFirebaseAnalytics.ts` |
| DELETE | `src/hooks/useBuildingBlocksAnalytics.ts` |
| MODIFY | Pages using analytics hooks |

---

## Benefits

1. **Single source of truth** - One analytics service in `building_blocks`
2. **No callback wiring** - Components auto-track without `onTrack` props
3. **No React overhead** - No context providers or hooks required
4. **Callable anywhere** - Works in React components, utilities, event handlers
5. **Consistent API** - Same methods across all apps
6. **Simpler code** - Less boilerplate in each app
