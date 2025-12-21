import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBudgetTracker, useAnalyticsManager } from '@sudobility/shapeshyft_lib';
import type { Budget, BudgetPeriod } from '@sudobility/shapeshyft_lib';
import { BudgetCard, BudgetForm, BudgetAlerts } from '../../components/dashboard/budgets';
import { useToast } from '../../hooks/useToast';
import { useApi } from '../../hooks/useApi';

function BudgetsPage() {
  const { t } = useTranslation('dashboard');
  const { success, error: showError } = useToast();
  const { networkClient, baseUrl, userId, token } = useApi();

  const {
    budgets,
    alerts,
    addBudget,
    updateBudget,
    removeBudget,
    checkBudgets,
  } = useBudgetTracker();

  const { analytics } = useAnalyticsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Check budgets against current analytics when data changes
  useEffect(() => {
    if (analytics) {
      checkBudgets(analytics);
    }
  }, [analytics, checkBudgets]);

  // Current total spend from analytics
  const currentTotalSpendCents = analytics?.aggregate.total_estimated_cost_cents ?? 0;

  const handleSubmit = (data: { name: string; limitCents: number; period: BudgetPeriod }) => {
    try {
      if (editingBudget) {
        updateBudget(editingBudget.id, data);
        success(t('common.saved'));
      } else {
        addBudget(data);
        success(t('budgets.form.add'));
      }
      setShowForm(false);
      setEditingBudget(null);
    } catch {
      showError(t('common.error'));
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('budgets.confirmDelete'))) {
      removeBudget(id);
      success(t('common.deleted'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          {t('budgets.title')}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('budgets.add')}
          </button>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <BudgetAlerts alerts={alerts} />
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-theme-bg-secondary rounded-xl">
          <h3 className="text-lg font-medium text-theme-text-primary mb-4">
            {editingBudget ? t('common.edit') : t('budgets.add')}
          </h3>
          <BudgetForm
            key={editingBudget?.id ?? 'new'}
            budget={editingBudget}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Budget List */}
      {budgets.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-theme-bg-secondary rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-tertiary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-theme-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-theme-text-primary mb-2">
            {t('budgets.empty')}
          </h3>
          <p className="text-theme-text-secondary mb-6">
            {t('budgets.emptyDescription')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('budgets.add')}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              currentSpend={currentTotalSpendCents}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BudgetsPage;
