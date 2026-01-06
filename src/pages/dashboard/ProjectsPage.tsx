import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectsManager } from '@sudobility/shapeshyft_lib';
import { getInfoService } from '@sudobility/di';
import { InfoType } from '@sudobility/types';
import { ItemList } from '@sudobility/components';
import type { Project } from '@sudobility/shapeshyft_types';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';

// Icons
const FolderIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
    />
  </svg>
);

function ProjectsPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { navigate } = useLocalizedNavigate();
  const { entitySlug = '' } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token, testMode, isReady, isLoading: apiLoading } = useApi();
  const { success } = useToast();

  const {
    projects,
    isLoading,
    error,
    deleteProject,
    clearError,
  } = useProjectsManager({
    baseUrl,
    networkClient,
    entitySlug,
    token,
    testMode,
    autoFetch: isReady && !!entitySlug,
  });

  // Show error via InfoInterface
  useEffect(() => {
    if (error) {
      getInfoService().show(t('common.error'), error, InfoType.ERROR, 5000);
      clearError();
    }
  }, [error, clearError, t]);

  const handleDeleteProject = async (projectId: string) => {
    if (confirm(t('projects.confirmDelete'))) {
      try {
        await deleteProject(projectId);
        success(t('common:toast.success.deleted'));
      } catch (err) {
        getInfoService().show(t('common.error'), err instanceof Error ? err.message : t('common:toast.error.generic'), InfoType.ERROR, 5000);
      }
    }
  };

  const renderProjectCard = (project: Project) => (
    <div
      className="p-6 bg-theme-bg-secondary rounded-xl border border-theme-border hover:border-blue-500 cursor-pointer transition-colors group"
      onClick={() => navigate(`/dashboard/${entitySlug}/projects/${project.uuid}`)}
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
        <span>
          {t('projects.card.created', {
            date: project.created_at ? new Date(project.created_at).toLocaleDateString() : '-',
          })}
        </span>
      </div>
    </div>
  );

  return (
    <ItemList
      title={t('projects.title')}
      items={projects}
      renderItem={renderProjectCard}
      keyExtractor={project => project.uuid}
      loading={apiLoading || (isReady && isLoading && projects.length === 0)}
      actions={[
        {
          id: 'create',
          label: t('projects.create'),
          onClick: () => navigate(`/dashboard/${entitySlug}/projects/new`),
          icon: <PlusIcon />,
          variant: 'primary',
        },
        {
          id: 'templates',
          label: t('projects.useTemplate'),
          onClick: () => navigate(`/dashboard/${entitySlug}/projects/templates`),
          icon: <TemplateIcon />,
          variant: 'secondary',
        },
      ]}
      emptyMessage={t('projects.emptyDescription')}
      emptyIcon={
        <div className="w-16 h-16 bg-theme-bg-secondary rounded-full flex items-center justify-center text-theme-text-tertiary">
          <FolderIcon />
        </div>
      }
      emptyAction={{
        label: t('projects.create'),
        onClick: () => navigate(`/dashboard/${entitySlug}/projects/new`),
      }}
      spacing="md"
    />
  );
}

export default ProjectsPage;
