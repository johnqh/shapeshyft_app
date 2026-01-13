import type { ReactNode } from "react";
import { BreadcrumbSection, LayoutProvider } from "@sudobility/components";
import TopBar from "./TopBar";
import Footer from "./Footer";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";
import { CONSTANTS } from "../../config/constants";

interface ShareConfig {
  title: string;
  description: string;
  hashtags: string[];
  onBeforeShare?: (baseUrl: string) => Promise<string>;
}

const DEFAULT_SHARE_CONFIG: ShareConfig = {
  title: `${CONSTANTS.APP_NAME} - Transform LLM Outputs into Structured APIs`,
  description:
    "Build reliable AI-powered REST APIs with JSON Schema validation.",
  hashtags: [CONSTANTS.APP_NAME, "AI", "LLM", "API", "StructuredOutput"],
};

interface ScreenContainerProps {
  children: ReactNode;
  footerVariant?: "full" | "compact";
  topbarVariant?: "default" | "transparent";
  showFooter?: boolean;
  showBreadcrumbs?: boolean;
  shareConfig?: ShareConfig | false;
}

function ScreenContainer({
  children,
  footerVariant = "full",
  topbarVariant = "default",
  showFooter = true,
  showBreadcrumbs = false,
  shareConfig,
}: ScreenContainerProps) {
  const { items: breadcrumbItems } = useBreadcrumbs();
  const effectiveShareConfig =
    shareConfig === false ? undefined : (shareConfig ?? DEFAULT_SHARE_CONFIG);

  return (
    <LayoutProvider mode="standard">
      <div className="min-h-screen flex flex-col bg-theme-bg-primary">
        {/* Sticky header containing topbar and breadcrumbs */}
        <div className="sticky top-0 z-40">
          <TopBar variant={topbarVariant} />

          {(showBreadcrumbs || effectiveShareConfig) &&
            breadcrumbItems.length > 0 && (
              <BreadcrumbSection
                items={breadcrumbItems}
                shareConfig={effectiveShareConfig}
              />
            )}
        </div>

        <main className="flex-1">
          <div className="container-app">{children}</div>
        </main>

        {showFooter && <Footer variant={footerVariant} />}
      </div>
    </LayoutProvider>
  );
}

export default ScreenContainer;
