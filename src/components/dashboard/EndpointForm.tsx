import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKeysManager } from "@sudobility/shapeshyft_lib";
import type {
  Endpoint,
  EndpointCreateRequest,
  HttpMethod,
  LlmProvider,
} from "@sudobility/shapeshyft_types";
import {
  PROVIDER_MODELS,
  DEFAULT_PROVIDER_MODEL,
  PROVIDER_ALLOWS_CUSTOM_MODEL,
  getModelPricing,
} from "@sudobility/shapeshyft_types";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useApi } from "../../hooks/useApi";
import SchemaEditor from "./SchemaEditor";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST"];

interface EndpointFormProps {
  projectId: string;
  endpoint?: Endpoint;
  onSubmit: (data: EndpointCreateRequest) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

interface FieldErrors {
  displayName?: string;
  endpointName?: string;
  llmKeyId?: string;
  inputSchema?: string;
  outputSchema?: string;
}

function EndpointForm({
  endpoint,
  onSubmit,
  onClose,
  isLoading,
}: EndpointFormProps) {
  const { t } = useTranslation("dashboard");
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token, isReady } = useApi();

  const isEditing = !!endpoint;

  const [displayName, setDisplayName] = useState(endpoint?.display_name ?? "");
  const [endpointName, setEndpointName] = useState(
    endpoint?.endpoint_name ?? "",
  );
  const [instructions, setInstructions] = useState(
    endpoint?.instructions ?? "",
  );
  const [httpMethod, setHttpMethod] = useState<HttpMethod>(
    endpoint?.http_method ?? "POST",
  );
  const [llmKeyId, setLlmKeyId] = useState(endpoint?.llm_key_id ?? "");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("");
  const [context, setContext] = useState(endpoint?.context ?? "");
  const [useInputSchema, setUseInputSchema] = useState(
    !!endpoint?.input_schema,
  );
  const [useOutputSchema, setUseOutputSchema] = useState(
    !!endpoint?.output_schema,
  );
  const [inputSchema, setInputSchema] = useState(
    endpoint?.input_schema
      ? JSON.stringify(endpoint.input_schema, null, 2)
      : '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}',
  );
  const [outputSchema, setOutputSchema] = useState(
    endpoint?.output_schema
      ? JSON.stringify(endpoint.output_schema, null, 2)
      : '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}',
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  // Get the selected key and its provider
  const selectedKey = useMemo(
    () => keys.find((k) => k.uuid === llmKeyId),
    [keys, llmKeyId]
  );
  const provider = selectedKey?.provider as LlmProvider | undefined;

  // Get available models for the selected provider
  const availableModels = useMemo(() => {
    if (!provider) return [];
    return PROVIDER_MODELS[provider] ?? [];
  }, [provider]);

  // Whether custom model input is allowed
  const allowsCustomModel = provider
    ? PROVIDER_ALLOWS_CUSTOM_MODEL[provider]
    : false;

  // The effective model (selected or custom)
  const effectiveModel = useMemo(() => {
    if (allowsCustomModel && customModel.trim()) {
      return customModel.trim();
    }
    return selectedModel || (provider ? DEFAULT_PROVIDER_MODEL[provider] : "");
  }, [selectedModel, customModel, allowsCustomModel, provider]);

  // Get pricing for the effective model
  const modelPricing = useMemo(() => {
    if (!effectiveModel) return null;
    return getModelPricing(effectiveModel);
  }, [effectiveModel]);

  // Handle key selection change - update model to default for provider
  const handleKeyChange = (newKeyId: string) => {
    setLlmKeyId(newKeyId);
    const newKey = keys.find((k) => k.uuid === newKeyId);
    const newProvider = newKey?.provider as LlmProvider | undefined;
    if (newProvider) {
      setSelectedModel(DEFAULT_PROVIDER_MODEL[newProvider]);
      setCustomModel("");
    } else {
      setSelectedModel("");
      setCustomModel("");
    }
    if (touched.llmKeyId) {
      setFieldErrors((prev) => ({
        ...prev,
        llmKeyId: validateLlmKeyId(newKeyId),
      }));
    }
  };

  // Auto-generate endpoint name from display name
  const generateEndpointName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    // Auto-fill endpoint name for new endpoints if it hasn't been manually edited
    if (!isEditing && !endpointName) {
      setEndpointName(generateEndpointName(value));
    }
    if (touched.displayName) {
      setFieldErrors((prev) => ({
        ...prev,
        displayName: validateDisplayName(value),
      }));
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const validateDisplayName = (value: string): string | undefined => {
    if (!value.trim()) return t("endpoints.form.errors.nameRequired");
    return undefined;
  };

  const validateEndpointName = (value: string): string | undefined => {
    if (!value.trim()) return t("endpoints.form.errors.slugRequired");
    return undefined;
  };

  const validateLlmKeyId = (value: string): string | undefined => {
    if (!value) return t("endpoints.form.errors.keyRequired");
    return undefined;
  };

  const validateInputSchema = (
    value: string,
    isUsed: boolean,
  ): string | undefined => {
    if (isUsed && !validateJson(value))
      return t("endpoints.form.errors.invalidInputSchema");
    return undefined;
  };

  const validateOutputSchema = (
    value: string,
    isUsed: boolean,
  ): string | undefined => {
    if (isUsed && !validateJson(value))
      return t("endpoints.form.errors.invalidOutputSchema");
    return undefined;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let error: string | undefined;
    switch (field) {
      case "displayName":
        error = validateDisplayName(displayName);
        break;
      case "endpointName":
        error = validateEndpointName(endpointName);
        break;
      case "llmKeyId":
        error = validateLlmKeyId(llmKeyId);
        break;
      case "inputSchema":
        error = validateInputSchema(inputSchema, useInputSchema);
        break;
      case "outputSchema":
        error = validateOutputSchema(outputSchema, useOutputSchema);
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await onSubmit({
        endpoint_name: endpointName.trim(),
        display_name: displayName.trim(),
        instructions: instructions.trim() || null,
        http_method: httpMethod,
        llm_key_id: llmKeyId,
        context: context.trim() || null,
        input_schema: useInputSchema ? JSON.parse(inputSchema) : null,
        output_schema: useOutputSchema ? JSON.parse(outputSchema) : null,
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
        <svg
          className="w-3 h-3 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-theme-bg-primary rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-theme-border shrink-0">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {isEditing
              ? t("endpoints.form.titleEdit")
              : t("endpoints.form.title")}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("endpoints.form.displayName")}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  onBlur={() => handleBlur("displayName")}
                  placeholder={t("endpoints.form.displayNamePlaceholder")}
                  className={inputClassName("displayName")}
                />
                {renderError("displayName")}
              </div>

              {/* Endpoint Name (slug) */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("endpoints.form.endpointName")}
                </label>
                <input
                  type="text"
                  value={endpointName}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-");
                    setEndpointName(value);
                    if (touched.endpointName) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        endpointName: validateEndpointName(value),
                      }));
                    }
                  }}
                  onBlur={() => handleBlur("endpointName")}
                  placeholder={t("endpoints.form.endpointNamePlaceholder")}
                  disabled={isEditing}
                  className={inputClassName(
                    "endpointName",
                    "font-mono disabled:opacity-50",
                  )}
                />
                {renderError("endpointName")}
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("endpoints.form.instructions")}{" "}
                  <span className="text-theme-text-tertiary">
                    ({t("common.optional")})
                  </span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t("endpoints.form.instructionsPlaceholder")}
                  rows={3}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* HTTP Method */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("endpoints.form.httpMethod")}
                </label>
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value as HttpMethod)}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {HTTP_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* LLM Key */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("endpoints.form.llmKey")}
                </label>
                {keysLoading ? (
                  <div className="h-10 bg-theme-bg-secondary rounded-lg animate-pulse" />
                ) : keys.length === 0 ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {t("endpoints.form.noKeys")}
                  </p>
                ) : (
                  <>
                    <select
                      value={llmKeyId}
                      onChange={(e) => handleKeyChange(e.target.value)}
                      onBlur={() => handleBlur("llmKeyId")}
                      className={inputClassName("llmKeyId")}
                    >
                      <option value="">{t("endpoints.form.selectKey")}</option>
                      {keys.map((key) => (
                        <option key={key.uuid} value={key.uuid}>
                          {key.key_name} ({key.provider})
                        </option>
                      ))}
                    </select>
                    {renderError("llmKeyId")}
                  </>
                )}
              </div>

              {/* Model Selection */}
              {provider && (
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t("endpoints.form.model")}
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>

                  {/* Custom model input for llm_server */}
                  {allowsCustomModel && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder={t("endpoints.form.customModelPlaceholder")}
                        className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                      />
                      <p className="mt-1 text-xs text-theme-text-tertiary">
                        {t("endpoints.form.customModelHint")}
                      </p>
                    </div>
                  )}

                  {/* Cost Estimation Display */}
                  {modelPricing && (
                    <div className="mt-3 p-3 bg-theme-bg-secondary rounded-lg border border-theme-border">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-theme-text-primary">
                          {t("endpoints.form.costEstimate")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-theme-text-tertiary">
                            {t("endpoints.form.inputCost")}:
                          </span>
                          <span className="ml-1 font-mono text-theme-text-primary">
                            ${(modelPricing.input / 100).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-theme-text-tertiary">
                            {t("endpoints.form.outputCost")}:
                          </span>
                          <span className="ml-1 font-mono text-theme-text-primary">
                            ${(modelPricing.output / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-theme-text-tertiary">
                        {t("endpoints.form.costPerMillion")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* System Context */}
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-1">
                  {t("endpoints.form.context")}
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={t("endpoints.form.contextPlaceholder")}
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
                  onChange={(e) => setUseInputSchema(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="useInputSchema"
                  className="text-sm font-medium text-theme-text-primary"
                >
                  {t("endpoints.form.useInputSchema")}
                </label>
              </div>

              {/* Input Schema */}
              {useInputSchema && (
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    {t("endpoints.form.inputSchema")}
                  </label>
                  <SchemaEditor
                    value={inputSchema}
                    onChange={(value) => {
                      setInputSchema(value);
                      if (touched.inputSchema) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          inputSchema: validateInputSchema(value, true),
                        }));
                      }
                    }}
                    error={!!hasError("inputSchema")}
                  />
                  {renderError("inputSchema")}
                </div>
              )}

              {/* Output Schema Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useOutputSchema"
                  checked={useOutputSchema}
                  onChange={(e) => setUseOutputSchema(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="useOutputSchema"
                  className="text-sm font-medium text-theme-text-primary"
                >
                  {t("endpoints.form.useOutputSchema")}
                </label>
              </div>

              {/* Output Schema */}
              {useOutputSchema && (
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">
                    {t("endpoints.form.outputSchema")}
                  </label>
                  <SchemaEditor
                    value={outputSchema}
                    onChange={(value) => {
                      setOutputSchema(value);
                      if (touched.outputSchema) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          outputSchema: validateOutputSchema(value, true),
                        }));
                      }
                    }}
                    error={!!hasError("outputSchema")}
                  />
                  {renderError("outputSchema")}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-theme-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !displayName.trim() ||
              !endpointName.trim() ||
              !llmKeyId
            }
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
              t("endpoints.form.create")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndpointForm;
