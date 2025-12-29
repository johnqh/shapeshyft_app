import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/layout/ScreenContainer';

function DocsPage() {
  const { t } = useTranslation('docs');

  return (
    <ScreenContainer footerVariant="full">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-theme-text-secondary">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-theme-text-primary mb-8">
            {t('gettingStarted.title')}
          </h2>

          <div className="space-y-6">
            {(t('gettingStarted.steps', { returnObjects: true }) as { title: string; description: string }[]).map(
              (step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 bg-theme-bg-secondary rounded-xl"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-text-primary mb-1">
                      {step.title}
                    </h3>
                    <p className="text-theme-text-secondary">{step.description}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Core Concepts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-theme-text-primary mb-8">
            {t('concepts.title')}
          </h2>

          {/* Endpoints */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">
              {t('concepts.endpoints.title')}
            </h3>
            <p className="text-theme-text-secondary mb-4">
              {t('concepts.endpoints.description')}
            </p>
            <div className="space-y-3">
              {(t('concepts.endpoints.items', { returnObjects: true }) as { name: string; description: string }[]).map(
                (item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-theme-bg-primary rounded-lg border border-theme-border"
                  >
                    <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                      {item.name}
                    </code>
                    <p className="mt-1 text-sm text-theme-text-secondary">
                      {item.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* JSON Schemas */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">
              {t('concepts.schemas.title')}
            </h3>
            <p className="text-theme-text-secondary">
              {t('concepts.schemas.description')}
            </p>
          </div>

          {/* System Context */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">
              {t('concepts.context.title')}
            </h3>
            <p className="text-theme-text-secondary">
              {t('concepts.context.description')}
            </p>
          </div>

          {/* Organization Path */}
          <div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">
              {t('concepts.organizationPath.title')}
            </h3>
            <p className="text-theme-text-secondary">
              {t('concepts.organizationPath.description')}
            </p>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-theme-text-primary mb-4">
            {t('apiReference.title')}
          </h2>
          <p className="text-theme-text-secondary mb-8">
            {t('apiReference.description')}
          </p>

          {/* Main Endpoints */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t('apiReference.endpoints.main.title')}
            </h3>
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
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t('apiReference.endpoints.prompt.title')}
            </h3>
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
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
              {t('apiReference.response.title')}
            </h3>
            <p className="text-theme-text-secondary mb-4">
              {t('apiReference.response.description')}
            </p>
            <div className="space-y-3">
              {(t('apiReference.response.fields', { returnObjects: true }) as { name: string; description: string }[]).map(
                (field, index) => (
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
                )
              )}
            </div>
          </div>

          {/* Example Request */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Example Request
            </h4>
            <pre className="text-sm text-blue-700 dark:text-blue-300 overflow-x-auto">
{`curl -X POST https://api.shapeshyft.io/api/v1/ai/my-org/my-project/classify \\
  -H "Content-Type: application/json" \\
  -d '{"text": "This is a great product!"}'`}
            </pre>
          </div>

          {/* Example Response */}
          <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Example Response
            </h4>
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
      </section>
    </ScreenContainer>
  );
}

export default DocsPage;
