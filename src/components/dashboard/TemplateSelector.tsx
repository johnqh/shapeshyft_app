import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeysManager, useSettingsManager } from '@sudobility/shapeshyft_lib';
import type { ProjectTemplate } from '@sudobility/shapeshyft_lib';
import { useApi } from '../../hooks/useApi';

interface TemplateSelectorProps {
  templates: ProjectTemplate[];
  onApply: (templateId: string, projectName: string, llmKeyId: string) => Promise<void>;
  onClose: () => void;
}

function TemplateSelector({ templates, onApply, onClose }: TemplateSelectorProps) {
  const { t } = useTranslation('dashboard');
  const { networkClient, baseUrl, userId, token, isReady } = useApi();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  const { settings } = useSettingsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  // Get organization path - use settings value or fallback to first 8 chars of userId
  const organizationPath = settings?.organization_path || (userId ? userId.replace(/-/g, '').slice(0, 8) : '');

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Auto-fill project name when template is selected
  useEffect(() => {
    if (selectedTemplateData && !projectName) {
      setProjectName(selectedTemplateData.name.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [selectedTemplateData, projectName]);

  const handleApply = async () => {
    if (!selectedTemplate || !projectName.trim() || !selectedKeyId) {
      setError(t('templates.errors.fillAllFields'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onApply(selectedTemplate, projectName.trim(), selectedKeyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-theme-bg-primary rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-theme-border shrink-0">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {t('templates.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-theme-hover-bg transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Template Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 text-left rounded-xl border-2 transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-theme-border hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-theme-text-primary mb-1">{template.name}</h4>
                <p className="text-sm text-theme-text-secondary mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.endpoints.map(ep => (
                    <span
                      key={ep.endpoint_name}
                      className="text-xs px-2 py-0.5 bg-theme-bg-tertiary text-theme-text-tertiary rounded"
                    >
                      {ep.display_name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Configuration (shown when template selected) */}
          {selectedTemplate && (
            <div className="space-y-4 pt-4 border-t border-theme-border">
              <h4 className="font-medium text-theme-text-primary">
                {t('templates.configure')}
              </h4>

              {/* Project Name */}
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-theme-text-primary mb-1"
                >
                  {t('templates.projectName')}
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={e =>
                    setProjectName(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '-')
                        .replace(/-+/g, '-')
                    )
                  }
                  placeholder={t('templates.projectNamePlaceholder')}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow font-mono"
                />
              </div>

              {/* LLM Key Selection */}
              <div>
                <label
                  htmlFor="llmKey"
                  className="block text-sm font-medium text-theme-text-primary mb-1"
                >
                  {t('templates.llmKey')}
                </label>
                {keysLoading ? (
                  <div className="h-10 bg-theme-bg-secondary rounded-lg animate-pulse" />
                ) : keys.length === 0 ? (
                  <p className="text-sm text-theme-text-secondary">
                    {t('templates.noKeys')}{' '}
                    <a href="#/keys" className="text-blue-600 hover:underline">
                      {t('templates.addKeyLink')}
                    </a>
                  </p>
                ) : (
                  <select
                    id="llmKey"
                    value={selectedKeyId}
                    onChange={e => setSelectedKeyId(e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="">{t('templates.selectKey')}</option>
                    {keys.map(key => (
                      <option key={key.uuid} value={key.uuid}>
                        {key.key_name} ({key.provider})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Template Preview */}
              {selectedTemplateData && (
                <div className="p-4 bg-theme-bg-secondary rounded-lg">
                  <h5 className="text-sm font-medium text-theme-text-primary mb-2">
                    {t('templates.preview')}
                  </h5>
                  <p className="text-sm text-theme-text-secondary mb-2">
                    {t('templates.willCreate', { count: selectedTemplateData.endpoints.length })}
                  </p>
                  <ul className="space-y-1">
                    {selectedTemplateData.endpoints.map(ep => (
                      <li
                        key={ep.endpoint_name}
                        className="text-sm text-theme-text-tertiary flex items-center gap-2"
                      >
                        <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          POST
                        </span>
                        <span className="font-mono">/{organizationPath}/{projectName}/{ep.endpoint_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-theme-border shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleApply}
            disabled={isLoading || !selectedTemplate || !projectName.trim() || !selectedKeyId}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('common.creating')}
              </span>
            ) : (
              t('templates.apply')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector;
