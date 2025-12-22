import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { VideoUploader } from '@/components/upload/VideoUploader';
import { LanguageSelector } from '@/components/upload/LanguageSelector';
import { ProcessingStatus } from '@/components/processing/ProcessingStatus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, UserLimits } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Video, Zap } from 'lucide-react';

type UploadState = 'select' | 'uploading' | 'processing' | 'completed' | 'failed';

const UploadPage = () => {
  const { toast } = useToast();
  const { userId, isAvailable, sendData, hapticFeedback } = useTelegram();
  const { user, refreshUser } = useAuth();

  const [state, setState] = useState<UploadState>('select');
  const [language, setLanguage] = useState('es');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const data = await api.getUserLimits();
        setLimits(data);
      } catch (err) {
        console.error('Failed to fetch limits');
      }
    };
    fetchLimits();
  }, []);

  useEffect(() => {
    if (!taskId || state !== 'processing') return;

    const pollStatus = async () => {
      try {
        const task = await api.getTaskStatus(taskId);
        
        if (task.status === 'processing') {
          setProcessingProgress(task.progress);
        } else if (task.status === 'completed') {
          setProcessingProgress(100);
          setDownloadUrl(task.download_url || null);
          setState('completed');
          hapticFeedback('success');
          
          // Send to Telegram if available
          if (isAvailable && task.download_url) {
            sendData({ file_url: task.download_url });
          }
          
          // Refresh user limits
          refreshUser();
        } else if (task.status === 'failed') {
          setError(task.error || 'Processing failed');
          setState('failed');
          hapticFeedback('error');
        }
      } catch (err) {
        console.error('Failed to poll status');
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [taskId, state, isAvailable, sendData, hapticFeedback, refreshUser]);

  const hasCredits = limits && (limits.video_limit > 0 || !limits.free_used);

  const handleUpload = async (file: File) => {
    setState('uploading');
    setUploadProgress(0);
    setError(null);
    hapticFeedback('light');

    try {
      const response = await api.uploadVideo(
        file,
        language,
        userId || undefined,
        undefined,
        setUploadProgress
      );

      setTaskId(response.task_id);
      setState('processing');
      setProcessingProgress(0);

      toast({
        title: 'Video uploaded!',
        description: 'Processing has started.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setState('failed');
      hapticFeedback('error');
      
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: message,
      });
    }
  };

  const handleRetry = () => {
    setState('select');
    setTaskId(null);
    setDownloadUrl(null);
    setError(null);
    setUploadProgress(0);
    setProcessingProgress(0);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleNewVideo = () => {
    handleRetry();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Upload Video
            </h1>
            <p className="text-muted-foreground">
              Upload your video and select the target language for dubbing.
            </p>
          </div>

          {/* Credits Display */}
          <Card variant="glass" className="mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {limits?.video_limit ?? 0} credits remaining
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {!limits?.free_used && 'Free trial available'}
                  </p>
                </div>
              </div>
              {!hasCredits && (
                <Link to="/pricing">
                  <Button variant="default" size="sm">
                    <Zap className="w-4 h-4 mr-1" />
                    Get Credits
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          {(state === 'select' || state === 'uploading') && (
            <div className="space-y-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-xl">Target Language</CardTitle>
                  <CardDescription>
                    Select the language you want your video dubbed into.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LanguageSelector
                    value={language}
                    onChange={setLanguage}
                    disabled={!hasCredits || state === 'uploading'}
                  />
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-xl">Video File</CardTitle>
                  <CardDescription>
                    Upload your video file. We support MP4, MOV, AVI, WebM, and MKV.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoUploader
                    onUpload={handleUpload}
                    isUploading={state === 'uploading'}
                    uploadProgress={uploadProgress}
                    isDisabled={!hasCredits}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {(state === 'processing' || state === 'completed' || state === 'failed') && (
            <ProcessingStatus
              status={state === 'processing' ? 'processing' : state}
              progress={processingProgress}
              downloadUrl={downloadUrl || undefined}
              error={error || undefined}
              onRetry={handleRetry}
              onDownload={handleDownload}
            />
          )}

          {state === 'completed' && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={handleNewVideo}>
                Dub Another Video
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
