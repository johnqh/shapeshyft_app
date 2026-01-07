import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKeysManager } from "@sudobility/shapeshyft_lib";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { ItemList } from "@sudobility/components";
import type { LlmApiKeySafe } from "@sudobility/shapeshyft_types";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import KeyForm from "../../components/dashboard/KeyForm";
import DetailErrorState from "../../components/dashboard/DetailErrorState";
import { isServerError } from "../../utils/errorUtils";

// Icons
const KeyIcon = () => (
  <svg
    className="w-8 h-8"
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
);

const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const PROVIDER_ICONS: Record<
  string,
  { bg: string; text: string; abbr: string }
> = {
  openai: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    abbr: "OAI",
  },
  anthropic: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    abbr: "CL",
  },
  gemini: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    abbr: "GEM",
  },
  llm_server: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    abbr: "LLM",
  },
};

function KeysPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const {
    networkClient,
    baseUrl,
    token,
    testMode,
    isReady,
    isLoading: apiLoading,
  } = useApi();
  const { success } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const {
    keys,
    isLoading,
    error,
    createKey,
    updateKey,
    deleteKey,
    clearError,
    refresh: refreshKeys,
  } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  const [isRetrying, setIsRetrying] = useState(false);

  // Handle retry for server errors
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    clearError();
    try {
      await refreshKeys();
    } finally {
      setIsRetrying(false);
    }
  }, [refreshKeys, clearError]);

  // Show error via InfoInterface (only for non-server errors)
  useEffect(() => {
    if (error && !isServerError(error)) {
      getInfoService().show(t("common.error"), error, InfoType.ERROR, 5000);
      clearError();
    }
  }, [error, clearError, t]);

  const handleDeleteKey = async (keyId: string) => {
    if (confirm(t("keys.confirmDelete"))) {
      try {
        await deleteKey(keyId);
        success(t("common:toast.success.deleted"));
      } catch (err) {
        getInfoService().show(
          t("common.error"),
          err instanceof Error ? err.message : t("common:toast.error.generic"),
          InfoType.ERROR,
          5000,
        );
      }
    }
  };

  const renderKeyItem = (key: LlmApiKeySafe) => {
    const provider = PROVIDER_ICONS[key.provider] ?? {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      abbr: "?",
    };

    return (
      <div className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border group">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${provider.bg}`}
            >
              <span className={`text-xs font-bold ${provider.text}`}>
                {provider.abbr}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-theme-text-primary truncate">
                {key.key_name}
              </h4>
              <p className="text-sm text-theme-text-tertiary truncate">
                {t(`keys.providers.${key.provider}`)}
                {key.endpoint_url && (
                  <span className="ml-2 font-mono text-xs hidden sm:inline">
                    {key.endpoint_url}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 ml-14 sm:ml-0">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                key.is_active
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {key.is_active ? t("keys.card.active") : t("keys.card.inactive")}
            </span>
            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingKey(key.uuid)}
                className="p-2 hover:bg-theme-hover-bg rounded-lg transition-colors"
                title={t("common.edit")}
              >
                <svg
                  className="w-4 h-4 text-theme-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteKey(key.uuid)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title={t("common.delete")}
              >
                <svg
                  className="w-4 h-4 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Server error state - show error but keep in detail panel
  if (error && isServerError(error)) {
    return <DetailErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  return (
    <div>
      <ItemList
        title={t("keys.title")}
        items={keys}
        renderItem={renderKeyItem}
        keyExtractor={(key) => key.uuid}
        loading={apiLoading || (isReady && isLoading && keys.length === 0)}
        actions={[
          {
            id: "add",
            label: t("keys.add"),
            onClick: () => setShowAddModal(true),
            icon: <PlusIcon />,
            variant: "primary",
          },
        ]}
        emptyMessage={t("keys.emptyDescription")}
        emptyIcon={
          <div className="w-16 h-16 bg-theme-bg-secondary rounded-full flex items-center justify-center text-theme-text-tertiary">
            <KeyIcon />
          </div>
        }
        emptyAction={{
          label: t("keys.add"),
          onClick: () => setShowAddModal(true),
        }}
        spacing="md"
      />

      {/* Add Key Modal */}
      {showAddModal && (
        <KeyForm
          onSubmit={async (data) => {
            try {
              await createKey(data);
              setShowAddModal(false);
              success(t("common:toast.success.created"));
            } catch (err) {
              getInfoService().show(
                t("common.error"),
                err instanceof Error
                  ? err.message
                  : t("common:toast.error.generic"),
                InfoType.ERROR,
                5000,
              );
            }
          }}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      )}

      {/* Edit Key Modal */}
      {editingKey && (
        <KeyForm
          apiKey={keys.find((k) => k.uuid === editingKey)}
          onSubmit={async (data) => {
            try {
              await updateKey(editingKey, {
                key_name: data.key_name,
                api_key: data.api_key,
                endpoint_url: data.endpoint_url,
                is_active: undefined,
              });
              setEditingKey(null);
              success(t("common:toast.success.saved"));
            } catch (err) {
              getInfoService().show(
                t("common.error"),
                err instanceof Error
                  ? err.message
                  : t("common:toast.error.generic"),
                InfoType.ERROR,
                5000,
              );
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
