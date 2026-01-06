import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsManager } from "@sudobility/shapeshyft_lib";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

function SettingsPage() {
  const { t } = useTranslation("dashboard");
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
    </div>
  );
}

export default SettingsPage;
