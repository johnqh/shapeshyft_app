import { useState, useRef, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Project, LlmApiKeySafe } from "@sudobility/shapeshyft_types";
import { useProviders } from "@sudobility/shapeshyft_client";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";
import { useApi } from "../../hooks/useApi";
import { CONSTANTS } from "../../config/constants";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isSelected: boolean;
  selectedChildId?: string | null;
  onSelect: () => void;
  children?: React.ReactNode;
  hasChildren?: boolean;
  childCount?: number;
}

const CollapsibleSubsections: React.FC<{
  children: React.ReactNode;
  isExpanded: boolean;
}> = ({ children, isExpanded }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeight(isExpanded ? scrollHeight + 8 : 0);
    }
  }, [isExpanded, children]);

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
    >
      <div ref={contentRef} className="ml-6 mt-1 mb-1 space-y-0.5">
        {children}
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
  icon,
  isSelected,
  selectedChildId,
  onSelect,
  children,
  hasChildren = false,
  childCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div className="relative flex items-center group">
        {/* Selection overlay */}
        {isSelected && !selectedChildId && (
          <div className="absolute top-1 bottom-1 left-1 right-10 bg-blue-500/15 dark:bg-blue-400/15 rounded-lg pointer-events-none" />
        )}
        {/* Hover overlay */}
        {!(isSelected && !selectedChildId) && (
          <div className="absolute top-1 bottom-1 left-1 right-10 bg-blue-500/0 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-400/10 rounded-lg pointer-events-none transition-colors duration-200" />
        )}
        <button
          onClick={onSelect}
          className={`relative z-10 flex-1 flex items-center gap-3 text-left px-3 py-3 text-sm font-medium transition-all duration-200 ${
            isSelected && !selectedChildId
              ? "text-blue-700 dark:text-blue-300"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <span
            className={`flex-shrink-0 ${isSelected && !selectedChildId ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
          >
            {icon}
          </span>
          <span className="flex-1">{title}</span>
          {childCount !== undefined && childCount > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
              {childCount}
            </span>
          )}
        </button>
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 mr-1"
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            <ChevronRightIcon
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${
                isExpanded ? "rotate-90" : "rotate-0"
              }`}
            />
          </button>
        )}
      </div>

      {hasChildren && children && (
        <CollapsibleSubsections isExpanded={isExpanded}>
          {children}
        </CollapsibleSubsections>
      )}
    </div>
  );
};

interface ChildItemProps {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onClick: () => void;
  statusBadge?: React.ReactNode;
}

const ChildItem: React.FC<ChildItemProps> = ({
  label,
  sublabel,
  isSelected,
  onClick,
  statusBadge,
}) => {
  return (
    <div className="relative group">
      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute top-0.5 bottom-0.5 left-1 right-1 bg-blue-500/15 dark:bg-blue-400/15 rounded-lg pointer-events-none" />
      )}
      {/* Hover overlay */}
      {!isSelected && (
        <div className="absolute top-0.5 bottom-0.5 left-1 right-1 bg-blue-500/0 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-400/10 rounded-lg pointer-events-none transition-colors duration-200" />
      )}
      <button
        onClick={onClick}
        className={`relative z-10 block w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
          isSelected
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate">{label}</div>
            {sublabel && (
              <div className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                {sublabel}
              </div>
            )}
          </div>
          {statusBadge}
        </div>
      </button>
    </div>
  );
};

interface DashboardMasterListProps {
  projects: Project[];
  keys: LlmApiKeySafe[];
  onNavigate?: () => void;
}

// Icons as components
const FolderIcon = () => (
  <svg
    className="w-5 h-5"
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
);

const KeyIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const BudgetIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SubscriptionIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const RateLimitsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span
    className={`w-2 h-2 rounded-full flex-shrink-0 ${
      isActive ? "bg-green-500" : "bg-gray-400"
    }`}
  />
);

