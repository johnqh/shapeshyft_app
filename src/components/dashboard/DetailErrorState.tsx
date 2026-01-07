import { useTranslation } from "react-i18next";
import { DetailErrorState as SharedDetailErrorState } from "@sudobility/components";

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

  return (
    <SharedDetailErrorState
      title={title ?? t("errors.serverDown.title")}
      message={message ?? t("errors.serverDown.message")}
      onRetry={onRetry}
      isRetrying={isRetrying}
      retryText={t("errors.serverDown.retry", { defaultValue: "Retry" })}
      loadingText={t("common.loading", { defaultValue: "Loading..." })}
    />
  );
}

export default DetailErrorState;
