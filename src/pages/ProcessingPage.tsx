import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Play, 
  Download, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('en');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [state, setState] = useState<ProcessingState>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const handleTranslate = async () => {
    if (!file) return;
    
    setState('uploading');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_language', language);
      
      // Get Telegram user ID if available
      const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (tgUserId) {
        formData.append('user_id', tgUserId.toString());
      }

      setState('processing');

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/upload_video/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Video limit exceeded. Please upgrade your plan.');
        }
        throw new Error('Failed to process video');
      }

      const data = await response.json();
      
      if (data.status === 'SUCCESS' && data.download_url) {
        setResultUrl(data.download_url);
        setState('done');
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleReset = () => {
    setFile(null);
    setState('idle');
    setResultUrl(null);
    setErrorMessage(null);
  };

  const selectedLanguage = LANGUAGES.find(l => l.code === language);

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
        <h1 className="text-lg font-semibold text-foreground">Translate Video</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Idle / Upload State */}
        {(state === 'idle' || state === 'uploading') && (
          <>
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative h-48 rounded-2xl border-2 border-dashed transition-colors cursor-pointer
                flex flex-col items-center justify-center gap-3
                ${dragActive 
                  ? 'border-primary bg-primary/5' 
                  : file 
                    ? 'border-primary/50 bg-card' 
                    : 'border-border bg-card hover:border-muted-foreground'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {file ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-foreground font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium">Upload video</p>
                    <p className="text-muted-foreground text-sm">Tap or drag & drop</p>
                  </div>
                </>
              )}
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Target Language</label>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                  className="w-full h-14 px-4 bg-card rounded-xl border border-border flex items-center justify-between active:scale-[0.99] transition-transform"
                >
                  <span className="text-foreground font-medium">
                    {selectedLanguage?.name}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showLanguageSelect ? 'rotate-180' : ''}`} />
                </button>
                
                {showLanguageSelect && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl overflow-hidden z-10 max-h-64 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageSelect(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          lang.code === language 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Processing State */}
        {state === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-foreground font-semibold text-lg">Processing your video...</p>
              <p className="text-muted-foreground text-sm">This may take a few minutes</p>
            </div>
          </div>
        )}

        {/* Done State */}
        {state === 'done' && resultUrl && (
          <div className="space-y-6">
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-foreground font-semibold text-lg">Translation complete!</p>
                <p className="text-muted-foreground text-sm">Your video is ready to download</p>
              </div>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border">
              <video
                src={resultUrl}
                controls
                className="w-full aspect-video"
                playsInline
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex flex-col items-center py-16 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-foreground font-semibold text-lg">Something went wrong</p>
              <p className="text-muted-foreground text-sm">{errorMessage || 'Please try again'}</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="px-4 pb-8 space-y-3">
        {state === 'idle' && (
          <button
            onClick={handleTranslate}
            disabled={!file}
            className={`
              w-full h-14 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all
              ${file 
                ? 'bg-primary text-primary-foreground active:scale-[0.98]' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            Translate Video
          </button>
        )}

        {state === 'done' && resultUrl && (
          <>
            <a
              href={resultUrl}
              download
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Download className="w-5 h-5" />
              Download Video
            </a>
            <button
              onClick={handleReset}
              className="w-full h-14 bg-card text-foreground font-medium rounded-xl border border-border flex items-center justify-center active:scale-[0.98] transition-transform"
            >
              Translate Another Video
            </button>
          </>
        )}

        {state === 'error' && (
          <button
            onClick={handleReset}
            className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
