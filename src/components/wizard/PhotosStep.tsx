import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, Upload, X, Info, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotosStepProps {
  images: File[];
  pairA?: File;
  pairB?: File;
  onChange: (images: File[], pairA?: File, pairB?: File) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

export const PhotosStep = ({ 
  images, 
  pairA, 
  pairB, 
  onChange, 
  onNext, 
  onPrev, 
  canProceed 
}: PhotosStepProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalCount = images.length + acceptedFiles.length + (pairA ? 1 : 0) + (pairB ? 1 : 0);
    
    if (totalCount > 12) {
      toast({
        title: "Previše slika",
        description: "Možete uploadovati maksimalno 12 slika.",
        variant: "destructive",
      });
      return;
    }
    
    const newImages = [...images, ...acceptedFiles];
    onChange(newImages, pairA, pairB);
  }, [images, pairA, pairB, onChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxFiles: 12
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages, pairA, pairB);
  };

  const setPairImage = (file: File, slot: 'A' | 'B') => {
    if (slot === 'A') {
      onChange(images, file, pairB);
    } else {
      onChange(images, pairA, file);
    }
  };

  const removePairImage = (slot: 'A' | 'B') => {
    if (slot === 'A') {
      onChange(images, undefined, pairB);
    } else {
      onChange(images, pairA, undefined);
    }
  };

  const onPairDrop = useCallback((acceptedFiles: File[], slot: 'A' | 'B') => {
    if (acceptedFiles.length > 0) {
      setPairImage(acceptedFiles[0], slot);
    }
  }, []);

  const { 
    getRootProps: getPairARootProps, 
    getInputProps: getPairAInputProps,
    isDragActive: isPairADragActive
  } = useDropzone({
    onDrop: (files) => onPairDrop(files, 'A'),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  });

  const { 
    getRootProps: getPairBRootProps, 
    getInputProps: getPairBInputProps,
    isDragActive: isPairBDragActive
  } = useDropzone({
    onDrop: (files) => onPairDrop(files, 'B'),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  });

  const totalImages = images.length + (pairA ? 1 : 0) + (pairB ? 1 : 0);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-heading-2 text-text-primary">
            Upload fotografija
          </h2>
          <p className="text-body text-text-muted">
            Dodajte 5-12 kvalitetnih slika nekretnine
          </p>
          <div className="text-sm text-text-subtle">
            Uploadovano: {totalImages}/12
          </div>
        </div>

        {/* Main image grid */}
        <div className="space-y-4">
          {images.length === 0 ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
              <p className="text-heading-3 text-text-primary mb-2">
                Prevucite slike ovde
              </p>
              <p className="text-body text-text-muted">
                ili kliknite da izaberete fajlove
              </p>
              <p className="text-sm text-text-subtle mt-2">
                PNG, JPG, WEBP do 20MB po slici
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add more button */}
                {totalImages < 12 && (
                  <div
                    {...getRootProps()}
                    className={`
                      aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-text-subtle" />
                      <p className="text-sm text-text-muted">
                        Dodaj još
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pair section */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-heading-3 text-text-primary">
              Glatki prelaz (opciono)
            </h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-text-subtle" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Dodaj dve slike za glatki prelaz između kadrova</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pair A */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Kadar A
              </label>
              {pairA ? (
                <div className="relative group aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(pairA)}
                    alt="Kadar A"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePairImage('A')}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getPairARootProps()}
                  className={`
                    aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
                    ${isPairADragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <input {...getPairAInputProps()} />
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-text-subtle" />
                    <p className="text-sm text-text-muted">
                      Dodaj sliku A
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pair B */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Kadar B
              </label>
              {pairB ? (
                <div className="relative group aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(pairB)}
                    alt="Kadar B"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePairImage('B')}
                    className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getPairBRootProps()}
                  className={`
                    aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
                    ${isPairBDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <input {...getPairBInputProps()} />
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-text-subtle" />
                    <p className="text-sm text-text-muted">
                      Dodaj sliku B
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live preview */}
        {images.length >= 5 && (
          <div className="border-t pt-6">
            <div className="bg-muted/30 rounded-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-primary fill-current" />
              </div>
              <h3 className="text-heading-3 text-text-primary mb-2">
                Live preview
              </h3>
              <p className="text-body text-text-muted mb-4">
                Imate dovoljno slika za kreiranje videa!
              </p>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min((images.length / 12) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-text-subtle mt-2">
                {images.length} od 12 slika
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrev}
            className="px-8"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Nazad
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="gradient-accent text-white px-8"
          >
            Sledeći korak
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};