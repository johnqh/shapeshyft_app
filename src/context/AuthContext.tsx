import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

// Firebase error message helper
const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/weak-password': 'Password is too weak.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid credentials.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return errorMessages[code] || 'An error occurred. Please try again.';
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        setUser(currentUser);
        setLoading(false);
        // Close modal on successful auth
        if (currentUser) {
          setIsAuthModalOpen(false);
        }
      },
      err => {
        console.error('Auth state change error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get ID token for API calls
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (err) {
      console.error('Error getting ID token:', err);
      return null;
    }
  }, [user]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setError('Firebase not configured');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email/password
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        setError('Firebase not configured');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        const firebaseError = err as { code?: string; message?: string };
        setError(getFirebaseErrorMessage(firebaseError.code || ''));
        console.error('Email sign in error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sign up with email/password
  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!auth) {
        setError('Firebase not configured');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const { user: newUser } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (displayName && newUser) {
          await updateProfile(newUser, { displayName });
        }
      } catch (err) {
        const firebaseError = err as { code?: string; message?: string };
        setError(getFirebaseErrorMessage(firebaseError.code || ''));
        console.error('Email sign up error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    if (!auth) {
      setError('Firebase not configured');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
      console.error('Password reset error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!auth) {
      return;
    }

    setError(null);

    try {
      await firebaseSignOut(auth);
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      setError(getFirebaseErrorMessage(firebaseError.code || ''));
      console.error('Sign out error:', err);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Modal controls
  const openAuthModal = useCallback(() => {
    setError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setError(null);
    setIsAuthModalOpen(false);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    clearError,
    isAuthenticated: !!user,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
