import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useProjectsManager,
  useEndpointsManager,
  useEndpointTester,
  useKeysManager,
} from "@sudobility/shapeshyft_lib";
import { useProviders, useProviderModels } from "@sudobility/shapeshyft_client";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import type {
  GeneratedMedia,
  LlmProvider,
  MediaInputFormat,
} from "@sudobility/shapeshyft_types";
import { estimateCost, formatCost } from "@sudobility/shapeshyft_types";
import {
  PhotoIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  EditableSelector,
} from "@sudobility/components";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import SchemaEditor from "../../components/dashboard/SchemaEditor";
import DetailErrorState from "../../components/dashboard/DetailErrorState";
import RateLimitPanel from "../../components/dashboard/RateLimitPanel";
import { isServerError, isRateLimitError } from "../../utils/errorUtils";
import { ProviderIcon } from "../../components/ui/ProviderIcon";
import { MediaUploadArea } from "../../components/ui/MediaUploadArea";
import { MediaDisplay } from "../../components/ui/MediaDisplay";
import {
  extractMediaFields,
  extractMediaFromOutput,
  mergeMediaIntoInput,
} from "../../utils/schemaUtils";

// Icons
const EditIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

type TabId = "general" | "input" | "output" | "playground";

function EndpointDetailPage() {
  const {
    entitySlug = "",
    projectId,
    endpointId,
  } = useParams<{
    entitySlug: string;
    projectId: string;
    endpointId: string;
  }>();
  const { t } = useTranslation("dashboard");
  const { navigate } = useLocalizedNavigate();
  const {
    networkClient,
    baseUrl,
    token,
    testMode,
    isReady,
    isLoading: apiLoading,
  } = useApi();
  const { success, error: showError } = useToast();
  const [searchParams] = useSearchParams();

  // Tab state - initialize from URL param if present
  const getInitialTab = (): TabId => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["general", "input", "output", "playground"].includes(tabParam)
    ) {
      return tabParam as TabId;
    }
    return "general";
  };
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  // Test state
  const [testInput, setTestInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [projectApiKey, setProjectApiKey] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<Record<string, string>>({});
  const initializedRef = useRef(false);

  // Separate edit states for each section
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [isEditingOutput, setIsEditingOutput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state - General
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editContext, setEditContext] = useState("");
  const [editLlmKeyId, setEditLlmKeyId] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editCustomModel, setEditCustomModel] = useState("");

  // Edit form state - Input
  const [editInputSchema, setEditInputSchema] = useState("");
  const [useInputSchema, setUseInputSchema] = useState(false);

  // Edit form state - Output
  const [editOutputSchema, setEditOutputSchema] = useState("");
  const [useOutputSchema, setUseOutputSchema] = useState(false);

  const {
    projects,
    isLoading: projectsLoading,
    getProjectApiKey,
  } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  // Fetch providers for display names
  const { providers } = useProviders(networkClient, baseUrl, testMode);

  // Helper to get provider display name
  const getProviderName = (providerId: string) => {
    const providerInfo = providers.find((p) => p.id === providerId);
    return providerInfo?.name ?? providerId;
  };

  const project = projects.find((p) => p.uuid === projectId);

  const {
    endpoints,
    isLoading: endpointsLoading,
    updateEndpoint,
    error: endpointsError,
    clearError: clearEndpointsError,
    refresh: refreshEndpoints,
  } = useEndpointsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    projectId: projectId ?? "",
    autoFetch: isReady && !!projectId && !!entitySlug,
  });

  const endpoint = endpoints.find((e) => e.uuid === endpointId);

  // Get the selected key and its provider for edit mode
  const editSelectedKey = useMemo(
    () => keys.find((k) => k.uuid === editLlmKeyId),
    [keys, editLlmKeyId],
  );
  const editProvider = editSelectedKey?.provider as LlmProvider | undefined;

  // Fetch models for the selected provider from the API (edit mode)
  const { provider: editProviderConfig, models: editModels } =
    useProviderModels(networkClient, baseUrl, editProvider ?? null, testMode);

  // Build model options with capability icons for edit mode
  // Blue = input capability, Green = output capability
  const editModelOptions = useMemo(() => {
    return editModels.map((modelInfo) => {
      const caps = modelInfo.capabilities;
      const inputIcons: ReactNode[] = [];
      const outputIcons: ReactNode[] = [];

      // Input capabilities (blue)
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
      // Output capabilities (green)
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
  }, [editModels]);

  // Whether custom model input is allowed in edit mode
  const editAllowsCustomModel = editProviderConfig?.allowsCustomModel ?? false;

  // The effective model in edit mode
  const editEffectiveModel = useMemo(() => {
    if (editAllowsCustomModel && editCustomModel.trim()) {
      return editCustomModel.trim();
    }
    return editModel || (editProviderConfig?.defaultModel ?? "");
  }, [
    editModel,
    editCustomModel,
    editAllowsCustomModel,
    editProviderConfig?.defaultModel,
  ]);

  // Get current endpoint's provider and model for display
  const currentKey = useMemo(
    () => keys.find((k) => k.uuid === endpoint?.llm_key_id),
    [keys, endpoint?.llm_key_id],
  );
  const currentProvider = currentKey?.provider as LlmProvider | undefined;

  // Fetch models for the current provider (for display mode)
  const { provider: currentProviderConfig, models: currentModels } =
    useProviderModels(
      networkClient,
      baseUrl,
      currentProvider ?? null,
      testMode,
    );
  const currentModel =
    endpoint?.model || (currentProviderConfig?.defaultModel ?? "");

  // Render model with capability icons
  const renderModelWithIcons = (model: string) => {
    const modelInfo = currentModels.find((m) => m.id === model);
    const caps = modelInfo?.capabilities ?? {};
    const inputIcons: ReactNode[] = [];
    const outputIcons: ReactNode[] = [];

    // Input capabilities (blue)
    if (caps.visionInput)
      inputIcons.push(<PhotoIcon key="vi" className="w-4 h-4 text-blue-500" />);
    if (caps.audioInput)
      inputIcons.push(
        <MicrophoneIcon key="ai" className="w-4 h-4 text-blue-500" />,
      );
    if (caps.videoInput)
      inputIcons.push(
        <VideoCameraIcon key="vdi" className="w-4 h-4 text-blue-500" />,
      );
    // Output capabilities (green)
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

    return (
      <span className="flex items-center gap-2">
        <span className="font-mono">{model}</span>
        {hasIcons && (
          <span className="flex items-center gap-1">
            {inputIcons}
            {outputIcons}
          </span>
        )}
      </span>
    );
  };

  const {
    testResults,
    isLoading: isTesting,
    error: testError,
    testEndpoint,
    getPrompt,
    generateSampleInput,
    validateInput,
  } = useEndpointTester(networkClient, baseUrl, testMode);

  // Prompt preview state
  const [promptPreview, setPromptPreview] = useState<string | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  // Track when to hide results (for clearing previous results on Prompt click)
  const [hideResultBefore, setHideResultBefore] = useState(0);

  // Get the latest test result for this endpoint (filtered by hideResultBefore)
  const latestResult = useMemo(
    () =>
      testResults
        .filter(
          (r) => r.endpointId === endpointId && r.timestamp > hideResultBefore,
        )
        .sort((a, b) => b.timestamp - a.timestamp)[0],
    [testResults, endpointId, hideResultBefore],
  );

  // Extract media fields from input and output schemas
  const inputMediaFields = useMemo(
    () => extractMediaFields(endpoint?.input_schema ?? null),
    [endpoint?.input_schema],
  );

  // Compute supported formats for each media field based on model capabilities
  const mediaSupportedFormats = useMemo(() => {
    const model = endpoint?.model;
    if (!model || !inputMediaFields) return undefined;

    // Find model info from the current provider's models
    const modelInfo = currentModels.find((m) => m.id === model);
    const mediaFormats = modelInfo?.capabilities?.mediaFormats;

    const formats: Record<string, MediaInputFormat[]> = {};
    for (const [fieldName, mediaType] of Object.entries(inputMediaFields)) {
      let supported: MediaInputFormat[] = [];
      if (mediaFormats) {
        switch (mediaType) {
          case "image":
            supported = mediaFormats.imageFormats ?? [];
            break;
          case "audio":
            supported = mediaFormats.audioFormats ?? [];
            break;
          case "video":
            supported = mediaFormats.videoFormats ?? [];
            break;
        }
      }
      // If model is unknown or no specific formats, default to base64
      formats[fieldName] = supported.length > 0 ? supported : ["base64"];
    }
    return formats;
  }, [endpoint?.model, inputMediaFields, currentModels]);

  const outputMediaItems = useMemo(
    () =>
      latestResult?.success && latestResult?.output
        ? extractMediaFromOutput(
            endpoint?.output_schema ?? null,
            latestResult.output,
          )
        : [],
    [endpoint?.output_schema, latestResult],
  );

  // Convert generated media (from LLM output like GPT-4o audio, Imagen images) to display format
  const generatedMediaItems = useMemo(() => {
    const media = latestResult?.generatedMedia;
    if (!media || media.length === 0) return [];

    return media.map((item: GeneratedMedia, index: number) => {
      // Build data URL if it's base64 without prefix
      const data = item.data.startsWith("data:")
        ? item.data
        : `data:${item.mimeType};base64,${item.data}`;

      return {
        fieldName: `${item.type}_${index + 1}`,
        type: item.type,
        data,
      };
    });
  }, [latestResult?.generatedMedia]);

  const hasInputMedia = Object.keys(inputMediaFields).length > 0;
  const hasOutputMedia = outputMediaItems.length > 0;
  const hasGeneratedMedia = generatedMediaItems.length > 0;

  // Calculate estimated cost for the latest test result
  const estimatedCostDisplay = useMemo(() => {
    if (
      !latestResult?.success ||
      !latestResult.tokensInput ||
      !latestResult.tokensOutput
    ) {
      return null;
    }

    const modelInfo = currentModels.find((m) => m.id === currentModel);
    if (!modelInfo?.pricing) {
      return null;
    }

    const costCents = estimateCost(
      modelInfo.pricing,
      latestResult.tokensInput,
      latestResult.tokensOutput,
    );

    return formatCost(costCents);
  }, [latestResult, currentModels, currentModel]);

  // Initialize test input with sample when endpoint loads (only once)
  useEffect(() => {
    if (endpoint && !initializedRef.current) {
      initializedRef.current = true;
      const sample = generateSampleInput(endpoint.input_schema);
      setTestInput(JSON.stringify(sample, null, 2));
    }
  }, [endpoint, generateSampleInput]);

  // Fetch project API key for testing
  useEffect(() => {
    if (projectId && isReady && getProjectApiKey) {
      getProjectApiKey(projectId).then((result) => {
        if (result?.api_key) {
          setProjectApiKey(result.api_key);
        }
      });
    }
  }, [projectId, isReady, getProjectApiKey]);

  const [isRetrying, setIsRetrying] = useState(false);

  // Handle retry for server errors
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    clearEndpointsError();
    try {
      await refreshEndpoints();
    } finally {
      setIsRetrying(false);
    }
  }, [refreshEndpoints, clearEndpointsError]);

  // Show test error via InfoInterface
  useEffect(() => {
    if (testError) {
      getInfoService().show(t("common.error"), testError, InfoType.ERROR, 5000);
    }
  }, [testError, t]);

  // Show endpoints error via InfoInterface (only for non-server errors)
  useEffect(() => {
    if (endpointsError && !isServerError(endpointsError)) {
      getInfoService().show(
        t("common.error"),
        endpointsError,
        InfoType.ERROR,
        5000,
      );
      clearEndpointsError();
    }
  }, [endpointsError, clearEndpointsError, t]);

  // Edit handlers for General tab
  const handleStartEditGeneral = () => {
    if (!endpoint) return;
    setEditDisplayName(endpoint.display_name);
    setEditInstructions(endpoint.instructions ?? "");
    setEditContext(endpoint.context ?? "");
    setEditLlmKeyId(endpoint.llm_key_id);
    // Initialize model - use endpoint's model (default will be provided by editProviderConfig)
    setEditModel(endpoint.model || "");
    setEditCustomModel("");
    setIsEditingGeneral(true);
  };

  // Handle key change in edit mode - reset model selection
  const handleEditKeyChange = (newKeyId: string) => {
    setEditLlmKeyId(newKeyId);
    // Reset model selection - the editEffectiveModel memo will use editProviderConfig.defaultModel
    setEditModel("");
    setEditCustomModel("");
  };

  const handleCancelEditGeneral = () => {
    setIsEditingGeneral(false);
  };

  const handleSaveGeneral = async () => {
    if (!endpoint) return;
    setIsSaving(true);
    try {
      const updated = await updateEndpoint(endpoint.uuid, {
        endpoint_name: endpoint.endpoint_name,
        display_name: editDisplayName.trim(),
        instructions: editInstructions.trim() || null,
        http_method: endpoint.http_method,
        llm_key_id: editLlmKeyId,
        model: editEffectiveModel || null,
        context: editContext.trim() || null,
        input_schema: endpoint.input_schema,
        output_schema: endpoint.output_schema,
        is_active: endpoint.is_active,
      });
      if (updated) {
        success(t("endpoints.updated"));
        setIsEditingGeneral(false);
      } else {
        showError(endpointsError || t("common.errorOccurred"));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("common.errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  // Edit handlers for Input tab
  const handleStartEditInput = () => {
    if (!endpoint) return;
    setEditInputSchema(
      endpoint.input_schema
        ? JSON.stringify(endpoint.input_schema, null, 2)
        : '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}',
    );
    setUseInputSchema(!!endpoint.input_schema);
    setIsEditingInput(true);
  };

  const handleCancelEditInput = () => {
    setIsEditingInput(false);
  };

  const handleSaveInput = async () => {
    if (!endpoint) return;

    let parsedInputSchema = null;
    if (useInputSchema) {
      try {
        parsedInputSchema = JSON.parse(editInputSchema);
      } catch {
        showError(t("endpoints.form.errors.invalidInputSchema"));
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = await updateEndpoint(endpoint.uuid, {
        endpoint_name: endpoint.endpoint_name,
        display_name: endpoint.display_name,
        instructions: endpoint.instructions,
        http_method: endpoint.http_method,
        llm_key_id: endpoint.llm_key_id,
        context: endpoint.context,
        input_schema: parsedInputSchema,
        output_schema: endpoint.output_schema,
        is_active: endpoint.is_active,
      });
      if (updated) {
        success(t("endpoints.updated"));
        setIsEditingInput(false);
      } else {
        showError(endpointsError || t("common.errorOccurred"));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("common.errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  // Edit handlers for Output tab
  const handleStartEditOutput = () => {
    if (!endpoint) return;
    setEditOutputSchema(
      endpoint.output_schema
        ? JSON.stringify(endpoint.output_schema, null, 2)
        : '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}',
    );
    setUseOutputSchema(!!endpoint.output_schema);
    setIsEditingOutput(true);
  };

  const handleCancelEditOutput = () => {
    setIsEditingOutput(false);
  };

  const handleSaveOutput = async () => {
    if (!endpoint) return;

    let parsedOutputSchema = null;
    if (useOutputSchema) {
      try {
        parsedOutputSchema = JSON.parse(editOutputSchema);
      } catch {
        showError(t("endpoints.form.errors.invalidOutputSchema"));
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = await updateEndpoint(endpoint.uuid, {
        endpoint_name: endpoint.endpoint_name,
        display_name: endpoint.display_name,
        instructions: endpoint.instructions,
        http_method: endpoint.http_method,
        llm_key_id: endpoint.llm_key_id,
        context: endpoint.context,
        input_schema: endpoint.input_schema,
        output_schema: parsedOutputSchema,
        is_active: endpoint.is_active,
      });
      if (updated) {
        success(t("endpoints.updated"));
        setIsEditingOutput(false);
      } else {
        showError(endpointsError || t("common.errorOccurred"));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("common.errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  // Test handlers
  const handleGenerateSample = () => {
    if (!endpoint) return;
    const sample = generateSampleInput(endpoint.input_schema);
    setTestInput(JSON.stringify(sample, null, 2));
    setInputError(null);
  };

  const handleViewPrompt = async () => {
    if (!endpoint || !project) return;

    setInputError(null);
    setPromptPreview(null);
    setHideResultBefore(Date.now()); // Clear previous test results

    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(testInput);
    } catch {
      setInputError(t("endpoints.tester.invalidJson"));
      return;
    }

    setIsLoadingPrompt(true);
    const result = await getPrompt(
      entitySlug,
      project.project_name,
      endpoint.endpoint_name,
      parsedInput,
      projectApiKey ?? undefined,
    );
    setIsLoadingPrompt(false);

    if (result.success && result.prompt) {
      setPromptPreview(result.prompt);
    } else {
      showError(result.error || t("common.errorOccurred"));
    }
  };

  const handleTest = async () => {
    if (!endpoint || !project) return;

    setInputError(null);
    setPromptPreview(null); // Clear prompt preview
    setHideResultBefore(Date.now()); // Clear previous results

    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(testInput);
    } catch {
      setInputError(t("endpoints.tester.invalidJson"));
      return;
    }

    // Merge media files into the input
    const finalInput = hasInputMedia
      ? mergeMediaIntoInput(parsedInput as Record<string, unknown>, mediaFiles)
      : parsedInput;

    const validation = validateInput(finalInput, endpoint.input_schema);
    if (!validation.valid) {
      setInputError(validation.errors.join(", "));
      return;
    }

    const result = await testEndpoint(
      entitySlug,
      project.project_name,
      endpoint,
      finalInput,
      projectApiKey ?? undefined,
    );
    if (result?.success) {
      success(t("endpoints.tester.success"));
    } else if (result?.error) {
      showError(result.error);
    }
  };

  // Loading state
  if (apiLoading || projectsLoading || endpointsLoading || keysLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Server error state - show error but keep in detail panel
  if (endpointsError && isServerError(endpointsError)) {
    return <DetailErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  // Not found
  if (!project || !endpoint) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          {t("endpoints.notFound")}
        </h3>
        <button
          onClick={() =>
            navigate(
              projectId ? `/dashboard/projects/${projectId}` : "/dashboard",
            )
          }
          className="text-blue-600 hover:underline"
        >
          {t("common.goBack")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Endpoint Info Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-theme-bg-secondary rounded-xl">
        <span
          className={`px-2 py-1 text-xs font-mono font-medium rounded ${
            endpoint.http_method === "GET"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          }`}
        >
          {endpoint.http_method}
        </span>
        <code className="text-sm text-theme-text-tertiary font-mono break-all">
          /api/v1/ai/{entitySlug}/{project.project_name}/
          {endpoint.endpoint_name}
        </code>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="general" className="flex-1">
            {t("endpoints.tabs.general")}
          </TabsTrigger>
          <TabsTrigger value="input" className="flex-1">
            {t("endpoints.tabs.input")}
          </TabsTrigger>
          <TabsTrigger value="output" className="flex-1">
            {t("endpoints.tabs.output")}
          </TabsTrigger>
          <TabsTrigger value="playground" className="flex-1">
            {t("endpoints.tabs.playground")}
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="space-y-6">
            {/* Header with Edit button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {t("endpoints.tabs.general")}
              </h3>
              {!isEditingGeneral && (
                <button
                  onClick={handleStartEditGeneral}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <EditIcon />
                  {t("common.edit")}
                </button>
              )}
            </div>

            {isEditingGeneral ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t("endpoints.form.displayName")}
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t("endpoints.form.llmKey")}
                  </label>
                  <Select
                    value={editLlmKeyId}
                    onValueChange={handleEditKeyChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {keys.map((key) => (
                        <SelectItem key={key.uuid} value={key.uuid}>
                          <span className="flex items-center gap-2">
                            <ProviderIcon
                              provider={key.provider as LlmProvider}
                              size="sm"
                            />
                            <span>{key.key_name}</span>
                            <span className="text-theme-text-tertiary">
                              ({getProviderName(key.provider)})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t("endpoints.form.model")}
                  </label>
                  {editAllowsCustomModel ? (
                    <EditableSelector
                      options={editModelOptions}
                      value={editEffectiveModel}
                      onChange={(value: string) => {
                        setEditModel(value);
                        setEditCustomModel("");
                      }}
                      disabled={!editProvider}
                      placeholder={
                        !editProvider
                          ? t("endpoints.form.selectModel")
                          : t("endpoints.form.modelPlaceholder")
                      }
                      inputClassName="font-mono text-sm"
                    />
                  ) : (
                    <Select
                      value={editEffectiveModel}
                      onValueChange={(value: string) => {
                        setEditModel(value);
                      }}
                      disabled={!editProvider}
                    >
                      <SelectTrigger className="w-full font-mono text-sm">
                        <SelectValue
                          placeholder={
                            !editProvider
                              ? t("endpoints.form.selectModel")
                              : t("endpoints.form.modelPlaceholder")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {editModelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t("endpoints.form.instructions")}
                  </label>
                  <textarea
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    rows={3}
                    placeholder={t("endpoints.form.instructionsPlaceholder")}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-1">
                    {t("endpoints.detail.context")}
                  </label>
                  <textarea
                    value={editContext}
                    onChange={(e) => setEditContext(e.target.value)}
                    rows={6}
                    placeholder={t("endpoints.form.contextPlaceholder")}
                    className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEditGeneral}
                    disabled={isSaving}
                    className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleSaveGeneral}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? t("common.saving") : t("common.save")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">
                    {t("endpoints.form.displayName")}
                  </h4>
                  <p className="text-theme-text-primary">
                    {endpoint.display_name}
                  </p>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">
                    {t("endpoints.form.llmKey")}
                  </h4>
                  <div className="flex items-center gap-2 text-theme-text-primary">
                    {currentProvider && (
                      <ProviderIcon provider={currentProvider} size="sm" />
                    )}
                    <span>{currentKey?.key_name || endpoint.llm_key_id}</span>
                    {currentProvider && (
                      <span className="text-theme-text-tertiary">
                        ({getProviderName(currentProvider)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">
                    {t("endpoints.form.model")}
                  </h4>
                  <div className="text-theme-text-primary">
                    {currentModel ? (
                      renderModelWithIcons(currentModel)
                    ) : (
                      <span className="italic text-theme-text-tertiary">
                        {t("common.notSet")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">
                    {t("endpoints.form.instructions")}
                  </h4>
                  <p className="text-theme-text-primary whitespace-pre-wrap">
                    {endpoint.instructions || (
                      <span className="italic text-theme-text-tertiary">
                        {t("common.notSet")}
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-theme-bg-secondary rounded-xl">
                  <h4 className="text-sm font-medium text-theme-text-tertiary mb-1">
                    {t("endpoints.detail.context")}
                  </h4>
                  <p className="text-theme-text-primary whitespace-pre-wrap">
                    {endpoint.context || (
                      <span className="italic text-theme-text-tertiary">
                        {t("common.notSet")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Input Tab */}
        <TabsContent value="input">
          <div className="space-y-6">
            {/* Header with Edit button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {t("endpoints.detail.inputSchema")}
              </h3>
              {!isEditingInput && (
                <button
                  onClick={handleStartEditInput}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <EditIcon />
                  {t("common.edit")}
                </button>
              )}
            </div>

            {isEditingInput ? (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                  <input
                    type="checkbox"
                    checked={useInputSchema}
                    onChange={(e) => setUseInputSchema(e.target.checked)}
                    className="rounded"
                  />
                  {t("endpoints.form.useInputSchema")}
                </label>
                {useInputSchema ? (
                  <SchemaEditor
                    value={editInputSchema}
                    onChange={setEditInputSchema}
                    showContextField={true}
                  />
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic p-4 bg-theme-bg-secondary rounded-xl">
                    {t("common.disabled")}
                  </p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEditInput}
                    disabled={isSaving}
                    className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleSaveInput}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? t("common.saving") : t("common.save")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-theme-bg-secondary rounded-xl">
                {endpoint.input_schema ? (
                  <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono max-h-96">
                    {JSON.stringify(endpoint.input_schema, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic">
                    {t("common.notSet")}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output">
          <div className="space-y-6">
            {/* Header with Edit button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {t("endpoints.detail.outputSchema")}
              </h3>
              {!isEditingOutput && (
                <button
                  onClick={handleStartEditOutput}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <EditIcon />
                  {t("common.edit")}
                </button>
              )}
            </div>

            {isEditingOutput ? (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                  <input
                    type="checkbox"
                    checked={useOutputSchema}
                    onChange={(e) => setUseOutputSchema(e.target.checked)}
                    className="rounded"
                  />
                  {t("endpoints.form.useOutputSchema")}
                </label>
                {useOutputSchema ? (
                  <SchemaEditor
                    value={editOutputSchema}
                    onChange={setEditOutputSchema}
                  />
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic p-4 bg-theme-bg-secondary rounded-xl">
                    {t("common.disabled")}
                  </p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEditOutput}
                    disabled={isSaving}
                    className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleSaveOutput}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? t("common.saving") : t("common.save")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-theme-bg-secondary rounded-xl">
                {endpoint.output_schema ? (
                  <pre className="text-sm bg-theme-bg-tertiary p-3 rounded-lg overflow-auto font-mono max-h-96">
                    {JSON.stringify(endpoint.output_schema, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-theme-text-tertiary italic">
                    {t("common.notSet")}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="playground">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-theme-text-primary">
              {t("endpoints.tester.title")}
            </h3>

            {/* Media Upload Area (if input schema has media fields) */}
            {hasInputMedia && (
              <MediaUploadArea
                mediaFields={inputMediaFields}
                onFilesChange={setMediaFiles}
                uploadedFiles={mediaFiles}
                disabled={isTesting}
                supportedFormats={mediaSupportedFormats}
              />
            )}

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-2">
                {t("endpoints.tester.input")}
                {hasInputMedia && (
                  <span className="text-theme-text-tertiary font-normal ml-2">
                    (non-media fields)
                  </span>
                )}
              </label>
              <textarea
                value={testInput}
                onChange={(e) => {
                  setTestInput(e.target.value);
                  setInputError(null);
                }}
                rows={hasInputMedia ? 4 : 8}
                className={`w-full px-3 py-2 bg-theme-bg-primary border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  inputError ? "border-red-500" : "border-theme-border"
                }`}
              />
              {inputError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {inputError}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleGenerateSample}
                className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors text-sm"
              >
                {t("endpoints.tester.generateSample")}
              </button>
              <button
                onClick={handleViewPrompt}
                disabled={isLoadingPrompt || !testInput.trim()}
                className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50 text-sm"
              >
                {isLoadingPrompt
                  ? t("common.loading")
                  : t("endpoints.tester.viewPrompt")}
              </button>
              <button
                onClick={handleTest}
                disabled={isTesting || !testInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isTesting
                  ? t("endpoints.tester.executing")
                  : t("endpoints.tester.execute")}
              </button>
            </div>

            {/* Prompt Preview */}
            {promptPreview && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-theme-text-primary">
                    {t("endpoints.tester.prompt")}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(promptPreview);
                        success(t("common.copied"));
                      }}
                      className="text-xs text-theme-text-tertiary hover:text-theme-text-primary flex items-center gap-1"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      {t("common.copy")}
                    </button>
                    <button
                      onClick={() => setPromptPreview(null)}
                      className="text-xs text-theme-text-tertiary hover:text-theme-text-primary"
                    >
                      {t("common.close")}
                    </button>
                  </div>
                </div>
                <pre className="p-3 bg-theme-bg-secondary rounded-lg overflow-auto font-mono text-sm text-theme-text-secondary max-h-64 whitespace-pre-wrap">
                  {promptPreview}
                </pre>
              </div>
            )}

            {/* Response */}
            {latestResult && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-theme-text-primary">
                    {t("endpoints.tester.response")}
                  </label>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      latestResult.success
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {latestResult.success
                      ? t("endpoints.tester.success")
                      : t("endpoints.tester.failed")}
                  </span>
                </div>

                {latestResult.error ? (
                  isRateLimitError(latestResult.error) ? (
                    <RateLimitPanel entitySlug={entitySlug} />
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      {latestResult.error}
                    </div>
                  )
                ) : (
                  <>
                    {/* Generated Media Display (from LLM like GPT-4o audio, Imagen images) */}
                    {hasGeneratedMedia && (
                      <MediaDisplay
                        items={generatedMediaItems}
                        title={t("media.generatedTitle")}
                      />
                    )}

                    {/* Schema-defined Media Output Display */}
                    {hasOutputMedia && (
                      <MediaDisplay
                        items={outputMediaItems}
                        title={t("media.outputTitle")}
                      />
                    )}

                    {/* JSON Output (for non-media or mixed outputs) */}
                    <pre className="p-3 bg-theme-bg-secondary rounded-lg overflow-auto font-mono text-sm text-green-600 dark:text-green-400 max-h-64">
                      {JSON.stringify(latestResult.output, null, 2)}
                    </pre>
                  </>
                )}

                {/* Metrics */}
                {latestResult.success && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {latestResult.latencyMs && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">
                          {t("endpoints.tester.latency")}
                        </p>
                        <p className="font-semibold text-theme-text-primary">
                          {latestResult.latencyMs}ms
                        </p>
                      </div>
                    )}
                    {latestResult.tokensInput && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">
                          {t("endpoints.tester.inputTokens")}
                        </p>
                        <p className="font-semibold text-theme-text-primary">
                          {latestResult.tokensInput}
                        </p>
                      </div>
                    )}
                    {latestResult.tokensOutput && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">
                          {t("endpoints.tester.outputTokens")}
                        </p>
                        <p className="font-semibold text-theme-text-primary">
                          {latestResult.tokensOutput}
                        </p>
                      </div>
                    )}
                    {estimatedCostDisplay && (
                      <div className="text-center p-3 bg-theme-bg-secondary rounded-lg">
                        <p className="text-xs text-theme-text-tertiary">
                          {t("endpoints.tester.estimatedCost")}
                        </p>
                        <p className="font-semibold text-theme-text-primary">
                          {estimatedCostDisplay}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EndpointDetailPage;
