import { useTranslation } from "react-i18next";
import type { Budget } from "@sudobility/shapeshyft_lib";

interface BudgetCardProps {
  budget: Budget;
  currentSpend: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

function BudgetCard({
  budget,
  currentSpend,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const { t } = useTranslation("dashboard");

  const percentage = Math.min((currentSpend / budget.limitCents) * 100, 100);
  const isWarning = percentage >= 75 && percentage < 90;
  const isCritical = percentage >= 90 && percentage < 100;
  const isExceeded = percentage >= 100;

  const getProgressColor = () => {
    if (isExceeded) return "bg-red-600";
    if (isCritical) return "bg-orange-500";
    if (isWarning) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="p-4 bg-theme-bg-primary rounded-xl border border-theme-border">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-theme-text-primary">{budget.name}</h4>
          <span className="text-sm text-theme-text-secondary capitalize">
            {t(`budgets.periods.${budget.period}`)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover-bg rounded transition-colors"
            aria-label={t("common.edit")}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 text-theme-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            aria-label={t("common.delete")}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <span className="text-theme-text-secondary">
          {formatCurrency(currentSpend)} / {formatCurrency(budget.limitCents)}
        </span>
        <span
          className={`font-medium ${
            isExceeded
              ? "text-red-600"
              : isCritical
                ? "text-orange-500"
                : isWarning
                  ? "text-yellow-600"
                  : "text-green-600"
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default BudgetCard;
