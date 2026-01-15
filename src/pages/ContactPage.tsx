import { useTranslation } from "react-i18next";
import { Section } from "@sudobility/components";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import { CONSTANTS } from "../config/constants";

function ContactPage() {
  const { t } = useTranslation("contact");
  const appName = CONSTANTS.APP_NAME;

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/contact"
        title={t("seo.title", { appName })}
        description={t("seo.description", { appName })}
      />

      <Section spacing="2xl" maxWidth="4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-theme-text-secondary max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="bg-theme-bg-secondary rounded-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-theme-text-primary">
              {t("email.title")}
            </h2>
          </div>

          <p className="text-lg text-theme-text-secondary mb-6">
            {t("email.description")}
          </p>

          <div className="bg-theme-bg-primary rounded-lg p-6 border border-theme-border">
            <p className="text-theme-text-primary">
              <span className="font-medium">{t("email.support")}:</span>{" "}
              <a
                href={`mailto:${CONSTANTS.SUPPORT_EMAIL}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {CONSTANTS.SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {t("responseTime.title")}
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            {t("responseTime.description")}
          </p>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-theme-bg-secondary rounded-lg p-6">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
              {t("support.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("support.description")}
            </p>
          </div>

          <div className="bg-theme-bg-secondary rounded-lg p-6">
            <svg
              className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
              {t("docs.title")}
            </h3>
            <p className="text-theme-text-secondary">{t("docs.description")}</p>
          </div>
        </div>
      </Section>
    </ScreenContainer>
  );
}

export default ContactPage;
