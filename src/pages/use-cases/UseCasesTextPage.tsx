import ScreenContainer from '../../components/layout/ScreenContainer';
import SEO from '../../components/seo/SEO';
import LocalizedLink from '../../components/layout/LocalizedLink';
import { CONSTANTS } from '../../config/constants';

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

const applications = [
  {
    title: 'Sentiment Analysis',
    description: 'Analyze customer feedback, reviews, and social media mentions to understand public perception. Get consistent sentiment scores that integrate directly into your analytics pipeline.',
    examples: ['Product reviews', 'Customer support tickets', 'Social media monitoring', 'Survey responses'],
  },
  {
    title: 'Intent Recognition',
    description: 'Understand what users want from their messages. Route inquiries to the right department, trigger automated workflows, or provide instant responses based on detected intent.',
    examples: ['Chatbot routing', 'Email categorization', 'Voice assistant commands', 'Support ticket triage'],
  },
  {
    title: 'Topic Detection',
    description: 'Automatically tag content with relevant topics and categories. Perfect for content management, search optimization, and organizing large document collections.',
    examples: ['News categorization', 'Document tagging', 'Research paper classification', 'Content recommendation'],
  },
  {
    title: 'Content Moderation',
    description: 'Flag inappropriate content, detect spam, and identify policy violations. Get structured classifications that enable automated moderation workflows.',
    examples: ['User-generated content', 'Comment sections', 'Forum posts', 'Product listings'],
  },
];

function UseCasesTextPage() {
  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases/text"
        title={`Text Classification - Use Cases - ${CONSTANTS.APP_NAME}`}
        description="Automatically categorize text with LLMs and get structured, validated output. Sentiment analysis, intent recognition, topic detection, and content moderation."
        keywords="text classification, sentiment analysis, intent recognition, topic detection, content moderation, NLP, LLM classification"
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20" />
          <div className="relative max-w-4xl mx-auto">
            <LocalizedLink
              to="/use-cases"
              className="inline-flex items-center text-sm text-theme-text-secondary hover:text-theme-text-primary mb-6"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Use Cases
            </LocalizedLink>
            <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
              Text Classification
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl">
              Transform unstructured text into actionable categories. Define your classification schema,
              and {CONSTANTS.APP_NAME} ensures every response matches your exact requirements.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              How It Works
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Define Your Schema</h3>
                <p className="text-theme-text-secondary">
                  Specify exactly what classifications you need—categories, confidence scores, multiple labels, or nested structures.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Send Your Text</h3>
                <p className="text-theme-text-secondary">
                  Call the {CONSTANTS.APP_NAME} API with your text. We route it to your chosen LLM with optimized prompting.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Get Validated Output</h3>
                <p className="text-theme-text-secondary">
                  Receive JSON that matches your schema exactly—guaranteed. No parsing errors, no unexpected formats.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Schema */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Example: Customer Feedback Classification
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Your JSON Schema</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                  <code>{exampleSchema}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Guaranteed Output</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                  <code>{exampleOutput}</code>
                </pre>
                <p className="text-sm text-theme-text-secondary mt-4">
                  Every response is validated against your schema before being returned. Invalid outputs are automatically retried.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Applications
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {applications.map((app) => (
                <div key={app.title} className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border">
                  <h3 className="text-xl font-semibold text-theme-text-primary mb-3">{app.title}</h3>
                  <p className="text-theme-text-secondary mb-4">{app.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {app.examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              Start Classifying Text Today
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              Create your first text classification endpoint in minutes. No ML expertise required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                to="/docs"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Read the Docs
              </LocalizedLink>
              <LocalizedLink
                to="/use-cases"
                className="inline-block px-8 py-3 bg-theme-bg-primary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
              >
                Explore Other Use Cases
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
}

export default UseCasesTextPage;
