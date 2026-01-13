import { useTranslation } from "react-i18next";
import { Section } from "@sudobility/components";
import ScreenContainer from "../../components/layout/ScreenContainer";
import SEO from "../../components/seo/SEO";
import LocalizedLink from "../../components/layout/LocalizedLink";
import { CONSTANTS } from "../../config/constants";

const exampleSchema = `{
  "type": "object",
  "properties": {
    "sentiment": {
      "type": "string",
      "enum": ["positive", "negative", "neutral"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "topics": {
      "type": "array",
      "items": { "type": "string" }
    },
    "urgency": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"]
    }
  },
  "required": ["sentiment", "confidence"]
}`;

const exampleOutput = `{
  "sentiment": "negative",
  "confidence": 0.92,
  "topics": ["billing", "service-quality"],
  "urgency": "high"
}`;

function UseCasesTextPage() {
  const { t } = useTranslation("useCases");
  const appName = CONSTANTS.APP_NAME;

  const applications = [
    {
      titleKey: "text.applications.sentiment.title",
      descriptionKey: "text.applications.sentiment.description",
      examplesKey: "text.applications.sentiment.examples",
    },
    {
      titleKey: "text.applications.intent.title",
      descriptionKey: "text.applications.intent.description",
      examplesKey: "text.applications.intent.examples",
    },
    {
      titleKey: "text.applications.topic.title",
      descriptionKey: "text.applications.topic.description",
      examplesKey: "text.applications.topic.examples",
    },
    {
      titleKey: "text.applications.moderation.title",
      descriptionKey: "text.applications.moderation.description",
      examplesKey: "text.applications.moderation.examples",
    },
  ];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases/text"
        title={t("seo.text.title", { appName })}
        description={t("seo.text.description")}
        keywords={t("seo.text.keywords")}
      />

      {/* Hero Section */}
      <Section
        spacing="3xl"
        background="gradient-tertiary"
        maxWidth="4xl"
        className="relative overflow-hidden"
      >
        <LocalizedLink
          to="/use-cases"
          className="inline-flex items-center text-sm text-theme-text-secondary hover:text-theme-text-primary mb-6"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("nav.allUseCases")}
        </LocalizedLink>
        <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
          {t("text.hero.title")}
        </h1>
        <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl">
          {t("text.hero.subtitle", { appName })}
        </p>
      </Section>

      {/* How It Works */}
      <Section spacing="3xl" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("text.howItWorks.title")}
        </h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                1
              </span>
            </div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t("text.howItWorks.step1.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("text.howItWorks.step1.description")}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                2
              </span>
            </div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t("text.howItWorks.step2.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("text.howItWorks.step2.description", { appName })}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                3
              </span>
            </div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t("text.howItWorks.step3.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("text.howItWorks.step3.description")}
            </p>
          </div>
        </div>
      </Section>

      {/* Example Schema */}
      <Section spacing="3xl" background="surface" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("text.example.title")}
        </h2>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t("text.example.schemaTitle")}
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>{exampleSchema}</code>
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t("text.example.outputTitle")}
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>{exampleOutput}</code>
            </pre>
            <p className="text-sm text-theme-text-secondary mt-4">
              {t("text.example.note")}
            </p>
          </div>
        </div>
      </Section>

      {/* Applications */}
      <Section spacing="3xl" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("text.applications.title")}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {applications.map((app) => {
            const examples = t(app.examplesKey, {
              returnObjects: true,
            }) as string[];
            return (
              <div
                key={app.titleKey}
                className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border"
              >
                <h3 className="text-xl font-semibold text-theme-text-primary mb-3">
                  {t(app.titleKey)}
                </h3>
                <p className="text-theme-text-secondary mb-4">
                  {t(app.descriptionKey)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(examples) &&
                    examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* CTA Section */}
      <Section spacing="3xl" background="surface" maxWidth="4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
            {t("text.cta.title")}
          </h2>
          <p className="text-lg text-theme-text-secondary mb-8">
            {t("text.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LocalizedLink
              to="/docs"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("nav.readDocs")}
            </LocalizedLink>
            <LocalizedLink
              to="/use-cases"
              className="inline-block px-8 py-3 bg-theme-bg-primary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
            >
              {t("nav.exploreOther")}
            </LocalizedLink>
          </div>
        </div>
      </Section>
    </ScreenContainer>
  );
}

export default UseCasesTextPage;
