import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    description: 'Try it out',
    minutes: '3 min',
    price: 'Free',
    features: ['1 video', 'Max 3 minutes', 'Standard quality'],
    telegramParam: 'free',
    featured: false,
  },
  {
    name: 'Basic',
    description: 'For casual users',
    minutes: '10 min',
    price: '$4.99',
    features: ['10 videos', 'Up to 10 min each', 'HD quality'],
    telegramParam: 'basic',
    featured: false,
  },
  {
    name: 'Pro',
    description: 'Most popular',
    minutes: '60 min',
    price: '$14.99',
    features: ['50 videos', 'Up to 1 hour each', 'HD quality', 'Priority processing'],
    telegramParam: 'pro',
    featured: true,
  },
  {
    name: 'Advanced',
    description: 'For power users',
    minutes: 'Unlimited',
    price: '$39.99',
    features: ['Unlimited videos', 'Any duration', '4K quality', 'Priority processing', 'Custom voices'],
    telegramParam: 'advanced',
    featured: false,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  const handleBuy = (telegramParam: string) => {
    // Open Telegram deep link for payment
    const botUsername = 'SmartDubBot'; // Replace with actual bot username
    window.open(`https://t.me/${botUsername}?start=buy_${telegramParam}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-card active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Pricing</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`
              relative rounded-2xl p-5 space-y-4 transition-all
              ${plan.featured 
                ? 'bg-card border-2 border-primary' 
                : 'bg-card border border-border'
              }
            `}
          >
            {/* Featured Badge */}
            {plan.featured && (
              <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </div>
            )}

            {/* Plan Header */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <h3 className="text-foreground font-semibold text-lg">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-foreground font-bold text-xl">{plan.price}</p>
                {plan.price !== 'Free' && (
                  <p className="text-muted-foreground text-xs">one-time</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Buy Button */}
            <button
              onClick={() => handleBuy(plan.telegramParam)}
              className={`
                w-full h-12 font-semibold rounded-xl flex items-center justify-center transition-all active:scale-[0.98]
                ${plan.featured
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
                }
              `}
            >
              {plan.price === 'Free' ? 'Start Free' : 'Buy via Telegram'}
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
