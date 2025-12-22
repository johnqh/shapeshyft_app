import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectsManager, useProjectTemplates } from '@sudobility/shapeshyft_lib';
import { ShapeshyftClient } from '@sudobility/shapeshyft_client';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import ProjectForm from '../../components/dashboard/ProjectForm';
import TemplateSelector from '../../components/dashboard/TemplateSelector';

function ProjectsPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { navigate } = useLocalizedNavigate();
  const { networkClient, baseUrl, userId, token, isReady, isLoading: apiLoading } = useApi();
  const { success, error: showError } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh,
    clearError,
  } = useProjectsManager({
    baseUrl,
    networkClient,
    userId: userId ?? '',
    token,
    autoFetch: isReady,
  });

  const { templates, applyTemplate } = useProjectTemplates();

  const handleCreateProject = async (data: { display_name: string; description?: string }) => {
    const projectName = data.display_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      await createProject({
        project_name: projectName,
        display_name: data.display_name,
        description: data.description ?? null,
      });
      setShowCreateModal(false);
      success(t('common:toast.success.created'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
    }
  };

  const handleUpdateProject = async (
    projectId: string,
    data: { display_name: string; description?: string }
  ) => {
    try {
      await updateProject(projectId, {
        project_name: undefined,
        display_name: data.display_name,
        description: data.description ?? null,
        is_active: undefined,
      });
      setEditingProject(null);
      success(t('common:toast.success.saved'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm(t('projects.confirmDelete'))) {
      try {
        await deleteProject(projectId);
        success(t('common:toast.success.deleted'));
      } catch (err) {
        showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
      }
    }
  };

  const handleApplyTemplate = async (
    templateId: string,
    projectName: string,
    llmKeyId: string
  ) => {
    const result = applyTemplate(templateId, projectName, llmKeyId);
    if (result && userId && token) {
      try {
        // Create the project first
        const project = await createProject(result.project);
        if (!project) {
          throw new Error('Failed to create project');
        }

        // Create endpoints using the client
        const client = new ShapeshyftClient({ networkClient, baseUrl });
        for (const endpointData of result.endpoints) {
          await client.createEndpoint(userId, project.uuid, endpointData, token);
        }

        setShowTemplateModal(false);
        refresh();
        success(t('common:toast.success.created'));
      } catch (err) {
        showError(err instanceof Error ? err.message : t('common:toast.error.generic'));
      }
    }
  };

  // Show loading state
  if (apiLoading || (isReady && isLoading && projects.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
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
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          {t('common.error')}
        </h3>
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
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {t('projects.create')}
        </button>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="px-4 py-2 border border-theme-border text-theme-text-primary font-medium rounded-lg hover:bg-theme-hover-bg transition-colors text-sm"
        >
          {t('projects.useTemplate')}
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-theme-bg-secondary rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-theme-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-theme-text-primary mb-2">
            {t('projects.empty')}
          </h3>
          <p className="text-theme-text-secondary">{t('projects.emptyDescription')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.uuid}
              className="p-6 bg-theme-bg-secondary rounded-xl border border-theme-border hover:border-blue-500 cursor-pointer transition-colors group"
              onClick={() => navigate(`/dashboard/projects/${project.uuid}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-theme-text-primary truncate">
                    {project.display_name}
                  </h3>
                  <p className="text-sm text-theme-text-tertiary font-mono truncate">
                    {project.project_name}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {project.is_active ? t('projects.card.active') : t('projects.card.inactive')}
                  </span>
                  <div
                    className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditingProject(project.uuid)}
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
                      onClick={() => handleDeleteProject(project.uuid)}
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
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-theme-text-secondary mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex justify-between items-center text-sm text-theme-text-tertiary">
                <span>{t('projects.card.created', {
                  date: project.created_at ? new Date(project.created_at).toLocaleDateString() : '-',
                })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onClose={() => setShowCreateModal(false)}
          isLoading={isLoading}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectForm
          project={projects.find(p => p.uuid === editingProject)}
          onSubmit={data => handleUpdateProject(editingProject, data)}
          onClose={() => setEditingProject(null)}
          isLoading={isLoading}
        />
      )}

      {/* Template Selector Modal */}
      {showTemplateModal && (
        <TemplateSelector
          templates={templates}
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

export default ProjectsPage;
