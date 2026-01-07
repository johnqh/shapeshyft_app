import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DetailErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

function DetailErrorState({
  title,
  message,
  onRetry,
  isRetrying = false,
}: DetailErrorStateProps) {
  const { t } = useTranslation("dashboard");

  const displayTitle = title ?? t("errors.serverDown.title");
  const displayMessage = message ?? t("errors.serverDown.message");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
          {displayTitle}
        </h3>

        <p className="text-sm text-theme-text-secondary mb-6">
          {displayMessage}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying
              ? t("common.loading", { defaultValue: "Loading..." })
              : t("errors.serverDown.retry", { defaultValue: "Retry" })}
          </button>
        )}
      </div>
    </div>
  );
}

export default DetailErrorState;
