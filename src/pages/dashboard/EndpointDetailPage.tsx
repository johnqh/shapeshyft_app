import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager, useEndpointsManager, useEndpointTester, useSettingsManager } from '@sudobility/shapeshyft_lib';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';

function EndpointDetailPage() {
  const { projectId, endpointId } = useParams<{ projectId: string; endpointId: string }>();
  const { t } = useTranslation('dashboard');
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, userId, token, isReady, isLoading: apiLoading } = useApi();
  const { success, error: showError } = useToast();

  const [testInput, setTestInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const { projects, isLoading: projectsLoading } = useProjectsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  const project = projects.find(p => p.uuid === projectId);

  const { endpoints, isLoading: endpointsLoading } = useEndpointsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId,
  });

  const endpoint = endpoints.find(e => e.uuid === endpointId);

  const { settings } = useSettingsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  // Get organization path - use settings value or fallback to first 8 chars of userId
  const organizationPath = settings?.organization_path || (userId ? userId.replace(/-/g, '').slice(0, 8) : '');

  const {
    testResults,
    isLoading: isTesting,
    error: testError,
    testEndpoint,
    generateSampleInput,
    validateInput,
  } = useEndpointTester(networkClient, baseUrl);

  // Get the latest test result for this endpoint
  const latestResult = useMemo(
    () => testResults.filter(r => r.endpointId === endpointId).sort((a, b) => b.timestamp - a.timestamp)[0],
    [testResults, endpointId]
  );

  // Initialize test input with sample when endpoint loads (only once)
  // This is a legitimate one-time initialization, not a cascading update
  useEffect(() => {
    if (endpoint && !initializedRef.current) {
      initializedRef.current = true;
      const sample = generateSampleInput(endpoint.input_schema);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTestInput(JSON.stringify(sample, null, 2));
    }
  }, [endpoint, generateSampleInput]);

  const handleGenerateSample = () => {
    if (!endpoint) return;
    const sample = generateSampleInput(endpoint.input_schema);
    setTestInput(JSON.stringify(sample, null, 2));
    setInputError(null);
  };

  const handleTest = async () => {
    if (!endpoint || !project) return;

    setInputError(null);

    // Parse and validate input
    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(testInput);
    } catch {
      setInputError(t('endpoints.tester.invalidJson'));
      return;
    }

    // Validate against schema
    const validation = validateInput(parsedInput, endpoint.input_schema);
    if (!validation.valid) {
      setInputError(validation.errors.join(', '));
      return;
    }

    const result = await testEndpoint(organizationPath, project.project_name, endpoint, parsedInput);
    if (result?.success) {
      success(t('endpoints.tester.success'));
    } else if (result?.error) {
      showError(result.error);
    }
  };

  // Loading state
  if (apiLoading || projectsLoading || endpointsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not found
  if (!project || !endpoint) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          {t('endpoints.notFound')}
        </h3>
        <button
          onClick={() => navigate(projectId ? `/dashboard/projects/${projectId}` : '/dashboard')}
          className="text-blue-600 hover:underline"
        >
          {t('common.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Endpoint Info */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-theme-bg-secondary rounded-xl">
        <span
          className={`px-2 py-1 text-xs font-mono font-medium rounded ${
            endpoint.http_method === 'GET'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}
        >
          {endpoint.http_method}
        </span>
        <code className="text-sm text-theme-text-tertiary font-mono break-all">
          /api/v1/ai/{organizationPath}/{project.project_name}/{endpoint.endpoint_name}
        </code>
      </div>
      {endpoint.description && (
        <p className="text-theme-text-secondary mb-6">{endpoint.description}</p>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* System Context */}
          <div className="p-4 bg-theme-bg-secondary rounded-xl">
            <h3 className="font-medium text-theme-text-primary mb-2">
              {t('endpoints.detail.context')}
            </h3>
            <p className="text-sm text-theme-text-secondary whitespace-pre-wrap">
              {endpoint.context}
            </p>
          </div>

          {/* Input Schema */}
          {endpoint.input_schema && (
            <div className="p-4 bg-theme-bg-secondary rounded-xl">
              <h3 className="font-medium text-theme-text-primary mb-2">
                {t('endpoints.detail.inputSchema')}
              </h3>
              <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono max-h-48">
                {JSON.stringify(endpoint.input_schema, null, 2)}
              </pre>
            </div>
          )}

          {/* Output Schema */}
          {endpoint.output_schema && (
            <div className="p-4 bg-theme-bg-secondary rounded-xl">
              <h3 className="font-medium text-theme-text-primary mb-2">
                {t('endpoints.detail.outputSchema')}
              </h3>
              <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono max-h-48">
                {JSON.stringify(endpoint.output_schema, null, 2)}
              </pre>
            </div>
          )}
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
              onChange={e => {
                setTestInput(e.target.value);
                setInputError(null);
              }}
              rows={8}
              className={`w-full px-3 py-2 bg-theme-bg-primary border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                inputError ? 'border-red-500' : 'border-theme-border'
              }`}
            />
            {inputError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{inputError}</p>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleGenerateSample}
              className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors text-sm"
            >
              {t('endpoints.tester.generateSample')}
            </button>
            <button
              onClick={handleTest}
              disabled={isTesting || !testInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isTesting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('endpoints.tester.executing')}
                </span>
              ) : (
                t('endpoints.tester.execute')
              )}
            </button>
          </div>

          {/* Error */}
          {testError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {testError}
            </div>
          )}

          {/* Response */}
          {latestResult && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-theme-text-primary">
                  {t('endpoints.tester.response')}
                </label>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    latestResult.success
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {latestResult.success ? t('endpoints.tester.success') : t('endpoints.tester.failed')}
                </span>
              </div>

              {latestResult.error ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {latestResult.error}
                </div>
              ) : (
                <pre className="p-3 bg-theme-bg-tertiary rounded-lg overflow-auto font-mono text-sm text-green-600 dark:text-green-400 max-h-64">
                  {JSON.stringify(latestResult.output, null, 2)}
                </pre>
              )}

              {/* Metrics */}
              {latestResult.success && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {latestResult.latencyMs && (
                    <div className="text-center">
                      <p className="text-xs text-theme-text-tertiary">{t('endpoints.tester.latency')}</p>
                      <p className="font-semibold text-theme-text-primary">{latestResult.latencyMs}ms</p>
                    </div>
                  )}
                  {latestResult.tokensInput && (
                    <div className="text-center">
                      <p className="text-xs text-theme-text-tertiary">{t('endpoints.tester.inputTokens')}</p>
                      <p className="font-semibold text-theme-text-primary">{latestResult.tokensInput}</p>
                    </div>
                  )}
                  {latestResult.tokensOutput && (
                    <div className="text-center">
                      <p className="text-xs text-theme-text-tertiary">{t('endpoints.tester.outputTokens')}</p>
                      <p className="font-semibold text-theme-text-primary">{latestResult.tokensOutput}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EndpointDetailPage;
