import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { AuthForm } from '@/components/auth/AuthForm';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Zap } from 'lucide-react';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register' || modeParam === 'login') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      if (mode === 'login') {
        await api.login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      } else {
        await api.register(email, password);
        toast({
          title: 'Account created!',
          description: 'Welcome to SmartDub. You have 1 free video to try.',
        });
      }
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
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

          <AuthForm
            mode={mode}
            onSubmit={handleSubmit}
            onModeChange={setMode}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
