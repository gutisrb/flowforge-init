import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MAKE_CREATE_URL, MAKE_STATUS_URL } from '@/config/make';
import { toast } from 'sonner';

export default function Furnisher() {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [style, setStyle] = useState('');
  const [type, setType] = useState('empty');
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
    
    if (!image1) {
      toast.error('Slika 1 je obavezna');
      return;
    }

    try {
      setIsProcessing(true);
      setResultImage(null);

      const formData = new FormData();
      formData.append('image1', image1);
      if (image2) {
        formData.append('image2', image2);
      }
      formData.append('style', style);
      formData.append('type', type);
      formData.append('instructions', instructions);

      const response = await fetch(MAKE_CREATE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
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
              {/* Image 1 Upload */}
              <div className="space-y-2">
                <Label htmlFor="image1" className="text-sm font-medium">
                  Slika 1 (Original) *
                </Label>
                <Input
                  id="image1"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage1(e.target.files?.[0] || null)}
                  disabled={isProcessing}
                  required
                />
              </div>

              {/* Image 2 Upload */}
              <div className="space-y-2">
                <Label htmlFor="image2" className="text-sm font-medium">
                  Slika 2 (Referenca, opciono)
                </Label>
                <Input
                  id="image2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage2(e.target.files?.[0] || null)}
                  disabled={isProcessing}
                />
              </div>

              {/* Style Input */}
              <div className="space-y-2">
                <Label htmlFor="style" className="text-sm font-medium">
                  Stil
                </Label>
                <Input
                  id="style"
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="npr. Moderni minimalizam, Skandinavski..."
                  disabled={isProcessing}
                />
              </div>

              {/* Type Radio Group */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Tip
                </Label>
                <RadioGroup
                  value={type}
                  onValueChange={setType}
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="empty" id="empty" />
                    <Label htmlFor="empty" className="text-sm font-normal">
                      Prazan prostor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="old" id="old" />
                    <Label htmlFor="old" className="text-sm font-normal">
                      Renoviranje
                    </Label>
                  </div>
                </RadioGroup>
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
                disabled={!image1 || isProcessing}
              >
                Generiši sliku
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