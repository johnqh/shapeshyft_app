import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager } from '@sudobility/shapeshyft_lib';
import { getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';

interface FieldErrors {
  displayName?: string;
}

function ProjectNewPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { navigate } = useLocalizedNavigate();
  const { entitySlug = '' } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token, isReady } = useApi();
  const { success } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { createProject, isLoading } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  // Generate slug preview
  const slugPreview = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const validateDisplayName = (value: string): string | undefined => {
    if (!value.trim()) {
      return t('projects.form.errors.nameRequired');
    }
    if (value.trim().length < 2) {
      return t('projects.form.errors.nameTooShort');
    }
    return undefined;
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (touched.displayName) {
      setFieldErrors(prev => ({
        ...prev,
        displayName: validateDisplayName(value),
      }));
    }
  };

  const handleDisplayNameBlur = () => {
    setTouched(prev => ({ ...prev, displayName: true }));
    setFieldErrors(prev => ({
      ...prev,
      displayName: validateDisplayName(displayName),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {
      displayName: validateDisplayName(displayName),
    };

    setFieldErrors(errors);
    setTouched({ displayName: true });

    // Check if there are any errors
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    const projectName = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const project = await createProject({
        project_name: projectName,
        display_name: displayName.trim(),
        description: description.trim() || null,
      });
      success(t('common:toast.success.created'));
      if (project) {
        navigate(`/dashboard/${entitySlug}/projects/${project.uuid}`);
      } else {
        navigate(`/dashboard/${entitySlug}`);
      }
    } catch (err) {
      getInfoService().show(t('common.error'), err instanceof Error ? err.message : t('common.errorOccurred'), InfoType.ERROR, 5000);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/${entitySlug}`);
  };

  const hasError = (field: keyof FieldErrors) => touched[field] && fieldErrors[field];

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={e => handleDisplayNameChange(e.target.value)}
            onBlur={handleDisplayNameBlur}
            placeholder={t('projects.form.displayNamePlaceholder')}
            className={`w-full px-3 py-2 border rounded-lg bg-theme-bg-primary outline-none transition-all ${
              hasError('displayName')
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            autoFocus
          />
          {hasError('displayName') ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.displayName}
            </p>
          ) : slugPreview ? (
            <p className="mt-1 text-xs text-theme-text-tertiary">
              {t('projects.form.slugPreview')}: <code className="font-mono">{slugPreview}</code>
            </p>
          ) : null}
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
            onClick={handleCancel}
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
            ) : (
              t('projects.form.create')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectNewPage;
