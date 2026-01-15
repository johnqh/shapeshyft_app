import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  PhotoIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  XMarkIcon,
  LinkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import type { MediaInputFormat } from "@sudobility/shapeshyft_types";

type MediaType = "image" | "audio" | "video";
type InputMode = "file" | "url";

interface MediaFile {
  file: File;
  preview: string;
  type: MediaType;
  fieldName: string;
}

interface MediaUploadAreaProps {
  /** Media fields extracted from the schema (field name -> media type) */
  mediaFields: Record<string, MediaType>;
  /** Callback when files are uploaded */
  onFilesChange: (files: Record<string, string>) => void;
  /** Current uploaded files as base64 strings or URLs */
  uploadedFiles: Record<string, string>;
  /** Disabled state */
  disabled?: boolean;
  /** Supported input formats per field (field name -> formats). If not provided, defaults to base64 only. */
  supportedFormats?: Record<string, MediaInputFormat[]>;
}

// File size limits in bytes
const SIZE_LIMITS: Record<MediaType, number> = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 20 * 1024 * 1024, // 20MB
  video: 20 * 1024 * 1024, // 20MB
};

// Accepted MIME types
const ACCEPTED_TYPES: Record<MediaType, string[]> = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
};

function getMediaTypeIcon(type: MediaType) {
  switch (type) {
    case "image":
      return <PhotoIcon className="w-6 h-6" />;
    case "audio":
      return <MicrophoneIcon className="w-6 h-6" />;
    case "video":
      return <VideoCameraIcon className="w-6 h-6" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaUploadArea({
  mediaFields,
  onFilesChange,
  uploadedFiles,
  disabled = false,
  supportedFormats,
}: MediaUploadAreaProps) {
  const { t } = useTranslation("dashboard");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, MediaFile>>({});
  const [inputModes, setInputModes] = useState<Record<string, InputMode>>({});
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Check if a field supports URL input
  const supportsUrl = useCallback(
    (fieldName: string): boolean => {
      const formats = supportedFormats?.[fieldName];
      return formats?.includes("url") ?? false;
    },
    [supportedFormats],
  );

  // Get current input mode for a field (default to "file" for base64/file, "url" if only URL is supported)
  const getInputMode = useCallback(
    (fieldName: string): InputMode => {
      if (inputModes[fieldName]) return inputModes[fieldName];
      const formats = supportedFormats?.[fieldName];
      // If only URL is supported (no base64 or file), default to URL mode
      if (
        formats &&
        formats.includes("url") &&
        !formats.includes("base64") &&
        !formats.includes("file")
      ) {
        return "url";
      }
      return "file";
    },
    [inputModes, supportedFormats],
  );

  // Set input mode for a field
  const setInputMode = useCallback((fieldName: string, mode: InputMode) => {
    setInputModes((prev) => ({ ...prev, [fieldName]: mode }));
  }, []);

  // Handle URL input change
  const handleUrlChange = useCallback((fieldName: string, url: string) => {
    setUrlInputs((prev) => ({ ...prev, [fieldName]: url }));
  }, []);

  // Submit URL
  const handleUrlSubmit = useCallback(
    (fieldName: string) => {
      const url = urlInputs[fieldName]?.trim();
      if (!url) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: t("media.errorUrlRequired"),
        }));
        return;
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: t("media.errorUrlInvalid"),
        }));
        return;
      }

      // Clear error and update files
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      onFilesChange({ ...uploadedFiles, [fieldName]: url });
    },
    [urlInputs, uploadedFiles, onFilesChange, t],
  );

  const fieldEntries = Object.entries(mediaFields);

  const validateFile = useCallback(
    (file: File, mediaType: MediaType): string | null => {
      // Check file size
      const limit = SIZE_LIMITS[mediaType];
      if (file.size > limit) {
        return t("media.errorSize", {
          max: formatFileSize(limit),
        });
      }

      // Check MIME type
      const accepted = ACCEPTED_TYPES[mediaType];
      if (!accepted.some((type) => file.type.startsWith(type.split("/")[0]))) {
        return t("media.errorType", { type: mediaType });
      }

      return null;
    },
    [t],
  );

  const handleFile = useCallback(
    async (file: File, fieldName: string, mediaType: MediaType) => {
      // Validate file
      const error = validateFile(file, mediaType);
      if (error) {
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
        return;
      }

      // Clear error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: { file, preview, type: mediaType, fieldName },
      }));

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onFilesChange({ ...uploadedFiles, [fieldName]: base64 });
      };
      reader.readAsDataURL(file);
    },
    [validateFile, uploadedFiles, onFilesChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, fieldName: string, mediaType: MediaType) => {
      e.preventDefault();
      setDragOver(null);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0], fieldName, mediaType);
      }
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, fieldName: string) => {
      e.preventDefault();
      if (!disabled) {
        setDragOver(fieldName);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldName: string,
      mediaType: MediaType,
    ) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0], fieldName, mediaType);
      }
    },
    [handleFile],
  );

  const handleRemove = useCallback(
    (fieldName: string) => {
      // Revoke preview URL (only for file uploads, not for external URLs)
      if (previews[fieldName]?.preview) {
        URL.revokeObjectURL(previews[fieldName].preview);
      }

      // Remove from previews
      setPreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[fieldName];
        return newPreviews;
      });

      // Clear URL input
      setUrlInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[fieldName];
        return newInputs;
      });

      // Remove from uploaded files
      const newFiles = { ...uploadedFiles };
      delete newFiles[fieldName];
      onFilesChange(newFiles);

      // Clear error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    },
    [previews, uploadedFiles, onFilesChange],
  );

  if (fieldEntries.length === 0) {
    return null;
  }

  // Check if a value is a URL (not base64)
  const isUrl = (value: string): boolean => {
    return value.startsWith("http://") || value.startsWith("https://");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-theme-text-primary mb-2">
        {t("media.uploadTitle")}
      </label>
      <div className="flex flex-col gap-4">
        {fieldEntries.map(([fieldName, mediaType]) => {
          const preview = previews[fieldName];
          const error = errors[fieldName];
          const hasFile = !!uploadedFiles[fieldName];
          const currentValue = uploadedFiles[fieldName];
          const isUrlValue = hasFile && isUrl(currentValue);
          const showUrlSupport = supportsUrl(fieldName);
          const currentMode = getInputMode(fieldName);

          return (
            <div key={fieldName} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-theme-text-secondary">
                  {fieldName}
                </label>
                {/* Mode toggle - only show if URL is supported and no file is uploaded */}
                {showUrlSupport && !hasFile && (
                  <div className="flex gap-1 p-0.5 bg-theme-bg-tertiary rounded-md">
                    <button
                      type="button"
                      onClick={() => setInputMode(fieldName, "file")}
                      disabled={disabled}
                      className={`
                        flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                        ${
                          currentMode === "file"
                            ? "bg-theme-bg-primary text-theme-text-primary shadow-sm"
                            : "text-theme-text-tertiary hover:text-theme-text-secondary"
                        }
                        disabled:opacity-50
                      `}
                      title={t("media.modeFile")}
                    >
                      <ArrowUpTrayIcon className="w-3 h-3" />
                      {t("media.modeFile")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode(fieldName, "url")}
                      disabled={disabled}
                      className={`
                        flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                        ${
                          currentMode === "url"
                            ? "bg-theme-bg-primary text-theme-text-primary shadow-sm"
                            : "text-theme-text-tertiary hover:text-theme-text-secondary"
                        }
                        disabled:opacity-50
                      `}
                      title={t("media.modeUrl")}
                    >
                      <LinkIcon className="w-3 h-3" />
                      {t("media.modeUrl")}
                    </button>
                  </div>
                )}
              </div>

              {/* Preview area when file/URL is uploaded */}
              {hasFile ? (
                <div className="relative border border-theme-border rounded-lg p-3 bg-theme-bg-secondary">
                  <button
                    type="button"
                    onClick={() => handleRemove(fieldName)}
                    disabled={disabled}
                    className="absolute top-2 right-2 p-1 bg-theme-bg-primary rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 z-10"
                    title={t("common.remove")}
                  >
                    <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>

                  {mediaType === "image" && (
                    <img
                      src={isUrlValue ? currentValue : (preview?.preview || currentValue)}
                      alt={fieldName}
                      className="max-h-32 rounded object-contain mx-auto"
                    />
                  )}

                  {mediaType === "audio" && (
                    <audio
                      src={isUrlValue ? currentValue : (preview?.preview || currentValue)}
                      controls
                      className="w-full"
                    />
                  )}

                  {mediaType === "video" && (
                    <video
                      src={isUrlValue ? currentValue : (preview?.preview || currentValue)}
                      controls
                      className="max-h-32 rounded mx-auto"
                    />
                  )}

                  <p className="text-xs text-theme-text-tertiary mt-2 text-center truncate">
                    {isUrlValue ? (
                      <span className="flex items-center justify-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {currentValue}
                      </span>
                    ) : (
                      preview &&
                      `${preview.file.name} (${formatFileSize(preview.file.size)})`
                    )}
                  </p>
                </div>
              ) : currentMode === "url" ? (
                /* URL input mode */
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInputs[fieldName] || ""}
                      onChange={(e) =>
                        handleUrlChange(fieldName, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUrlSubmit(fieldName);
                        }
                      }}
                      disabled={disabled}
                      placeholder={t("media.urlPlaceholder", {
                        type: mediaType,
                      })}
                      className={`
                        flex-1 px-3 py-2 text-sm rounded-lg border
                        bg-theme-bg-primary text-theme-text-primary
                        placeholder:text-theme-text-tertiary
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? "border-red-500" : "border-theme-border"}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => handleUrlSubmit(fieldName)}
                      disabled={disabled || !urlInputs[fieldName]?.trim()}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t("media.submitUrl")}
                    </button>
                  </div>
                  <p className="text-xs text-theme-text-tertiary">
                    {t("media.urlHint", { type: mediaType })}
                  </p>
                </div>
              ) : (
                /* File upload mode (default) */
                <div
                  onDrop={(e) => handleDrop(e, fieldName, mediaType)}
                  onDragOver={(e) => handleDragOver(e, fieldName)}
                  onDragLeave={handleDragLeave}
                  onClick={() =>
                    !disabled && fileInputRefs.current[fieldName]?.click()
                  }
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-colors
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-theme-bg-secondary"}
                    ${
                      dragOver === fieldName
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-theme-border"
                    }
                    ${error ? "border-red-500" : ""}
                  `}
                >
                  <input
                    ref={(el) => {
                      fileInputRefs.current[fieldName] = el;
                    }}
                    type="file"
                    accept={ACCEPTED_TYPES[mediaType].join(",")}
                    onChange={(e) => handleInputChange(e, fieldName, mediaType)}
                    disabled={disabled}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center gap-2 text-theme-text-tertiary">
                    {getMediaTypeIcon(mediaType)}
                    <span className="text-sm">
                      {t("media.dropOrClick", { type: mediaType })}
                    </span>
                    <span className="text-xs">
                      {t("media.maxSize", {
                        size: formatFileSize(SIZE_LIMITS[mediaType]),
                      })}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MediaUploadArea;
