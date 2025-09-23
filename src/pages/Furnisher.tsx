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
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResultImage(imageUrl);
        setIsProcessing(false);
        return true;
      } else {
        const result = await response.json();
        if (result.status === 'processing') {
          return false;
        } else {
          throw new Error('Unexpected status');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Failed to check job status');
      setIsProcessing(false);
      return true;
    }
  };

  const startPolling = async (jobId: string) => {
    const interval = setInterval(async () => {
      const done = await checkStatus(jobId);
      if (done) clearInterval(interval);
    }, 3000);
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
      // Attach user_id for Make credit checks
      const { data: u } = await supabase.auth.getUser();
      if (u?.user?.id) {
        formData.append('user_id', u.user.id);
      }
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });
      formData.append('instructions', instructions);

      const response = await fetch(MAKE_CREATE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 402) {
          toast.error('Nema image kredita. Nadogradite paket.');
        } else {
          throw new Error('Failed to submit form');
        }
        setIsProcessing(false);
        return;
      }

      const result = await response.json();
      setJobId(result.jobId);
      startPolling(result.jobId);
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Greška pri slanju');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Upload slike</Label>
                <ImageUploader images={images} onImagesChange={setImages} />
              </div>

              <div>
                <Label>Instrukcije (opciono)</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="npr. postavi moderan nameštaj, svetli tonovi..."
                  rows={4}
                  disabled={isProcessing}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={images.length === 0 || isProcessing}
              >
                {isProcessing ? 'Obrada…' : 'Generiši sliku'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {resultImage && (
          <div className="mt-6">
            <img src={resultImage} alt="Rezultat" className="rounded-xl border max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
