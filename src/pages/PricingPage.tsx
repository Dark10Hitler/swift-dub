import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingCard, PricingPlan } from '@/components/pricing/PricingCard';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
      'Email support',
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
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      toast({
        title: 'Free Trial',
        description: 'Sign up to get your free video credit!',
      });
      return;
    }

    setLoadingPlan(planId);
    
    try {
      const { payment_url } = await api.createPayment(planId);
      window.location.href = payment_url;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start payment. Please try again.',
      });
    } finally {
      setLoadingPlan(null);
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
              Choose the plan that works for you. All plans include full access to our AI dubbing technology.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                isLoading={loadingPlan === plan.id}
              />
            ))}
          </div>

          {/* FAQ/Trust */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              All payments are secure and processed via our payment partner.
              <br />
              Questions? <a href="/contact" className="text-primary hover:underline">Contact us</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
