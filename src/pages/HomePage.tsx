import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import AISearchOptimization from '../components/seo/AISearchOptimization';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

function HomePage() {
  const { t } = useTranslation('home');
  const { user, openModal } = useAuthStatus();
  const { navigate } = useLocalizedNavigate();

  const isAuthenticated = !!user;

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      openModal();
    }
  };

  return (
    <ScreenContainer footerVariant="full">
      <SEO
        canonical="/"
        keywords="LLM API, structured output, JSON Schema, AI API, OpenAI, Anthropic, Claude, GPT, REST API"
      />
      <AISearchOptimization
        pageType="landing"
        pageName="ShapeShyft - Transform LLM Outputs into Structured APIs"
        description="Build reliable AI-powered REST APIs with JSON Schema validation. Transform unstructured LLM responses into predictable, type-safe endpoints."
        keywords={['LLM API', 'structured output', 'JSON Schema', 'AI API', 'OpenAI', 'Anthropic', 'REST API']}
        features={[
          'Structured LLM output with JSON Schema',
          'Multi-provider support (OpenAI, Anthropic, Google)',
          'REST API generation',
          'Token usage tracking',
          'Rate limiting',
        ]}
        useCases={[
          'Text classification and sentiment analysis',
          'Data extraction from unstructured text',
          'Structured content generation',
          'AI-powered form validation',
        ]}
        benefits={[
          'No more parsing unstructured LLM text',
          'Type-safe API responses',
          'Works with any major LLM provider',
          'Built-in usage analytics',
        ]}
        faqs={[
          {
            question: 'What is ShapeShyft?',
            answer: 'ShapeShyft transforms unstructured LLM outputs into reliable, type-safe REST APIs using JSON Schema validation.',
          },
          {
            question: 'Which LLM providers are supported?',
            answer: 'ShapeShyft supports OpenAI, Anthropic Claude, Google Gemini, and custom LLM servers with OpenAI-compatible APIs.',
          },
          {
            question: 'Is there a free tier?',
            answer: 'Yes, ShapeShyft offers a free tier with limited requests to get started.',
          },
        ]}
      />
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-theme-text-primary mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-theme-text-secondary max-w-2xl mx-auto mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCTA}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('hero.cta')}
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="px-8 py-3 border border-theme-border text-theme-text-primary font-semibold rounded-lg hover:bg-theme-hover-bg transition-colors"
            >
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-theme-text-primary mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Structured Output */}
            <div className="p-6 bg-theme-bg-secondary rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                {t('features.structuredOutput.title')}
              </h3>
              <p className="text-theme-text-secondary text-sm">
                {t('features.structuredOutput.description')}
              </p>
            </div>

            {/* Multi-Provider */}
            <div className="p-6 bg-theme-bg-secondary rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                {t('features.multiProvider.title')}
              </h3>
              <p className="text-theme-text-secondary text-sm">
                {t('features.multiProvider.description')}
              </p>
            </div>

            {/* Analytics */}
            <div className="p-6 bg-theme-bg-secondary rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                {t('features.analytics.title')}
              </h3>
              <p className="text-theme-text-secondary text-sm">
                {t('features.analytics.description')}
              </p>
            </div>

            {/* Easy Testing */}
            <div className="p-6 bg-theme-bg-secondary rounded-xl">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                {t('features.easyTesting.title')}
              </h3>
              <p className="text-theme-text-secondary text-sm">
                {t('features.easyTesting.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-theme-text-primary mb-4">
              {t('useCases.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary">
              {t('useCases.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-theme-bg-primary p-8 rounded-xl border border-theme-border">
              <h3 className="text-xl font-semibold text-theme-text-primary mb-3">
                {t('useCases.classification.title')}
              </h3>
              <p className="text-theme-text-secondary">
                {t('useCases.classification.description')}
              </p>
            </div>

            <div className="bg-theme-bg-primary p-8 rounded-xl border border-theme-border">
              <h3 className="text-xl font-semibold text-theme-text-primary mb-3">
                {t('useCases.extraction.title')}
              </h3>
              <p className="text-theme-text-secondary">
                {t('useCases.extraction.description')}
              </p>
            </div>

            <div className="bg-theme-bg-primary p-8 rounded-xl border border-theme-border">
              <h3 className="text-xl font-semibold text-theme-text-primary mb-3">
                {t('useCases.generation.title')}
              </h3>
              <p className="text-theme-text-secondary">
                {t('useCases.generation.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-theme-text-primary mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-theme-text-secondary mb-8">
            {t('cta.subtitle')}
          </p>
          <button
            onClick={handleCTA}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('cta.button')}
          </button>
        </div>
      </section>
    </ScreenContainer>
  );
}

export default HomePage;
