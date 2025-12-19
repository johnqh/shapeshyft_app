import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

// Placeholder data
const mockProject = {
  uuid: '1',
  project_name: 'text-classifier',
  display_name: 'Text Classifier',
  description: 'Classify text into categories using AI',
  is_active: true,
};

const mockEndpoints = [
  {
    uuid: 'e1',
    endpoint_name: 'classify',
    display_name: 'Classify Text',
    http_method: 'POST',
    endpoint_type: 'text_in_structured_out',
    is_active: true,
  },
  {
    uuid: 'e2',
    endpoint_name: 'batch-classify',
    display_name: 'Batch Classification',
    http_method: 'POST',
    endpoint_type: 'structured_in_structured_out',
    is_active: true,
  },
];

function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation('dashboard');
  const { navigate } = useLocalizedNavigate();

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
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-theme-text-primary mb-1">
            {mockProject.display_name}
          </h2>
          <p className="text-sm text-theme-text-tertiary font-mono">
            {mockProject.project_name}
          </p>
          {mockProject.description && (
            <p className="mt-2 text-theme-text-secondary">
              {mockProject.description}
            </p>
          )}
        </div>
        <button className="px-4 py-2 border border-theme-border text-theme-text-primary rounded-lg hover:bg-theme-hover-bg transition-colors">
          Edit Project
        </button>
      </div>

      {/* Endpoints Section */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-theme-text-primary">
          {t('endpoints.title')}
        </h3>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          {t('endpoints.create')}
        </button>
      </div>

      {mockEndpoints.length === 0 ? (
        <div className="text-center py-12 bg-theme-bg-secondary rounded-xl">
          <p className="text-theme-text-secondary">{t('endpoints.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockEndpoints.map(endpoint => (
            <div
              key={endpoint.uuid}
              className="p-4 bg-theme-bg-secondary rounded-xl border border-theme-border hover:border-blue-500 cursor-pointer transition-colors"
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
                    <h4 className="font-medium text-theme-text-primary">
                      {endpoint.display_name}
                    </h4>
                    <p className="text-sm text-theme-text-tertiary font-mono">
                      /{mockProject.project_name}/{endpoint.endpoint_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-theme-text-tertiary bg-theme-bg-tertiary px-2 py-1 rounded">
                    {endpoint.endpoint_type}
                  </span>
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
    </div>
  );
}

export default ProjectDetailPage;
