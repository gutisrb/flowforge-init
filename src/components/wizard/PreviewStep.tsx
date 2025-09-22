import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Save, Sparkles } from 'lucide-react';
import { WizardData } from '@/components/VideoWizard';

interface PreviewStepProps {
  wizardData: WizardData;
  onPrev: () => void;
  onGenerate: () => void;
  onSaveDraft: () => void;
  isLoading: boolean;
}

export const PreviewStep = ({ 
  wizardData, 
  onPrev, 
  onGenerate, 
  onSaveDraft, 
  isLoading 
}: PreviewStepProps) => {
  const { formData, images, pairA, pairB } = wizardData;
  const totalImages = images.length + (pairA ? 1 : 0) + (pairB ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-heading-2 text-text-primary">
          Pregled & preuzimanje
        </h2>
        <p className="text-body text-text-muted">
          Proverite podatke pre generisanja videa
        </p>
      </div>

      {/* Property details summary */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <h3 className="text-heading-3 text-text-primary mb-4">
            Detalji nekretnine
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-text-muted">Naslov</dt>
              <dd className="text-base text-text-primary font-medium">
                {formData.title}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-text-muted">Cena</dt>
              <dd className="text-base text-text-primary font-medium">
                {formData.price}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-text-muted">Lokacija</dt>
              <dd className="text-base text-text-primary">
                {formData.location}
              </dd>
            </div>
            
            {formData.size && (
              <div>
                <dt className="text-sm text-text-muted">Površina</dt>
                <dd className="text-base text-text-primary">
                  {formData.size} m²
                </dd>
              </div>
            )}
            
            {formData.beds && (
              <div>
                <dt className="text-sm text-text-muted">Sobe</dt>
                <dd className="text-base text-text-primary">
                  {formData.beds}
                </dd>
              </div>
            )}
            
            {formData.baths && (
              <div>
                <dt className="text-sm text-text-muted">Kupatila</dt>
                <dd className="text-base text-text-primary">
                  {formData.baths}
                </dd>
              </div>
            )}
            
            {formData.sprat && (
              <div>
                <dt className="text-sm text-text-muted">Sprat</dt>
                <dd className="text-base text-text-primary">
                  {formData.sprat}
                </dd>
              </div>
            )}
          </div>
          
          {formData.extras && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-sm text-text-muted mb-1">Posebnosti</dt>
              <dd className="text-base text-text-primary">
                {formData.extras}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images summary */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-3 text-text-primary">
              Fotografije
            </h3>
            <span className="text-sm text-text-muted">
              {totalImages} slika
            </span>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Slika ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            
            {pairA && (
              <div className="aspect-square rounded-md overflow-hidden bg-muted relative">
                <img
                  src={URL.createObjectURL(pairA)}
                  alt="Kadar A"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs px-1 py-0.5 text-center">
                  A
                </div>
              </div>
            )}
            
            {pairB && (
              <div className="aspect-square rounded-md overflow-hidden bg-muted relative">
                <img
                  src={URL.createObjectURL(pairB)}
                  alt="Kadar B"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs px-1 py-0.5 text-center">
                  B
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview player placeholder */}
      <Card className="border border-border">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-primary fill-current" />
            </div>
            <div>
              <h3 className="text-heading-3 text-text-primary mb-2">
                Scenario generisan
              </h3>
              <p className="text-body text-text-muted">
                Video će biti kreiran na osnovu vaših podataka i slika
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isLoading}
          className="px-8"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Nazad
        </Button>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-6 -mx-8 -mb-8 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onSaveDraft}
            disabled={isLoading}
            className="px-6"
          >
            <Save className="mr-2 w-4 h-4" />
            Sačuvaj nacrt
          </Button>
          
          <Button
            onClick={onGenerate}
            disabled={isLoading}
            className="gradient-accent text-white px-8"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generisanje u toku...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-4 h-4" />
                Generiši video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};