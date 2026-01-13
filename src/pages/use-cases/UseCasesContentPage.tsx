import { useTranslation } from "react-i18next";
import { Section } from "@sudobility/components";
import ScreenContainer from "../../components/layout/ScreenContainer";
import SEO from "../../components/seo/SEO";
import LocalizedLink from "../../components/layout/LocalizedLink";
import { CONSTANTS } from "../../config/constants";

const exampleSchema = `{
  "type": "object",
  "properties": {
    "headline": {
      "type": "string",
      "maxLength": 60
    },
    "tagline": {
      "type": "string",
      "maxLength": 120
    },
    "description": {
      "type": "string",
      "minLength": 100,
      "maxLength": 500
    },
    "keyFeatures": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 3,
      "maxItems": 5
    },
    "callToAction": {
      "type": "string",
      "maxLength": 30
    },
    "seoKeywords": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["headline", "description", "keyFeatures"]
}`;

const exampleOutput = `{
  "headline": "Premium Wireless Earbuds",
  "tagline": "Immersive sound meets all-day comfort",
  "description": "Experience crystal-clear audio with our
    premium wireless earbuds. Featuring advanced noise
    cancellation, 8-hour battery life, and an ergonomic
    design that stays comfortable during extended
    listening sessions. IPX5 water resistance makes
    them perfect for workouts.",
  "keyFeatures": [
    "Active noise cancellation",
    "8-hour battery life",
    "IPX5 water resistant",
    "Touch controls"
  ],
  "callToAction": "Shop Now",
  "seoKeywords": ["wireless earbuds", "noise cancelling"]
}`;

function UseCasesContentPage() {
  const { t } = useTranslation("useCases");
  const appName = CONSTANTS.APP_NAME;

  const applications = [
    {
      titleKey: "content.applications.productDescriptions.title",
      descriptionKey: "content.applications.productDescriptions.description",
      examplesKey: "content.applications.productDescriptions.examples",
    },
    {
      titleKey: "content.applications.marketingCopy.title",
      descriptionKey: "content.applications.marketingCopy.description",
      examplesKey: "content.applications.marketingCopy.examples",
    },
    {
      titleKey: "content.applications.documentation.title",
      descriptionKey: "content.applications.documentation.description",
      examplesKey: "content.applications.documentation.examples",
    },
    {
      titleKey: "content.applications.personalizedContent.title",
      descriptionKey: "content.applications.personalizedContent.description",
      examplesKey: "content.applications.personalizedContent.examples",
    },
  ];

  const benefits = [
    {
      emoji: "📏",
      titleKey: "content.benefits.lengthControl.title",
      descriptionKey: "content.benefits.lengthControl.description",
    },
    {
      emoji: "🎨",
      titleKey: "content.benefits.consistentStructure.title",
      descriptionKey: "content.benefits.consistentStructure.description",
    },
    {
      emoji: "🚀",
      titleKey: "content.benefits.scaleInstantly.title",
      descriptionKey: "content.benefits.scaleInstantly.description",
    },
  ];

  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases/content"
        title={t("seo.content.title", { appName })}
        description={t("seo.content.description")}
        keywords={t("seo.content.keywords")}
      />

      {/* Hero Section */}
      <Section
        spacing="3xl"
        background="gradient"
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
          {t("content.hero.title")}
        </h1>
        <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl">
          {t("content.hero.subtitle")}
        </p>
      </Section>

      {/* How It Works */}
      <Section spacing="3xl" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("content.howItWorks.title")}
        </h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                1
              </span>
            </div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t("content.howItWorks.step1.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("content.howItWorks.step1.description")}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                2
              </span>
            </div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t("content.howItWorks.step2.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("content.howItWorks.step2.description")}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                3
              </span>
            </div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
              {t("content.howItWorks.step3.title")}
            </h3>
            <p className="text-theme-text-secondary">
              {t("content.howItWorks.step3.description")}
            </p>
          </div>
        </div>
      </Section>

      {/* Example Schema */}
      <Section spacing="3xl" background="surface" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("content.example.title")}
        </h2>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t("content.example.schemaTitle")}
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96">
              <code>{exampleSchema}</code>
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t("content.example.outputTitle")}
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96 whitespace-pre-wrap">
              <code>{exampleOutput}</code>
            </pre>
            <p className="text-sm text-theme-text-secondary mt-4">
              {t("content.example.note")}
            </p>
          </div>
        </div>
      </Section>

      {/* Applications */}
      <Section spacing="3xl" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("content.applications.title")}
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
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
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

      {/* Benefits */}
      <Section spacing="3xl" background="surface" maxWidth="6xl">
        <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
          {t("content.benefits.title", { appName })}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.titleKey} className="text-center">
              <div className="text-4xl mb-4">{benefit.emoji}</div>
              <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
                {t(benefit.titleKey)}
              </h3>
              <p className="text-theme-text-secondary">
                {t(benefit.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section spacing="3xl" maxWidth="4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
            {t("content.cta.title")}
          </h2>
          <p className="text-lg text-theme-text-secondary mb-8">
            {t("content.cta.subtitle")}
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
              className="inline-block px-8 py-3 bg-theme-bg-secondary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
            >
              {t("nav.exploreOther")}
            </LocalizedLink>
          </div>
        </div>
      </Section>
    </ScreenContainer>
  );
}

export default UseCasesContentPage;
