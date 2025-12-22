import { useEffect, useState, useCallback, useMemo } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  platform: string;
  version: string;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramPlatformInfo {
  isMobile: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: string;
}

export function useTelegram() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initTelegram = () => {
      try {
        if (window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Safely call ready and expand
          try {
            webApp.ready();
          } catch (e) {
            console.warn('Failed to call tg.ready():', e);
          }
          
          try {
            webApp.expand();
          } catch (e) {
            console.warn('Failed to call tg.expand():', e);
          }
          
          setTg(webApp);
          setIsAvailable(true);
          setInitError(null);
        } else {
          setIsAvailable(false);
          setInitError('Telegram WebApp not available');
        }
      } catch (e) {
        console.error('Telegram init error:', e);
        setIsAvailable(false);
        setInitError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      // Small delay to ensure Telegram SDK is injected
      const timeout = setTimeout(initTelegram, 50);
      return () => clearTimeout(timeout);
    } else {
      // Wait for window load
      const handleLoad = () => {
        setTimeout(initTelegram, 50);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Extract user data safely
  const userId = tg?.initDataUnsafe?.user?.id ?? null;
  const username = tg?.initDataUnsafe?.user?.username ?? null;
  const firstName = tg?.initDataUnsafe?.user?.first_name ?? null;
  const lastName = tg?.initDataUnsafe?.user?.last_name ?? null;
  const initData = tg?.initData || null;
  const colorScheme = tg?.colorScheme ?? 'dark';

  // Check if initData is valid (has actual content)
  const hasValidInitData = Boolean(initData && initData.length > 0);

  // Platform detection
  const platformInfo: TelegramPlatformInfo = useMemo(() => {
    const platform = tg?.platform?.toLowerCase() || '';
    return {
      isMobile: platform.includes('android') || platform.includes('ios'),
      isDesktop: platform.includes('tdesktop') || platform.includes('macos') || platform.includes('web'),
      isIOS: platform.includes('ios'),
      isAndroid: platform.includes('android'),
      platform: tg?.platform || 'unknown',
    };
  }, [tg?.platform]);

  const sendData = useCallback((data: object) => {
    if (tg) {
      try {
        tg.sendData(JSON.stringify(data));
      } catch (e) {
        console.error('Failed to send data to Telegram:', e);
      }
    }
  }, [tg]);

  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy') => {
    if (tg?.HapticFeedback) {
      try {
        if (type === 'success' || type === 'error' || type === 'warning') {
          tg.HapticFeedback.notificationOccurred(type);
        } else {
          tg.HapticFeedback.impactOccurred(type);
        }
      } catch (e) {
        console.warn('Haptic feedback failed:', e);
      }
    }
  }, [tg]);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (tg?.MainButton) {
      try {
        tg.MainButton.setText(text);
        tg.MainButton.onClick(onClick);
        tg.MainButton.show();
      } catch (e) {
        console.warn('Failed to show main button:', e);
      }
    }
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (tg?.MainButton) {
      try {
        tg.MainButton.hide();
      } catch (e) {
        console.warn('Failed to hide main button:', e);
      }
    }
  }, [tg]);

  const closeMiniApp = useCallback(() => {
    if (tg) {
      try {
        tg.close();
      } catch (e) {
        console.warn('Failed to close mini app:', e);
      }
    }
  }, [tg]);

  return {
    tg,
    isAvailable,
    isLoading,
    initError,
    userId,
    username,
    firstName,
    lastName,
    initData,
    hasValidInitData,
    colorScheme,
    platformInfo,
    sendData,
    hapticFeedback,
    showMainButton,
    hideMainButton,
    closeMiniApp,
  };
}
