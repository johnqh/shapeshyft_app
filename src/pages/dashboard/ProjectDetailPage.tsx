import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager, useEndpointsManager } from '@sudobility/shapeshyft_lib';
import { getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';

function ProjectDetailPage() {
  const { entitySlug = '', projectId } = useParams<{ entitySlug: string; projectId: string }>();
  const { t } = useTranslation(['dashboard', 'common']);
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, token, isReady, isLoading: apiLoading } = useApi();
  const { success } = useToast();

  // Inline editing state for project
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);

  const {
    projects,
    isLoading: projectsLoading,
    updateProject,
  } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    autoFetch: isReady && !!entitySlug,
  });

  const project = projects.find(p => p.uuid === projectId);

  const {
    endpoints,
    isLoading: endpointsLoading,
    error,
    deleteEndpoint,
    clearError,
  } = useEndpointsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId && !!entitySlug,
  });

  // Show error via InfoInterface
  useEffect(() => {
    if (error) {
      getInfoService().show(t('common.error'), error, InfoType.ERROR, 5000);
      clearError();
    }
  }, [error, clearError, t]);

  const handleStartEditProject = () => {
    if (project) {
      setEditDisplayName(project.display_name);
      setEditDescription(project.description || '');
      setIsEditingProject(true);
    }
  };

  const handleSaveProject = async () => {
    if (!projectId || !editDisplayName.trim()) return;
    setIsSavingProject(true);
    try {
      await updateProject(projectId, {
        project_name: undefined,
        display_name: editDisplayName.trim(),
        description: editDescription.trim() || null,
        is_active: undefined,
      });
      setIsEditingProject(false);
      success(t('common:toast.success.saved'));
    } catch (err) {
      getInfoService().show(t('common.error'), err instanceof Error ? err.message : t('common:toast.error.generic'), InfoType.ERROR, 5000);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleCancelEditProject = () => {
    setIsEditingProject(false);
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    if (confirm(t('endpoints.confirmDelete'))) {
      try {
        await deleteEndpoint(endpointId);
        success(t('common:toast.success.deleted'));
      } catch (err) {
        getInfoService().show(t('common.error'), err instanceof Error ? err.message : t('common:toast.error.generic'), InfoType.ERROR, 5000);
      }
    }
  };

  // Loading state
  if (apiLoading || projectsLoading || (isReady && endpointsLoading && endpoints.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          {t('projects.notFound')}
        </h3>
        <button
          onClick={() => navigate(`/dashboard/${entitySlug}`)}
          className="text-blue-600 hover:underline"
        >
          {t('projects.backToProjects')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Project Info */}
      <div className="mb-6 p-4 bg-theme-bg-secondary rounded-xl">
        {isEditingProject ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('projects.form.displayName')}
              </label>
              <input
                type="text"
                value={editDisplayName}
                onChange={e => setEditDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-primary mb-1">
                {t('projects.form.description')}{' '}
                <span className="text-theme-text-tertiary">({t('common.optional')})</span>
              </label>
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-bg-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEditProject}
                disabled={isSavingProject}
                className="px-3 py-1.5 text-sm border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={isSavingProject || !editDisplayName.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSavingProject ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="min-w-0">
              <p className="text-sm text-theme-text-tertiary font-mono truncate mb-1">{project.project_name}</p>
              {project.description && (
                <p className="text-sm text-theme-text-secondary">{project.description}</p>
              )}
            </div>
            <button
              onClick={handleStartEditProject}
              className="flex-shrink-0 px-3 py-1.5 text-sm border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors"
            >
              {t('common.edit')}
            </button>
          </div>
        )}
      </div>

      {/* Endpoints Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-theme-text-primary">{t('endpoints.title')}</h3>
        <button
          onClick={() => navigate(`/dashboard/${entitySlug}/projects/${projectId}/endpoints/new`)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {t('endpoints.create')}
        </button>
      </div>

      {endpoints.length === 0 ? (
        <div className="text-center py-12 bg-theme-bg-secondary rounded-xl">
          <p className="text-theme-text-secondary">{t('endpoints.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {endpoints.map(endpoint => (
            <div
              key={endpoint.uuid}
              className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border hover:border-blue-500 cursor-pointer transition-colors group"
              onClick={() => navigate(`/dashboard/${entitySlug}/projects/${projectId}/endpoints/${endpoint.uuid}`)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`flex-shrink-0 px-2 py-1 text-xs font-mono font-medium rounded ${
                      endpoint.http_method === 'GET'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {endpoint.http_method}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-medium text-theme-text-primary truncate">{endpoint.display_name}</h4>
                    <p className="text-sm text-theme-text-tertiary font-mono truncate">
                      /{entitySlug}/{project.project_name}/{endpoint.endpoint_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 ml-11 sm:ml-0">
                  <div
                    className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleDeleteEndpoint(endpoint.uuid)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title={t('common.delete')}
                    >
                      <svg
                        className="w-4 h-4 text-red-600 dark:text-red-400"
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
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/dashboard/${entitySlug}/projects/${projectId}/endpoints/${endpoint.uuid}`);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {t('endpoints.test')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDetailPage;
