# Building Blocks Package Implementation Plan

**Package:** `@sudobility/building_blocks`
**Location:** `~/0xmail/building_blocks`

## Overview

Create a shared component library for higher-level UI building blocks used across multiple apps (mail_box, shapeshyft_app, sudojo_app, whisperly_app). These components handle integrations with auth, wallet, routing, and i18n.

---

## Components to Create

### 1. AppTopBar (Base)
Base topbar with render prop for auth section.

**Props:**
- `logo: { src: string, appName: string, onClick?: () => void }`
- `menuItems: { id, label, icon: ComponentType, href }[]`
- `languages?: LanguageConfig[]` (defaults to 16 built-in)
- `currentLanguage?: string`
- `onLanguageChange?: (code: string) => void`
- `renderAccountSection?: () => ReactNode`
- `LinkComponent?: ComponentType`
- `collapseBelow?: 'sm' | 'md' | 'lg' | 'xl'`

### 2. AppTopBarWithFirebaseAuth
Wraps AppTopBar with Firebase auth via `@sudobility/auth-components`.

**Additional Props:**
- `authenticatedMenuItems?: AuthMenuItem[]`
- `loginButtonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'`

### 3. AppTopBarWithWallet
Wraps AppTopBar with wallet connection via `@sudobility/web3-components`.

**Additional Props:**
- `isConnected: boolean`
- `walletAddress?: string`
- `authStatus?: AuthStatus`
- `chainType?: ChainType`
- `onConnect: () => void`
- `onDisconnect: () => Promise<void>`
- `walletMenuItems?: WalletMenuItem[]`

### 4. AppBreadcrumbs
Breadcrumbs with social share and "Talk to Founder" button.

**Props:**
- `items: { label, href?, current? }[]`
- `shareConfig?: { title, description, hashtags, onBeforeShare? }`
- `talkToFounder?: { meetingUrl: string, buttonText?: string, icon?: ComponentType }`
- `variant?: 'default' | 'transparent' | 'subtle'`

**Note:** Always renders at `max-w-7xl` width.

### 5. AppFooterForHomePage (Full)
Extensive footer for home/landing pages.

**Props:**
- `logo: { src?, appName }`
- `linkSections: { title, links: { label, href }[] }[]`
- `socialLinks?: { twitterUrl?, discordUrl?, githubUrl?, ... }`
- `statusIndicator?: { statusPageUrl, apiEndpoint?, refreshInterval? }`
- `version?: string`
- `copyrightYear?: string`
- `companyName: string`
- `description?: string`

### 6. AppFooter (Compact)
Simplified sticky footer for app pages.

**Props:**
- `version?: string`
- `copyrightYear?: string`
- `companyName: string`
- `links?: { label, href }[]`
- `statusIndicator?: StatusIndicatorConfig`
- `sticky?: boolean`

### 7. AppPageLayout
Layout wrapper combining all blocks.

**Props:**
- `topBar: ReactNode`
- `breadcrumbs?: AppBreadcrumbsProps`
- `footer?: ReactNode`
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full'`
- `contentPadding?: 'none' | 'sm' | 'md' | 'lg'`
- `background?: 'default' | 'white' | 'gradient'`
- `children: ReactNode`

---

## File Structure

```
~/0xmail/building_blocks/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── components/
│   │   ├── index.ts
│   │   ├── topbar/
│   │   │   ├── index.ts
│   │   │   ├── app-topbar.tsx
│   │   │   ├── app-topbar-with-firebase-auth.tsx
│   │   │   ├── app-topbar-with-wallet.tsx
│   │   │   └── language-selector.tsx
│   │   ├── breadcrumbs/
│   │   │   ├── index.ts
│   │   │   └── app-breadcrumbs.tsx
│   │   ├── footer/
│   │   │   ├── index.ts
│   │   │   ├── app-footer.tsx
│   │   │   └── app-footer-for-home-page.tsx
│   │   └── layout/
│   │       ├── index.ts
│   │       └── app-page-layout.tsx
│   ├── constants/
│   │   ├── index.ts
│   │   └── languages.ts
│   └── utils/
│       └── index.ts
```

---

## Default Languages (16)

```typescript
export const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-hant', name: '繁體中文', flag: '🇹🇼' },
];
```

---

## Dependencies

### package.json

```json
{
  "name": "@sudobility/building_blocks",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "@heroicons/react": "^2.2.0",
    "@sudobility/components": "*",
    "@sudobility/design": "*",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "tailwind-merge": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "@sudobility/auth-components": { "optional": true },
    "@sudobility/auth_lib": { "optional": true },
    "@sudobility/web3-components": { "optional": true },
    "@sudobility/devops-components": { "optional": true },
    "@sudobility/types": { "optional": true }
  }
}
```

---

## Reference Files

| Component | Source Reference |
|-----------|-----------------|
| TopBar | `/Users/johnhuang/0xmail/mail_box/src/components/TopBar.tsx` |
| Language Selector | `/Users/johnhuang/0xmail/mail_box/src/components/LanguageSelector.tsx` |
| Footer | `/Users/johnhuang/0xmail/mail_box/src/components/Footer.tsx` |
| Breadcrumbs | `/Users/johnhuang/0xmail/mail_box/src/hooks/useBreadcrumbs.ts` |
| Firebase Auth | `/Users/johnhuang/shapeshyft/shapeshyft_app/src/components/layout/TopBar.tsx` |
| Wallet Menu | `/Users/johnhuang/0xmail/mail_box/src/components/ConnectedWalletMenu.tsx` |
| Page Layout | `/Users/johnhuang/0xmail/mail_box/src/components/layout/standard-page-layout.tsx` |

---

## Key Implementation Notes

1. **Icons**: Apps pass HeroIcon components directly (e.g., `Cog6ToothIcon`)
2. **Width**: Breadcrumbs always `max-w-7xl`, content width configurable via layout
3. **Theme**: Use `dark:` Tailwind classes throughout
4. **Responsive**: Hamburger menu at configurable breakpoint (default `lg`)
5. **LinkComponent**: Accept custom Link for router integration
6. **Talk to Founder**: Generic URL (Calendly, Cal.com, or any)

---

## Implementation Steps

1. **Project Setup**
   - Create `~/0xmail/building_blocks` directory
   - Initialize package.json, tsconfig.json, vite.config.ts
   - Set up build tooling (vite + vite-plugin-dts)

2. **Base Components**
   - Implement `LanguageSelector` from mail_box code
   - Implement `AppTopBar` base component
   - Implement `AppBreadcrumbs` with share + talk-to-founder
   - Implement `AppFooter` (compact)
   - Implement `AppFooterForHomePage` (full)
   - Implement `AppPageLayout`

3. **Auth Variants**
   - Implement `AppTopBarWithFirebaseAuth`
   - Implement `AppTopBarWithWallet`

4. **Constants & Utils**
   - Add DEFAULT_LANGUAGES
   - Add cn utility

5. **Exports**
   - Create index.ts with all exports
   - Build and verify types

---

## Verification

1. Build the package: `bun run build`
2. Verify types are generated in `dist/`
3. Test import in a consumer app
4. Verify responsive behavior (hamburger menu)
5. Verify theme switching (light/dark)
6. Test each component variant

---

## Future Migration (After Verification)

After building_blocks is verified:
1. Update mail_box to use building_blocks
2. Update shapeshyft_app to use building_blocks
3. Update sudojo_app to use building_blocks
4. Update whisperly_app to use building_blocks
