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
  const {
    toast
  } = useToast();
  const {
    isAvailable,
    userId,
    firstName
  } = useTelegram();
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [videos, setVideos] = useState<VideoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limitsData, videosData] = await Promise.all([api.getUserLimits(), api.getVideoHistory()]);
        setLimits(limitsData);
        setVideos(videosData);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  const hasCredits = limits && (limits.video_limit > 0 || !limits.free_used);
  const displayName = firstName || 'there';
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        
      </main>
    </div>;
};
export default Dashboard;