import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, MessageCircle } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';

interface TelegramAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function TelegramAuth({ onSuccess, onError }: TelegramAuthProps) {
  const { isAvailable, isLoading: isTelegramLoading, initData, firstName, username } = useTelegram();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      if (!initData || isAuthenticating || isAuthenticated) return;

      setIsAuthenticating(true);
      try {
        await api.authenticateWithTelegram(initData);
        setIsAuthenticated(true);
        onSuccess();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        onError(message);
      } finally {
        setIsAuthenticating(false);
      }
    };

    if (isAvailable && initData && !isTelegramLoading) {
      authenticate();
    }
  }, [isAvailable, initData, isTelegramLoading, isAuthenticating, isAuthenticated, onSuccess, onError]);

  // Still checking Telegram availability
  if (isTelegramLoading) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to Telegram...</p>
        </CardContent>
      </Card>
    );
  }

  // Not opened from Telegram
  if (!isAvailable) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-display">Telegram Required</CardTitle>
          <CardDescription>
            This app must be opened from Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            SmartDub is a Telegram Mini App. Please open it from our Telegram bot to continue.
          </p>
          <Button 
            variant="hero" 
            className="w-full"
            onClick={() => window.open('https://t.me/SmartDubBot', '_blank')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Open in Telegram
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Authenticating with backend
  if (isAuthenticating) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            Welcome, {firstName || username || 'there'}!
          </p>
          <p className="text-muted-foreground">Signing you in...</p>
        </CardContent>
      </Card>
    );
  }

  // Successfully authenticated
  if (isAuthenticated) {
    return (
      <Card variant="glass" className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            Welcome, {firstName || username || 'there'}!
          </p>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  // Waiting for auth to start (shouldn't normally show)
  return (
    <Card variant="glass" className="w-full max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Preparing authentication...</p>
      </CardContent>
    </Card>
  );
}