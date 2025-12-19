import type { ReactNode } from 'react';
import TopBar from './TopBar';
import Footer from './Footer';
import AuthModal from '../auth/AuthModal';

interface ScreenContainerProps {
  children: ReactNode;
  footerVariant?: 'full' | 'compact';
  topbarVariant?: 'default' | 'transparent';
  showFooter?: boolean;
}

function ScreenContainer({
  children,
  footerVariant = 'full',
  topbarVariant = 'default',
  showFooter = true,
}: ScreenContainerProps) {
  return (
    <div className="min-h-screen flex flex-col bg-theme-bg-primary">
      <TopBar variant={topbarVariant} />

      <main className="flex-1">{children}</main>

      {showFooter && <Footer variant={footerVariant} />}

      {/* Auth Modal - rendered at root level */}
      <AuthModal />
    </div>
  );
}

export default ScreenContainer;
