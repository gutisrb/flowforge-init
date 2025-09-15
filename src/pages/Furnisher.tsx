import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/ImageUploader';

export default function Furnisher() {
  const [images, setImages] = useState<File[]>([]);
  const [instructions, setInstructions] = useState('');

  const handleGenerate = () => {
    if (images.length === 0 || !instructions.trim()) {
      return;
    }

    // Build FormData as specified
    const formData = new FormData();
    formData.append('instructions', instructions.trim());
    formData.append('image1', images[0]);
    if (images[1]) {
      formData.append('image2', images[1]);
    }

    // Log FormData keys for now as requested
    console.log('FormData keys:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
    }
  };

  const handleClear = () => {
    setImages([]);
    setInstructions('');
  };

  const isGenerateEnabled = images.length > 0 && instructions.trim().length > 0;

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
            />
          </div>
        </div>

        {/* Action Buttons */}
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

        {/* Status Message */}
        {images.length === 0 && (
          <p className="text-center text-muted-foreground">
            Upload at least one image and provide instructions to get started
          </p>
        )}
      </div>
    </div>
  );
}