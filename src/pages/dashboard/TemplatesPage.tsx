import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useKeysManager,
  useProjectsManager,
  useProjectTemplates,
  useProviderModelsManager,
} from "@sudobility/shapeshyft_lib";
import { ShapeshyftClient, useProviders } from "@sudobility/shapeshyft_client";
import type {
  LlmProvider,
  ModelCapabilities,
} from "@sudobility/shapeshyft_types";
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
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import { CONSTANTS } from "../../config/constants";

// Image-related template IDs to filter out unless DEV_MODE is enabled
const IMAGE_TEMPLATE_IDS = [
  "image-recognition",
  "image-generation",
  "image-processing",
];

function TemplatesPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { navigate } = useLocalizedNavigate();
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token, testMode, isReady } = useApi();
  const { success } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  const { createProject } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: false,
  });

  const { templates: allTemplates, applyTemplate } = useProjectTemplates();

  // Filter out image-related templates unless DEV_MODE is enabled
  const templates = useMemo(() => {
    if (CONSTANTS.DEV_MODE) {
      return allTemplates;
    }
    return allTemplates.filter((t) => !IMAGE_TEMPLATE_IDS.includes(t.id));
  }, [allTemplates]);

  // Fetch providers for display names
  const { providers } = useProviders(networkClient, baseUrl, testMode);

  // Helper to get provider display name
  const getProviderName = (providerId: string) => {
    const providerInfo = providers.find((p) => p.id === providerId);
    return providerInfo?.name ?? providerId;
  };

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  // Get provider from selected key
  const selectedKey = keys.find((k) => k.uuid === selectedKeyId);
  const provider = selectedKey?.provider as LlmProvider | undefined;

  // Detect required capabilities from template endpoints
  const requiredCapabilities = useMemo(() => {
    if (!selectedTemplateData) return {};
    // Combine capabilities from all endpoints in the template
    let combined: ModelCapabilities = {};
    for (const ep of selectedTemplateData.endpoints) {
      const caps = detectRequiredCapabilities(
        ep.input_schema as Record<string, unknown>,
        ep.output_schema as Record<string, unknown>,
      );
      combined = { ...combined, ...caps };
    }
    return combined;
  }, [selectedTemplateData]);

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

  // Auto-fill project name when template is selected
  useEffect(() => {
    if (selectedTemplateData && !projectName) {
      setProjectName(
        selectedTemplateData.name.toLowerCase().replace(/\s+/g, "-"),
      );
    }
  }, [selectedTemplateData, projectName]);

  const handleApply = async () => {
    if (!selectedTemplate || !projectName.trim() || !selectedKeyId) {
      getInfoService().show(
        t("common.error"),
        t("templates.errors.fillAllFields"),
        InfoType.ERROR,
        5000,
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = applyTemplate(
        selectedTemplate,
        projectName.trim(),
        selectedKeyId,
      );
      if (result && entitySlug && token) {
        // Create the project first
        const project = await createProject(result.project);
        if (!project) {
          throw new Error("Failed to create project");
        }

        // Create endpoints using the client, with the selected model
        const client = new ShapeshyftClient({
          networkClient,
          baseUrl,
          testMode,
        });
        for (const endpointData of result.endpoints) {
          await client.createEndpoint(
            entitySlug,
            project.uuid,
            { ...endpointData, model: effectiveModel || undefined },
            token,
          );
        }

        success(t("common:toast.success.created"));
        navigate(`/dashboard/${entitySlug}/projects/${project.uuid}`);
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
    navigate(`/dashboard/${entitySlug}`);
  };

  return (
    <div>
      <p className="text-theme-text-secondary mb-6">
        {t("templates.subtitle")}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() =>
              !template.requiresV2 && setSelectedTemplate(template.id)
            }
            disabled={template.requiresV2}
            className={`p-4 text-left rounded-xl border-2 transition-all ${
              template.requiresV2
                ? "border-theme-border opacity-60 cursor-not-allowed"
                : selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-theme-border hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-theme-text-primary">
                {template.name}
              </h4>
              {template.requiresV2 && (
                <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                  {t("templates.comingSoon")}
                </span>
              )}
            </div>
            <p className="text-sm text-theme-text-secondary mb-2">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {template.endpoints.map((ep) => (
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
            {t("templates.configure")}
          </h4>

          {/* Project Name */}
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-theme-text-primary mb-1"
            >
              {t("templates.projectName")}
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) =>
                setProjectName(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-"),
                )
              }
              placeholder={t("templates.projectNamePlaceholder")}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow font-mono"
            />
          </div>

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
          {selectedTemplateData && (
            <div className="p-4 bg-theme-bg-secondary rounded-lg">
              <h5 className="text-sm font-medium text-theme-text-primary mb-2">
                {t("templates.preview")}
              </h5>
              <p className="text-sm text-theme-text-secondary mb-2">
                {t("templates.willCreate", {
                  count: selectedTemplateData.endpoints.length,
                })}
              </p>
              <ul className="space-y-1">
                {selectedTemplateData.endpoints.map((ep) => (
                  <li
                    key={ep.endpoint_name}
                    className="text-sm text-theme-text-tertiary flex items-center gap-2"
                  >
                    <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      POST
                    </span>
                    <span className="font-mono">
                      /{entitySlug}/{projectName}/{ep.endpoint_name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          disabled={
            isLoading ||
            !selectedTemplate ||
            !projectName.trim() ||
            !selectedKeyId
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
              {t("common.creating")}
            </span>
          ) : (
            t("templates.apply")
          )}
        </button>
      </div>
    </div>
  );
}

export default TemplatesPage;
