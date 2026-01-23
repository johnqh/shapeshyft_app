# Subscription Library Implementation Plan

## Overview

Create `subscription_lib` - a cross-platform (React + React Native) library for subscription management using RevenueCat, with supporting UI updates.

## 1. Create subscription_lib

**Location:** `~/shapeshyft/subscription_lib`
**Template:** Use `auth_lib` as reference for project structure

### 1.1 Project Setup

```
subscription_lib/
├── src/
│   ├── index.ts              # Public exports
│   ├── types/
│   │   ├── index.ts
│   │   ├── adapter.ts        # RevenueCat adapter interface
│   │   ├── subscription.ts   # Package, Product, Offer types
│   │   └── period.ts         # Period types and utilities
│   ├── core/
│   │   ├── index.ts
│   │   ├── singleton.ts      # Global singleton manager
│   │   └── service.ts        # SubscriptionService class
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useSubscriptions.ts
│   │   ├── useUserSubscription.ts
│   │   ├── useSubscriptionPeriods.ts
│   │   ├── useSubscriptionForPeriod.ts
│   │   └── useSubscribable.ts
│   └── utils/
│       ├── index.ts
│       ├── period-parser.ts  # ISO 8601 duration parsing
│       └── level-calculator.ts # Entitlement level from price
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

### 1.2 Package Configuration

```json
{
  "name": "@sudobility/subscription_lib",
  "peerDependencies": {
    "react": "^19.x"
  }
}
```

No direct RevenueCat SDK dependency - adapter injection pattern.

---

## 2. Types

### 2.1 Adapter Interface (`types/adapter.ts`)

```typescript
export interface SubscriptionAdapter {
  getOfferings(params?: { currency?: string }): Promise<AdapterOfferings>;
  getCustomerInfo(): Promise<AdapterCustomerInfo>;
  purchase(params: AdapterPurchaseParams): Promise<AdapterPurchaseResult>;
}

export interface AdapterOfferings {
  all: Record<string, AdapterOffering>;
  current: AdapterOffering | null;
}

export interface AdapterOffering {
  identifier: string;
  metadata: Record<string, unknown> | null;
  availablePackages: AdapterPackage[];
}

export interface AdapterPackage {
  identifier: string;
  packageType: string;
  product: AdapterProduct;
}

export interface AdapterProduct {
  identifier: string;
  title: string;
  description: string | null;
  price: number; // In standard units (not micros)
  priceString: string;
  currencyCode: string;
  normalPeriodDuration: string | null; // ISO 8601
  subscriptionOptions?: Record<string, AdapterSubscriptionOption>;
}

export interface AdapterSubscriptionOption {
  id: string;
  trial: AdapterPricingPhase | null;
  introPrice: AdapterPricingPhase | null;
}

export interface AdapterPricingPhase {
  periodDuration: string | null;
  price: number | null;
  priceString: string | null;
  cycleCount: number;
}

export interface AdapterCustomerInfo {
  activeSubscriptions: string[];
  entitlements: {
    active: Record<string, AdapterEntitlementInfo>;
  };
}

export interface AdapterEntitlementInfo {
  identifier: string;
  productIdentifier: string;
  expirationDate: string | null;
  willRenew: boolean;
}

export interface AdapterPurchaseParams {
  packageId: string;
  offeringId: string;
  customerEmail?: string;
}

export interface AdapterPurchaseResult {
  customerInfo: AdapterCustomerInfo;
}
```

### 2.2 Subscription Types (`types/subscription.ts`)

```typescript
export type SubscriptionPeriod =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "lifetime";

export interface SubscriptionProduct {
  productId: string;
  name: string;
  description?: string;
  price: number;
  priceString: string;
  currency: string;
  period: SubscriptionPeriod;
  periodDuration: string; // Raw ISO 8601
  trialPeriod?: string;
  introPrice?: string;
  introPricePeriod?: string;
  introPriceCycles?: number;
}

export interface SubscriptionPackage {
  packageId: string;
  name: string;
  product?: SubscriptionProduct; // undefined for free tier
  entitlements: string[];
}

export interface SubscriptionOffer {
  offerId: string;
  metadata?: Record<string, unknown>;
  packages: SubscriptionPackage[];
}

export interface CurrentSubscription {
  isActive: boolean;
  productId?: string;
  packageId?: string;
  entitlements: string[];
  period?: SubscriptionPeriod;
  expirationDate?: Date;
  willRenew?: boolean;
}

export interface FreeTierConfig {
  packageId: string;
  name: string;
}
```

---

## 3. Core Implementation

### 3.1 Singleton (`core/singleton.ts`)

```typescript
export interface SubscriptionConfig {
  adapter: SubscriptionAdapter;
  freeTier: FreeTierConfig;
}

let instance: SubscriptionService | null = null;

export function initializeSubscription(config: SubscriptionConfig): void {
  instance = new SubscriptionService(config);
}

