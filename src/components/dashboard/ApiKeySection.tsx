import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@sudobility/shapeshyft_types';
import { getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';

interface ApiKeySectionProps {
  project: Project;
  onGetApiKey: () => Promise<string | null>;
  onRefreshApiKey: () => Promise<string | null>;
  isLoading?: boolean;
}

function ApiKeySection({
  project,
  onGetApiKey,
  onRefreshApiKey,
  isLoading = false,
}: ApiKeySectionProps) {
  const { t } = useTranslation('dashboard');
  const [showKey, setShowKey] = useState(false);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmRefresh, setShowConfirmRefresh] = useState(false);

  const handleShowKey = useCallback(async () => {
    if (showKey) {
      setShowKey(false);
      setFullKey(null);
      return;
    }

    setIsFetching(true);
    try {
      const key = await onGetApiKey();
      if (key) {
        setFullKey(key);
        setShowKey(true);
      }
    } finally {
      setIsFetching(false);
    }
  }, [showKey, onGetApiKey]);

  const handleCopyKey = useCallback(async () => {
    if (!fullKey) {
      // Need to fetch the key first
      setIsFetching(true);
      try {
        const key = await onGetApiKey();
        if (key) {
          await navigator.clipboard.writeText(key);
          getInfoService().show(
            t('apiKey.copied'),
            t('apiKey.copiedMessage'),
            InfoType.SUCCESS,
            3000
          );
        }
      } finally {
        setIsFetching(false);
      }
    } else {
      await navigator.clipboard.writeText(fullKey);
      getInfoService().show(
        t('apiKey.copied'),
        t('apiKey.copiedMessage'),
        InfoType.SUCCESS,
        3000
      );
    }
  }, [fullKey, onGetApiKey, t]);

  const handleRefreshKey = useCallback(async () => {
    setShowConfirmRefresh(false);
    setIsRefreshing(true);
    try {
      const newKey = await onRefreshApiKey();
      if (newKey) {
        setFullKey(newKey);
        setShowKey(true);
        getInfoService().show(
          t('apiKey.refreshed'),
          t('apiKey.refreshedMessage'),
          InfoType.SUCCESS,
          5000
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshApiKey, t]);

  const displayKey = showKey && fullKey ? fullKey : project.api_key_prefix ? `${project.api_key_prefix}••••••••••••••••` : '••••••••••••••••';

  const formattedDate = project.api_key_created_at
    ? new Date(project.api_key_created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-theme-text-primary">
          {t('apiKey.title')}
        </h4>
        {formattedDate && (
          <span className="text-xs text-theme-text-tertiary">
            {t('apiKey.createdAt')}: {formattedDate}
          </span>
        )}
      </div>

      {/* API Key Display */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-theme-bg-primary border border-theme-border rounded-lg px-3 py-2 font-mono text-sm text-theme-text-primary overflow-x-auto">
          {displayKey}
        </div>

        {/* Show/Hide Button */}
        <button
          type="button"
          onClick={handleShowKey}
          disabled={isLoading || isFetching}
          className="p-2 border border-theme-border rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
          title={showKey ? t('apiKey.hide') : t('apiKey.show')}
        >
          {isFetching ? (
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
          ) : showKey ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopyKey}
          disabled={isLoading || isFetching}
          className="p-2 border border-theme-border rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
          title={t('apiKey.copy')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={() => setShowConfirmRefresh(true)}
          disabled={isLoading || isRefreshing}
          className="p-2 border border-theme-border rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
          title={t('apiKey.refresh')}
        >
          {isRefreshing ? (
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
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-xs text-theme-text-tertiary">
        {t('apiKey.description')}
      </p>

      {/* Confirm Refresh Modal */}
      {showConfirmRefresh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmRefresh(false)} />
          <div className="relative w-full max-w-sm bg-theme-bg-primary rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
              {t('apiKey.confirmRefreshTitle')}
            </h3>
            <p className="text-sm text-theme-text-secondary mb-4">
              {t('apiKey.confirmRefreshMessage')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmRefresh(false)}
                className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleRefreshKey}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('apiKey.confirmRefresh')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiKeySection;
