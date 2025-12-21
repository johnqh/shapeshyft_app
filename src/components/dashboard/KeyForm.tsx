import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { LlmApiKeySafe, LlmApiKeyCreateRequest, LlmProvider } from '@sudobility/shapeshyft_types';

const PROVIDERS: { value: LlmProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'llm_server', label: 'Custom LLM Server' },
];

interface KeyFormProps {
  apiKey?: LlmApiKeySafe;
  onSubmit: (data: LlmApiKeyCreateRequest) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

function KeyForm({ apiKey, onSubmit, onClose, isLoading }: KeyFormProps) {
  const { t } = useTranslation('dashboard');
  const isEditing = !!apiKey;

  const [keyName, setKeyName] = useState(apiKey?.key_name ?? '');
  const [provider, setProvider] = useState<LlmProvider>(apiKey?.provider ?? 'openai');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [endpointUrl, setEndpointUrl] = useState(apiKey?.endpoint_url ?? '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyName.trim()) {
      setError(t('keys.form.errors.nameRequired'));
      return;
    }

    if (!isEditing && !apiKeyValue.trim()) {
      setError(t('keys.form.errors.apiKeyRequired'));
      return;
    }

    if (provider === 'llm_server' && !endpointUrl.trim()) {
      setError(t('keys.form.errors.endpointRequired'));
      return;
    }

    try {
      await onSubmit({
        key_name: keyName.trim(),
        provider,
        api_key: apiKeyValue.trim() || undefined,
        endpoint_url: provider === 'llm_server' ? endpointUrl.trim() : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errorOccurred'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-theme-bg-primary rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {isEditing ? t('keys.form.titleEdit') : t('keys.form.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-theme-hover-bg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Key Name */}
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {t('keys.form.keyName')}
            </label>
            <input
              type="text"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              placeholder={t('keys.form.keyNamePlaceholder')}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {t('keys.form.provider')}
            </label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value as LlmProvider)}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Endpoint URL (for llm_server) */}
          {provider === 'llm_server' && (
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('keys.form.endpointUrl')}
              </label>
              <input
                type="url"
                value={endpointUrl}
                onChange={e => setEndpointUrl(e.target.value)}
                placeholder={t('keys.form.endpointUrlPlaceholder')}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {t('keys.form.apiKey')}
              {isEditing && (
                <span className="text-theme-text-tertiary ml-1">
                  ({t('keys.form.leaveBlank')})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyValue}
                onChange={e => setApiKeyValue(e.target.value)}
                placeholder={isEditing ? '••••••••••••••••' : t('keys.form.apiKeyPlaceholder')}
                className="w-full px-3 py-2 pr-10 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-hover-bg rounded"
              >
                {showApiKey ? (
                  <svg className="w-5 h-5 text-theme-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-theme-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-theme-text-tertiary">
              {t('keys.form.apiKeyHint')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !keyName.trim()}
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
              ) : isEditing ? (
                t('common.save')
              ) : (
                t('keys.form.add')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default KeyForm;
