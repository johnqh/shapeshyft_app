import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { CONSTANTS, SUPPORTED_LANGUAGES } from "../../config/constants";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: object;
  /** Breadcrumb items for BreadcrumbList structured data */
  breadcrumbs?: BreadcrumbItem[];
  /** Article metadata for documentation pages */
  article?: {
    datePublished?: string;
    dateModified?: string;
    author?: string;
  };
}

const BASE_URL = `https://${import.meta.env.VITE_APP_DOMAIN || "shapeshyft.ai"}`;
const DEFAULT_TITLE = `${CONSTANTS.APP_NAME} - Transform LLM Outputs into Structured APIs`;
const DEFAULT_DESCRIPTION =
  "Build reliable AI-powered REST APIs with JSON Schema validation. Transform unstructured LLM responses into predictable, type-safe endpoints.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

// Language code to hreflang mapping
const LANGUAGE_HREFLANG_MAP: Record<string, string> = {
  en: "en",
  ar: "ar",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  pt: "pt",
  ru: "ru",
  sv: "sv",
  th: "th",
  uk: "uk",
  vi: "vi",
  zh: "zh-Hans",
  "zh-hant": "zh-Hant",
};

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
  breadcrumbs,
  article,
}: SEOProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const fullTitle = title ? `${title} | ${CONSTANTS.APP_NAME}` : DEFAULT_TITLE;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  // Generate hreflang URLs for all supported languages
  const getLocalizedUrl = (lang: string, path: string) => {
    if (lang === "en") {
      return `${BASE_URL}${path}`;
    }
    return `${BASE_URL}/${lang}${path}`;
  };

  // Build BreadcrumbList structured data
  const breadcrumbStructuredData = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${BASE_URL}${item.url}`,
        })),
      }
    : null;

  // Build Article structured data for documentation pages
  const articleStructuredData = article
    ? {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: fullTitle,
        description: description,
        author: {
          "@type": "Organization",
          name: article.author || CONSTANTS.APP_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: CONSTANTS.APP_NAME,
          url: BASE_URL,
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        mainEntityOfPage: canonicalUrl,
        inLanguage: currentLang,
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang Links for International SEO */}
      {canonical &&
        SUPPORTED_LANGUAGES.map((lang) => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={LANGUAGE_HREFLANG_MAP[lang] || lang}
            href={getLocalizedUrl(lang, canonical)}
          />
        ))}
      {canonical && (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={getLocalizedUrl("en", canonical)}
        />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={CONSTANTS.APP_NAME} />
      <meta
        property="og:locale"
        content={currentLang === "en" ? "en_US" : currentLang}
      />
      {/* Alternate locales for Open Graph */}
      {SUPPORTED_LANGUAGES.filter((lang) => lang !== currentLang).map(
        (lang) => (
          <meta
            key={lang}
            property="og:locale:alternate"
            content={lang === "en" ? "en_US" : lang}
          />
        ),
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta property="twitter:url" content={canonicalUrl} />}
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Custom Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* BreadcrumbList Structured Data */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}

      {/* Article Structured Data */}
      {articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
