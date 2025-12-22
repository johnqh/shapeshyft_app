import type { ReactNode } from 'react';
import { BreadcrumbSection, LayoutProvider } from '@sudobility/components';
import TopBar from './TopBar';
import Footer from './Footer';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

interface ScreenContainerProps {
  children: ReactNode;
  footerVariant?: 'full' | 'compact';
  topbarVariant?: 'default' | 'transparent';
  showFooter?: boolean;
  showBreadcrumbs?: boolean;
}

function ScreenContainer({
  children,
  footerVariant = 'full',
  topbarVariant = 'default',
  showFooter = true,
  showBreadcrumbs = false,
}: ScreenContainerProps) {
  const { items: breadcrumbItems } = useBreadcrumbs();

  return (
    <LayoutProvider mode="standard">
      <div className="min-h-screen flex flex-col bg-theme-bg-primary">
        <TopBar variant={topbarVariant} />

        {showBreadcrumbs && breadcrumbItems.length > 1 && (
          <BreadcrumbSection items={breadcrumbItems} />
        )}

        <main className="flex-1">{children}</main>

        {showFooter && <Footer variant={footerVariant} />}
      </div>
    </LayoutProvider>
  );
}

export default ScreenContainer;
