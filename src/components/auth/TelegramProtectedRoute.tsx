import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, MessageCircle } from 'lucide-react';

interface TelegramProtectedRouteProps {
  children: ReactNode;
}

export function TelegramProtectedRoute({ children }: TelegramProtectedRouteProps) {
  const location = useLocation();
  const { isAvailable, isLoading: isTelegramLoading } = useTelegram();
  const { isAuthenticated, isLoading: isAuthLoading, isInitialized } = useAuth();

  // Show loading while initializing
  if (isTelegramLoading || isAuthLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not opened from Telegram
  if (!isAvailable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md">
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
      </div>
    );
  }

  // Telegram available but not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated - render children
  return <>{children}</>;
}
