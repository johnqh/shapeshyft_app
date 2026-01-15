import { useTranslation } from "react-i18next";
import {
  AppFooter,
  AppFooterForHomePage,
  type FooterLinkSection,
} from "@sudobility/building_blocks";
import {
  SystemStatusIndicator,
  useNetwork,
} from "@sudobility/devops-components";
import { CONSTANTS } from "../../config/constants";
import LocalizedLink from "./LocalizedLink";

interface FooterProps {
  variant?: "full" | "compact";
}

// Link wrapper for footer
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

function Footer({ variant = "full" }: FooterProps) {
  const { t } = useTranslation("common");
  const currentYear = String(new Date().getFullYear());
  const { isOnline } = useNetwork();

  if (variant === "compact") {
    return (
      <AppFooter
        version={CONSTANTS.APP_VERSION}
        copyrightYear={currentYear}
        companyName={CONSTANTS.COMPANY_NAME}
        companyUrl="/"
        statusIndicator={
          CONSTANTS.STATUS_PAGE_URL
            ? {
                statusPageUrl: CONSTANTS.STATUS_PAGE_URL,
                apiEndpoint: CONSTANTS.STATUS_PAGE_API_URL,
                refreshInterval: 60000,
              }
            : undefined
        }
        StatusIndicatorComponent={SystemStatusIndicator}
        links={[
          { label: t("footer.privacyPolicy"), href: "/privacy" },
          { label: t("footer.termsOfService"), href: "/terms" },
        ]}
        LinkComponent={LinkWrapper}
        isNetworkOnline={isOnline}
        sticky
      />
    );
  }

  const linkSections: FooterLinkSection[] = [
    {
      title: "Product",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Pricing", href: "/pricing" },
        { label: "API Reference", href: "/docs/api-reference" },
      ],
    },
    {
      title: "Use Cases",
      links: [
        { label: "Text Classification", href: "/docs/classification" },
        { label: "Data Extraction", href: "/docs/extraction" },
        { label: "Content Generation", href: "/docs/generation" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: t("footer.contact"), href: "/contact" },
        { label: t("footer.privacyPolicy"), href: "/privacy" },
        { label: t("footer.termsOfService"), href: "/terms" },
        { label: t("footer.sitemap"), href: "/sitemap" },
      ],
    },
  ];

  return (
    <AppFooterForHomePage
      logo={{
        src: "/logo.png",
        appName: CONSTANTS.APP_NAME,
      }}
      linkSections={linkSections}
      socialLinks={CONSTANTS.SOCIAL_LINKS}
      statusIndicator={
        CONSTANTS.STATUS_PAGE_URL
          ? {
              statusPageUrl: CONSTANTS.STATUS_PAGE_URL,
              apiEndpoint: CONSTANTS.STATUS_PAGE_API_URL,
              refreshInterval: 60000,
            }
          : undefined
      }
      StatusIndicatorComponent={SystemStatusIndicator}
      version={CONSTANTS.APP_VERSION}
      copyrightYear={currentYear}
      companyName={CONSTANTS.COMPANY_NAME}
      description="Transform LLM outputs into structured APIs. Build reliable AI-powered endpoints with schema validation."
      LinkComponent={LinkWrapper}
      isNetworkOnline={isOnline}
      gridColumns={3}
    />
  );
}

export default Footer;
