import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  generateCode, 
  connectTelegram, 
  checkStatus, 
  getStoredCode, 
  saveCode, 
  clearCode,
  StatusResponse 
} from '@/lib/api';
import { useTelegram } from '@/hooks/useTelegram';

interface AuthContextType {
  userCode: string | null;
  minutesLeft: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  logout: () => void;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAvailable, isLoading: isTelegramLoading, initData, hasValidInitData } = useTelegram();
  
  const [userCode, setUserCode] = useState<string | null>(null);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(userCode && minutesLeft >= 0);

  // Centralized logout logic
  const logout = useCallback(() => {
    clearCode();
    setUserCode(null);
    setMinutesLeft(0);
    setError(null);
  }, []);

  // Refresh status from API
  const refreshStatus = useCallback(async () => {
    const code = getStoredCode();
    if (!code) {
      setUserCode(null);
      setMinutesLeft(0);
      return;
    }

    try {
      const status = await checkStatus(code);
      setUserCode(code);
      setMinutesLeft(status.minutes_left);
      setError(null);
    } catch (err) {
      console.warn('Failed to refresh status');
      // Don't logout on status check failure, just log
    }
  }, []);

  // Connect with Telegram initData
  const connect = useCallback(async (): Promise<boolean> => {
    if (!hasValidInitData || !initData) {
      setError('No valid Telegram data available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get or generate user code
      let code = getStoredCode();
      
      if (!code) {
        const codeResponse = await generateCode();
        code = codeResponse.code;
        saveCode(code);
      }

      // Connect with Telegram
      const response = await connectTelegram(code, initData);
      
      if (response.success) {
        setUserCode(code);
        setMinutesLeft(response.minutes_left);
        return true;
      } else {
        throw new Error(response.message || 'Connection failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [initData, hasValidInitData]);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      // Wait for Telegram SDK to initialize
      if (isTelegramLoading) return;

      // Check if we have an existing code
      const code = getStoredCode();
      if (code) {
        try {
          const status = await checkStatus(code);
          setUserCode(code);
          setMinutesLeft(status.minutes_left);
        } catch {
          // Code is invalid, clear it
          clearCode();
        }
      }

      setIsLoading(false);
      setIsInitialized(true);
    };

    initAuth();
  }, [isTelegramLoading]);

  const value: AuthContextType = {
    userCode,
    minutesLeft,
    isAuthenticated,
    isLoading: isLoading || isTelegramLoading,
    isInitialized,
    error,
    connect,
    logout,
    refreshStatus,
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
