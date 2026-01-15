import { useTranslation } from "react-i18next";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import { CONSTANTS } from "../config/constants";
import { AppTextPage } from "@sudobility/building_blocks";
import type { TextPageContent } from "@sudobility/building_blocks";

function TermsPage() {
  const { t } = useTranslation("terms");
  const appName = CONSTANTS.APP_NAME;

  // Build the text content from i18n translations
  const text: TextPageContent = {
    title: t("title"),
    lastUpdated: t("lastUpdated", { date: "{{date}}" }),
    sections: [
      // Section 1: Acceptance of Terms
      {
        title: t("sections.acceptance.title"),
        content: t("sections.acceptance.content", { appName }),
      },
      // Section 2: Description of Service
      {
        title: t("sections.service.title"),
        content: t("sections.service.content", { appName }),
      },
      // Section 3: User Accounts
      {
        title: t("sections.accounts.title"),
        description: t("sections.accounts.description"),
        items: t("sections.accounts.items", {
          returnObjects: true,
        }) as string[],
      },
      // Section 4: Acceptable Use
      {
        title: t("sections.acceptableUse.title"),
        description: t("sections.acceptableUse.description", { appName }),
        items: t("sections.acceptableUse.items", {
          returnObjects: true,
        }) as string[],
      },
      // Section 5: API Usage
      {
        title: t("sections.apiUsage.title"),
        content: t("sections.apiUsage.content"),
      },
      // Section 6: Intellectual Property
      {
        title: t("sections.ip.title"),
        content: t("sections.ip.content", { appName }),
      },
      // Section 7: Limitation of Liability
      {
        title: t("sections.liability.title"),
        content: t("sections.liability.content", { appName }),
      },
      // Section 8: Termination
      {
        title: t("sections.termination.title"),
        content: t("sections.termination.content"),
      },
      // Section 9: Changes to Terms
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
      },
    },
  };

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/terms"
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

export default TermsPage;
