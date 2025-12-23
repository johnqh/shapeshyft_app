import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStatus } from '@sudobility/auth-components';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login page
      navigate(`/${lang || 'en'}/login`, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, lang]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
