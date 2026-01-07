import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowUpRight } from "lucide-react";

interface RateLimitPanelProps {
  entitySlug: string;
}

function RateLimitPanel({ entitySlug }: RateLimitPanelProps) {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate(`/dashboard/${entitySlug}/subscription`);
  };

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
            {t("errors.rateLimit.title")}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            {t("errors.rateLimit.message")}
          </p>
          <button
            onClick={handleUpgrade}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            {t("errors.rateLimit.upgradeButton")}
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RateLimitPanel;
