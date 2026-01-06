import ScreenContainer from '../../components/layout/ScreenContainer';
import SEO from '../../components/seo/SEO';
import LocalizedLink from '../../components/layout/LocalizedLink';

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

const applications = [
  {
    title: 'Product Descriptions',
    description: 'Generate consistent, compelling product copy at scale. Define structure for features, benefits, specs, and SEO keywords—then generate thousands of descriptions programmatically.',
    examples: ['E-commerce listings', 'Catalog pages', 'Marketplace listings', 'Product specs'],
  },
  {
    title: 'Marketing Copy',
    description: 'Create structured marketing content with consistent formatting. Headlines, body copy, CTAs, and metadata all conform to your brand guidelines.',
    examples: ['Ad copy', 'Landing pages', 'Email campaigns', 'Social media posts'],
  },
  {
    title: 'Documentation',
    description: 'Generate technical documentation with consistent structure. API docs, user guides, and help articles all follow your defined templates.',
    examples: ['API documentation', 'User guides', 'FAQ generation', 'Release notes'],
  },
  {
    title: 'Personalized Content',
    description: 'Create individualized content at scale. Generate personalized emails, recommendations, and reports based on user data while maintaining consistent structure.',
    examples: ['Personalized emails', 'Custom reports', 'Recommendations', 'Notifications'],
  },
];

function UseCasesContentPage() {
  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases/content"
        title="Content Generation - Use Cases - ShapeShyft"
        description="Generate structured content with LLMs. Product descriptions, marketing copy, documentation, and personalized content with guaranteed formatting."
        keywords="content generation, AI copywriting, product descriptions, marketing automation, structured content, LLM content"
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20" />
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
              Content Generation
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl">
              Generate high-quality content programmatically with guaranteed structure.
              Define your content format once, then generate at scale with perfect consistency.
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Define Your Format</h3>
                <p className="text-theme-text-secondary">
                  Specify content structure—headlines, body sections, bullet points, metadata, and length constraints.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Provide Context</h3>
                <p className="text-theme-text-secondary">
                  Send product data, topics, or source material. The LLM generates content tailored to your input.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Get Formatted Content</h3>
                <p className="text-theme-text-secondary">
                  Receive perfectly structured content ready for your CMS, database, or application.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Schema */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Example: Product Description Generation
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Your Content Schema</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96">
                  <code>{exampleSchema}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Generated Content</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96 whitespace-pre-wrap">
                  <code>{exampleOutput}</code>
                </pre>
                <p className="text-sm text-theme-text-secondary mt-4">
                  Every piece of content matches your schema constraints—length limits, required fields, and array bounds.
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
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
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

        {/* Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Why ShapeShyft for Content Generation?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📏</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Length Control</h3>
                <p className="text-theme-text-secondary">
                  Set character limits for headlines, descriptions, and body content. Never exceed platform limits.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Consistent Structure</h3>
                <p className="text-theme-text-secondary">
                  Every piece of content follows your defined format. Perfect for templates and bulk generation.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Scale Instantly</h3>
                <p className="text-theme-text-secondary">
                  Generate hundreds of content pieces with a single endpoint. Same quality, fraction of the time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              Start Generating Content Today
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              Create your first content generation endpoint in minutes. Scale from one to thousands instantly.
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
                className="inline-block px-8 py-3 bg-theme-bg-secondary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
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

export default UseCasesContentPage;
