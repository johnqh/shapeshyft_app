import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

type MediaType = "image" | "audio" | "video";

interface MediaItem {
  fieldName: string;
  type: MediaType;
  data: string; // base64 data URL or regular URL
}

interface MediaDisplayProps {
  /** Media items to display */
  items: MediaItem[];
  /** Title for the section */
  title?: string;
}

function isBase64DataUrl(str: string): boolean {
  return str.startsWith("data:");
}

function getMimeType(dataUrl: string): string {
  const match = dataUrl.match(/data:([^;]+)/);
  return match ? match[1] : "application/octet-stream";
}

function getExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/webm": "webm",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "video/quicktime": "mov",
  };
  return mimeToExt[mimeType] || "bin";
}

function ImageWithModal({
  src,
  alt,
  onDownload,
}: {
  src: string;
  alt: string;
  onDownload: () => void;
}) {
  const { t } = useTranslation("dashboard");
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="relative group">
        <img
          src={src}
          alt={alt}
          className="max-h-32 rounded object-contain mx-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsExpanded(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/50 rounded-full p-2">
            <ArrowsPointingOutIcon className="w-5 h-5 text-white" />
          </div>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="absolute bottom-1 right-1 p-1.5 bg-theme-bg-primary/80 rounded-lg hover:bg-theme-bg-primary transition-colors opacity-0 group-hover:opacity-100"
          title={t("media.download")}
        >
          <ArrowDownTrayIcon className="w-4 h-4 text-theme-text-primary" />
        </button>
      </div>

      {/* Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {t("media.download")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function MediaDisplay({ items, title }: MediaDisplayProps) {
  const { t } = useTranslation("dashboard");

  if (items.length === 0) {
    return null;
  }

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = item.data;

    // Generate filename
    const mimeType = isBase64DataUrl(item.data)
      ? getMimeType(item.data)
      : "application/octet-stream";
    const ext = getExtension(mimeType);
    link.download = `${item.fieldName}.${ext}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {title && (
        <label className="block text-sm font-medium text-theme-text-primary">
          {title}
        </label>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.fieldName}
            className="border border-theme-border rounded-lg p-3 bg-theme-bg-secondary"
          >
            <label className="block text-sm text-theme-text-secondary mb-2">
              {item.fieldName}
            </label>

            {item.type === "image" && (
              <ImageWithModal
                src={item.data}
                alt={item.fieldName}
                onDownload={() => handleDownload(item)}
              />
            )}

            {item.type === "audio" && (
              <div className="space-y-2">
                <audio src={item.data} controls className="w-full" />
                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className="w-full px-3 py-1.5 text-sm bg-theme-bg-tertiary rounded-lg hover:bg-theme-hover-bg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  {t("media.download")}
                </button>
              </div>
            )}

            {item.type === "video" && (
              <div className="space-y-2">
                <video src={item.data} controls className="max-h-48 rounded mx-auto" />
                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className="w-full px-3 py-1.5 text-sm bg-theme-bg-tertiary rounded-lg hover:bg-theme-hover-bg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  {t("media.download")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaDisplay;
