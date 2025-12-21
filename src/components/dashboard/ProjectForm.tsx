import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@sudobility/shapeshyft_types';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: { display_name: string; description?: string }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

function ProjectForm({ project, onSubmit, onClose, isLoading }: ProjectFormProps) {
  const { t } = useTranslation('dashboard');
  const [displayName, setDisplayName] = useState(project?.display_name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!project;

  // Generate slug preview
  const slugPreview = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError(t('projects.form.errors.nameRequired'));
      return;
    }

    if (displayName.trim().length < 2) {
      setError(t('projects.form.errors.nameTooShort'));
      return;
    }

    try {
      await onSubmit({
        display_name: displayName.trim(),
        description: description.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errorOccurred'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-theme-bg-primary rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            {isEditing ? t('projects.form.titleEdit') : t('projects.form.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-theme-hover-bg transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-theme-text-primary mb-1"
            >
              {t('projects.form.displayName')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('projects.form.displayNamePlaceholder')}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              autoFocus
            />
            {!isEditing && slugPreview && (
              <p className="mt-1 text-xs text-theme-text-tertiary">
                {t('projects.form.slugPreview')}: <code className="font-mono">{slugPreview}</code>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-theme-text-primary mb-1"
            >
              {t('projects.form.description')}{' '}
              <span className="text-theme-text-tertiary">({t('common.optional')})</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('projects.form.descriptionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !displayName.trim()}
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
                  {t('common.saving')}
                </span>
              ) : isEditing ? (
                t('common.save')
              ) : (
                t('projects.form.create')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;
