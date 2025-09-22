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
  const {
    formData,
    slots
  } = wizardData;
  const totalImages = slots.reduce((acc, slot) => acc + slot.images.length, 0);
  return <div className="space-y-6">
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
            
            {formData.size && <div>
                <dt className="text-sm text-text-muted">Površina</dt>
                <dd className="text-base text-text-primary">
                  {formData.size} m²
                </dd>
              </div>}
            
            {formData.beds && <div>
                <dt className="text-sm text-text-muted">Sobe</dt>
                <dd className="text-base text-text-primary">
                  {formData.beds}
                </dd>
              </div>}
            
            {formData.baths && <div>
                <dt className="text-sm text-text-muted">Kupatila</dt>
                <dd className="text-base text-text-primary">
                  {formData.baths}
                </dd>
              </div>}
            
            {formData.sprat && <div>
                <dt className="text-sm text-text-muted">Sprat</dt>
                <dd className="text-base text-text-primary">
                  {formData.sprat}
                </dd>
              </div>}
          </div>
          
          {formData.extras && <div className="mt-4 pt-4 border-t">
              <dt className="text-sm text-text-muted mb-1">Posebnosti</dt>
              <dd className="text-base text-text-primary">
                {formData.extras}
              </dd>
            </div>}
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
              {totalImages} slika u {slots.length} slotova
            </span>
          </div>
          
          <div className="space-y-4">
            {slots.map((slot, slotIndex) => <div key={slot.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-text-primary">
                    Slot {slotIndex + 1}
                  </h4>
                  <span className="text-xs text-text-muted">
                    {slot.images.length} {slot.images.length === 2 ? 'slike (animacija)' : 'slika'}
                  </span>
                </div>
                
                {slot.images.length > 0 && <div className="grid grid-cols-6 gap-2">
                    {slot.images.map((image, imageIndex) => <div key={imageIndex} className="aspect-square rounded-md overflow-hidden bg-muted">
                        <img src={URL.createObjectURL(image)} alt={`Slot ${slotIndex + 1}, Slika ${imageIndex + 1}`} className="w-full h-full object-cover" />
                      </div>)}
                  </div>}
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Preview player placeholder */}
      

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev} disabled={isLoading} className="px-8">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Nazad
        </Button>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-6 -mx-8 -mb-8 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="ghost" onClick={onSaveDraft} disabled={isLoading} className="px-6">
            <Save className="mr-2 w-4 h-4" />
            Sačuvaj nacrt
          </Button>
          
          <Button onClick={onGenerate} disabled={isLoading} className="gradient-accent text-white px-8">
            {isLoading ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generisanje u toku...
              </> : <>
                <Sparkles className="mr-2 w-4 h-4" />
                Generiši video
              </>}
          </Button>
        </div>
      </div>
    </div>;
};