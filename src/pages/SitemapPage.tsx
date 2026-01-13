import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import LocalizedLink from "../components/layout/LocalizedLink";
import {
  SUPPORTED_LANGUAGES,
  CONSTANTS,
  type SupportedLanguage,
} from "../config/constants";
import { AppSitemapPage } from "@sudobility/building_blocks";
import type {
  SitemapPageText,
  SitemapSection,
  LanguageOption,
  QuickLink,
  LinkComponentProps,
} from "@sudobility/building_blocks";

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

// Link wrapper component that integrates with AppSitemapPage
const LinkWrapper: React.FC<LinkComponentProps & { language?: string }> = ({
  href,
  className,
  children,
  language,
}) => {
  if (language) {
    return (
      <LocalizedLink to={href} className={className} language={language as SupportedLanguage}>
        {children}
      </LocalizedLink>
    );
  }
  return (
    <LocalizedLink to={href} className={className}>
      {children}
    </LocalizedLink>
  );
};

function SitemapPage() {
  const { t } = useTranslation("sitemap");
  const appName = CONSTANTS.APP_NAME;

  // Sort languages by their native name
  const languageOptions: LanguageOption[] = useMemo(() => {
    return [...SUPPORTED_LANGUAGES]
      .map((code) => ({
        code,
        name: LANGUAGE_INFO[code]?.name || code.toUpperCase(),
        flag: LANGUAGE_INFO[code]?.flag || "🌐",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const sections: SitemapSection[] = [
    {
      title: t("sections.main", "Main Pages"),
      icon: "home",
      links: [
        {
          path: "/",
          label: t("links.home", "Home"),
          description: t("descriptions.home", "Landing page"),
        },
        {
          path: "/pricing",
          label: t("links.pricing", "Pricing"),
          description: t("descriptions.pricing", "Subscription plans"),
        },
        {
          path: "/settings",
          label: t("links.settings", "Settings"),
          description: t("descriptions.settings", "App settings"),
        },
      ],
    },
    {
      title: t("sections.documentation", "Documentation"),
      icon: "document",
      links: [
        {
          path: "/docs",
          label: t("links.docs", "Documentation"),
          description: t("descriptions.docs", {
            defaultValue: `Learn how to use ${appName}`,
            appName,
          }),
        },
        {
          path: "/docs/getting-started",
          label: t("links.gettingStarted", "Getting Started"),
          description: t("descriptions.gettingStarted", "Quick start guide"),
        },
        {
          path: "/docs/concepts",
          label: t("links.concepts", "Core Concepts"),
          description: t("descriptions.concepts", "Understand key concepts"),
        },
        {
          path: "/docs/api-reference",
          label: t("links.apiReference", "API Reference"),
          description: t(
            "descriptions.apiReference",
            "Complete API documentation",
          ),
        },
      ],
    },
    {
      title: t("sections.useCases", "Use Cases"),
      icon: "document",
      links: [
        {
          path: "/use-cases",
          label: t("links.useCases", "Use Cases"),
          description: t("descriptions.useCases", "Explore possibilities"),
        },
        {
          path: "/use-cases/text",
          label: t("links.textClassification", "Text Classification"),
          description: t(
            "descriptions.textClassification",
            "Sentiment, intent, topic analysis",
          ),
        },
        {
          path: "/use-cases/data",
          label: t("links.dataExtraction", "Data Extraction"),
          description: t(
            "descriptions.dataExtraction",
            "Extract structured data",
          ),
        },
        {
          path: "/use-cases/content",
          label: t("links.contentGeneration", "Content Generation"),
          description: t(
            "descriptions.contentGeneration",
            "Generate structured content",
          ),
        },
      ],
    },
    {
      title: t("sections.company", "Company"),
      icon: "home",
      links: [
        {
          path: "/about",
          label: t("links.about", "About"),
          description: t("descriptions.about", {
            defaultValue: `About ${appName}`,
            appName,
          }),
        },
        {
          path: "/contact",
          label: t("links.contact", "Contact"),
          description: t("descriptions.contact", "Get in touch"),
        },
      ],
    },
    {
      title: t("sections.legal", "Legal"),
      icon: "document",
      links: [
        {
          path: "/privacy",
          label: t("links.privacy", "Privacy Policy"),
          description: t("descriptions.privacy", "Privacy and data protection"),
        },
        {
          path: "/terms",
          label: t("links.terms", "Terms of Service"),
          description: t("descriptions.terms", "Terms and conditions"),
        },
      ],
    },
  ];

  // Build quick links
  const quickLinks: QuickLink[] = [
    {
      path: "/docs",
      label: t("quickLinks.viewDocs", "View Documentation"),
      variant: "primary",
      icon: "document",
    },
    {
      path: "/pricing",
      label: t("quickLinks.viewPricing", "View Pricing"),
      variant: "secondary",
    },
    {
      path: "/use-cases",
      label: t("quickLinks.exploreUseCases", "Explore Use Cases"),
      variant: "outline",
      icon: "document",
    },
  ];

  // Build text content
  const text: SitemapPageText = {
    title: t("title", "Sitemap"),
    subtitle: t("subtitle", {
      defaultValue: `Explore all pages and features available on ${appName}`,
      appName,
    }),
    languagesSectionTitle: t("sections.languages", "Languages"),
    languagesDescription: t("languageDescription", {
      defaultValue: `${appName} is available in multiple languages. Select your preferred language:`,
      appName,
    }),
    quickLinksTitle: t("quickLinks.title", "Quick Links"),
  };

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        title={t("seo.title", {
          defaultValue: `Sitemap - ${appName}`,
          appName,
        })}
        description={t("seo.description", {
          defaultValue: `Navigate all pages and features available on ${appName}`,
          appName,
        })}
        canonical="/sitemap"
        keywords={`sitemap, navigation, ${appName} pages`}
      />

      <AppSitemapPage
        text={text}
        sections={sections}
        languages={languageOptions}
        quickLinks={quickLinks}
        LinkComponent={LinkWrapper}
      />
    </ScreenContainer>
  );
}

export default SitemapPage;
