import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type {
  LlmApiKeySafe,
  LlmApiKeyCreateRequest,
  LlmProvider,
} from "@sudobility/shapeshyft_types";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { PROVIDER_OPTIONS } from "../../config/providers-config";

interface KeyFormProps {
  apiKey?: LlmApiKeySafe;
  onSubmit: (data: LlmApiKeyCreateRequest) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

interface FieldErrors {
  keyName?: string;
  apiKey?: string;
  endpointUrl?: string;
}

function KeyForm({ apiKey, onSubmit, onClose, isLoading }: KeyFormProps) {
  const { t } = useTranslation("dashboard");
  const isEditing = !!apiKey;

  const [keyName, setKeyName] = useState(apiKey?.key_name ?? "");
  const [provider, setProvider] = useState<LlmProvider>(
    apiKey?.provider ?? "openai",
  );
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [endpointUrl, setEndpointUrl] = useState(apiKey?.endpoint_url ?? "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const validateKeyName = (value: string): string | undefined => {
    if (!value.trim()) {
      return t("keys.form.errors.nameRequired");
    }
    return undefined;
  };

  const validateApiKey = (
    value: string,
    currentProvider: LlmProvider,
  ): string | undefined => {
    // API key not required for custom LM server or when editing
    if (currentProvider === "llm_server" || isEditing) {
      return undefined;
    }
    if (!value.trim()) {
      return t("keys.form.errors.apiKeyRequired");
    }
    return undefined;
  };

  const validateEndpointUrl = (
    value: string,
    currentProvider: LlmProvider,
  ): string | undefined => {
    if (currentProvider === "llm_server" && !value.trim()) {
      return t("keys.form.errors.endpointRequired");
    }
    return undefined;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let error: string | undefined;
    switch (field) {
      case "keyName":
        error = validateKeyName(keyName);
        break;
      case "apiKey":
        error = validateApiKey(apiKeyValue, provider);
        break;
      case "endpointUrl":
        error = validateEndpointUrl(endpointUrl, provider);
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "keyName":
        setKeyName(value);
        if (touched.keyName) {
          setFieldErrors((prev) => ({
            ...prev,
            keyName: validateKeyName(value),
          }));
        }
        break;
      case "apiKey":
        setApiKeyValue(value);
        if (touched.apiKey) {
          setFieldErrors((prev) => ({
            ...prev,
            apiKey: validateApiKey(value, provider),
          }));
        }
        break;
      case "endpointUrl":
        setEndpointUrl(value);
        if (touched.endpointUrl) {
          setFieldErrors((prev) => ({
            ...prev,
            endpointUrl: validateEndpointUrl(value, provider),
          }));
        }
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {
      keyName: validateKeyName(keyName),
      apiKey: validateApiKey(apiKeyValue, provider),
      endpointUrl: validateEndpointUrl(endpointUrl, provider),
    };

    setFieldErrors(errors);
    setTouched({ keyName: true, apiKey: true, endpointUrl: true });

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    try {
      await onSubmit({
        key_name: keyName.trim(),
        provider,
        api_key: apiKeyValue.trim() || undefined,
        endpoint_url:
          provider === "llm_server" ? endpointUrl.trim() : undefined,
      });
    } catch (err) {
      getInfoService().show(
        t("common.error"),
        err instanceof Error ? err.message : t("common.errorOccurred"),
        InfoType.ERROR,
        5000,
      );
    }
  };

  const hasError = (field: keyof FieldErrors) =>
    touched[field] && fieldErrors[field];

  const renderError = (field: keyof FieldErrors) => {
    if (!hasError(field)) return null;
    return (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {fieldErrors[field]}
      </p>
    );
  };

  const inputClassName = (field: keyof FieldErrors, extra?: string) =>
    `w-full px-3 py-2 border rounded-lg bg-theme-bg-primary outline-none transition-all ${extra ?? ""} ${
      hasError(field)
        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-theme-bg-primary rounded-none sm:rounded-xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {isEditing ? t("keys.form.titleEdit") : t("keys.form.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-theme-hover-bg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {t("keys.form.provider")}
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as LlmProvider)}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
              autoFocus
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Key Name */}
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {t("keys.form.keyName")}
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => handleFieldChange("keyName", e.target.value)}
              onBlur={() => handleBlur("keyName")}
              placeholder={t("keys.form.keyNamePlaceholder")}
              className={inputClassName("keyName")}
            />
            {renderError("keyName")}
          </div>

          {/* Endpoint URL (for llm_server) */}
          {provider === "llm_server" && (
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t("keys.form.endpointUrl")}
              </label>
              <input
                type="url"
                value={endpointUrl}
                onChange={(e) =>
                  handleFieldChange("endpointUrl", e.target.value)
                }
                onBlur={() => handleBlur("endpointUrl")}
                placeholder={t("keys.form.endpointUrlPlaceholder")}
                className={inputClassName("endpointUrl", "font-mono text-sm")}
              />
              {renderError("endpointUrl")}
            </div>
          )}

          {/* API Key (not needed for custom LM server) */}
          {provider !== "llm_server" && (
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t("keys.form.apiKey")}
                {isEditing && (
                  <span className="text-theme-text-tertiary ml-1">
                    ({t("keys.form.leaveBlank")})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyValue}
                  onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                  onBlur={() => handleBlur("apiKey")}
                  placeholder={
                    isEditing
                      ? "••••••••••••••••"
                      : t("keys.form.apiKeyPlaceholder")
                  }
                  className={inputClassName(
                    "apiKey",
                    "pr-10 font-mono text-sm",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-hover-bg rounded"
                >
                  {showApiKey ? (
                    <svg
                      className="w-5 h-5 text-theme-text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-theme-text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {renderError("apiKey")}
              {!hasError("apiKey") && (
                <p className="mt-1 text-xs text-theme-text-tertiary">
                  {t("keys.form.apiKeyHint")}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading || !keyName.trim()}
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
                  {t("common.saving")}
                </span>
              ) : isEditing ? (
                t("common.save")
              ) : (
                t("keys.form.add")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default KeyForm;
