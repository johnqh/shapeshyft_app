import { useTranslation } from "react-i18next";
import ScreenContainer from "../components/layout/ScreenContainer";
import SEO from "../components/seo/SEO";
import { CONSTANTS } from "../config/constants";

function TermsPage() {
  const { t } = useTranslation("terms");
  const appName = CONSTANTS.APP_NAME;

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/terms"
        title={t("seo.title", { appName })}
        description={t("seo.description", { appName })}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
            {t("title")}
          </h1>
          <p className="text-theme-text-secondary mb-8">
            {t("lastUpdated", { date: new Date().toLocaleDateString() })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.acceptance.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.acceptance.content", { appName })}
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.service.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.service.content", { appName })}
              </p>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.accounts.title")}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t("sections.accounts.description")}
              </p>
              <ul className="list-disc list-inside text-theme-text-secondary space-y-2">
                {(
                  t("sections.accounts.items", {
                    returnObjects: true,
                  }) as string[]
                ).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.acceptableUse.title")}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t("sections.acceptableUse.description", { appName })}
              </p>
              <ul className="list-disc list-inside text-theme-text-secondary space-y-2">
                {(
                  t("sections.acceptableUse.items", {
                    returnObjects: true,
                  }) as string[]
                ).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* API Usage */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.apiUsage.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.apiUsage.content")}
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.ip.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.ip.content", { appName })}
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.liability.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.liability.content", { appName })}
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.termination.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.termination.content")}
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.changes.title")}
              </h2>
              <p className="text-theme-text-secondary">
                {t("sections.changes.content")}
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
                {t("sections.contact.title")}
              </h2>
              <p className="text-theme-text-secondary mb-4">
                {t("sections.contact.description")}
              </p>
              <div className="bg-theme-bg-secondary p-4 rounded-lg">
                <p className="text-theme-text-primary">
                  {t("sections.contact.email")}{" "}
                  <a
                    href={`mailto:${CONSTANTS.SUPPORT_EMAIL}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {CONSTANTS.SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </ScreenContainer>
  );
}

export default TermsPage;
