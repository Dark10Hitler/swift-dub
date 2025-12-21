import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] gradient-glow opacity-50" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/3 left-[10%] w-20 h-20 rounded-2xl gradient-primary opacity-20 animate-float blur-xl" />
      <div className="absolute bottom-1/3 right-[15%] w-32 h-32 rounded-full gradient-secondary opacity-15 animate-float blur-2xl" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Video Processing</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Process Your Videos{' '}
            <span className="text-gradient">Faster. Smarter.</span>{' '}
            <br className="hidden sm:block" />
            Automatically.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Transform your videos with AI-powered dubbing and translation. 
            Reach global audiences in minutes, not hours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth?mode=register">
              <Button variant="hero" size="xl" className="group">
                Start Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="glass" size="xl" className="group">
                <Play className="w-5 h-5" />
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-gradient">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Videos Processed</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-gradient">50+</p>
              <p className="text-sm text-muted-foreground mt-1">Languages</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-gradient">99%</p>
              <p className="text-sm text-muted-foreground mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
