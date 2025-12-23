import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKeysManager, useEndpointsManager } from '@sudobility/shapeshyft_lib';
import type { HttpMethod } from '@sudobility/shapeshyft_types';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import SchemaEditor from '../../components/dashboard/SchemaEditor';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST'];

interface FieldErrors {
  displayName?: string;
  endpointName?: string;
  llmKeyId?: string;
  inputSchema?: string;
  outputSchema?: string;
}

function EndpointNewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation(['dashboard', 'common']);
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, userId, token, isReady } = useApi();
  const { success, error: showError } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [endpointName, setEndpointName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('POST');
  const [llmKeyId, setLlmKeyId] = useState('');
  const [context, setContext] = useState('');
  const [useInputSchema, setUseInputSchema] = useState(false);
  const [useOutputSchema, setUseOutputSchema] = useState(false);
  const [inputSchema, setInputSchema] = useState('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
  const [outputSchema, setOutputSchema] = useState('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  const { createEndpoint, isLoading } = useEndpointsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId,
  });

  // Auto-generate endpoint name from display name
  const generateEndpointName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    // Auto-fill endpoint name if it hasn't been manually edited
    if (!endpointName || endpointName === generateEndpointName(displayName)) {
      setEndpointName(generateEndpointName(value));
    }
    if (touched.displayName) {
      setFieldErrors(prev => ({ ...prev, displayName: validateDisplayName(value) }));
    }
  };

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const validateDisplayName = (value: string): string | undefined => {
    if (!value.trim()) return t('endpoints.form.errors.nameRequired');
    return undefined;
  };

  const validateEndpointName = (value: string): string | undefined => {
    if (!value.trim()) return t('endpoints.form.errors.slugRequired');
    return undefined;
  };

  const validateLlmKeyId = (value: string): string | undefined => {
    if (!value) return t('endpoints.form.errors.keyRequired');
    return undefined;
  };

  const validateInputSchema = (value: string, isUsed: boolean): string | undefined => {
    if (isUsed && !validateJson(value)) return t('endpoints.form.errors.invalidInputSchema');
    return undefined;
  };

  const validateOutputSchema = (value: string, isUsed: boolean): string | undefined => {
    if (isUsed && !validateJson(value)) return t('endpoints.form.errors.invalidOutputSchema');
    return undefined;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let error: string | undefined;
    switch (field) {
      case 'displayName':
        error = validateDisplayName(displayName);
        break;
      case 'endpointName':
        error = validateEndpointName(endpointName);
        break;
      case 'llmKeyId':
        error = validateLlmKeyId(llmKeyId);
        break;
      case 'inputSchema':
        error = validateInputSchema(inputSchema, useInputSchema);
        break;
      case 'outputSchema':
        error = validateOutputSchema(outputSchema, useOutputSchema);
        break;
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields
    const errors: FieldErrors = {
      displayName: validateDisplayName(displayName),
      endpointName: validateEndpointName(endpointName),
      llmKeyId: validateLlmKeyId(llmKeyId),
      inputSchema: validateInputSchema(inputSchema, useInputSchema),
      outputSchema: validateOutputSchema(outputSchema, useOutputSchema),
    };

    setFieldErrors(errors);
    setTouched({
      displayName: true,
      endpointName: true,
      llmKeyId: true,
      inputSchema: true,
      outputSchema: true,
    });

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    try {
      await createEndpoint({
        endpoint_name: endpointName.trim(),
        display_name: displayName.trim(),
        instructions: instructions.trim() || null,
        http_method: httpMethod,
        llm_key_id: llmKeyId,
        context: context.trim() || null,
        input_schema: useInputSchema ? JSON.parse(inputSchema) : null,
        output_schema: useOutputSchema ? JSON.parse(outputSchema) : null,
      });
      success(t('common:toast.success.created'));
      navigate(`/dashboard/projects/${projectId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('common.errorOccurred'));
      showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  const hasError = (field: keyof FieldErrors) => touched[field] && fieldErrors[field];

  const renderError = (field: keyof FieldErrors) => {
    if (!hasError(field)) return null;
    return (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {fieldErrors[field]}
      </p>
    );
  };

  const inputClassName = (field: keyof FieldErrors, extra?: string) =>
    `w-full px-3 py-2 border rounded-lg bg-theme-bg-primary outline-none transition-all ${extra ?? ''} ${
      hasError(field)
        ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
        : 'border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    }`;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {submitError}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('endpoints.form.displayName')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => handleDisplayNameChange(e.target.value)}
                onBlur={() => handleBlur('displayName')}
                placeholder={t('endpoints.form.displayNamePlaceholder')}
                className={inputClassName('displayName')}
                autoFocus
              />
              {renderError('displayName')}
            </div>

            {/* Endpoint Name (slug) */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('endpoints.form.endpointName')}
              </label>
              <input
                type="text"
                value={endpointName}
                onChange={e => {
                  const value = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-');
                  setEndpointName(value);
                  if (touched.endpointName) {
                    setFieldErrors(prev => ({ ...prev, endpointName: validateEndpointName(value) }));
                  }
                }}
                onBlur={() => handleBlur('endpointName')}
                placeholder={t('endpoints.form.endpointNamePlaceholder')}
                className={inputClassName('endpointName', 'font-mono')}
              />
              {renderError('endpointName')}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('endpoints.form.instructions')}{' '}
                <span className="text-theme-text-tertiary">({t('common.optional')})</span>
              </label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder={t('endpoints.form.instructionsPlaceholder')}
                rows={3}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* HTTP Method */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('endpoints.form.httpMethod')}
              </label>
              <select
                value={httpMethod}
                onChange={e => setHttpMethod(e.target.value as HttpMethod)}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {HTTP_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* LLM Key */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('endpoints.form.llmKey')}
              </label>
              {keysLoading ? (
                <div className="h-10 bg-theme-bg-secondary rounded-lg animate-pulse" />
              ) : keys.length === 0 ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {t('endpoints.form.noKeys')}
                </p>
              ) : (
                <>
                  <select
                    value={llmKeyId}
                    onChange={e => {
                      setLlmKeyId(e.target.value);
                      if (touched.llmKeyId) {
                        setFieldErrors(prev => ({ ...prev, llmKeyId: validateLlmKeyId(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleBlur('llmKeyId')}
                    className={inputClassName('llmKeyId')}
                  >
                    <option value="">{t('endpoints.form.selectKey')}</option>
                    {keys.map(key => (
                      <option key={key.uuid} value={key.uuid}>
                        {key.key_name} ({key.provider})
                      </option>
                    ))}
                  </select>
                  {renderError('llmKeyId')}
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* System Context */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('endpoints.form.context')}
              </label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder={t('endpoints.form.contextPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Input Schema Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useInputSchema"
                checked={useInputSchema}
                onChange={e => setUseInputSchema(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useInputSchema" className="text-sm font-medium text-theme-text-primary">
                {t('endpoints.form.useInputSchema')}
              </label>
            </div>

            {/* Input Schema */}
            {useInputSchema && (
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  {t('endpoints.form.inputSchema')}
                </label>
                <SchemaEditor
                  value={inputSchema}
                  onChange={value => {
                    setInputSchema(value);
                    if (touched.inputSchema) {
                      setFieldErrors(prev => ({ ...prev, inputSchema: validateInputSchema(value, true) }));
                    }
                  }}
                  error={!!hasError('inputSchema')}
                />
                {renderError('inputSchema')}
              </div>
            )}

            {/* Output Schema Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useOutputSchema"
                checked={useOutputSchema}
                onChange={e => setUseOutputSchema(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useOutputSchema" className="text-sm font-medium text-theme-text-primary">
                {t('endpoints.form.useOutputSchema')}
              </label>
            </div>

            {/* Output Schema */}
            {useOutputSchema && (
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">
                  {t('endpoints.form.outputSchema')}
                </label>
                <SchemaEditor
                  value={outputSchema}
                  onChange={value => {
                    setOutputSchema(value);
                    if (touched.outputSchema) {
                      setFieldErrors(prev => ({ ...prev, outputSchema: validateOutputSchema(value, true) }));
                    }
                  }}
                  error={!!hasError('outputSchema')}
                />
                {renderError('outputSchema')}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-theme-border">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading || !displayName.trim() || !endpointName.trim() || !llmKeyId}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.saving')}
              </span>
            ) : (
              t('endpoints.form.create')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EndpointNewPage;
