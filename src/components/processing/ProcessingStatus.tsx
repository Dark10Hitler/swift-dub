import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Download, Loader2, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
  onRetry?: () => void;
  onDownload?: () => void;
}

const statusMessages = {
  pending: 'Preparing your video...',
  processing: 'AI is processing your video...',
  completed: 'Your video is ready!',
  failed: 'Processing failed',
};

export function ProcessingStatus({
  status,
  progress,
  downloadUrl,
  error,
  onRetry,
  onDownload,
}: ProcessingStatusProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (status === 'processing' || status === 'pending') {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <Card variant={status === 'completed' ? 'glow' : 'glass'} className="w-full max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === 'pending' || status === 'processing' ? (
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full gradient-primary opacity-20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
          ) : status === 'completed' ? (
            <div className="w-24 h-24 mx-auto rounded-full gradient-primary flex items-center justify-center animate-bounce-subtle">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
          )}
        </div>

        {/* Status Message */}
        <h3 className="font-display text-xl font-semibold mb-2">
          {statusMessages[status]}
          {(status === 'pending' || status === 'processing') && dots}
        </h3>

        {/* Progress Bar */}
        {(status === 'pending' || status === 'processing') && (
          <div className="mb-6">
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {/* Processing Steps */}
        {status === 'processing' && (
          <div className="text-left space-y-3 mb-6">
            <ProcessingStep label="Analyzing audio" completed={progress >= 25} active={progress < 25} />
            <ProcessingStep label="Transcribing speech" completed={progress >= 50} active={progress >= 25 && progress < 50} />
            <ProcessingStep label="Translating content" completed={progress >= 75} active={progress >= 50 && progress < 75} />
            <ProcessingStep label="Generating voice" completed={progress >= 100} active={progress >= 75 && progress < 100} />
          </div>
        )}

        {/* Error Message */}
        {status === 'failed' && error && (
          <p className="text-sm text-destructive mb-6">{error}</p>
        )}

        {/* Actions */}
        {status === 'completed' && downloadUrl && (
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={onDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Video
          </Button>
        )}

        {status === 'failed' && onRetry && (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={onRetry}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ProcessingStep({ label, completed, active }: { label: string; completed: boolean; active: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
      completed && "bg-primary/10",
      active && "bg-muted"
    )}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
        completed ? "gradient-primary text-primary-foreground" : active ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground/50"
      )}>
        {completed ? <CheckCircle className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      </div>
      <span className={cn(
        "text-sm",
        completed ? "text-foreground" : active ? "text-muted-foreground" : "text-muted-foreground/50"
      )}>
        {label}
      </span>
    </div>
  );
}
