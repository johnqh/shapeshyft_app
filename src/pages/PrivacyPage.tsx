import { useTranslation } from "react-i18next";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import { CONSTANTS } from "../config/constants";
import { AppTextPage } from "@sudobility/building_blocks";
import type { TextPageContent } from "@sudobility/building_blocks";

function PrivacyPage() {
  const { t } = useTranslation("privacy");
  const appName = CONSTANTS.APP_NAME;

  // Build the text content from i18n translations
  const text: TextPageContent = {
    title: t("title"),
    lastUpdated: t("lastUpdated", { date: "{{date}}" }),
    sections: [
      // Introduction
      {
        title: t("sections.introduction.title"),
        content: t("sections.introduction.content", { appName }),
      },
      // Information We Collect
      {
        title: t("sections.collection.title"),
        subsections: [
          {
            title: "Information You Provide",
            items: t("sections.collection.items", { returnObjects: true }) as string[],
          },
          {
            title: "Information Collected Automatically",
            items: [
              "Device and browser information",
              "IP address and location data",
              "Usage patterns and analytics",
            ],
          },
        ],
      },
      // How We Use
      {
        title: t("sections.usage.title"),
        description: t("sections.usage.description"),
        items: t("sections.usage.items", { returnObjects: true }) as string[],
      },
      // Information Sharing
      {
        title: "Information Sharing",
        description: "We may share your information in the following circumstances:",
        items: [
          "With service providers who assist in our operations",
          "When required by law or legal process",
          "To protect our rights and safety",
          "With your consent",
        ],
      },
      // Data Security
      {
        title: t("sections.security.title"),
        description: "We implement appropriate security measures:",
        items: [
          "Encryption of data in transit and at rest",
          "Regular security assessments",
          "Access controls and authentication",
          "Secure API key management",
        ],
      },
      // Data Retention
      {
        title: t("sections.retention.title"),
        content: t("sections.retention.content"),
      },
      // Privacy Rights
      {
        title: t("sections.rights.title"),
        description: t("sections.rights.description"),
        items: t("sections.rights.items", { returnObjects: true }) as string[],
      },
      // International Transfers
      {
        title: "International Data Transfers",
        content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.",
      },
      // Children's Privacy
      {
        title: "Children's Privacy",
        content: "Our service is not intended for children under 13. We do not knowingly collect information from children under 13.",
      },
      // Cookies
      {
        title: t("sections.cookies.title"),
        content: t("sections.cookies.content"),
      },
      // Changes
      {
        title: t("sections.changes.title"),
        content: t("sections.changes.content"),
      },
    ],
    contact: {
      title: t("sections.contact.title"),
      description: t("sections.contact.description"),
      info: {
        emailLabel: t("sections.contact.email"),
        email: CONSTANTS.SUPPORT_EMAIL,
        websiteLabel: "Website:",
        websiteUrl: `https://${CONSTANTS.APP_DOMAIN}`,
        dpoLabel: "Data Protection Officer:",
        dpoEmail: CONSTANTS.SUPPORT_EMAIL,
      },
      gdprNotice: {
        title: "GDPR Rights",
        content: "If you are in the European Union, you have additional rights under GDPR including the right to lodge a complaint with a supervisory authority.",
      },
    },
  };

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/privacy"
        title={t("seo.title", { appName })}
        description={t("seo.description", { appName })}
      />

      <AppTextPage
        text={text}
        lastUpdatedDate={new Date().toLocaleDateString()}
      />
    </ScreenContainer>
  );
}

export default PrivacyPage;
