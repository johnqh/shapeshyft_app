import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  AppTopBarWithFirebaseAuth,
  type MenuItemConfig,
  type AuthMenuItem,
  type AuthActionProps,
} from "@sudobility/building_blocks";
import { AuthAction, useAuthStatus } from "@sudobility/auth-components";
import { useSiteAdmin } from "@sudobility/auth_lib";
import type { ComponentType } from "react";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";
import { useCurrentEntityOptional } from "../../hooks/useCurrentEntity";
import { useApi } from "@sudobility/building_blocks/firebase";
import {
  CONSTANTS,
  SUPPORTED_LANGUAGES,
  isLanguageSupported,
} from "../../config/constants";
import LocalizedLink from "./LocalizedLink";

// Language display names and flags
const LANGUAGE_INFO: Record<string, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  ar: { name: "العربية", flag: "🇸🇦" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  it: { name: "Italiano", flag: "🇮🇹" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  pt: { name: "Português", flag: "🇧🇷" },
  ru: { name: "Русский", flag: "🇷🇺" },
  sv: { name: "Svenska", flag: "🇸🇪" },
  th: { name: "ไทย", flag: "🇹🇭" },
  uk: { name: "Українська", flag: "🇺🇦" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  zh: { name: "简体中文", flag: "🇨🇳" },
  "zh-hant": { name: "繁體中文", flag: "🇹🇼" },
};

interface TopBarProps {
  variant?: "default" | "transparent";
}

// Icon components for nav items
const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
    />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const Squares2X2Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
    />
  </svg>
);

const Cog6ToothIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

// Menu icons for dropdown
const MenuFolderIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const MenuKeyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const MenuChartIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const MenuBudgetIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const MenuSubscriptionIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const MenuRateLimitsIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const MenuSettingsIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// Link wrapper for TopbarNavigation
const LinkWrapper = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <LocalizedLink to={href} className={className}>
    {children}
  </LocalizedLink>
);

function TopBar({ variant = "default" }: TopBarProps) {
  const { t } = useTranslation("common");
  const { t: tDashboard } = useTranslation("dashboard");
  const { navigate, switchLanguage, currentLanguage } = useLocalizedNavigate();
  const { user } = useAuthStatus();
  const { networkClient, baseUrl, token } = useApi();

  // Get the current entity from context - this is set when user logs in
  // and automatically selects their personal entity
  const entityContext = useCurrentEntityOptional();
  const entitySlug = entityContext?.currentEntitySlug ?? null;

  const isAuthenticated = !!user;

  // Check if user is a site admin
  const { isSiteAdmin } = useSiteAdmin({
    networkClient,
    baseUrl,
    userId: user?.uid,
    token: token ?? undefined,
  });

  // Build languages list
  const languages = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((code) => ({
        code,
        name: LANGUAGE_INFO[code]?.name || code.toUpperCase(),
        flag: LANGUAGE_INFO[code]?.flag || "🌐",
      })),
    [],
  );

  // Build authenticated menu items
  const authenticatedMenuItems: AuthMenuItem[] = useMemo(
    () =>
      isAuthenticated
        ? [
            {
              id: "projects",
              label: tDashboard("navigation.projects"),
              icon: <MenuFolderIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/projects`
                    : "/dashboard",
                ),
            },
            {
              id: "providers",
              label: tDashboard("navigation.providers"),
              icon: <MenuKeyIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/providers`
                    : "/dashboard",
                ),
            },
            {
              id: "analytics",
              label: tDashboard("navigation.analytics"),
              icon: <MenuChartIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/analytics`
                    : "/dashboard",
                ),
            },
            {
              id: "budgets",
              label: tDashboard("navigation.budgets"),
              icon: <MenuBudgetIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/budgets`
                    : "/dashboard",
                ),
            },
            {
              id: "subscription",
              label: tDashboard("navigation.subscription"),
              icon: <MenuSubscriptionIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/subscription`
                    : "/dashboard",
                ),
            },
            {
              id: "rate-limits",
              label: tDashboard("navigation.rateLimits"),
              icon: <MenuRateLimitsIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/rate-limits`
                    : "/dashboard",
                ),
            },
            {
              id: "settings",
              label: tDashboard("navigation.settings"),
              icon: <MenuSettingsIcon />,
              onClick: () =>
                navigate(
                  entitySlug
                    ? `/dashboard/${entitySlug}/settings`
                    : "/dashboard",
                ),
              dividerAfter: true,
            },
          ]
        : [],
    [isAuthenticated, tDashboard, navigate, entitySlug],
  );

  // Build navigation items
  const menuItems: MenuItemConfig[] = useMemo(() => {
    const items: MenuItemConfig[] = [
      {
        id: "use-cases",
        label: t("navigation.useCases"),
        icon: LightBulbIcon,
        href: "/use-cases",
      },
      {
        id: "docs",
        label: t("navigation.docs"),
        icon: DocumentTextIcon,
        href: "/docs",
      },
      {
        id: "pricing",
        label: t("navigation.pricing"),
        icon: CurrencyDollarIcon,
        href: "/pricing",
      },
    ];

    if (isAuthenticated) {
      items.push({
        id: "dashboard",
        label: t("navigation.dashboard"),
        icon: Squares2X2Icon,
        href: "/dashboard",
        className:
          "!text-blue-600 dark:!text-blue-400 hover:!text-blue-700 dark:hover:!text-blue-300",
      });
    }

    items.push({
      id: "settings",
      label: t("navigation.settings"),
      icon: Cog6ToothIcon,
      href: "/settings",
    });

    return items;
  }, [t, isAuthenticated]);

  const handleLanguageChange = (newLang: string) => {
    if (isLanguageSupported(newLang)) {
      switchLanguage(newLang);
    }
  };

  // Site admin indicator - subtle gold/amber shade for both themes
  const siteAdminClassName = isSiteAdmin
    ? "bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50"
    : "";

  return (
    <AppTopBarWithFirebaseAuth
      className={siteAdminClassName}
      logo={{
        src: "/logo.png",
        appName: CONSTANTS.APP_NAME,
        onClick: () => navigate("/"),
      }}
      menuItems={menuItems}
      languages={languages}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      LinkComponent={LinkWrapper}
      AuthActionComponent={AuthAction as ComponentType<AuthActionProps>}
      onLoginClick={() => navigate("/login")}
      authenticatedMenuItems={authenticatedMenuItems}
      variant={variant === "transparent" ? "default" : "default"}
      sticky
    />
  );
}

export default TopBar;
