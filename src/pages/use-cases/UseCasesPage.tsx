import ScreenContainer from '../../components/layout/ScreenContainer';
import SEO from '../../components/seo/SEO';
import LocalizedLink from '../../components/layout/LocalizedLink';
import { CONSTANTS } from '../../config/constants';

// Icons for use case cards
const TextClassificationIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const DataExtractionIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
  </svg>
);

const ContentGenerationIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const useCases = [
  {
    id: 'text',
    title: 'Text Classification',
    description: 'Automatically categorize text into predefined labels with high accuracy. Perfect for sentiment analysis, topic detection, intent recognition, and content moderation.',
    icon: TextClassificationIcon,
    href: '/use-cases/text',
    examples: ['Sentiment Analysis', 'Topic Detection', 'Intent Recognition', 'Content Moderation'],
  },
  {
    id: 'data',
    title: 'Data Extraction',
    description: 'Extract structured information from unstructured text documents. Transform invoices, contracts, emails, and forms into clean, usable data.',
    icon: DataExtractionIcon,
    href: '/use-cases/data',
    examples: ['Invoice Processing', 'Resume Parsing', 'Contract Analysis', 'Email Extraction'],
  },
  {
    id: 'content',
    title: 'Content Generation',
    description: 'Generate high-quality, structured content programmatically. Create product descriptions, marketing copy, documentation, and more with consistent formatting.',
    icon: ContentGenerationIcon,
    href: '/use-cases/content',
    examples: ['Product Descriptions', 'Marketing Copy', 'Documentation', 'Email Templates'],
  },
];

function UseCasesPage() {
  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases"
        title={`Use Cases - ${CONSTANTS.APP_NAME}`}
        description={`Discover how ${CONSTANTS.APP_NAME} transforms LLM outputs into structured, reliable data. From text classification to data extraction and content generation.`}
        keywords="LLM use cases, structured output, text classification, data extraction, content generation, AI applications"
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
              Build Anything with Structured LLM Output
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl mx-auto">
              {CONSTANTS.APP_NAME} transforms unpredictable AI responses into reliable, schema-validated data.
              Here are some common use cases—but your imagination is the only limit.
            </p>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase) => (
                <LocalizedLink
                  key={useCase.id}
                  to={useCase.href}
                  className="group bg-theme-bg-secondary rounded-2xl p-8 border border-theme-border hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all"
                >
                  <div className="text-blue-600 dark:text-blue-400 mb-4">
                    <useCase.icon />
                  </div>
                  <h2 className="text-2xl font-bold text-theme-text-primary mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {useCase.title}
                  </h2>
                  <p className="text-theme-text-secondary mb-4">
                    {useCase.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </section>

        {/* Unlimited Possibilities Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              Your Use Case, Your Rules
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              While we've highlighted common patterns, {CONSTANTS.APP_NAME} is designed to be completely flexible.
              Define any JSON schema, connect any LLM provider, and build exactly what you need. Whether you're
              creating a chatbot, analyzing research papers, automating workflows, or building something entirely
              new—if you can describe it in a schema, {CONSTANTS.APP_NAME} can deliver it.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[
                { title: 'Custom Schemas', description: 'Define any data structure you need' },
                { title: 'Any LLM Provider', description: 'OpenAI, Anthropic, Google & more' },
                { title: 'Validated Output', description: 'Guaranteed schema compliance' },
                { title: 'API-First', description: 'Easy integration with any stack' },
              ].map((feature) => (
                <div key={feature.title} className="bg-theme-bg-primary rounded-xl p-6 border border-theme-border">
                  <h3 className="font-semibold text-theme-text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-theme-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              Ready to Build?
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              Start with our free tier and see how {CONSTANTS.APP_NAME} can transform your AI integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                to="/docs"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Read the Docs
              </LocalizedLink>
              <LocalizedLink
                to="/pricing"
                className="inline-block px-8 py-3 bg-theme-bg-secondary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
              >
                View Pricing
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
}

export default UseCasesPage;
