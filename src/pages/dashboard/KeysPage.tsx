import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Placeholder data
const mockKeys = [
  {
    uuid: 'k1',
    key_name: 'OpenAI Production',
    provider: 'openai',
    has_api_key: true,
    is_active: true,
  },
  {
    uuid: 'k2',
    key_name: 'Anthropic Dev',
    provider: 'anthropic',
    has_api_key: true,
    is_active: true,
  },
];

const PROVIDER_ICONS: Record<string, { bg: string; text: string }> = {
  openai: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  anthropic: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  gemini: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  llm_server: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
};

function KeysPage() {
  const { t } = useTranslation('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          {t('keys.title')}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('keys.add')}
        </button>
      </div>

      {/* Keys List */}
      {mockKeys.length === 0 ? (
        <div className="text-center py-12 bg-theme-bg-secondary rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-tertiary rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-theme-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-theme-text-primary mb-2">
            {t('keys.empty')}
          </h3>
          <p className="text-theme-text-secondary">
            {t('keys.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockKeys.map(key => (
            <div
              key={key.uuid}
              className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    PROVIDER_ICONS[key.provider]?.bg || 'bg-gray-100'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      PROVIDER_ICONS[key.provider]?.text || 'text-gray-600'
                    }`}
                  >
                    {key.provider === 'openai' && 'OAI'}
                    {key.provider === 'anthropic' && 'CL'}
                    {key.provider === 'gemini' && 'GEM'}
                    {key.provider === 'llm_server' && 'LLM'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-theme-text-primary">
                    {key.key_name}
                  </h4>
                  <p className="text-sm text-theme-text-tertiary">
                    {t(`keys.providers.${key.provider}`)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    key.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {key.is_active ? t('keys.card.active') : t('keys.card.inactive')}
                </span>
                <button className="p-2 hover:bg-theme-hover-bg rounded-lg transition-colors">
                  <svg
                    className="w-5 h-5 text-theme-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Key Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md bg-theme-bg-primary rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('keys.form.title')}
            </h3>
            <p className="text-theme-text-secondary mb-4">
              API key form will be implemented with API integration.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-2 border border-theme-border rounded-lg hover:bg-theme-hover-bg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeysPage;
