import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager, useEndpointsManager, useEndpointTester, useKeysManager } from '@sudobility/shapeshyft_lib';
import { getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@sudobility/components';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import SchemaEditor from '../../components/dashboard/SchemaEditor';

// Icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

type TabId = 'general' | 'input' | 'output' | 'test';

function EndpointDetailPage() {
  const { entitySlug = '', projectId, endpointId } = useParams<{
    entitySlug: string;
    projectId: string;
    endpointId: string;
  }>();
  const { t } = useTranslation('dashboard');
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, token, isReady, isLoading: apiLoading } = useApi();
  const { success, error: showError } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Test state
  const [testInput, setTestInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [projectApiKey, setProjectApiKey] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Separate edit states for each section
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [isEditingOutput, setIsEditingOutput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state - General
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editContext, setEditContext] = useState('');
  const [editLlmKeyId, setEditLlmKeyId] = useState('');

  // Edit form state - Input
  const [editInputSchema, setEditInputSchema] = useState('');
  const [useInputSchema, setUseInputSchema] = useState(false);

  // Edit form state - Output
  const [editOutputSchema, setEditOutputSchema] = useState('');
  const [useOutputSchema, setUseOutputSchema] = useState(false);

  const { projects, isLoading: projectsLoading, getProjectApiKey } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  const project = projects.find(p => p.uuid === projectId);

  const { endpoints, isLoading: endpointsLoading, updateEndpoint, error: updateError } = useEndpointsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId && !!entitySlug,
  });

  const endpoint = endpoints.find(e => e.uuid === endpointId);

  const {
    testResults,
    isLoading: isTesting,
    error: testError,
    testEndpoint,
    getPrompt,
    generateSampleInput,
    validateInput,
  } = useEndpointTester(networkClient, baseUrl);

  // Prompt preview state
  const [promptPreview, setPromptPreview] = useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  // Get the latest test result for this endpoint
  const latestResult = useMemo(
    () => testResults.filter(r => r.endpointId === endpointId).sort((a, b) => b.timestamp - a.timestamp)[0],
    [testResults, endpointId]
  );

  // Initialize test input with sample when endpoint loads (only once)
  useEffect(() => {
    if (endpoint && !initializedRef.current) {
      initializedRef.current = true;
      const sample = generateSampleInput(endpoint.input_schema);
      setTestInput(JSON.stringify(sample, null, 2));
    }
  }, [endpoint, generateSampleInput]);

  // Fetch project API key for testing
  useEffect(() => {
    if (projectId && isReady && getProjectApiKey) {
      getProjectApiKey(projectId).then(result => {
        if (result?.api_key) {
          setProjectApiKey(result.api_key);
        }
      });
    }
  }, [projectId, isReady, getProjectApiKey]);

  // Show test error via InfoInterface
  useEffect(() => {
    if (testError) {
      getInfoService().show(t('common.error'), testError, InfoType.ERROR, 5000);
    }
  }, [testError, t]);

  // Edit handlers for General tab
  const handleStartEditGeneral = () => {
    if (!endpoint) return;
    setEditDisplayName(endpoint.display_name);
    setEditInstructions(endpoint.instructions ?? '');
    setEditContext(endpoint.context ?? '');
    setEditLlmKeyId(endpoint.llm_key_id);
    setIsEditingGeneral(true);
  };

  const handleCancelEditGeneral = () => {
    setIsEditingGeneral(false);
  };

  const handleSaveGeneral = async () => {
    if (!endpoint) return;
    setIsSaving(true);
    try {
      const updated = await updateEndpoint(endpoint.uuid, {
        endpoint_name: endpoint.endpoint_name,
        display_name: editDisplayName.trim(),
        instructions: editInstructions.trim() || null,
        http_method: endpoint.http_method,
        llm_key_id: editLlmKeyId,
        context: editContext.trim() || null,
        input_schema: endpoint.input_schema,
        output_schema: endpoint.output_schema,
        is_active: endpoint.is_active,
      });
      if (updated) {
        success(t('endpoints.updated'));
        setIsEditingGeneral(false);
      } else {
        showError(updateError || t('common.errorOccurred'));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('common.errorOccurred'));
    } finally {
      setIsSaving(false);
    }
  };

  // Edit handlers for Input tab
  const handleStartEditInput = () => {
    if (!endpoint) return;
    setEditInputSchema(endpoint.input_schema ? JSON.stringify(endpoint.input_schema, null, 2) : '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
    setUseInputSchema(!!endpoint.input_schema);
    setIsEditingInput(true);
  };

  const handleCancelEditInput = () => {
    setIsEditingInput(false);
  };

  const handleSaveInput = async () => {
    if (!endpoint) return;

    let parsedInputSchema = null;
    if (useInputSchema) {
      try {
        parsedInputSchema = JSON.parse(editInputSchema);
      } catch {
        showError(t('endpoints.form.errors.invalidInputSchema'));
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = await updateEndpoint(endpoint.uuid, {
        endpoint_name: endpoint.endpoint_name,
        display_name: endpoint.display_name,
        instructions: endpoint.instructions,
        http_method: endpoint.http_method,
        llm_key_id: endpoint.llm_key_id,
        context: endpoint.context,
        input_schema: parsedInputSchema,
        output_schema: endpoint.output_schema,
        is_active: endpoint.is_active,
      });
      if (updated) {
        success(t('endpoints.updated'));
        setIsEditingInput(false);
      } else {
        showError(updateError || t('common.errorOccurred'));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('common.errorOccurred'));
    } finally {
      setIsSaving(false);
    }
  };

  // Edit handlers for Output tab
  const handleStartEditOutput = () => {
    if (!endpoint) return;
    setEditOutputSchema(endpoint.output_schema ? JSON.stringify(endpoint.output_schema, null, 2) : '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
    setUseOutputSchema(!!endpoint.output_schema);
    setIsEditingOutput(true);
  };

  const handleCancelEditOutput = () => {
    setIsEditingOutput(false);
  };

  const handleSaveOutput = async () => {
    if (!endpoint) return;

    let parsedOutputSchema = null;
    if (useOutputSchema) {
      try {
        parsedOutputSchema = JSON.parse(editOutputSchema);
      } catch {
        showError(t('endpoints.form.errors.invalidOutputSchema'));
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = await updateEndpoint(endpoint.uuid, {
        endpoint_name: endpoint.endpoint_name,
        display_name: endpoint.display_name,
        instructions: endpoint.instructions,
        http_method: endpoint.http_method,
        llm_key_id: endpoint.llm_key_id,
        context: endpoint.context,
        input_schema: endpoint.input_schema,
        output_schema: parsedOutputSchema,
        is_active: endpoint.is_active,
      });
      if (updated) {
        success(t('endpoints.updated'));
        setIsEditingOutput(false);
      } else {
        showError(updateError || t('common.errorOccurred'));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t('common.errorOccurred'));
    } finally {
      setIsSaving(false);
    }
  };

  // Test handlers
  const handleGenerateSample = () => {
    if (!endpoint) return;
    const sample = generateSampleInput(endpoint.input_schema);
    setTestInput(JSON.stringify(sample, null, 2));
    setInputError(null);
  };

  const handleViewPrompt = async () => {
    if (!endpoint || !project) return;

    setInputError(null);
    setPromptPreview(null);

    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(testInput);
    } catch {
      setInputError(t('endpoints.tester.invalidJson'));
      return;
    }

    setIsLoadingPrompt(true);
    const result = await getPrompt(
      entitySlug,
      project.project_name,
      endpoint.endpoint_name,
      parsedInput,
      projectApiKey ?? undefined
    );
    setIsLoadingPrompt(false);

    if (result.success && result.prompt) {
      setPromptPreview(result.prompt);
    } else {
      showError(result.error || t('common.errorOccurred'));
    }
  };

  const handleTest = async () => {
    if (!endpoint || !project) return;

    setInputError(null);

    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(testInput);
    } catch {
      setInputError(t('endpoints.tester.invalidJson'));
      return;
    }

    const validation = validateInput(parsedInput, endpoint.input_schema);
    if (!validation.valid) {
      setInputError(validation.errors.join(', '));
      return;
    }

    const result = await testEndpoint(entitySlug, project.project_name, endpoint, parsedInput, projectApiKey ?? undefined);
    if (result?.success) {
      success(t('endpoints.tester.success'));
    } else if (result?.error) {
      showError(result.error);
    }
  };

  // Loading state
  if (apiLoading || projectsLoading || endpointsLoading || keysLoading) {
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
      {/* Endpoint Info Header */}
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
          /api/v1/ai/{entitySlug}/{project.project_name}/{endpoint.endpoint_name}
        </code>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">{t('endpoints.tabs.general')}</TabsTrigger>
          <TabsTrigger value="input">{t('endpoints.tabs.input')}</TabsTrigger>
          <TabsTrigger value="output">{t('endpoints.tabs.output')}</TabsTrigger>
          <TabsTrigger value="test">{t('endpoints.tabs.test')}</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="space-y-6">
            {/* Header with Edit button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {t('endpoints.tabs.general')}
              </h3>
              {!isEditingGeneral && (
                <button
                  onClick={handleStartEditGeneral}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <EditIcon />
                  {t('common.edit')}
                </button>
              )}
            </div>

            {isEditingGeneral ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t('endpoints.form.displayName')}
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={e => setEditDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t('endpoints.form.llmKey')}
                  </label>
                  <select
                    value={editLlmKeyId}
                    onChange={e => setEditLlmKeyId(e.target.value)}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {keys.map(key => (
                      <option key={key.uuid} value={key.uuid}>
                        {key.key_name} ({t(`keys.providers.${key.provider}`)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t('endpoints.form.instructions')}
                  </label>
                  <textarea
                    value={editInstructions}
                    onChange={e => setEditInstructions(e.target.value)}
                    rows={3}
                    placeholder={t('endpoints.form.instructionsPlaceholder')}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t('endpoints.detail.context')}
                  </label>
                  <textarea
                    value={editContext}
                    onChange={e => setEditContext(e.target.value)}
                    rows={6}
                    placeholder={t('endpoints.form.contextPlaceholder')}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEditGeneral}
                    disabled={isSaving}
                    className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveGeneral}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">{t('endpoints.form.displayName')}</h4>
                  <p className="text-theme-text-primary">{endpoint.display_name}</p>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">{t('endpoints.form.llmKey')}</h4>
                  <p className="text-theme-text-primary">
                    {keys.find(k => k.uuid === endpoint.llm_key_id)?.key_name || endpoint.llm_key_id}
                  </p>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">{t('endpoints.form.instructions')}</h4>
                  <p className="text-theme-text-primary whitespace-pre-wrap">
                    {endpoint.instructions || <span className="italic text-theme-text-tertiary">{t('common.notSet')}</span>}
                  </p>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">{t('endpoints.detail.context')}</h4>
                  <p className="text-theme-text-primary whitespace-pre-wrap">
                    {endpoint.context || <span className="italic text-theme-text-tertiary">{t('common.notSet')}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Input Tab */}
        <TabsContent value="input">
          <div className="space-y-6">
            {/* Header with Edit button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {t('endpoints.detail.inputSchema')}
              </h3>
              {!isEditingInput && (
                <button
                  onClick={handleStartEditInput}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <EditIcon />
                  {t('common.edit')}
                </button>
              )}
            </div>

            {isEditingInput ? (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                  <input
                    type="checkbox"
                    checked={useInputSchema}
                    onChange={e => setUseInputSchema(e.target.checked)}
                    className="rounded"
                  />
                  {t('endpoints.form.useInputSchema')}
                </label>
                {useInputSchema ? (
                  <SchemaEditor
                    value={editInputSchema}
                    onChange={setEditInputSchema}
                  />
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic p-4 bg-theme-bg-secondary rounded-xl">{t('common.disabled')}</p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEditInput}
                    disabled={isSaving}
                    className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveInput}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-theme-bg-secondary rounded-xl">
                {endpoint.input_schema ? (
                  <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono max-h-96">
                    {JSON.stringify(endpoint.input_schema, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic">{t('common.notSet')}</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output">
          <div className="space-y-6">
            {/* Header with Edit button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {t('endpoints.detail.outputSchema')}
              </h3>
              {!isEditingOutput && (
                <button
                  onClick={handleStartEditOutput}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <EditIcon />
                  {t('common.edit')}
                </button>
              )}
            </div>

            {isEditingOutput ? (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                  <input
                    type="checkbox"
                    checked={useOutputSchema}
                    onChange={e => setUseOutputSchema(e.target.checked)}
                    className="rounded"
                  />
                  {t('endpoints.form.useOutputSchema')}
                </label>
                {useOutputSchema ? (
                  <SchemaEditor
                    value={editOutputSchema}
                    onChange={setEditOutputSchema}
                  />
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic p-4 bg-theme-bg-secondary rounded-xl">{t('common.disabled')}</p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEditOutput}
                    disabled={isSaving}
                    className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveOutput}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-theme-bg-secondary rounded-xl">
                {endpoint.output_schema ? (
                  <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono max-h-96">
                    {JSON.stringify(endpoint.output_schema, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic">{t('common.notSet')}</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-theme-text-primary">
              {t('endpoints.tester.title')}
            </h3>

            {/* Input */}
            <div>
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

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateSample}
                className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors text-sm"
              >
                {t('endpoints.tester.generateSample')}
              </button>
              <button
                onClick={handleViewPrompt}
                disabled={isLoadingPrompt || !testInput.trim()}
                className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50 text-sm"
              >
                {isLoadingPrompt ? t('common.loading') : t('endpoints.tester.viewPrompt')}
              </button>
              <button
                onClick={handleTest}
                disabled={isTesting || !testInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isTesting ? t('endpoints.tester.executing') : t('endpoints.tester.execute')}
              </button>
            </div>

            {/* Prompt Preview */}
            {promptPreview && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-theme-text-primary">
                    {t('endpoints.tester.prompt')}
                  </label>
                  <button
                    onClick={() => setPromptPreview(null)}
                    className="text-xs text-theme-text-tertiary hover:text-theme-text-primary"
                  >
                    {t('common.close')}
                  </button>
                </div>
                <pre className="p-3 bg-theme-bg-secondary rounded-lg overflow-auto font-mono text-sm text-theme-text-secondary max-h-64 whitespace-pre-wrap">
                  {promptPreview}
                </pre>
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
                  <pre className="p-3 bg-theme-bg-secondary rounded-lg overflow-auto font-mono text-sm text-green-600 dark:text-green-400 max-h-64">
                    {JSON.stringify(latestResult.output, null, 2)}
                  </pre>
                )}

                {/* Metrics */}
                {latestResult.success && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {latestResult.latencyMs && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">{t('endpoints.tester.latency')}</p>
                        <p className="font-semibold text-theme-text-primary">{latestResult.latencyMs}ms</p>
                      </div>
                    )}
                    {latestResult.tokensInput && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">{t('endpoints.tester.inputTokens')}</p>
                        <p className="font-semibold text-theme-text-primary">{latestResult.tokensInput}</p>
                      </div>
                    )}
                    {latestResult.tokensOutput && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">{t('endpoints.tester.outputTokens')}</p>
                        <p className="font-semibold text-theme-text-primary">{latestResult.tokensOutput}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EndpointDetailPage;
