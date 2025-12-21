import { useEffect, useState, useCallback } from 'react';

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

export function useTelegram() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tg, setTg] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        webApp.expand();
        setTg(webApp);
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
      setIsLoading(false);
    };

    // Check immediately
    if (document.readyState === 'complete') {
      checkTelegram();
    } else {
      window.addEventListener('load', checkTelegram);
      return () => window.removeEventListener('load', checkTelegram);
    }

    // Also check after a short delay for dynamic loading
    const timeout = setTimeout(checkTelegram, 100);
    return () => clearTimeout(timeout);
  }, []);

  const userId = tg?.initDataUnsafe?.user?.id || null;
  const username = tg?.initDataUnsafe?.user?.username || null;
  const firstName = tg?.initDataUnsafe?.user?.first_name || null;
  const lastName = tg?.initDataUnsafe?.user?.last_name || null;
  const initData = tg?.initData || null;
  const colorScheme = tg?.colorScheme || 'dark';

  const sendData = useCallback((data: object) => {
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  }, [tg]);

  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy') => {
    if (tg?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  }, [tg]);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    }
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  }, [tg]);

  return {
    tg,
    isAvailable,
    isLoading,
    userId,
    username,
    firstName,
    lastName,
    initData,
    colorScheme,
    sendData,
    hapticFeedback,
    showMainButton,
    hideMainButton,
  };
}
