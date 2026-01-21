import { useTranslation } from "react-i18next";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import { CONSTANTS } from "../config/constants";
import { AppTextPage } from "@sudobility/building_blocks";
import type { TextPageContent } from "@sudobility/building_blocks";

function CookiesPage() {
  const { t } = useTranslation("cookies");
  const appName = CONSTANTS.APP_NAME;

  const text: TextPageContent = {
    title: t("title", "Cookie Policy"),
    lastUpdated: t("lastUpdated", {
      date: "{{date}}",
      defaultValue: "Last updated: {{date}}",
    }),
    sections: [
      {
        title: t("sections.whatAreCookies.title", "What Are Cookies"),
        content: t("sections.whatAreCookies.content", {
          defaultValue:
            "Cookies are small text files that websites store on your device to remember information about your visit. They are widely used to make websites work efficiently and provide information to site owners.",
        }),
      },
      {
        title: t("sections.ourApproach.title", "Our Cookie-Free Approach"),
        description: t("sections.ourApproach.description", {
          defaultValue: `${appName} is designed with privacy in mind. We minimize the use of cookies and tracking technologies:`,
          appName,
        }),
        items: t("sections.ourApproach.items", {
          returnObjects: true,
          defaultValue: [
            "No third-party advertising cookies",
            "No cross-site tracking",
            "Minimal use of essential cookies for functionality",
            "Local storage for user preferences",
          ],
        }) as string[],
      },
      {
        title: t("sections.whatWeUse.title", "What We Use"),
        subsections: [
          {
            title: t("sections.whatWeUse.localStorage.title", "Local Storage"),
            items: t("sections.whatWeUse.localStorage.items", {
              returnObjects: true,
              defaultValue: [
                "Theme preference (light/dark mode)",
                "Language preference",
                "UI settings and preferences",
              ],
            }) as string[],
          },
          {
            title: t(
              "sections.whatWeUse.sessionStorage.title",
              "Session Storage",
            ),
            items: t("sections.whatWeUse.sessionStorage.items", {
              returnObjects: true,
              defaultValue: [
                "Temporary session data",
                "Form data during your visit",
              ],
            }) as string[],
          },
        ],
      },
      {
        title: t("sections.thirdParty.title", "Third-Party Services"),
        description: t("sections.thirdParty.description", {
          defaultValue:
            "We use essential third-party services that may use their own cookies:",
        }),
        items: t("sections.thirdParty.items", {
          returnObjects: true,
          defaultValue: [
            "Authentication services for secure login",
            "Payment processors for subscription handling",
            "Analytics (anonymized, no personal tracking)",
          ],
        }) as string[],
      },
      {
        title: t("sections.yourControl.title", "Your Control"),
        description: t("sections.yourControl.description", {
          defaultValue: "You have full control over cookies and local storage:",
        }),
        items: t("sections.yourControl.items", {
          returnObjects: true,
          defaultValue: [
            "Clear local storage through your browser settings",
            "Use private/incognito browsing mode",
            "Disable cookies in your browser (may affect functionality)",
            "Request data deletion through our support",
          ],
        }) as string[],
      },
      {
        title: t("sections.changes.title", "Changes to This Policy"),
        content: t("sections.changes.content", {
          defaultValue:
            "We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.",
        }),
      },
    ],
    contact: {
      title: t("sections.contact.title", "Questions"),
      description: t(
        "sections.contact.description",
        "If you have questions about our cookie practices, please contact us:",
      ),
      info: {
        emailLabel: "Email:",
        email: CONSTANTS.SUPPORT_EMAIL,
        websiteLabel: "Website:",
        websiteUrl: `https://${CONSTANTS.APP_DOMAIN}`,
      },
    },
  };

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/cookies"
        title={t("seo.title", {
          defaultValue: `Cookie Policy - ${appName}`,
          appName,
        })}
        description={t("seo.description", {
          defaultValue: `Cookie policy for ${appName}. Learn about our privacy-focused approach.`,
          appName,
        })}
        keywords="cookie policy, ShapeShyft cookies, privacy, tracking, local storage, browser cookies"
      />

      <AppTextPage
        text={text}
        lastUpdatedDate={new Date().toLocaleDateString()}
      />
    </ScreenContainer>
  );
}

export default CookiesPage;
