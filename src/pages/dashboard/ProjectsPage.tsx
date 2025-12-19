import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

// Placeholder data until API integration
const mockProjects = [
  {
    uuid: '1',
    project_name: 'text-classifier',
    display_name: 'Text Classifier',
    description: 'Classify text into categories',
    is_active: true,
    created_at: new Date().toISOString(),
    endpoint_count: 2,
  },
  {
    uuid: '2',
    project_name: 'sentiment-api',
    display_name: 'Sentiment API',
    description: 'Analyze sentiment from text',
    is_active: true,
    created_at: new Date().toISOString(),
    endpoint_count: 1,
  },
];

function ProjectsPage() {
  const { t } = useTranslation('dashboard');
  const { navigate } = useLocalizedNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-theme-text-primary">
          {t('projects.title')}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('projects.create')}
          </button>
          <button
            onClick={() => {/* TODO: Show template selector */}}
            className="px-4 py-2 border border-theme-border text-theme-text-primary font-medium rounded-lg hover:bg-theme-hover-bg transition-colors"
          >
            {t('projects.useTemplate')}
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {mockProjects.length === 0 ? (
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
          <p className="text-theme-text-secondary">
            {t('projects.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map(project => (
            <div
              key={project.uuid}
              onClick={() => navigate(`/dashboard/projects/${project.uuid}`)}
              className="p-6 bg-theme-bg-secondary rounded-xl border border-theme-border hover:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-theme-text-primary">
                    {project.display_name}
                  </h3>
                  <p className="text-sm text-theme-text-tertiary font-mono">
                    {project.project_name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {project.is_active
                    ? t('projects.card.active')
                    : t('projects.card.inactive')}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-theme-text-secondary mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex justify-between items-center text-sm text-theme-text-tertiary">
                <span>
                  {t('projects.card.endpoints', { count: project.endpoint_count })}
                </span>
                <span>
                  {t('projects.card.created', {
                    date: new Date(project.created_at).toLocaleDateString(),
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md bg-theme-bg-primary rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('projects.form.title')}
            </h3>
            <p className="text-theme-text-secondary mb-4">
              Project creation form will be implemented with API integration.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-2 border border-theme-border rounded-lg hover:bg-theme-hover-bg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
