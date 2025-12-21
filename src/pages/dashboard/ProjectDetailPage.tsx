import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager, useEndpointsManager } from '@sudobility/shapeshyft_lib';
import type { EndpointUpdateRequest, HttpMethod, JsonSchema } from '@sudobility/shapeshyft_types';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import ProjectForm from '../../components/dashboard/ProjectForm';
import EndpointForm from '../../components/dashboard/EndpointForm';

function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation(['dashboard', 'common']);
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, userId, token, isReady, isLoading: apiLoading } = useApi();
  const { success, error: showError } = useToast();

  const [showEditProject, setShowEditProject] = useState(false);
  const [showCreateEndpoint, setShowCreateEndpoint] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<string | null>(null);

  const {
    projects,
    isLoading: projectsLoading,
    updateProject,
  } = useProjectsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  const project = projects.find(p => p.uuid === projectId);

  const {
    endpoints,
    isLoading: endpointsLoading,
    error,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    refresh,
    clearError,
  } = useEndpointsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    projectId: projectId ?? '',
    autoFetch: isReady && !!projectId,
  });

  const handleUpdateProject = async (data: { display_name: string; description?: string }) => {
    if (!projectId) return;
    try {
      await updateProject(projectId, {
        project_name: undefined,
        display_name: data.display_name,
        description: data.description ?? null,
        is_active: undefined,
      });
      setShowEditProject(false);
      success(t('common:toast.success.saved'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    if (confirm(t('endpoints.confirmDelete'))) {
      try {
        await deleteEndpoint(endpointId);
        success(t('common:toast.success.deleted'));
      } catch (err) {
        showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
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
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:underline"
        >
          {t('projects.backToProjects')}
        </button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
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
        </div>
        <p className="text-theme-text-secondary mb-4">{error}</p>
        <button
          onClick={() => {
            clearError();
            refresh();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-text-primary mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('projects.backToProjects')}
      </button>

      {/* Project Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-theme-text-primary mb-1">
            {project.display_name}
          </h2>
          <p className="text-sm text-theme-text-tertiary font-mono">{project.project_name}</p>
          {project.description && (
            <p className="mt-2 text-theme-text-secondary">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowEditProject(true)}
          className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors"
        >
          {t('common.edit')}
        </button>
      </div>

      {/* Endpoints Section */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-theme-text-primary">{t('endpoints.title')}</h3>
        <button
          onClick={() => setShowCreateEndpoint(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
              onClick={() => navigate(`/dashboard/projects/${projectId}/endpoints/${endpoint.uuid}`)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 text-xs font-mono font-medium rounded ${
                      endpoint.http_method === 'GET'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {endpoint.http_method}
                  </span>
                  <div>
                    <h4 className="font-medium text-theme-text-primary">{endpoint.display_name}</h4>
                    <p className="text-sm text-theme-text-tertiary font-mono">
                      /{project.project_name}/{endpoint.endpoint_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditingEndpoint(endpoint.uuid)}
                      className="p-1 hover:bg-theme-hover-bg rounded"
                      title={t('common.edit')}
                    >
                      <svg
                        className="w-4 h-4 text-theme-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
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
                      navigate(`/dashboard/projects/${projectId}/endpoints/${endpoint.uuid}`);
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

      {/* Edit Project Modal */}
      {showEditProject && (
        <ProjectForm
          project={project}
          onSubmit={handleUpdateProject}
          onClose={() => setShowEditProject(false)}
          isLoading={projectsLoading}
        />
      )}

      {/* Create Endpoint Modal */}
      {showCreateEndpoint && (
        <EndpointForm
          projectId={projectId!}
          onSubmit={async data => {
            try {
              await createEndpoint(data);
              setShowCreateEndpoint(false);
              success(t('common:toast.success.created'));
            } catch (err) {
              showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
            }
          }}
          onClose={() => setShowCreateEndpoint(false)}
          isLoading={endpointsLoading}
        />
      )}

      {/* Edit Endpoint Modal */}
      {editingEndpoint && (
        <EndpointForm
          projectId={projectId!}
          endpoint={endpoints.find(e => e.uuid === editingEndpoint)}
          onSubmit={async data => {
            try {
              const updateData: EndpointUpdateRequest = {
                endpoint_name: data.endpoint_name,
                display_name: data.display_name,
                http_method: data.http_method as HttpMethod | undefined,
                llm_key_id: data.llm_key_id,
                input_schema: data.input_schema as JsonSchema | undefined | null,
                output_schema: data.output_schema as JsonSchema | undefined | null,
                description: data.description,
                context: data.context,
                is_active: undefined,
              };
              await updateEndpoint(editingEndpoint, updateData);
              setEditingEndpoint(null);
              success(t('common:toast.success.saved'));
            } catch (err) {
              showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
            }
          }}
          onClose={() => setEditingEndpoint(null)}
          isLoading={endpointsLoading}
        />
      )}
    </div>
  );
}

export default ProjectDetailPage;
