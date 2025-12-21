import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VideoHistoryTable } from '@/components/dashboard/VideoHistoryTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, UserLimits, VideoTask } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { Upload, CreditCard, Video, Zap, Gift, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAvailable, userId, firstName } = useTelegram();
  
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [videos, setVideos] = useState<VideoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limitsData, videosData] = await Promise.all([
          api.getUserLimits(),
          api.getVideoHistory(),
        ]);
        setLimits(limitsData);
        setVideos(videosData);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const hasCredits = limits && (limits.video_limit > 0 || !limits.free_used);
  const displayName = firstName || 'there';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your videos and track your usage.
            </p>
          </div>

          {/* Telegram Warning */}
          {isAvailable && userId && (
            <Card variant="glass" className="mb-6 border-secondary/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-secondary" />
                <p className="text-sm text-foreground">
                  Connected via Telegram • User ID: {userId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Video Credits"
              value={limits?.video_limit ?? 0}
              subtitle="Remaining videos"
              icon={Video}
              variant="primary"
            />
            <StatsCard
              title="Free Trial"
              value={limits?.free_used ? 'Used' : 'Available'}
              subtitle={limits?.free_used ? 'Upgrade for more' : '1 free video'}
              icon={Gift}
            />
            <StatsCard
              title="Videos Processed"
              value={limits?.videos_processed ?? 0}
              subtitle="Total processed"
              icon={Zap}
            />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card variant="interactive" className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                      Upload Video
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {hasCredits
                        ? 'Translate and dub your video with AI'
                        : 'You need credits to upload videos'}
                    </p>
                    <Link to="/upload">
                      <Button 
                        variant={hasCredits ? 'hero' : 'outline'} 
                        disabled={!hasCredits}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </Link>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="interactive" className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                      Buy More Credits
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get more videos with our flexible plans
                    </p>
                    <Link to="/pricing">
                      <Button variant="secondary">
                        <CreditCard className="w-4 h-4 mr-2" />
                        View Plans
                      </Button>
                    </Link>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <CreditCard className="w-6 h-6 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Limit Warning */}
          {!hasCredits && (
            <Card variant="glass" className="mb-8 border-destructive/50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    You've reached your video limit
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Purchase a plan to continue processing videos.
                  </p>
                </div>
                <Link to="/pricing">
                  <Button variant="default" size="sm">
                    Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Video History */}
          <VideoHistoryTable 
            videos={videos.map((v) => ({
              id: v.id,
              name: `Video ${v.id.slice(0, 8)}`,
              status: v.status,
              language: 'en',
              createdAt: new Date().toISOString(),
              downloadUrl: v.download_url,
            }))} 
            isLoading={isLoading} 
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
