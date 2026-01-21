import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useKeysManager,
  useEndpointsManager,
  useEndpointTemplates,
  useProviderModelsManager,
  type EndpointTemplateWithCategory,
} from "@sudobility/shapeshyft_lib";
import { useProviders } from "@sudobility/shapeshyft_client";
import type { LlmProvider } from "@sudobility/shapeshyft_types";
import { detectRequiredCapabilities } from "@sudobility/shapeshyft_types";
import {
  PhotoIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import {
  EditableSelector,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@sudobility/components";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";
import { useApi } from "@sudobility/building_blocks/firebase";
import { useToast } from "../../hooks/useToast";

function EndpointTemplatesPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { navigate } = useLocalizedNavigate();
  const { entitySlug = "", projectId = "" } = useParams<{
    entitySlug: string;
    projectId: string;
  }>();
  const { networkClient, baseUrl, token, testMode, isReady } = useApi();
  const { success } = useToast();

  const [selectedTemplate, setSelectedTemplate] =
    useState<EndpointTemplateWithCategory | null>(null);
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  const { endpoints, createEndpoint } = useEndpointsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    projectId,
    autoFetch: isReady && !!projectId && !!entitySlug,
  });

  // Get existing endpoint names for duplicate checking
  const existingEndpointNames = endpoints.map((e) => e.endpoint_name);

  // Check if endpoint name already exists
  const endpointNameExists = (name: string): boolean => {
    if (!name) return false;
    return existingEndpointNames.some(
      (existing) => existing.toLowerCase() === name.toLowerCase(),
    );
  };

  const { endpointTemplates, getCategories, applyEndpointTemplate } =
    useEndpointTemplates();
  const categories = getCategories();

  // Fetch providers for display names
  const { providers } = useProviders(networkClient, baseUrl, testMode);

  // Helper to get provider display name
  const getProviderName = (providerId: string) => {
    const providerInfo = providers.find((p) => p.id === providerId);
    return providerInfo?.name ?? providerId;
  };

  // Get provider from selected key
  const selectedKey = keys.find((k) => k.uuid === selectedKeyId);
  const provider = selectedKey?.provider as LlmProvider | undefined;

  // Detect required capabilities from selected template
  const requiredCapabilities = useMemo(() => {
    if (!selectedTemplate) return {};
    return detectRequiredCapabilities(
      selectedTemplate.input_schema as Record<string, unknown> | null,
      selectedTemplate.output_schema as Record<string, unknown> | null,
    );
  }, [selectedTemplate]);

  // Fetch and filter models for the selected provider using the lib hook
  const {
    models: filteredModels,
    allowsCustomModel,
    defaultModel,
  } = useProviderModelsManager({
    networkClient,
    baseUrl,
    provider: provider ?? null,
    requiredCapabilities,
    testMode,
  });

  // Build model options with capability icons
  const modelOptions = useMemo(() => {
    return filteredModels.map((modelInfo) => {
      const caps = modelInfo.capabilities;
      const inputIcons: ReactNode[] = [];
      const outputIcons: ReactNode[] = [];

      if (caps.visionInput)
        inputIcons.push(
          <PhotoIcon key="vi" className="w-4 h-4 text-blue-500" />,
        );
      if (caps.audioInput)
        inputIcons.push(
          <MicrophoneIcon key="ai" className="w-4 h-4 text-blue-500" />,
        );
      if (caps.videoInput)
        inputIcons.push(
          <VideoCameraIcon key="vdi" className="w-4 h-4 text-blue-500" />,
        );
      if (caps.imageOutput)
        outputIcons.push(
          <PhotoIcon key="io" className="w-4 h-4 text-green-500" />,
        );
      if (caps.audioOutput)
        outputIcons.push(
          <MicrophoneIcon key="ao" className="w-4 h-4 text-green-500" />,
        );
      if (caps.videoOutput)
        outputIcons.push(
          <VideoCameraIcon key="vdo" className="w-4 h-4 text-green-500" />,
        );

      const hasIcons = inputIcons.length > 0 || outputIcons.length > 0;
      const label = hasIcons ? (
        <span className="flex items-center gap-2">
          <span className="font-mono">{modelInfo.id}</span>
          <span className="flex items-center gap-1">
            {inputIcons}
            {outputIcons}
          </span>
        </span>
      ) : (
        modelInfo.id
      );

      return { value: modelInfo.id, label, searchLabel: modelInfo.id };
    });
  }, [filteredModels]);

  // The effective model (selected or custom)
  const effectiveModel = useMemo(() => {
    if (allowsCustomModel && customModel.trim()) {
      return customModel.trim();
    }
    return selectedModel || (defaultModel ?? "");
  }, [selectedModel, customModel, allowsCustomModel, defaultModel]);

  // Filter templates by category
  const filteredTemplates = selectedCategory
    ? endpointTemplates.filter((t) => t.category === selectedCategory)
    : endpointTemplates;

  // Auto-select first key if only one available
  useEffect(() => {
    if (keys.length === 1 && !selectedKeyId) {
      setSelectedKeyId(keys[0].uuid);
    }
  }, [keys, selectedKeyId]);

  const handleApply = async () => {
    if (!selectedTemplate || !selectedKeyId) {
      getInfoService().show(
        t("common.error"),
        t("endpointTemplates.errors.fillAllFields"),
        InfoType.ERROR,
        5000,
      );
      return;
    }

    // Check for duplicate endpoint name
    if (endpointNameExists(selectedTemplate.endpoint_name)) {
      getInfoService().show(
        t("common.error"),
        t("endpoints.form.errors.slugExists"),
        InfoType.ERROR,
        5000,
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpointRequest = applyEndpointTemplate(
        selectedTemplate,
        selectedKeyId,
      );
      const newEndpoint = await createEndpoint({
        ...endpointRequest,
        model: effectiveModel || null,
      });
      if (newEndpoint) {
        success(t("common:toast.success.created"));
        navigate(
          `/dashboard/${entitySlug}/projects/${projectId}/endpoints/${newEndpoint.uuid}`,
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("common.errorOccurred");
      setError(errorMessage);
      getInfoService().show(
        t("common.error"),
        errorMessage,
        InfoType.ERROR,
        5000,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/${entitySlug}/projects/${projectId}`);
  };

  return (
    <div>
      <p className="text-theme-text-secondary mb-6">
        {t("endpointTemplates.subtitle")}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedCategory === null
              ? "bg-blue-600 text-white"
              : "bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover-bg"
          }`}
        >
          {t("endpointTemplates.allCategories")}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-hover-bg"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredTemplates.map((template) => (
          <button
            key={`${template.projectTemplateId}-${template.endpoint_name}`}
            onClick={() => setSelectedTemplate(template)}
            className={`p-4 text-left rounded-xl border-2 transition-all ${
              selectedTemplate?.endpoint_name === template.endpoint_name &&
              selectedTemplate?.projectTemplateId === template.projectTemplateId
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-theme-border hover:border-blue-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-theme-bg-tertiary text-theme-text-tertiary">
                {template.category}
              </span>
            </div>
            <h4 className="font-semibold text-theme-text-primary mb-1">
              {template.display_name}
            </h4>
            <p className="text-xs text-theme-text-tertiary font-mono mb-2">
              /{template.endpoint_name}
            </p>
            <p className="text-sm text-theme-text-secondary line-clamp-2">
              {template.instructions}
            </p>
          </button>
        ))}
      </div>

      {/* Configuration (shown when template selected) */}
      {selectedTemplate && (
        <div className="space-y-4 pt-4 border-t border-theme-border">
          <h4 className="font-medium text-theme-text-primary">
            {t("endpointTemplates.configure")}
          </h4>

          {/* LLM Key Selection */}
          <div>
            <label
              htmlFor="llmKey"
              className="block text-sm font-medium text-theme-text-primary mb-1"
            >
              {t("templates.llmKey")}
            </label>
            {keysLoading ? (
              <div className="h-10 bg-theme-bg-secondary rounded-lg animate-pulse" />
            ) : keys.length === 0 ? (
              <p className="text-sm text-theme-text-secondary">
                {t("templates.noKeys")}{" "}
                <button
                  onClick={() => navigate(`/dashboard/${entitySlug}/providers`)}
                  className="text-blue-600 hover:underline"
                >
                  {t("templates.addKeyLink")}
                </button>
              </p>
            ) : (
              <Select
                value={selectedKeyId}
                onValueChange={(newKeyId: string) => {
                  setSelectedKeyId(newKeyId);
                  // Reset model when provider changes
                  const newKey = keys.find((k) => k.uuid === newKeyId);
                  const oldKey = keys.find((k) => k.uuid === selectedKeyId);
                  if (newKey?.provider !== oldKey?.provider) {
                    setSelectedModel("");
                    setCustomModel("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("templates.selectKey")} />
                </SelectTrigger>
                <SelectContent>
                  {keys.map((key) => (
                    <SelectItem key={key.uuid} value={key.uuid}>
                      {key.key_name} ({getProviderName(key.provider)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {t("endpoints.form.model")}
            </label>
            {allowsCustomModel ? (
              <EditableSelector
                options={modelOptions}
                value={effectiveModel}
                onChange={(value: string) => {
                  setSelectedModel(value);
                  setCustomModel("");
                }}
                disabled={!provider}
                placeholder={
                  !provider
                    ? t("endpoints.form.selectModel")
                    : t("endpoints.form.modelPlaceholder")
                }
                inputClassName="font-mono text-sm"
              />
            ) : (
              <Select
                value={effectiveModel}
                onValueChange={(value: string) => {
                  setSelectedModel(value);
                }}
                disabled={!provider}
              >
                <SelectTrigger className="w-full font-mono text-sm">
                  <SelectValue
                    placeholder={
                      !provider
                        ? t("endpoints.form.selectModel")
                        : t("endpoints.form.modelPlaceholder")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Template Preview */}
          <div className="p-4 bg-theme-bg-secondary rounded-lg">
            <h5 className="text-sm font-medium text-theme-text-primary mb-2">
              {t("endpointTemplates.preview")}
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-theme-text-tertiary">
                  {t("endpointTemplates.endpointName")}:
                </span>
                <span className="font-mono text-theme-text-primary">
                  {selectedTemplate.endpoint_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-theme-text-tertiary">
                  {t("endpointTemplates.category")}:
                </span>
                <span className="text-theme-text-primary">
                  {selectedTemplate.category}
                </span>
              </div>
              {selectedTemplate.input_schema && (
                <div>
                  <span className="text-theme-text-tertiary">
                    {t("endpointTemplates.inputFields")}:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.keys(
                      (selectedTemplate.input_schema as Record<string, unknown>)
                        ?.properties || {},
                    ).map((field) => (
                      <span
                        key={field}
                        className="px-2 py-0.5 text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-theme-border">
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleApply}
          disabled={isLoading || !selectedTemplate || !selectedKeyId}
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
              {t("common.creating")}
            </span>
          ) : (
            t("endpointTemplates.create")
          )}
        </button>
      </div>
    </div>
  );
}

export default EndpointTemplatesPage;
