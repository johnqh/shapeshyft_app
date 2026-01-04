import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MasterDetailLayout } from '@sudobility/components';
import ScreenContainer from '../components/layout/ScreenContainer';
import SEO from '../components/seo/SEO';
import AISearchOptimization from '../components/seo/AISearchOptimization';
import DocsSidebar from '../components/docs/DocsSidebar';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

type DocSection = 'getting-started' | 'concepts' | 'api-reference';

function DocsPage() {
  const { t } = useTranslation('docs');
  const { section } = useParams<{ section?: string }>();
  const { navigate } = useLocalizedNavigate();
  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');

  const currentSection = (section as DocSection) || 'getting-started';

  // Redirect to default section if no section specified
  useEffect(() => {
    if (!section) {
      navigate('/docs/getting-started', { replace: true });
    }
  }, [section, navigate]);

  const handleBackToNavigation = () => {
    setMobileView('navigation');
  };

  const handleNavigate = () => {
    setMobileView('content');
  };

  const getDetailTitle = () => {
    switch (currentSection) {
      case 'getting-started':
        return t('gettingStarted.title');
      case 'concepts':
        return t('concepts.title');
      case 'api-reference':
        return t('apiReference.title');
      default:
        return t('title');
    }
  };

  const masterContent = <DocsSidebar onNavigate={handleNavigate} />;

  const detailContent = (
    <div className="p-6">
      {currentSection === 'getting-started' && <GettingStartedContent />}
      {currentSection === 'concepts' && <ConceptsContent />}
      {currentSection === 'api-reference' && <ApiReferenceContent />}
    </div>
  );

  const getSeoDescription = () => {
    switch (currentSection) {
      case 'getting-started':
        return 'Learn how to get started with ShapeShyft. Create projects, configure LLM providers, and build your first structured AI endpoint.';
      case 'concepts':
        return 'Understand core concepts: endpoints, JSON schemas, system context, and organization paths for building structured AI APIs.';
      case 'api-reference':
        return 'Complete API reference for ShapeShyft. REST endpoints, request formats, response structures, and code examples.';
      default:
        return 'ShapeShyft documentation. Learn how to build reliable AI-powered REST APIs with JSON Schema validation.';
    }
  };

  const getHowTo = () => {
    if (currentSection === 'getting-started') {
      return {
        name: 'How to Create a Structured LLM Endpoint',
        description: 'Step-by-step guide to creating your first structured AI API endpoint with ShapeShyft',
        steps: [
          { name: 'Create a Project', text: 'Start by creating a new project in your dashboard to organize your endpoints.' },
          { name: 'Add an LLM Provider', text: 'Configure your API key for OpenAI, Anthropic, Google Gemini, or a custom LM server.' },
          { name: 'Define an Endpoint', text: 'Create an endpoint with instructions, context, and JSON output schema.' },
          { name: 'Test Your Endpoint', text: 'Use the built-in tester to verify your endpoint returns structured data.' },
          { name: 'Integrate', text: 'Call your endpoint from your application using simple GET or POST requests.' },
        ],
      };
    }
    return undefined;
  };

  return (
    <ScreenContainer footerVariant="compact" showFooter={true} showBreadcrumbs>
      <SEO
        title={getDetailTitle()}
        description={getSeoDescription()}
        canonical={`/docs/${currentSection}`}
        keywords="LLM API documentation, JSON Schema, AI API tutorial, structured output guide"
      />
      <AISearchOptimization
        pageType="documentation"
        pageName={getDetailTitle()}
        description={getSeoDescription()}
        keywords={['LLM API', 'documentation', 'JSON Schema', 'tutorial', 'structured output']}
        howTo={getHowTo()}
      />
      <main className="flex-1">
        <MasterDetailLayout
          masterTitle={t('title')}
          backButtonText={t('title')}
          masterContent={masterContent}
          detailContent={detailContent}
          detailTitle={getDetailTitle()}
          mobileView={mobileView}
          onBackToNavigation={handleBackToNavigation}
          enableAnimations={true}
          animationDuration={150}
          masterWidth={260}
          stickyTopOffset={80}
        />
      </main>
    </ScreenContainer>
  );
}

