import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Languages, Download, ArrowRight, CreditCard } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: Upload, text: 'Upload video' },
    { icon: Languages, text: 'Choose language' },
    { icon: Download, text: 'Get translated video' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">SmartDub</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              AI Video Translator
            </h2>
            <p className="text-muted-foreground text-lg">
              Translate any video to any language using AI
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="px-6 pb-8 space-y-3">
        <button
          onClick={() => navigate('/process')}
          className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          Start Translation
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => navigate('/pricing')}
          className="w-full h-14 bg-card text-foreground font-medium rounded-xl border border-border flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          View Pricing
        </button>
      </div>
    </div>
  );
}
