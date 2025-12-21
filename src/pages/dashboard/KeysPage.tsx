import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeysManager } from '@sudobility/shapeshyft_lib';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import KeyForm from '../../components/dashboard/KeyForm';

const PROVIDER_ICONS: Record<string, { bg: string; text: string; abbr: string }> = {
  openai: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', abbr: 'OAI' },
  anthropic: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', abbr: 'CL' },
  gemini: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', abbr: 'GEM' },
  llm_server: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', abbr: 'LLM' },
};

function KeysPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { networkClient, baseUrl, userId, token, isReady, isLoading: apiLoading } = useApi();
  const { success, error: showError } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const {
    keys,
    isLoading,
    error,
    createKey,
    updateKey,
    deleteKey,
    refresh,
    clearError,
  } = useKeysManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  const handleDeleteKey = async (keyId: string) => {
    if (confirm(t('keys.confirmDelete'))) {
      try {
        await deleteKey(keyId);
        success(t('common:toast.success.deleted'));
      } catch (err) {
        showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
      }
    }
  };

  // Loading state
  if (apiLoading || (isReady && isLoading && keys.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-theme-text-secondary mb-4">{error}</p>
        <button
          onClick={() => { clearError(); refresh(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

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
      {keys.length === 0 ? (
        <div className="text-center py-12 bg-theme-bg-secondary rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-tertiary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-theme-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
          {keys.map(key => {
            const provider = PROVIDER_ICONS[key.provider] ?? {
              bg: 'bg-gray-100 dark:bg-gray-800',
              text: 'text-gray-600 dark:text-gray-400',
              abbr: '?',
            };

            return (
              <div
                key={key.uuid}
                className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border flex justify-between items-center group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.bg}`}>
                    <span className={`text-xs font-bold ${provider.text}`}>
                      {provider.abbr}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-text-primary">{key.key_name}</h4>
                    <p className="text-sm text-theme-text-tertiary">
                      {t(`keys.providers.${key.provider}`)}
                      {key.endpoint_url && (
                        <span className="ml-2 font-mono text-xs">{key.endpoint_url}</span>
                      )}
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingKey(key.uuid)}
                      className="p-2 hover:bg-theme-hover-bg rounded-lg transition-colors"
                      title={t('common.edit')}
                    >
                      <svg className="w-4 h-4 text-theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.uuid)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title={t('common.delete')}
                    >
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Key Modal */}
      {showAddModal && (
        <KeyForm
          onSubmit={async data => {
            try {
              await createKey(data);
              setShowAddModal(false);
              success(t('common:toast.success.created'));
            } catch (err) {
              showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
            }
          }}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      )}

      {/* Edit Key Modal */}
      {editingKey && (
        <KeyForm
          apiKey={keys.find(k => k.uuid === editingKey)}
          onSubmit={async data => {
            try {
              await updateKey(editingKey, {
                key_name: data.key_name,
                api_key: data.api_key,
                endpoint_url: data.endpoint_url,
                is_active: undefined,
              });
              setEditingKey(null);
              success(t('common:toast.success.saved'));
            } catch (err) {
              showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
            }
          }}
          onClose={() => setEditingKey(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default KeysPage;