function GettingStartedContent() {
  const { t } = useTranslation('docs');
  const steps = t('gettingStarted.steps', { returnObjects: true }) as { title: string; description: string }[];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          {t('gettingStarted.title')}
        </h1>
        <p className="text-theme-text-secondary">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex gap-4 p-5 bg-theme-bg-secondary rounded-xl border border-theme-border"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-theme-text-primary mb-1">
                {step.title}
              </h3>
              <p className="text-theme-text-secondary text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConceptsContent() {
  const { t } = useTranslation('docs');
  const endpointItems = t('concepts.endpoints.items', { returnObjects: true }) as { name: string; description: string }[];

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          {t('concepts.title')}
        </h1>
      </div>

      {/* Endpoints */}
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-3">
          {t('concepts.endpoints.title')}
        </h2>
        <p className="text-theme-text-secondary mb-4">
          {t('concepts.endpoints.description')}
        </p>
        <div className="space-y-3">
          {endpointItems.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-theme-bg-secondary rounded-lg border border-theme-border"
            >
              <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                {item.name}
              </code>
              <p className="mt-1 text-sm text-theme-text-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Schemas */}
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-3">
          {t('concepts.schemas.title')}
        </h2>
        <p className="text-theme-text-secondary">
          {t('concepts.schemas.description')}
        </p>
      </div>

      {/* System Context */}
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-3">
          {t('concepts.context.title')}
        </h2>
        <p className="text-theme-text-secondary">
          {t('concepts.context.description')}
        </p>
      </div>

      {/* Organization Path */}
      <div>
        <h2 className="text-xl font-semibold text-theme-text-primary mb-3">
          {t('concepts.organizationPath.title')}
        </h2>
        <p className="text-theme-text-secondary">
          {t('concepts.organizationPath.description')}
        </p>
      </div>
    </div>
  );
}

function ApiReferenceContent() {
  const { t } = useTranslation('docs');
  const responseFields = t('apiReference.response.fields', { returnObjects: true }) as { name: string; description: string }[];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          {t('apiReference.title')}
        </h1>
        <p className="text-theme-text-secondary">
          {t('apiReference.description')}
        </p>
      </div>

      {/* Main Endpoints */}
      <div>
        <h2 className="text-lg font-semibold text-theme-text-primary mb-3">
          {t('apiReference.endpoints.main.title')}
        </h2>
        <p className="text-theme-text-secondary mb-4">
          {t('apiReference.endpoints.main.description')}
        </p>
        <div className="space-y-3">
          <div className="p-4 bg-theme-bg-secondary rounded-lg font-mono text-sm">
            <span className="text-green-600 dark:text-green-400">GET</span>{' '}
            <span className="text-theme-text-primary">/api/v1/ai/:orgPath/:projectName/:endpointName</span>
          </div>
          <div className="p-4 bg-theme-bg-secondary rounded-lg font-mono text-sm">
            <span className="text-blue-600 dark:text-blue-400">POST</span>{' '}
            <span className="text-theme-text-primary">/api/v1/ai/:orgPath/:projectName/:endpointName</span>
          </div>
        </div>
      </div>

      {/* Prompt-Only Endpoints */}
      <div>
        <h2 className="text-lg font-semibold text-theme-text-primary mb-3">
          {t('apiReference.endpoints.prompt.title')}
        </h2>
        <p className="text-theme-text-secondary mb-4">
          {t('apiReference.endpoints.prompt.description')}
        </p>
        <div className="space-y-3">
          <div className="p-4 bg-theme-bg-secondary rounded-lg font-mono text-sm">
            <span className="text-green-600 dark:text-green-400">GET</span>{' '}
            <span className="text-theme-text-primary">/api/v1/ai/:orgPath/:projectName/:endpointName/prompt</span>
          </div>
          <div className="p-4 bg-theme-bg-secondary rounded-lg font-mono text-sm">
            <span className="text-blue-600 dark:text-blue-400">POST</span>{' '}
            <span className="text-theme-text-primary">/api/v1/ai/:orgPath/:projectName/:endpointName/prompt</span>
          </div>
        </div>
      </div>

      {/* Response Format */}
      <div>
        <h2 className="text-lg font-semibold text-theme-text-primary mb-3">
          {t('apiReference.response.title')}
        </h2>
        <p className="text-theme-text-secondary mb-4">
          {t('apiReference.response.description')}
        </p>
        <div className="space-y-3">
          {responseFields.map((field, index) => (
            <div
              key={index}
              className="p-4 bg-theme-bg-secondary rounded-lg border border-theme-border"
            >
              <code className="text-sm font-mono text-purple-600 dark:text-purple-400">
                {field.name}
              </code>
              <p className="mt-1 text-sm text-theme-text-secondary">
                {field.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Example Request */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Example Request
        </h3>
        <pre className="text-sm text-blue-700 dark:text-blue-300 overflow-x-auto">
{`curl -X POST https://api.shapeshyft.io/api/v1/ai/my-org/my-project/classify \\
  -H "Content-Type: application/json" \\
  -d '{"text": "This is a great product!"}'`}
        </pre>
      </div>

      {/* Example Response */}
      <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
          Example Response
        </h3>
        <pre className="text-sm text-green-700 dark:text-green-300 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "output": {
      "sentiment": "positive",
      "confidence": 0.95
    },
    "usage": {
      "tokens_input": 42,
      "tokens_output": 15,
      "latency_ms": 523,
      "estimated_cost_cents": 1
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}

export default DocsPage;
