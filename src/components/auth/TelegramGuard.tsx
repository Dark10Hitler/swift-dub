import { ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, MessageCircle } from 'lucide-react';

interface TelegramGuardProps {
  children: ReactNode;
  /** If true, allows access even outside Telegram (for public pages) */
  allowOutsideTelegram?: boolean;
}

/**
 * Guards content that requires Telegram environment.
 * Shows appropriate UI if Telegram is not available.
 */
export function TelegramGuard({ children, allowOutsideTelegram = false }: TelegramGuardProps) {
  const { isAvailable, isLoading } = useTelegram();

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Connecting to Telegram...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow access outside Telegram if specified
  if (allowOutsideTelegram) {
    return <>{children}</>;
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
            <CardTitle className="text-2xl font-display">Open in Telegram</CardTitle>
            <CardDescription>
              SmartDub is a Telegram Mini App
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              To use SmartDub, please open this app from our Telegram bot.
            </p>
            <Button 
              variant="hero" 
              className="w-full"
              onClick={() => window.open('https://t.me/SmartDubBot', '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Open @SmartDubBot
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
