// src/pages/Furnisher.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';
import { MAKE_CREATE_URL, MAKE_STATUS_URL } from '@/config/make';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Furnisher() {
  const [images, setImages] = useState<File[]>([]);
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const checkStatus = async (jobId: string) => {
    try {
      // Your Make "status" scenario accepts GET with ?jobId=
      const response = await fetch(`${MAKE_STATUS_URL}?jobId=${encodeURIComponent(jobId)}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const ct = response.headers.get('content-type') || '';
      if (ct.includes('image/')) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResultImage(imageUrl);
        setIsProcessing(false);
        return true; // stop polling
      } else {
        const result = await response.json();
        if (result.status === 'processing') {
          return false; // keep polling
        } else if (result.status === 'done' && result.url) {
          setResultImage(result.url);
          setIsProcessing(false);
          return true; // stop polling
        } else {
          throw new Error('Unexpected status');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check job status');
      setIsProcessing(false);
      return true; // stop polling on error
    }
  };

  const startPolling = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      const shouldStop = await checkStatus(jobId);
      if (shouldStop) clearInterval(pollInterval);
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Najmanje jedna slika je obavezna');
      return;
    }

    try {
      setIsProcessing(true);
      setResultImage(null);

      const formData = new FormData();

      // ✅ CRITICAL: include user_id for Make → Supabase RPC credit checks
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data?.user?.id;
        if (uid) {
          formData.append('user_id', uid);
        } else {
          toast.error('Niste prijavljeni (user_id nije pronađen).');
          setIsProcessing(false);
          return;
        }
      } catch {
        toast.error('Ne mogu da očitam korisnika (auth).');
        setIsProcessing(false);
        return;
      }

      // Always send image1
      formData.append('image1', images[0]);

      // Always send image2 KEY:
      // - if there is a second image → send it
      // - else → send empty string so the key exists (your Make formulas expect it)
      if (images.length >= 2) {
        formData.append('image2', images[1]);
      } else {
        formData.append('image2', '');
      }

      formData.append('instructions', instructions);

      const response = await fetch(MAKE_CREATE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 402) {
          toast.error('Nema image kredita. Nadogradite paket.');
        } else {
          const txt = await response.text().catch(() => '');
          toast.error(`Failed to submit form${txt ? `: ${txt}` : ''}`);
        }
        setIsProcessing(false);
        return;
      }

      const result = await response.json();
      if (!result?.jobId) {
        // If your Make flow sometimes finishes instantly and returns an image URL:
        if (result?.url) {
          setResultImage(result.url);
        } else {
          toast.error('Nedostaje jobId u odgovoru scenarija.');
        }
        setIsProcessing(false);
        return;
      }

      setJobId(result.jobId);
      startPolling(result.jobId);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to generate image');
      setIsProcessing(false);
    }
  };

  const Spinner = () => (
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  );

  const copyToClipboard = async () => {
    if (resultImage) {
      try {
        await navigator.clipboard.writeText(resultImage);
        toast.success('Link kopiran!');
      } catch {
        toast.error('Greška pri kopiranju');
      }
    }
  };

  const handleRedo = () => {
    setResultImage(null);
    setJobId(null);
    setShowComparison(false);
  };

  const downloadImage = () => {
    if (resultImage) {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = 'generated-interior.jpg';
      a.click();
    }
  };

  return (
    <div className="showtime min-h-[calc(100vh-64px)] bg-background">
      <div className="grain-overlay"></div>
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="aurora text-text-primary">Stage Studio</h1>
          <p className="text-text-muted mt-4">
            Transformišite vaše prostori uz AI nameštanje
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload */}
          <Card className="card-premium">
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-helper text-text-muted">Slike prostora *</Label>
                <div className="stage-upload-zone">
                  <ImageUploader
                    images={images}
                    onImagesChange={setImages}
                    maxImages={2}
                  />
                </div>
                <p className="text-helper text-text-muted">
                  Najbolji rezultati sa prirodnim osvetljenjem
                </p>
              </div>

              <div className="hairline-divider"></div>

              {/* Instructions */}
              <div className="space-y-3">
                <Label htmlFor="instructions" className="text-helper text-text-muted">
                  Instrukcije za AI
                </Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="npr. 'Namesti ovaj prazan dnevni boravak u skandinavskom stilu'"
                  rows={4}
                  disabled={isProcessing}
                  className="focus-ring rounded-xl h-11 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Result */}
          <Card className="card-premium relative">
            <CardContent className="p-0">
              <div className="aspect-square relative overflow-hidden rounded-2xl canvas-spotlight shadow-deep border border-border/20">
                {!resultImage && !isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-muted-dark/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-text-muted/20"></div>
                      </div>
                      <p className="text-helper text-text-muted">Vaš rezultat će biti prikazan ovde</p>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      {/* Skeleton shimmer */}
                      <div className="w-16 h-16 rounded-2xl skeleton-shimmer"></div>
                      <div className="w-32 h-3 rounded-lg skeleton-shimmer"></div>
                      <div className="w-24 h-2 rounded skeleton-shimmer"></div>
                      <p className="text-helper text-white/60 mt-4">Generisanje u toku...</p>
                    </div>
                  </div>
                )}

                {resultImage && (
                  <>
                    {/* Main result image */}
                    <img
                      src={resultImage}
                      alt="Generated result"
                      className="w-full h-full object-cover reveal-animation"
                    />
                    
                    {/* Before/After comparison overlay */}
                    {showComparison && images[0] && (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 overflow-hidden">
                          <img
                            src={URL.createObjectURL(images[0])}
                            alt="Original"
                            className="w-full h-full object-cover"
                            style={{ clipPath: 'inset(0 50% 0 0)' }}
                          />
                        </div>
                        {/* Slider handle */}
                        <div className="absolute inset-y-0 left-1/2 w-0.5 aurora-slider-line shadow-lg">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-slider-handle flex items-center justify-center">
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Toolbar */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={handleRedo}
                         className="w-9 h-9 rounded-full toolbar-glass flex items-center justify-center text-white/80 hover:text-white"
                        title="Nova generacija"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="w-8 h-8 rounded-full bg-glass backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                        title="Kopiraj link"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={downloadImage}
                         className="w-9 h-9 rounded-full toolbar-glass flex items-center justify-center text-white/80 hover:text-white"
                        title="Preuzmi"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      {images[0] && (
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                           className={`w-9 h-9 rounded-full toolbar-glass flex items-center justify-center transition-colors ${
                             showComparison ? 'text-white shadow-lg' : 'text-white/80 hover:text-white'
                           }`}
                          title={showComparison ? 'Sakrij poređenje' : 'Pokaži poređenje'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Primary action button - bottom right */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={handleSubmit}
            className="h-14 px-8 rounded-full shadow-premium"
            size="lg"
            disabled={images.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse [animation-delay:0.4s]"></div>
                </div>
                Generisanje…
              </div>
            ) : (
              'Generiši sliku'
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