export function getSubscriptionInstance(): SubscriptionService {
  if (!instance) {
    throw new Error(
      "Subscription not initialized. Call initializeSubscription() first.",
    );
  }
  return instance;
}

export function isSubscriptionInitialized(): boolean {
  return instance !== null;
}
```

### 3.2 Service (`core/service.ts`)

```typescript
export class SubscriptionService {
  private adapter: SubscriptionAdapter;
  private freeTier: FreeTierConfig;
  private offersCache: Map<string, SubscriptionOffer> = new Map();
  private currentSubscription: CurrentSubscription | null = null;

  constructor(config: SubscriptionConfig) {
    this.adapter = config.adapter;
    this.freeTier = config.freeTier;
  }

  async loadOfferings(): Promise<void>;
  async loadCustomerInfo(): Promise<void>;

  getOffer(offerId: string): SubscriptionOffer | null;
  getOfferIds(): string[];
  getCurrentSubscription(): CurrentSubscription | null;
  getFreeTier(): SubscriptionPackage;

  async purchase(params: AdapterPurchaseParams): Promise<AdapterPurchaseResult>;
}
```

---

## 4. Hooks

### 4.1 useSubscriptions(offerId)

```typescript
interface UseSubscriptionsResult {
  offer: SubscriptionOffer | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSubscriptions(offerId: string): UseSubscriptionsResult;
```

### 4.2 useUserSubscription()

```typescript
interface UseUserSubscriptionResult {
  subscription: CurrentSubscription | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserSubscription(): UseUserSubscriptionResult;
```

### 4.3 useSubscriptionPeriods(offerId)

```typescript
interface UseSubscriptionPeriodsResult {
  periods: SubscriptionPeriod[];
  isLoading: boolean;
  error: Error | null;
}

export function useSubscriptionPeriods(
  offerId: string,
): UseSubscriptionPeriodsResult;
```

Extracts unique periods from all packages, sorted: weekly → monthly → quarterly → yearly → lifetime

### 4.4 useSubscriptionForPeriod(offerId, period)

```typescript
interface UseSubscriptionForPeriodResult {
  packages: SubscriptionPackage[]; // Sorted by price (ascending), includes free tier
  isLoading: boolean;
  error: Error | null;
}

export function useSubscriptionForPeriod(
  offerId: string,
  period: SubscriptionPeriod,
): UseSubscriptionForPeriodResult;
```

- Filters packages by period
- Sorts by price (ascending) - free tier first, then lowest to highest
- Always includes free tier at position 0

### 4.5 useSubscribable(offerId)

```typescript
interface UseSubscribableResult {
  subscribablePackageIds: string[]; // Package IDs user can subscribe/upgrade to
  isLoading: boolean;
  error: Error | null;
}

export function useSubscribable(offerId: string): UseSubscribableResult;
```

**Upgrade eligibility logic:**

1. If no current subscription → all package IDs
2. If has subscription:
   - Get current period and entitlement level
   - Entitlement level = derived from price comparison within same period
   - Package is subscribable if:
     - `package.period >= currentPeriod` AND
     - `package.entitlementLevel >= currentLevel`

**Period ranking:** weekly(1) < monthly(2) < quarterly(3) < yearly(4) < lifetime(5)

**Level calculation:**

```typescript
function calculateEntitlementLevels(
  packages: SubscriptionPackage[],
): Map<string, number> {
  // Group packages by period
  // For each period, sort by price
  // Assign levels: 1, 2, 3... (free tier = 0)
  // Return map of packageId -> level
}
```

---

## 5. Utility Functions

### 5.1 Period Parser (`utils/period-parser.ts`)

```typescript
export function parseISO8601Period(duration: string): SubscriptionPeriod {
  // P1W, P7D → weekly
  // P1M → monthly
  // P3M → quarterly
  // P1Y, P12M → yearly
  // null/empty → lifetime
}

export function getPeriodRank(period: SubscriptionPeriod): number {
  // weekly: 1, monthly: 2, quarterly: 3, yearly: 4, lifetime: 5
}

export function comparePeriods(
  a: SubscriptionPeriod,
  b: SubscriptionPeriod,
): number {
  return getPeriodRank(a) - getPeriodRank(b);
}
```

---

## 6. UI Changes

### 6.1 SubscriptionTile Updates

**File:** `~/0xmail/mail_box_components/packages/subscription-components/src/subscription-tile.tsx`

**New/Modified Props:**

```typescript
interface SubscriptionTileProps {
  // ... existing props

  /** Whether this is the user's current subscription (blue border) */
  current?: boolean;

