import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

// Placeholder data
const mockEndpoint = {
  uuid: 'e1',
  endpoint_name: 'classify',
  display_name: 'Classify Text',
  description: 'Classify input text into predefined categories',
  http_method: 'POST',
  endpoint_type: 'text_in_structured_out',
  context: 'You are a text classifier. Classify the input text into one of the following categories: positive, negative, neutral.',
  input_schema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'The text to classify' },
    },
    required: ['text'],
  },
  output_schema: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: ['category', 'confidence'],
  },
  is_active: true,
};

function EndpointDetailPage() {
  const { projectId } = useParams<{ projectId: string; endpointId: string }>();
  const { t } = useTranslation('dashboard');
  const { navigate } = useLocalizedNavigate();
  const [testInput, setTestInput] = useState('{\n  "text": "This product is amazing!"\n}');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTestResult(JSON.stringify({
      output: {
        category: 'positive',
        confidence: 0.95,
      },
      usage: {
        tokens_input: 42,
        tokens_output: 15,
        latency_ms: 234,
        estimated_cost_cents: 0.0012,
      },
    }, null, 2));
    setIsLoading(false);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(`/dashboard/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-text-primary mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Project
      </button>

      {/* Endpoint Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-theme-text-primary">
              {mockEndpoint.display_name}
            </h2>
            <span
              className={`px-2 py-1 text-xs font-mono font-medium rounded ${
                mockEndpoint.http_method === 'GET'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}
            >
              {mockEndpoint.http_method}
            </span>
          </div>
          <p className="text-sm text-theme-text-tertiary font-mono mb-2">
            /api/v1/ai/project/{mockEndpoint.endpoint_name}
          </p>
          {mockEndpoint.description && (
            <p className="text-theme-text-secondary">
              {mockEndpoint.description}
            </p>
          )}
        </div>
        <button className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors">
          Edit Endpoint
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Endpoint Type */}
          <div className="p-4 bg-theme-bg-secondary rounded-xl">
            <h3 className="font-medium text-theme-text-primary mb-2">
              Endpoint Type
            </h3>
            <span className="text-sm text-theme-text-tertiary bg-theme-bg-tertiary px-2 py-1 rounded font-mono">
              {mockEndpoint.endpoint_type}
            </span>
          </div>

          {/* System Context */}
          <div className="p-4 bg-theme-bg-secondary rounded-xl">
            <h3 className="font-medium text-theme-text-primary mb-2">
              System Context
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {mockEndpoint.context}
            </p>
          </div>

          {/* Input Schema */}
          <div className="p-4 bg-theme-bg-secondary rounded-xl">
            <h3 className="font-medium text-theme-text-primary mb-2">
              Input Schema
            </h3>
            <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono">
              {JSON.stringify(mockEndpoint.input_schema, null, 2)}
            </pre>
          </div>

          {/* Output Schema */}
          <div className="p-4 bg-theme-bg-secondary rounded-xl">
            <h3 className="font-medium text-theme-text-primary mb-2">
              Output Schema
            </h3>
            <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono">
              {JSON.stringify(mockEndpoint.output_schema, null, 2)}
            </pre>
          </div>
        </div>

        {/* Tester */}
        <div className="p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {t('endpoints.tester.title')}
          </h3>

          {/* Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-2">
              {t('endpoints.tester.input')}
            </label>
            <textarea
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setTestInput(JSON.stringify({ text: 'Sample input' }, null, 2))}
              className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors text-sm"
            >
              {t('endpoints.tester.generateSample')}
            </button>
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isLoading ? '...' : t('endpoints.tester.execute')}
            </button>
          </div>

          {/* Response */}
          {testResult && (
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-2">
                {t('endpoints.tester.response')}
              </label>
              <pre className="p-3 bg-theme-bg-tertiary rounded-lg overflow-auto font-mono text-sm text-green-600 dark:text-green-400">
                {testResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EndpointDetailPage;
