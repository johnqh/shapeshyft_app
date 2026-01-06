import { useTranslation } from "react-i18next";
import type { BudgetAlert } from "@sudobility/shapeshyft_lib";

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
  onDismiss?: (alertId: string) => void;
}

function BudgetAlerts({ alerts, onDismiss }: BudgetAlertsProps) {
  const { t } = useTranslation("dashboard");

  if (alerts.length === 0) return null;

  const getAlertStyles = (severity: BudgetAlert["severity"]) => {
    switch (severity) {
      case "exceeded":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          text: "text-red-800 dark:text-red-200",
        };
      case "critical":
        return {
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800",
          icon: "text-orange-600 dark:text-orange-400",
          text: "text-orange-800 dark:text-orange-200",
        };
      case "warning":
      default:
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          text: "text-yellow-800 dark:text-yellow-200",
        };
    }
  };

  const getIcon = (severity: BudgetAlert["severity"]) => {
    if (severity === "exceeded") {
      return (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    }
    return (
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
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.severity);
        return (
          <div
            key={`${alert.budgetId}-${alert.severity}`}
            className={`flex items-start gap-3 p-4 rounded-lg border ${styles.bg} ${styles.border}`}
          >
            <div className={`flex-shrink-0 ${styles.icon}`}>
              {getIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${styles.text}`}>
                {t(`budgets.alerts.${alert.severity}`, {
                  name: alert.budgetName,
                })}
              </p>
              <p className={`text-sm mt-0.5 ${styles.text} opacity-80`}>
                {t("budgets.alerts.usage", {
                  percentage: alert.percentUsed.toFixed(0),
                })}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(`${alert.budgetId}-${alert.severity}`)}
                className={`flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${styles.text}`}
                aria-label={t("common.dismiss")}
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BudgetAlerts;
