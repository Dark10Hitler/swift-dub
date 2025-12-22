import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingCard, PricingPlan } from '@/components/pricing/PricingCard';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, AlertTriangle } from 'lucide-react';

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 'Free',
    description: 'Try SmartDub with one free video',
    videoLimit: 1,
    maxDuration: '3 minutes',
    features: [
      'One-time use',
      'All 50+ languages',
      'Standard processing',
      'Download in HD',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: '/one-time',
    description: 'Perfect for small projects',
    videoLimit: 10,
    maxDuration: '10 minutes',
    features: [
      '10 video credits',
      'All 50+ languages',
      'Priority processing',
      'Download in HD',
      'Telegram support',
    ],
    badge: 'Popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/one-time',
    description: 'For content creators & businesses',
    videoLimit: 50,
    maxDuration: '60 minutes',
    featured: true,
    features: [
      '50 video credits',
      'All 50+ languages',
      'Fastest processing',
      'Download in 4K',
      'Priority support',
      'Custom voice selection',
    ],
    badge: 'Best Value',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '$199',
    period: '/one-time',
    description: 'For agencies & power users',
    videoLimit: 200,
    maxDuration: '120 minutes',
    features: [
      '200 video credits',
      'All 50+ languages',
      'Fastest processing',
      'Download in 4K',
      'Dedicated support',
      'Custom voice cloning',
      'API access',
    ],
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, isAvailable, hapticFeedback } = useTelegram();
  const { isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const pendingRequest = useRef(false);

  const handleSelectPlan = async (planId: string) => {
    // Handle free plan
    if (planId === 'free') {
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
      toast({
        title: 'Free Trial',
        description: 'Your free video credit is already available in your account!',
      });
      navigate('/upload');
      return;
    }

    // Prevent double-clicks
    if (pendingRequest.current || loadingPlan) {
      return;
    }

    // Must be in Telegram
    if (!isAvailable) {
      toast({
        variant: 'destructive',
        title: 'Telegram Required',
        description: 'Please open this app from Telegram to make purchases.',
      });
      return;
    }

    // Must have userId
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unable to identify your Telegram account. Please reopen the app.',
      });
      return;
    }

    pendingRequest.current = true;
    setLoadingPlan(planId);
    hapticFeedback('light');
    
    try {
      const response = await api.requestTelegramInvoice(planId, userId);
      
      if (response.success) {
        hapticFeedback('success');
        toast({
          title: 'Invoice Sent!',
          description: 'Check your Telegram chat with @SmartDubBot to complete payment.',
        });
      } else {
        throw new Error(response.message || 'Failed to create invoice');
      }
    } catch (err) {
      hapticFeedback('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create invoice. Please try again.',
      });
    } finally {
      setLoadingPlan(null);
      pendingRequest.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent{' '}
              <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works for you. Pay securely via Telegram.
            </p>
          </div>

          {/* Telegram Payment Notice */}
          {!isAvailable && (
            <Card variant="glass" className="mb-8 border-secondary/50 max-w-2xl mx-auto">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-sm text-foreground">
                  To purchase credits, please open this app from Telegram.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                isLoading={loadingPlan === plan.id}
                isDisabled={loadingPlan !== null && loadingPlan !== plan.id}
              />
            ))}
          </div>

          {/* Payment Info */}
          <div className="mt-16 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <p className="text-sm">
                All payments are processed securely via Telegram Payments.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              After clicking "Buy", you'll receive an invoice in your Telegram chat.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
