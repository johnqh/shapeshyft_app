import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Budget, BudgetPeriod } from "@sudobility/shapeshyft_lib";

interface BudgetFormProps {
  budget?: Budget | null;
  onSubmit: (data: {
    name: string;
    limitCents: number;
    period: BudgetPeriod;
  }) => void;
  onCancel: () => void;
}

function BudgetForm({ budget, onSubmit, onCancel }: BudgetFormProps) {
  const { t } = useTranslation("dashboard");
  const [name, setName] = useState(budget?.name ?? "");
  const [limitDollars, setLimitDollars] = useState(
    budget ? (budget.limitCents / 100).toFixed(2) : "",
  );
  const [period, setPeriod] = useState<BudgetPeriod>(
    budget?.period ?? "monthly",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitCents = Math.round(parseFloat(limitDollars) * 100);
    if (name && limitCents > 0) {
      onSubmit({ name, limitCents, period });
    }
  };

  const periods: BudgetPeriod[] = ["daily", "weekly", "monthly"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-theme-text-primary mb-1">
          {t("budgets.form.name")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("budgets.form.namePlaceholder")}
          className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Limit */}
      <div>
        <label className="block text-sm font-medium text-theme-text-primary mb-1">
          {t("budgets.form.limit")}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary">
            $
          </span>
          <input
            type="number"
            value={limitDollars}
            onChange={(e) => setLimitDollars(e.target.value)}
            placeholder="10.00"
            min="0.01"
            step="0.01"
            className="w-full pl-7 pr-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Period */}
      <div>
        <label className="block text-sm font-medium text-theme-text-primary mb-1">
          {t("budgets.form.period")}
        </label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
          className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              {t(`budgets.periods.${p}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-theme-text-primary bg-theme-bg-tertiary hover:bg-theme-hover-bg rounded-lg transition-colors"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {budget ? t("common.save") : t("budgets.form.add")}
        </button>
      </div>
    </form>
  );
}

export default BudgetForm;
