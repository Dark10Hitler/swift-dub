import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  language: string;
  createdAt: string;
  downloadUrl?: string;
}

interface VideoHistoryTableProps {
  videos: Video[];
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-secondary/20 text-secondary',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-green-500/20 text-green-500',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-destructive/20 text-destructive',
  },
};

export function VideoHistoryTable({ videos, isLoading }: VideoHistoryTableProps) {
  if (isLoading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No videos processed yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first video to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Recent Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => {
            const status = statusConfig[video.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                    <StatusIcon className={cn(
                      "w-5 h-5",
                      video.status === 'processing' && "animate-spin"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {video.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString()} • {video.language.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>
                  
                  {video.status === 'completed' && video.downloadUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={video.downloadUrl} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
