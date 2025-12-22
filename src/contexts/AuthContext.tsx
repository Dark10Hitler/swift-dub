import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, User } from '@/lib/api';
import { useTelegram } from '@/hooks/useTelegram';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: () => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAvailable, isLoading: isTelegramLoading, initData, hasValidInitData } = useTelegram();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(user && api.isAuthenticated());

  // Centralized logout logic
  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
  }, []);

  // Refresh user data from API
  const refreshUser = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const userData = await api.getUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      // Token is invalid or expired
      console.warn('Failed to refresh user, logging out');
      logout();
    }
  }, [logout]);

  // Login with Telegram initData
  const login = useCallback(async (): Promise<boolean> => {
    if (!hasValidInitData || !initData) {
      setError('No valid Telegram data available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.authenticateWithTelegram(initData);
      setUser(response.user);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [initData, hasValidInitData, logout]);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      // Wait for Telegram SDK to initialize
      if (isTelegramLoading) return;

      // Check if we have an existing token
      if (api.isAuthenticated()) {
        try {
          const userData = await api.getUser();
          setUser(userData);
        } catch {
          // Token is invalid, clear it
          logout();
        }
      }

      setIsLoading(false);
      setIsInitialized(true);
    };

    initAuth();
  }, [isTelegramLoading, logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || isTelegramLoading,
    isInitialized,
    error,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
