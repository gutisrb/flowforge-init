// src/pages/Furnisher.tsx
import React, { useState, useRef } from 'react';
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
  const jobIdRef = useRef<string | null>(null);
  const pollingRef = useRef<boolean>(false);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const checkStatus = async (jobId: string) => {
    try {
      // POST JSON (this is what your Make webhook should expect)
      const response = await fetch(MAKE_STATUS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      // If Make returns the image directly
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('image/')) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResultImage(imageUrl);
        setIsProcessing(false);
        return true; // done
      }

      // Otherwise parse JSON status
      const result = await response.json().catch(() => null);

      if (!result) {
        throw new Error('Status response was not JSON or image');
      }

      if (result.status === 'processing') {
        return false; // keep polling
      }

      if (result.status === 'done' && result.url) {
        setResultImage(result.url);
        setIsProcessing(false);
        return true; // done
      }

      // Any other shape -> treat as error to stop infinite loops
      throw new Error(`Unexpected status payload: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Greška pri proveri statusa');
      setIsProcessing(false);
      return true; // stop polling on error
    }
  };

  const pollUntilDone = async (jobId: string) => {
    if (pollingRef.current) return; // guard
    pollingRef.current = true;

    // poll every 5 seconds, up to ~10 minutes (120 attempts)
    for (let i = 0; i < 120; i++) {
      const stop = await checkStatus(jobId);
      if (stop) {
        pollingRef.current = false;
        return;
      }
      await sleep(5000);
    }

    // timeout
    toast.error('Vreme čekanja je isteklo. Pokušajte ponovo.');
    setIsProcessing(false);
    pollingRef.current = false;
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

      // Attach user_id for Make credit checks (if you use it in the scenario)
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data?.user?.id;
        if (uid) formData.append('user_id', uid);
      } catch { /* ignore */ }

      // Always send image1
      formData.append('image1', images[0]);

      // Always send image2 key (file or empty string) so your Make logic is consistent
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
          toast.error(`Greška pri slanju${txt ? `: ${txt}` : ''}`);
        }
        setIsProcessing(false);
        return;
      }

      const result = await response.json();

      // Expecting { jobId: "..." }
      if (!result?.jobId) {
        // If your scenario sometimes returns the final image immediately:
        if (result?.url) {
          setResultImage(result.url);
          setIsProcessing(false);
          return;
        }
        toast.error('Nedostaje jobId u odgovoru.');
        setIsProcessing(false);
        return;
      }

      jobIdRef.current = result.jobId;
      pollUntilDone(result.jobId);
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Greška pri slanju');
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
                <Label className="text-sm font-medium">Slike *</Label>
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={2}
                />
                <p className="text-xs text-muted-foreground">
                  Uvek šaljemo polja <b>image1</b> i <b>image2</b>. Ako ne izaberete drugu sliku,
                  <b> image2</b> se šalje prazno, radi doslednosti u Make scenariju.
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
