import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

interface DocsSidebarProps {
  onNavigate?: () => void;
}

interface DocSection {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
}

const sections: DocSection[] = [
  {
    id: 'getting-started',
    labelKey: 'nav.gettingStarted',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'concepts',
    labelKey: 'nav.concepts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'api-reference',
    labelKey: 'nav.apiReference',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

function DocsSidebar({ onNavigate }: DocsSidebarProps) {
  const { t } = useTranslation('docs');
  const location = useLocation();
  const { navigate } = useLocalizedNavigate();

  const currentSection = location.pathname.split('/docs/')[1] || 'getting-started';

  const handleSectionClick = (sectionId: string) => {
    navigate(`/docs/${sectionId}`);
    onNavigate?.();
  };

  return (
    <nav className="py-4">
      <ul className="space-y-1">
        {sections.map((section) => {
          const isActive = currentSection === section.id;
          return (
            <li key={section.id}>
              <button
                onClick={() => handleSectionClick(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-theme-text-secondary hover:bg-theme-hover-bg hover:text-theme-text-primary'
                }`}
              >
                <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-theme-text-tertiary'}>
                  {section.icon}
                </span>
                <span>{t(section.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default DocsSidebar;