  /** Whether user can select this tile (false = grayed out, not selectable) */
  enabled?: boolean;
}
```

**Behavior:**
| State | Border | Text | Radio/CTA | Selectable |
|-------|--------|------|-----------|------------|
| `current=true` | Blue (2px solid) | Normal | Hidden | No |
| `enabled=false` | Normal | Grayed (`opacity-50`) | Hidden | No |
| `enabled=true, current=false` | Normal | Normal | Shown | Yes |

**Implementation:**

- Add `current` prop with blue border styling
- Add `enabled` prop (default: `true`)
- When `enabled=false`: add `opacity-50` or similar graying, `cursor-not-allowed`
- Hide radio/CTA when `current=true` OR `enabled=false`
- Block selection when `current=true` OR `enabled=false`

### 6.2 AppPricingPage Updates

**File:** `~/0xmail/building_blocks/src/components/subscription/AppPricingPage.tsx`

**Changes:**

1. Replace hardcoded `billingPeriodOptions` with `useSubscriptionPeriods(offerId)`
2. Use `useSubscriptionForPeriod(offerId, selectedPeriod)` for tile data
3. Use `useSubscribable(offerId)` to determine `enabled` prop
4. Pass `current` and `enabled` props to `SubscriptionTile`

### 6.3 AppSubscriptionsPage Updates

**File:** `~/0xmail/building_blocks/src/components/subscription/AppSubscriptionsPage.tsx`

**Same changes as AppPricingPage**

---

## 7. Development Setup

### 7.1 Symlinks

During development, create symlinks:

```bash
# In subscription_lib
cd ~/shapeshyft/subscription_lib
bun link

# In consuming projects
cd ~/0xmail/mail_box_components/packages/subscription-components
bun link @sudobility/subscription_lib

cd ~/0xmail/building_blocks
bun link @sudobility/subscription_lib
```

### 7.2 Build Order

1. `subscription_lib` - build first
2. `subscription-components` - update and build
3. `building_blocks` - update and build
4. Test in `shapeshyft_app`

---

## 8. Files to Create/Modify

### New Files (subscription_lib)

- `~/shapeshyft/subscription_lib/package.json`
- `~/shapeshyft/subscription_lib/tsconfig.json`
- `~/shapeshyft/subscription_lib/CLAUDE.md`
- `~/shapeshyft/subscription_lib/src/index.ts`
- `~/shapeshyft/subscription_lib/src/types/index.ts`
- `~/shapeshyft/subscription_lib/src/types/adapter.ts`
- `~/shapeshyft/subscription_lib/src/types/subscription.ts`
- `~/shapeshyft/subscription_lib/src/types/period.ts`
- `~/shapeshyft/subscription_lib/src/core/index.ts`
- `~/shapeshyft/subscription_lib/src/core/singleton.ts`
- `~/shapeshyft/subscription_lib/src/core/service.ts`
- `~/shapeshyft/subscription_lib/src/hooks/index.ts`
- `~/shapeshyft/subscription_lib/src/hooks/useSubscriptions.ts`
- `~/shapeshyft/subscription_lib/src/hooks/useUserSubscription.ts`
- `~/shapeshyft/subscription_lib/src/hooks/useSubscriptionPeriods.ts`
- `~/shapeshyft/subscription_lib/src/hooks/useSubscriptionForPeriod.ts`
- `~/shapeshyft/subscription_lib/src/hooks/useSubscribable.ts`
- `~/shapeshyft/subscription_lib/src/utils/index.ts`
- `~/shapeshyft/subscription_lib/src/utils/period-parser.ts`
- `~/shapeshyft/subscription_lib/src/utils/level-calculator.ts`

### Modified Files

- `~/0xmail/mail_box_components/packages/subscription-components/src/subscription-tile.tsx`
- `~/0xmail/mail_box_components/packages/subscription-components/src/types.ts`
- `~/0xmail/building_blocks/src/components/subscription/AppPricingPage.tsx`
- `~/0xmail/building_blocks/src/components/subscription/AppSubscriptionsPage.tsx`

---

## 9. Verification

### 9.1 Unit Tests

- Period parser correctly handles all ISO 8601 durations
- Level calculator correctly ranks packages by price within period
- `useSubscribable` returns correct package IDs for various subscription states

### 9.2 Integration Tests

- Initialize with mock adapter
- Verify hooks return correct data
- Verify upgrade eligibility logic

### 9.3 Manual Testing

1. Build all packages
2. Run shapeshyft_app
3. Test scenarios:
   - No subscription: all tiles enabled, free tier current
   - Basic monthly: basic yearly, pro monthly, pro yearly enabled
   - Pro yearly: only pro yearly is current (highest), others disabled

---

## 10. Implementation Order

1. **subscription_lib setup** - package.json, tsconfig, structure
2. **Types** - adapter.ts, subscription.ts, period.ts
3. **Utils** - period-parser.ts, level-calculator.ts
4. **Core** - singleton.ts, service.ts
5. **Hooks** - all 5 hooks
6. **SubscriptionTile** - add current/enabled props
7. **AppPricingPage** - integrate hooks
8. **AppSubscriptionsPage** - integrate hooks
9. **Testing** - verify all scenarios
