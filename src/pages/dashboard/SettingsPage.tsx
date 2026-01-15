import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettingsManager } from "@sudobility/shapeshyft_lib";
import { useStorageConfig } from "@sudobility/shapeshyft_client";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import type {
  StorageProvider,
  StorageConfigCreateRequest,
} from "@sudobility/shapeshyft_types";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

function SettingsPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, userId, token, testMode } = useApi();
  const { success } = useToast();

  const { settings, isLoading, error, updateSettings } = useSettingsManager({
    baseUrl,
    networkClient,
    userId: userId ?? "",
    token,
    testMode,
    autoFetch: true,
  });

  const [organizationName, setOrganizationName] = useState("");
  const [organizationPath, setOrganizationPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);

  // Storage config state
  const {
    storageConfig,
    isLoading: storageLoading,
    error: storageError,
    createOrUpdate: saveStorageConfig,
    deleteConfig: deleteStorageConfig,
    refresh: refreshStorage,
  } = useStorageConfig(networkClient, baseUrl, testMode);

  const [storageProvider, setStorageProvider] =
    useState<StorageProvider>("gcs");
  const [storageBucket, setStorageBucket] = useState("");
  const [storagePrefix, setStoragePrefix] = useState("");
  // GCS uses a JSON service account file
  const [gcsCredentialsJson, setGcsCredentialsJson] = useState("");
  const [gcsJsonError, setGcsJsonError] = useState<string | null>(null);
  // S3 uses individual fields
  const [s3Region, setS3Region] = useState("");
  const [s3AccessKeyId, setS3AccessKeyId] = useState("");
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState("");
  const [isSavingStorage, setIsSavingStorage] = useState(false);

  // Fetch storage config
  useEffect(() => {
    if (token && entitySlug) {
      refreshStorage(entitySlug, token);
    }
  }, [token, entitySlug, refreshStorage]);

  // Sync storage form state with loaded config
  useEffect(() => {
    if (storageConfig) {
      setStorageProvider(storageConfig.provider);
      setStorageBucket(storageConfig.bucket);
      setStoragePrefix(storageConfig.path_prefix ?? "");
      // Note: credentials are not returned from API for security
    }
  }, [storageConfig]);

  // Sync form state with loaded settings
  useEffect(() => {
    if (settings) {
      setOrganizationName(settings.organization_name ?? "");
      setOrganizationPath(settings.organization_path ?? "");
    }
  }, [settings]);

  const validatePath = (value: string): boolean => {
    if (!value.trim()) {
      return true; // Empty is valid (will use default)
    }
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(value)) {
      setPathError(t("settings.organization.pathInvalid"));
      return false;
    }
    setPathError(null);
    return true;
  };

  const handlePathChange = (value: string) => {
    setOrganizationPath(value);
    validatePath(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePath(organizationPath)) {
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        organization_name: organizationName.trim() || undefined,
        organization_path: organizationPath.trim() || undefined,
      });
      success(t("settings.form.saved"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("settings.form.error");
      if (message.includes("already taken")) {
        setPathError(t("settings.organization.pathTaken"));
      } else {
        getInfoService().show(
          t("settings.form.error"),
          message,
          InfoType.ERROR,
          5000,
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    (settings?.organization_name ?? "") !== organizationName ||
    (settings?.organization_path ?? "") !== organizationPath;

  // Validate GCS JSON
  const validateGcsJson = useCallback(
    (json: string): boolean => {
      if (!json.trim()) {
        setGcsJsonError(null);
        return true; // Empty is OK if updating existing config
      }
      try {
        const parsed = JSON.parse(json);
        // Check required fields
        const requiredFields = [
          "type",
          "project_id",
          "private_key_id",
          "private_key",
          "client_email",
          "client_id",
        ];
        for (const field of requiredFields) {
          if (!parsed[field]) {
            setGcsJsonError(t("settings.storage.missingField", { field }));
            return false;
          }
        }
        if (parsed.type !== "service_account") {
          setGcsJsonError(t("settings.storage.invalidType"));
          return false;
        }
        setGcsJsonError(null);
        return true;
      } catch {
        setGcsJsonError(t("settings.storage.invalidJson"));
        return false;
      }
    },
    [t],
  );

  // Storage config handlers
  const handleStorageSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || !entitySlug) return;

      // Validate GCS credentials if provider is GCS and credentials are provided
      if (
        storageProvider === "gcs" &&
        gcsCredentialsJson &&
        !validateGcsJson(gcsCredentialsJson)
      ) {
        return;
      }

      setIsSavingStorage(true);
      try {
        // Parse GCS credentials or use S3 credentials
        let credentials;
        if (storageProvider === "gcs") {
          if (gcsCredentialsJson.trim()) {
            credentials = JSON.parse(gcsCredentialsJson);
          } else if (storageConfig) {
            // Updating without changing credentials
            credentials = undefined;
          } else {
            setGcsJsonError(t("settings.storage.credentialsRequired"));
            setIsSavingStorage(false);
            return;
          }
        } else {
          if (!s3AccessKeyId || !s3SecretAccessKey || !s3Region) {
            if (!storageConfig) {
              getInfoService().show(
                t("common:common.error"),
                t("settings.storage.credentialsRequired"),
                InfoType.ERROR,
                5000,
              );
              setIsSavingStorage(false);
              return;
            }
          }
          credentials = {
            region: s3Region,
            access_key_id: s3AccessKeyId,
            secret_access_key: s3SecretAccessKey,
          };
        }

        const data: StorageConfigCreateRequest = {
          provider: storageProvider,
          bucket: storageBucket,
          path_prefix: storagePrefix || undefined,
          credentials: credentials!,
        };
        const response = await saveStorageConfig(entitySlug, data, token);
        if (response.success) {
          success(t("settings.storage.saved"));
          // Clear sensitive fields after save
          setGcsCredentialsJson("");
          setS3SecretAccessKey("");
        } else {
          getInfoService().show(
            t("common:common.error"),
            response.error ?? t("settings.storage.saveError"),
            InfoType.ERROR,
            5000,
          );
        }
      } catch (err) {
        getInfoService().show(
          t("common:common.error"),
          err instanceof Error ? err.message : t("settings.storage.saveError"),
          InfoType.ERROR,
          5000,
        );
      } finally {
        setIsSavingStorage(false);
      }
    },
    [
      token,
      entitySlug,
      storageProvider,
      storageBucket,
      storagePrefix,
      gcsCredentialsJson,
      s3Region,
      s3AccessKeyId,
      s3SecretAccessKey,
      storageConfig,
      saveStorageConfig,
      validateGcsJson,
      success,
      t,
    ],
  );

  const handleDeleteStorage = useCallback(async () => {
    if (!token || !entitySlug) return;
    if (!confirm(t("settings.storage.confirmDelete"))) return;

    try {
      const response = await deleteStorageConfig(entitySlug, token);
      if (response.success) {
        success(t("common:toast.success.deleted"));
        // Clear form
        setStorageBucket("");
        setStoragePrefix("");
        setGcsCredentialsJson("");
        setGcsJsonError(null);
        setS3Region("");
        setS3AccessKeyId("");
        setS3SecretAccessKey("");
      } else {
        getInfoService().show(
          t("common:common.error"),
          response.error ?? t("settings.storage.deleteError"),
          InfoType.ERROR,
          5000,
        );
      }
    } catch (err) {
      getInfoService().show(
        t("common:common.error"),
        err instanceof Error ? err.message : t("settings.storage.deleteError"),
        InfoType.ERROR,
        5000,
      );
    }
  }, [token, entitySlug, deleteStorageConfig, success, t]);

  // Show error via InfoInterface
  useEffect(() => {
    if (error && !settings) {
      getInfoService().show(
        t("settings.form.error"),
        error,
        InfoType.ERROR,
        5000,
      );
    }
  }, [error, settings, t]);

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Organization Settings Card */}
      <div className="bg-theme-bg-primary border border-theme-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-theme-border">
          <h2 className="text-lg font-semibold text-theme-text-primary">
            {t("settings.organization.title")}
          </h2>
          <p className="mt-1 text-sm text-theme-text-secondary">
            {t("settings.organization.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Organization Name */}
          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-theme-text-primary mb-1"
            >
              {t("settings.organization.name")}
            </label>
            <input
              id="organizationName"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder={t("settings.organization.namePlaceholder")}
              className="w-full max-w-md px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="mt-1 text-xs text-theme-text-tertiary">
              {t("settings.organization.nameHint")}
            </p>
          </div>

          {/* Organization Path */}
          <div>
            <label
              htmlFor="organizationPath"
              className="block text-sm font-medium text-theme-text-primary mb-1"
            >
              {t("settings.organization.path")}
            </label>
            <input
              id="organizationPath"
              type="text"
              value={organizationPath}
              onChange={(e) => handlePathChange(e.target.value)}
              placeholder={t("settings.organization.pathPlaceholder")}
              className={`w-full max-w-md px-3 py-2 border rounded-lg bg-theme-bg-primary focus:ring-2 focus:border-transparent outline-none font-mono text-sm ${
                pathError
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-theme-border focus:ring-blue-500"
              }`}
            />
            {pathError ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {pathError}
              </p>
            ) : (
              <p className="mt-1 text-xs text-theme-text-tertiary">
                {t("settings.organization.pathHint")}
              </p>
            )}

            {/* Preview URL */}
            {organizationPath && !pathError && (
              <div className="mt-3 p-3 bg-theme-bg-secondary rounded-lg">
                <p className="text-xs text-theme-text-tertiary mb-1">
                  {t("settings.organization.apiUrlPreview")}
                </p>
                <code className="text-sm font-mono text-theme-text-primary">
                  /api/v1/ai/
                  <span className="text-blue-600">{organizationPath}</span>
                  /project-name/endpoint-name
                </code>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || !hasChanges || !!pathError}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
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
                  {t("settings.form.saving")}
                </span>
              ) : (
                t("settings.form.save")
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Storage Configuration Card */}
      <div className="bg-theme-bg-primary border border-theme-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-theme-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-theme-text-primary">
                {t("settings.storage.title")}
              </h2>
              <p className="mt-1 text-sm text-theme-text-secondary">
                {t("settings.storage.description")}
              </p>
            </div>
            {storageConfig && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                {t("settings.storage.configured")}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleStorageSubmit} className="p-6 space-y-6">
          {storageLoading && !storageConfig ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {/* Storage Provider */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("settings.storage.provider")}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storageProvider"
                      value="gcs"
                      checked={storageProvider === "gcs"}
                      onChange={() => setStorageProvider("gcs")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-theme-text-primary">
                      Google Cloud Storage
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storageProvider"
                      value="s3"
                      checked={storageProvider === "s3"}
                      onChange={() => setStorageProvider("s3")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-theme-text-primary">
                      Amazon S3
                    </span>
                  </label>
                </div>
              </div>

              {/* Bucket Name */}
              <div>
                <label
                  htmlFor="storageBucket"
                  className="block text-sm font-medium text-theme-text-primary mb-1"
                >
                  {t("settings.storage.bucket")}
                </label>
                <input
                  id="storageBucket"
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder={
                    storageProvider === "gcs"
                      ? "my-bucket-name"
                      : "my-s3-bucket"
                  }
                  className="w-full max-w-md px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                  required
                />
              </div>

              {/* Prefix (optional) */}
              <div>
                <label
                  htmlFor="storagePrefix"
                  className="block text-sm font-medium text-theme-text-primary mb-1"
                >
                  {t("settings.storage.prefix")}
                  <span className="text-theme-text-tertiary ml-1">
                    ({t("common:optional")})
                  </span>
                </label>
                <input
                  id="storagePrefix"
                  type="text"
                  value={storagePrefix}
                  onChange={(e) => setStoragePrefix(e.target.value)}
                  placeholder="generated-media/"
                  className="w-full max-w-md px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-theme-text-tertiary">
                  {t("settings.storage.prefixHint")}
                </p>
              </div>

              {/* GCS Credentials */}
              {storageProvider === "gcs" && (
                <div className="space-y-4 p-4 bg-theme-bg-secondary rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-theme-text-primary">
                        {t("settings.storage.gcsCredentials")}
                      </h4>
                      <p className="text-xs text-theme-text-tertiary mt-1">
                        {t("settings.storage.gcsCredentialsHint")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="gcsCredentialsJson"
                      className="block text-sm font-medium text-theme-text-primary mb-1"
                    >
                      {t("settings.storage.serviceAccountJson")}
                    </label>
                    <textarea
                      id="gcsCredentialsJson"
                      value={gcsCredentialsJson}
                      onChange={(e) => {
                        setGcsCredentialsJson(e.target.value);
                        if (e.target.value) {
                          validateGcsJson(e.target.value);
                        } else {
                          setGcsJsonError(null);
                        }
                      }}
                      placeholder={
                        storageConfig
                          ? t("settings.storage.credentialsHidden")
                          : '{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'
                      }
                      className={`w-full px-3 py-2 border rounded-lg bg-theme-bg-primary focus:ring-2 focus:border-transparent outline-none font-mono text-xs h-40 resize-y ${
                        gcsJsonError
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-theme-border focus:ring-blue-500"
                      }`}
                      required={storageProvider === "gcs" && !storageConfig}
                    />
                    {gcsJsonError ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {gcsJsonError}
                      </p>
                    ) : storageConfig ? (
                      <p className="mt-1 text-xs text-theme-text-tertiary">
                        {t("settings.storage.leaveEmptyToKeep")}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {/* S3 Credentials */}
              {storageProvider === "s3" && (
                <div className="space-y-4 p-4 bg-theme-bg-secondary rounded-lg">
                  <h4 className="text-sm font-medium text-theme-text-primary">
                    {t("settings.storage.s3Credentials")}
                  </h4>

                  <div>
                    <label
                      htmlFor="s3Region"
                      className="block text-sm font-medium text-theme-text-primary mb-1"
                    >
                      {t("settings.storage.region")}
                    </label>
                    <input
                      id="s3Region"
                      type="text"
                      value={s3Region}
                      onChange={(e) => setS3Region(e.target.value)}
                      placeholder="us-east-1"
                      className="w-full max-w-md px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                      required={storageProvider === "s3" && !storageConfig}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="s3AccessKeyId"
                      className="block text-sm font-medium text-theme-text-primary mb-1"
                    >
                      {t("settings.storage.accessKeyId")}
                    </label>
                    <input
                      id="s3AccessKeyId"
                      type="text"
                      value={s3AccessKeyId}
                      onChange={(e) => setS3AccessKeyId(e.target.value)}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className="w-full max-w-md px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                      required={storageProvider === "s3" && !storageConfig}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="s3SecretAccessKey"
                      className="block text-sm font-medium text-theme-text-primary mb-1"
                    >
                      {t("settings.storage.secretAccessKey")}
                    </label>
                    <input
                      id="s3SecretAccessKey"
                      type="password"
                      value={s3SecretAccessKey}
                      onChange={(e) => setS3SecretAccessKey(e.target.value)}
                      placeholder={
                        storageConfig
                          ? t("settings.storage.credentialsHidden")
                          : "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      }
                      className="w-full max-w-md px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                      required={storageProvider === "s3" && !storageConfig}
                    />
                    {storageConfig && (
                      <p className="mt-1 text-xs text-theme-text-tertiary">
                        {t("settings.storage.leaveEmptyToKeep")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {storageError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {storageError}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSavingStorage || !storageBucket}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingStorage ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
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
                      {t("settings.form.saving")}
                    </span>
                  ) : storageConfig ? (
                    t("settings.storage.update")
                  ) : (
                    t("settings.storage.configure")
                  )}
                </button>

                {storageConfig && (
                  <button
                    type="button"
                    onClick={handleDeleteStorage}
                    className="px-4 py-2 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {t("settings.storage.remove")}
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
