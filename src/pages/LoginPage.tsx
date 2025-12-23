import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthInline, useAuthStatus } from '@sudobility/auth-components';
import { CONSTANTS } from '../config/constants';

function LoginPage() {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate(`/${lang || 'en'}/dashboard`, { replace: true });
    }
  }, [user, loading, navigate, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-theme-bg-primary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt={CONSTANTS.APP_NAME} className="h-12" />
        </div>

        {/* Auth Form */}
        <div className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border">
          <AuthInline
            onSuccess={() => {
              navigate(`/${lang || 'en'}/dashboard`, { replace: true });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