export function DashboardMasterList({
  projects,
  keys,
  onNavigate,
}: DashboardMasterListProps) {
  const { t } = useTranslation("dashboard");
  const { navigate } = useLocalizedNavigate();
  const location = useLocation();
  const { entitySlug = "", projectId } = useParams<{
    entitySlug: string;
    projectId: string;
  }>();
  const { networkClient, baseUrl, testMode } = useApi();

  // Fetch providers for display names
  const { providers } = useProviders(networkClient, baseUrl, testMode);

  // Helper to get provider display name
  const getProviderName = (providerId: string) => {
    const providerInfo = providers.find((p) => p.id === providerId);
    return providerInfo?.name ?? providerId;
  };

  // Determine current section from URL
  const pathname = location.pathname;
  const isProjectsSection =
    pathname.includes("/dashboard") &&
    !pathname.includes("/providers") &&
    !pathname.includes("/analytics") &&
    !pathname.includes("/budgets") &&
    !pathname.includes("/subscription") &&
    !pathname.includes("/settings") &&
    !pathname.includes("/rate-limits");
  const isProvidersSection = pathname.includes("/providers");
  const isAnalyticsSection = pathname.includes("/analytics");
  const isBudgetsSection = pathname.includes("/budgets");
  const isSubscriptionSection = pathname.includes("/subscription");
  const isRateLimitsSection = pathname.includes("/rate-limits");
  const isSettingsSection = pathname.includes("/settings");

  const handleNavigation = (path: string) => {
    navigate(`/dashboard/${entitySlug}${path}`);
    onNavigate?.();
  };

  return (
    <div className="space-y-0">
      {/* Projects Section */}
      <CollapsibleSection
        id="projects"
        title={t("navigation.projects")}
        icon={<FolderIcon />}
        isSelected={isProjectsSection}
        selectedChildId={projectId}
        onSelect={() => handleNavigation("")}
        hasChildren={projects.length > 0}
        childCount={projects.length}
      >
        {projects.map((project) => (
          <ChildItem
            key={project.uuid}
            label={project.display_name}
            sublabel={project.project_name}
            isSelected={projectId === project.uuid}
            onClick={() => handleNavigation(`/projects/${project.uuid}`)}
            statusBadge={<StatusBadge isActive={project.is_active ?? false} />}
          />
        ))}
      </CollapsibleSection>

      {/* Providers Section */}
      <CollapsibleSection
        id="providers"
        title={t("navigation.providers")}
        icon={<KeyIcon />}
        isSelected={isProvidersSection}
        onSelect={() => handleNavigation("/providers")}
        hasChildren={keys.length > 0}
        childCount={keys.length}
      >
        {keys.map((key) => (
          <ChildItem
            key={key.uuid}
            label={key.key_name}
            sublabel={getProviderName(key.provider)}
            isSelected={false}
            onClick={() => handleNavigation("/providers")}
            statusBadge={<StatusBadge isActive={key.is_active ?? false} />}
          />
        ))}
      </CollapsibleSection>

      {/* Divider */}
      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

      {/* Analytics - dev mode only */}
      {CONSTANTS.DEV_MODE && (
        <CollapsibleSection
          id="analytics"
          title={t("navigation.analytics")}
          icon={<ChartIcon />}
          isSelected={isAnalyticsSection}
          onSelect={() => handleNavigation("/analytics")}
        />
      )}

      {/* Budgets - dev mode only */}
      {CONSTANTS.DEV_MODE && (
        <CollapsibleSection
          id="budgets"
          title={t("navigation.budgets")}
          icon={<BudgetIcon />}
          isSelected={isBudgetsSection}
          onSelect={() => handleNavigation("/budgets")}
        />
      )}

      {/* Subscription */}
      <CollapsibleSection
        id="subscription"
        title={t("navigation.subscription")}
        icon={<SubscriptionIcon />}
        isSelected={isSubscriptionSection}
        onSelect={() => handleNavigation("/subscription")}
      />

      {/* Rate Limits */}
      <CollapsibleSection
        id="rate-limits"
        title={t("navigation.rateLimits")}
        icon={<RateLimitsIcon />}
        isSelected={isRateLimitsSection}
        onSelect={() => handleNavigation("/rate-limits")}
      />

      {/* Divider */}
      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

      {/* Settings */}
      <CollapsibleSection
        id="settings"
        title={t("navigation.settings")}
        icon={<SettingsIcon />}
        isSelected={isSettingsSection}
        onSelect={() => handleNavigation("/settings")}
      />
    </div>
  );
}

export default DashboardMasterList;
