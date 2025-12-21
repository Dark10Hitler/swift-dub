import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  videoLimit: number;
  maxDuration?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
  currentPlan?: boolean;
}

export function PricingCard({ plan, onSelect, isLoading, currentPlan }: PricingCardProps) {
  return (
    <Card 
      variant={plan.featured ? 'pricingFeatured' : 'pricing'}
      className={cn(
        "relative flex flex-col h-full",
        plan.featured && "z-10"
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={cn(
            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
            plan.featured 
              ? "bg-background text-primary" 
              : "gradient-primary text-primary-foreground"
          )}>
            <Sparkles className="w-3 h-3" />
            {plan.badge}
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className={cn(
          "text-xl",
          plan.featured && "text-primary-foreground"
        )}>
          {plan.name}
        </CardTitle>
        <CardDescription className={cn(
          plan.featured && "text-primary-foreground/80"
        )}>
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        <div className="text-center mb-6">
          <span className={cn(
            "font-display text-4xl font-bold",
            plan.featured ? "text-primary-foreground" : "text-foreground"
          )}>
            {plan.price}
          </span>
          {plan.period && (
            <span className={cn(
              "text-sm ml-1",
              plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {plan.period}
            </span>
          )}
        </div>

        <div className={cn(
          "text-center mb-6 py-3 rounded-lg",
          plan.featured ? "bg-primary-foreground/10" : "bg-muted"
        )}>
          <span className={cn(
            "font-display text-2xl font-bold",
            plan.featured ? "text-primary-foreground" : "text-gradient"
          )}>
            {plan.videoLimit}
          </span>
          <span className={cn(
            "text-sm ml-2",
            plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            videos
          </span>
          {plan.maxDuration && (
            <p className={cn(
              "text-xs mt-1",
              plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"
            )}>
              Up to {plan.maxDuration} each
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className={cn(
                "w-5 h-5 flex-shrink-0 mt-0.5",
                plan.featured ? "text-primary-foreground" : "text-primary"
              )} />
              <span className={cn(
                "text-sm",
                plan.featured ? "text-primary-foreground/90" : "text-muted-foreground"
              )}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isLoading || currentPlan}
          className="w-full"
          variant={plan.featured ? 'glass' : 'hero'}
          size="lg"
        >
          {currentPlan ? 'Current Plan' : plan.price === 'Free' ? 'Get Started' : 'Buy Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
