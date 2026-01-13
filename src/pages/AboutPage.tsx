import { useTranslation } from "react-i18next";
import { Section } from "@sudobility/components";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import LocalizedLink from "../components/layout/LocalizedLink";
import { CONSTANTS } from "../config/constants";

function AboutPage() {
  const { t } = useTranslation("about");
  const appName = CONSTANTS.APP_NAME;

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/about"
        title={t("seo.title", { appName })}
        description={t("seo.description", { appName })}
      />

      {/* Hero Section */}
      <Section
        spacing="3xl"
        background="gradient-primary"
        maxWidth="4xl"
        className="relative overflow-hidden"
      >
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
            {t("hero.title", { appName })}
          </h1>
          <p className="text-lg sm:text-xl text-theme-text-secondary max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>
      </Section>

      {/* Story Section */}
      <Section spacing="3xl" maxWidth="4xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
          {t("story.title")}
        </h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-theme-text-secondary mb-6">
            {t("story.paragraph1", { appName })}
          </p>
          <p className="text-theme-text-secondary mb-6">
            {t("story.paragraph2", { appName })}
          </p>
        </div>
      </Section>

      {/* Mission Section */}
      <Section spacing="3xl" background="surface" maxWidth="4xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
          {t("mission.title")}
        </h2>
        <p className="text-lg text-theme-text-secondary mb-8">
          {t("mission.description")}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            {t("values.title")}
          </h3>
          <ul className="space-y-3 text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>{t("values.reliability.title")}</strong>{" "}
                {t("values.reliability.description")}
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>{t("values.simplicity.title")}</strong>{" "}
                {t("values.simplicity.description")}
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>{t("values.transparency.title")}</strong>{" "}
                {t("values.transparency.description")}
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>{t("values.innovation.title")}</strong>{" "}
                {t("values.innovation.description")}
              </span>
            </li>
          </ul>
        </div>
      </Section>

      {/* CTA Section */}
      <Section spacing="3xl" maxWidth="4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-theme-text-secondary mb-8">
            {t("cta.description", { appName })}
          </p>
          <LocalizedLink
            to="/docs"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("cta.button")}
          </LocalizedLink>
        </div>
      </Section>
    </ScreenContainer>
  );
}

export default AboutPage;
