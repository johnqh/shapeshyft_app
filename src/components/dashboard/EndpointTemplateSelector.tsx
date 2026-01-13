import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useKeysManager,
  useEndpointTemplates,
  type EndpointTemplateWithCategory,
} from "@sudobility/shapeshyft_lib";
import { getInfoService } from "@sudobility/di";
import { InfoType } from "@sudobility/types";
import { useApi } from "../../hooks/useApi";

interface EndpointTemplateSelectorProps {
  onApply: (
    template: EndpointTemplateWithCategory,
    llmKeyId: string,
  ) => Promise<void>;
  onClose: () => void;
}

function EndpointTemplateSelector({
  onApply,
  onClose,
}: EndpointTemplateSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token, isReady } = useApi();

  const [selectedTemplate, setSelectedTemplate] =
    useState<EndpointTemplateWithCategory | null>(null);
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { keys, isLoading: keysLoading } = useKeysManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  const { endpointTemplates, getCategories } = useEndpointTemplates();
  const categories = getCategories();

  // Filter templates by category
  const filteredTemplates = selectedCategory
    ? endpointTemplates.filter((t) => t.category === selectedCategory)
    : endpointTemplates;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

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

    setIsLoading(true);

    try {
      await onApply(selectedTemplate, selectedKeyId);
    } catch (err) {
      getInfoService().show(
        t("common.error"),
        err instanceof Error ? err.message : t("common.errorOccurred"),
        InfoType.ERROR,
        5000,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-theme-bg-primary rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-theme-border shrink-0">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {t("endpointTemplates.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-theme-hover-bg transition-colors"
            aria-label={t("common.close")}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
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
                  selectedTemplate?.projectTemplateId ===
                    template.projectTemplateId
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
                    <a
                      href={`#/dashboard/${entitySlug}/providers`}
                      className="text-blue-600 hover:underline"
                    >
                      {t("templates.addKeyLink")}
                    </a>
                  </p>
                ) : (
                  <select
                    id="llmKey"
                    value={selectedKeyId}
                    onChange={(e) => setSelectedKeyId(e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="">{t("templates.selectKey")}</option>
                    {keys.map((key) => (
                      <option key={key.uuid} value={key.uuid}>
                        {key.key_name} ({key.provider})
                      </option>
                    ))}
                  </select>
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
                          (
                            selectedTemplate.input_schema as Record<
                              string,
                              unknown
                            >
                          )?.properties || {},
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
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-theme-border shrink-0">
          <button
            onClick={onClose}
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
    </div>
  );
}

export default EndpointTemplateSelector;
