import { Helmet } from 'react-helmet-async';

interface AISearchOptimizationProps {
  pageType: 'landing' | 'product' | 'documentation' | 'guide' | 'feature' | 'pricing';
  pageName: string;
  description: string;
  keywords?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  howTo?: {
    name: string;
    description: string;
    steps: Array<{
      name: string;
      text: string;
    }>;
  };
  features?: string[];
  useCases?: string[];
  benefits?: string[];
}

const BASE_URL = 'https://shapeshyft.io';
const APP_NAME = 'ShapeShyft';

/**
 * AI Search Optimization Component
 * Adds structured data and meta tags optimized for AI search engines like
 * ChatGPT, Claude, Perplexity, Gemini, and others.
 */
export function AISearchOptimization({
  pageType,
  pageName,
  description,
  keywords = [],
  faqs = [],
  howTo,
  features = [],
  useCases = [],
  benefits = [],
}: AISearchOptimizationProps) {
  // Generate comprehensive knowledge graph data
  const knowledgeGraphData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description:
      'ShapeShyft transforms unstructured LLM outputs into reliable, type-safe REST APIs using JSON Schema validation. Works with OpenAI, Anthropic Claude, Google Gemini, and custom LM servers.',
    url: BASE_URL,
    creator: {
      '@type': 'Organization',
      name: 'Sudobility',
      url: BASE_URL,
    },
    featureList:
      features.length > 0
        ? features
        : [
            'Structured LLM output with JSON Schema',
            'Multi-provider support (OpenAI, Anthropic, Google)',
            'REST API generation',
            'Token usage tracking',
            'Cost estimation',
            'Rate limiting',
            'Project organization',
            'Team collaboration',
          ],
    softwareRequirements: 'REST API client or HTTP library',
    audience: {
      '@type': 'Audience',
      audienceType: 'Developers, AI Engineers, Product Teams',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
  };

  // Generate speakable structured data for voice assistants
  const speakableData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageName,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.hero-title', '.hero-description', '.summary'],
    },
  };

  // Generate FAQ structured data if provided
  const faqData =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  // Generate HowTo structured data if provided
  const howToData = howTo
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: howTo.name,
        description: howTo.description,
        step: howTo.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      }
    : null;

  // Generate use cases structured data
  const useCaseData =
    useCases.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Use Cases',
          description: 'Common use cases for ShapeShyft',
          itemListElement: useCases.map((useCase, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: useCase,
          })),
        }
      : null;

  // Generate benefits structured data
  const benefitsData =
    benefits.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Benefits',
          description: 'Key benefits of using ShapeShyft',
          itemListElement: benefits.map((benefit, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: benefit,
          })),
        }
      : null;

  // AI-specific meta tags
  const aiMetaTags = [
    // OpenAI/ChatGPT hints
    { name: 'ai-content-type', content: pageType },
    { name: 'ai-content-category', content: 'Developer Tools, AI, API, LLM' },
    { name: 'ai-content-summary', content: description },

    // Perplexity AI optimization
    { name: 'perplexity-content-type', content: pageType },
    { name: 'perplexity-last-modified', content: new Date().toISOString().split('T')[0] },

    // Claude optimization
    { name: 'claude-content-priority', content: 'high' },
    { name: 'claude-content-freshness', content: 'evergreen' },

    // General AI hints
    { name: 'ai-keywords', content: keywords.join(', ') },
    {
      name: 'ai-entities',
      content: 'ShapeShyft, LLM, JSON Schema, REST API, OpenAI, Anthropic, Claude, GPT, Gemini',
    },
    {
      name: 'ai-topics',
      content: 'structured output, LLM API, JSON Schema validation, AI integration, developer tools',
    },
    { name: 'ai-sentiment', content: 'informative, technical, developer-focused' },
    { name: 'ai-reading-level', content: 'technical' },
  ];

  return (
    <Helmet>
      {/* AI-specific meta tags */}
      {aiMetaTags.map((tag, index) => (
        <meta key={`ai-meta-${index}`} {...tag} />
      ))}

      {/* Dublin Core metadata for better AI understanding */}
      <meta name="DC.title" content={pageName} />
      <meta name="DC.creator" content="Sudobility" />
      <meta name="DC.subject" content={keywords.join(', ')} />
      <meta name="DC.description" content={description} />
      <meta name="DC.publisher" content={APP_NAME} />
      <meta name="DC.type" content="Software" />
      <meta name="DC.format" content="text/html" />

      {/* Knowledge Graph Data */}
      <script type="application/ld+json">{JSON.stringify(knowledgeGraphData)}</script>

      {/* Speakable Data for Voice Assistants */}
      <script type="application/ld+json">{JSON.stringify(speakableData)}</script>

      {/* FAQ Structured Data */}
      {faqData && <script type="application/ld+json">{JSON.stringify(faqData)}</script>}

      {/* HowTo Structured Data */}
      {howToData && <script type="application/ld+json">{JSON.stringify(howToData)}</script>}

      {/* Use Cases Data */}
      {useCaseData && <script type="application/ld+json">{JSON.stringify(useCaseData)}</script>}

      {/* Benefits Data */}
      {benefitsData && <script type="application/ld+json">{JSON.stringify(benefitsData)}</script>}

      {/* Rich snippets for AI crawlers */}
      <meta itemProp="name" content="ShapeShyft - Structured LLM Output Platform" />
      <meta itemProp="description" content={description} />
      <meta itemProp="applicationCategory" content="Developer Tools, AI, API" />
    </Helmet>
  );
}

export default AISearchOptimization;
