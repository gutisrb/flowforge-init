import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';
import { WEBHOOK_URL, STATUS_URL } from '@/config/make';
import { toast } from 'sonner';

type ProgressStep = 'uploading' | 'creating' | 'processing';
type JobStatus = 'pending' | 'processing' | 'success' | 'error';

interface JobResult {
  jobId: string;
  status: JobStatus;
  resultUrl?: string;
}

export default function Furnisher() {
  const [images, setImages] = useState<File[]>([]);
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>('uploading');
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const pollStatus = async (jobId: string, signal: AbortSignal): Promise<void> => {
    try {
      while (!signal.aborted) {
        const response = await fetch(`${STATUS_URL}${jobId}`, { signal });
        if (!response.ok) throw new Error('Polling failed');
        
        const result: JobResult = await response.json();
        
        if (result.status === 'success' && result.resultUrl) {
          const imageResponse = await fetch(result.resultUrl, { signal });
          if (!imageResponse.ok) throw new Error('Failed to fetch result image');
          
          const blob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          setResultImage(imageUrl);
          setIsProcessing(false);
          return;
        }
        
        if (result.status === 'error') {
          throw new Error('Job failed on server');
        }
        
        if (result.status === 'processing') {
          setProgressStep('processing');
        }
        
        await new Promise(resolve => setTimeout(resolve, 7000));
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error('Polling error:', error);
        toast.error('Failed to check job status');
        setIsProcessing(false);
      }
    }
  };

  const downloadBlob = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (images.length === 0 || !instructions.trim()) return;

    try {
      setIsProcessing(true);
      setProgressStep('uploading');
      setResultImage(null);
      
      abortControllerRef.current = new AbortController();
      
      const formData = new FormData();
      formData.append('instructions', instructions.trim());
      
      images.forEach(image => {
        formData.append('images[]', image);
      });

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const result: JobResult = await response.json();
      setJobId(result.jobId);
      setProgressStep('creating');
      
      await pollStatus(result.jobId, abortControllerRef.current.signal);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Job cancelled');
      } else {
        console.error('Generate error:', error);
        toast.error('Failed to generate image');
      }
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      toast.info('Job cancelled');
    }
  };

  const handleRetry = () => {
    handleGenerate();
  };

  const handleDownload = async () => {
    if (resultImage) {
      try {
        const response = await fetch(resultImage);
        const blob = await response.blob();
        downloadBlob('furnished.png', blob);
      } catch (error) {
        toast.error('Failed to download image');
      }
    }
  };

  const handleTryVariation = () => {
    setResultImage(null);
    setIsProcessing(false);
    setJobId(null);
  };

  const handleClear = () => {
    setImages([]);
    setInstructions('');
    setResultImage(null);
    setIsProcessing(false);
    setJobId(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const isGenerateEnabled = images.length > 0 && instructions.trim().length > 0 && !isProcessing;

  const getProgressText = () => {
    switch (progressStep) {
      case 'uploading': return 'Uploading…';
      case 'creating': return 'Creating task…';
      case 'processing': return 'Processing…';
      default: return 'Processing…';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Furnisher</h1>
          <p className="text-muted-foreground mt-2">
            Transform your spaces with AI-powered furniture design
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Images</h2>
          <ImageUploader 
            images={images} 
            onImagesChange={setImages} 
            maxImages={2} 
          />
        </div>

        {/* Instructions Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-lg font-semibold">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="npr. Ubaci lik agenta pored prozora, uskladi senke i perspektivu."
              rows={4}
              className="resize-none"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Progress Section */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-lg font-medium">{getProgressText()}</p>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Section */}
        {resultImage && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <img 
                  src={resultImage} 
                  alt="Furnished result" 
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleDownload} className="flex-1">
                    Download
                  </Button>
                  <Button variant="outline" onClick={handleTryVariation} className="flex-1">
                    Try Variation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!isProcessing && !resultImage && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!isGenerateEnabled}
              className="flex-1 h-12 text-base font-semibold"
            >
              Generate
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1 h-12 text-base font-semibold"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Status Message */}
        {!isProcessing && !resultImage && images.length === 0 && (
          <p className="text-center text-muted-foreground">
            Upload at least one image and provide instructions to get started
          </p>
        )}

        {/* Error Retry */}
        {!isProcessing && !resultImage && jobId && (
          <div className="text-center">
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}