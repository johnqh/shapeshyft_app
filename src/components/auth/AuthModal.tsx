import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password';

function AuthModal() {
  const { t } = useTranslation('auth');
  const { isAuthModalOpen, closeAuthModal, error, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const prevIsOpenRef = useRef(isAuthModalOpen);

  // Reset mode when modal transitions from closed to open
  // This setState is intentional to reset form state on modal open
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isAuthModalOpen;

    // Only reset when transitioning from closed to open
    if (isAuthModalOpen && !wasOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode('login');
      clearError();
    }
  }, [isAuthModalOpen, clearError]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    if (isAuthModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-theme-bg-primary rounded-xl shadow-xl">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-theme-hover-bg transition-colors"
          aria-label="Close"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-6">
            {t('modal.title')}
          </h2>

          {/* Tabs (only show for login/signup) */}
          {mode !== 'forgot-password' && (
            <div className="flex border-b border-theme-border mb-6">
              <button
                onClick={() => {
                  setMode('login');
                  clearError();
                }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  mode === 'login'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                {t('modal.loginTab')}
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  clearError();
                }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  mode === 'signup'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                {t('modal.signupTab')}
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Forms */}
          {mode === 'login' && (
            <LoginForm onForgotPassword={() => setMode('forgot-password')} />
          )}
          {mode === 'signup' && <SignupForm />}
          {mode === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
