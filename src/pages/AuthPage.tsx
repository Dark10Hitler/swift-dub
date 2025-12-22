import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { TelegramAuth } from '@/components/auth/TelegramAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Zap } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isInitialized } = useAuth();

  // Get the redirect destination
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, from]);

  const handleSuccess = () => {
    toast({
      title: 'Welcome to SmartDub!',
      description: 'You have been successfully authenticated via Telegram.',
    });
    navigate(from, { replace: true });
  };

  const handleError = (error: string) => {
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: error,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Smart<span className="text-gradient">Dub</span>
            </h1>
          </div>

          <TelegramAuth 
            onSuccess={handleSuccess} 
            onError={handleError} 
          />
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
