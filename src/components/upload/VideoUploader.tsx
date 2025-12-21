import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  isDisabled?: boolean;
  maxSizeMB?: number;
}

const ACCEPTED_FORMATS = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],
  'video/x-matroska': ['.mkv'],
};

export function VideoUploader({
  onUpload,
  isUploading,
  uploadProgress,
  isDisabled = false,
  maxSizeMB = 500,
}: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file format. Please upload MP4, MOV, AVI, WebM, or MKV.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles: 1,
    disabled: isDisabled || isUploading,
  });

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all duration-300 cursor-pointer",
            isDragActive && !isDisabled
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
              isDragActive ? "gradient-primary scale-110" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-8 h-8",
                isDragActive ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-md bg-muted">MP4</span>
              <span className="px-2 py-1 rounded-md bg-muted">MOV</span>
              <span className="px-2 py-1 rounded-md bg-muted">AVI</span>
              <span className="px-2 py-1 rounded-md bg-muted">WebM</span>
              <span className="px-2 py-1 rounded-md bg-muted">MKV</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Max file size: {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <File className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {isUploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {file && !isUploading && (
        <Button
          onClick={handleUpload}
          disabled={isDisabled}
          className="w-full"
          variant="hero"
          size="lg"
        >
          <Upload className="w-5 h-5 mr-2" />
          Start Processing
        </Button>
      )}

      {isDisabled && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>You've reached your video limit. Please upgrade to continue.</span>
        </div>
      )}
    </div>
  );
}
