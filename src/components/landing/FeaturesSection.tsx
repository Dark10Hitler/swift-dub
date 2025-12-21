import { Card, CardContent } from '@/components/ui/card';
import { Upload, Gauge, Shield, Zap, Globe, Clock } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Easy Video Upload',
    description: 'Drag and drop your videos. We support all major formats including MP4, MOV, and AVI.',
  },
  {
    icon: Gauge,
    title: 'Usage-Based Limits',
    description: 'Pay only for what you use. Flexible credit system with transparent pricing.',
  },
  {
    icon: Shield,
    title: 'Secure Processing',
    description: 'Enterprise-grade security. Your videos are encrypted and automatically deleted.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'AI-optimized processing delivers results in minutes, not hours.',
  },
  {
    icon: Globe,
    title: '50+ Languages',
    description: 'Reach global audiences with support for over 50 languages and dialects.',
  },
  {
    icon: Clock,
    title: '24/7 Processing',
    description: 'Upload anytime. Our system processes your videos around the clock.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 gradient-glow opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="text-gradient">Go Global</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features designed to make video translation effortless and efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="interactive"
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
