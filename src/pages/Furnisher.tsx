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
      const response = await fetch(`${MAKE_STATUS_URL}?jobId=${jobId}`);
      
      if (response.headers.get('content-type')?.includes('image/')) {
        // Response is an image - job is complete
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResultImage(imageUrl);
        setIsProcessing(false);
        return true; // Stop polling
      } else {
        // Response is JSON status
        const result = await response.json();
        if (result.status === 'processing') {
          return false; // Continue polling
        } else if (result.status === 'done' && result.url) {
          setResultImage(result.url);
          setIsProcessing(false);
          return true; // Stop polling
        } else {
          throw new Error('Unexpected status');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check job status');
      setIsProcessing(false);
      return true; // Stop polling
    }
  };

  const startPolling = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      const shouldStop = await checkStatus(jobId);
      if (shouldStop) {
        clearInterval(pollInterval);
      }
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

      // Attach user_id for Make credit checks (required by your scenarios)
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data?.user?.id;
        if (uid) formData.append('user_id', uid);
      } catch {
        // If auth read fails, we still proceed; Make may reject without user_id
      }

      // Always send image1 (required)
      formData.append('image1', images[0]);

      // Always send image2 KEY as well:
      // - if user picked a second image → send that file
      // - if not → send an EMPTY field so key exists (restores your old behavior)
      if (images.length >= 2) {
        formData.append('image2', images[1]);
      } else {
        // IMPORTANT: empty string, not omitted
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
      setJobId(result.jobId);

      // Start polling for status
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Nameštanje</h1>
        <p className="text-muted-foreground mt-2">
          Transformišite vaše prostori uz AI nameštanje
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Slike *
                </Label>
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={2}
                />
                <p className="text-xs text-muted-foreground">
                  Uvek šaljemo polja <b>image1</b> i <b>image2</b>. Ako ne izaberete drugu sliku,
                  <b> image2</b> se šalje prazno (kao ranije), da bi Make scenario ispravno radio.
                </p>
              </div>

              {/* Instructions Textarea */}
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-medium">
                  Instrukcije
                </Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="npr. 'Namesti ovaj prazan dnevni boravak u skandinavskom stilu'"
                  rows={4}
                  disabled={isProcessing}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={images.length === 0 || isProcessing}
              >
                {isProcessing ? 'Generisanje…' : 'Generiši sliku'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Panel - Result Panel */}
        <Card>
          <CardContent className="p-6">
            <div className="min-h-[400px] flex items-center justify-center">
              {!resultImage && !isProcessing && (
                <div className="text-center text-muted-foreground">
                  <p>Rezultat će biti prikazan ovde</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="text-center space-y-4">
                  <Spinner />
                  <p className="text-muted-foreground">Generisanje u toku...</p>
                </div>
              )}
              
              {resultImage && (
                <div className="w-full">
                  <img 
                    src={resultImage} 
                    alt="Generated result" 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
