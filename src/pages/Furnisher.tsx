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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="aurora text-text-primary">Stage Studio</h1>
          <p className="text-text-muted mt-4">
            Transformišite vaše prostori uz AI nameštanje
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <Card className="card-premium">
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label className="text-text-primary">Slike *</Label>
                  <ImageUploader
                    images={images}
                    onImagesChange={setImages}
                    maxImages={2}
                  />
                  <p className="text-helper text-text-muted">
                    Uvek šaljemo polja <b>image1</b> i <b>image2</b>. Ako ne izaberete drugu sliku,
                    <b> image2</b> se šalje prazno (radi doslednosti u scenariju).
                  </p>
                </div>

                {/* Instructions Textarea */}
                <div className="space-y-3">
                  <Label htmlFor="instructions" className="text-text-primary">
                    Instrukcije
                  </Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="npr. 'Namesti ovaj prazan dnevni boravak u skandinavskom stilu'"
                    rows={4}
                    disabled={isProcessing}
                    className="focus-ring rounded-xl"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={images.length === 0 || isProcessing}
                >
                  {isProcessing ? 'Generisanje…' : 'Generiši sliku'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Panel - Result Panel */}
          <Card className="card-premium">
            <CardContent>
              <h2 className="text-text-primary mb-6">Rezultat</h2>
              <div className="min-h-[400px] flex items-center justify-center">
                {!resultImage && !isProcessing && (
                  <div className="text-center text-text-muted bg-muted rounded-xl p-8 border-2 border-dashed border-border">
                    <p className="text-helper">Rezultat će biti prikazan ovde</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-text-muted text-helper">Generisanje u toku...</p>
                  </div>
                )}

                {resultImage && (
                  <div className="w-full space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-muted shadow-premium">
                      <img
                        src={resultImage}
                        alt="Generated result"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = resultImage;
                          a.download = 'generated-interior.jpg';
                          a.click();
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Preuzmi
                      </Button>
                      <Button
                        onClick={() => {
                          setResultImage(null);
                          setJobId(null);
                        }}
                        variant="outline" 
                        className="flex-1"
                      >
                        Nova generacija
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
