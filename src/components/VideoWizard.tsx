import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/Stepper';
import { DetailsStep } from '@/components/wizard/DetailsStep';
import { PhotosStep } from '@/components/wizard/PhotosStep';
import { PreviewStep } from '@/components/wizard/PreviewStep';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useProgress } from '@/contexts/ProgressContext';
import { useWizard } from '@/contexts/WizardContext';
import { MAKE_VIDEO_URL } from '@/config/make';

interface VideoWizardProps {
  user: User;
  session: Session;
}

export const VideoWizard = ({ user, session }: VideoWizardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile(user);
  const { progress, setProgress } = useProgress();
  const { 
    wizardData, 
    updateFormData, 
    updateSlots, 
    updateClipCount, 
    setCurrentStep,
    resetWizard
  } = useWizard();

  const nextStep = () => setCurrentStep(wizardData.currentStep < 3 ? (wizardData.currentStep + 1) as 1 | 2 | 3 : 3);
  const prevStep = () => setCurrentStep(wizardData.currentStep > 1 ? (wizardData.currentStep - 1) as 1 | 2 | 3 : 1);

  const canProceedToStep2 = () => !!(wizardData.formData.title && wizardData.formData.price && wizardData.formData.location);
  const canProceedToStep3 = () => wizardData.slots.some(s => s.images.length > 0);

  const createMultipartFormData = () => {
    const form = new FormData();
    
    // Add form fields
    form.append("title", wizardData.formData.title);
    form.append("price", wizardData.formData.price);
    form.append("location", wizardData.formData.location);
    form.append("size", wizardData.formData.size || "");
    form.append("beds", wizardData.formData.beds || "");
    form.append("baths", wizardData.formData.baths || "");
    form.append("sprat", wizardData.formData.sprat || "");
    form.append("extras", wizardData.formData.extras || "");

    const grouping: any[] = [];
    let imageIndex = 0;

    wizardData.slots.forEach((slot, i) => {
      if (slot.mode === 'image-to-video') {
        for (let j = 0; j < slot.images.length; j++) {
          form.append(`image_${imageIndex}`, slot.images[j]);
          grouping.push({
            type: "single",
            index: imageIndex
          });
          imageIndex++;
        }
      } else if (slot.mode === 'frame-to-frame') {
        if (slot.images.length < 2) return;
        const firstIndex = imageIndex;
        form.append(`image_${imageIndex}`, slot.images[0]);
        imageIndex++;
        form.append(`image_${imageIndex}`, slot.images[1]);
        grouping.push({
          type: "frame-to-frame",
          files: [firstIndex, imageIndex],
          first_index: firstIndex,
          second_index: imageIndex
        });
        imageIndex++;
      }
    });

    form.append("grouping", JSON.stringify(grouping));
    form.append("slot_mode_info", JSON.stringify(grouping));
    form.append("total_images", String(imageIndex));

    // IMPORTANT: attach user_id for Make credit checks
    form.append("user_id", user.id);

    return form;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setProgress(20);

    try {
      const webhookUrl = MAKE_VIDEO_URL;

      const multipartData = createMultipartFormData();
      setProgress(55);

      const res = await fetch(webhookUrl, { method: "POST", body: multipartData });
      setProgress(90);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast({ title: "Uspešno!", description: "Započeli smo generisanje videa." });
      setProgress(100);
      
      // Reset wizard after successful submit
      setTimeout(() => {
        resetWizard();
        setProgress(0);
      }, 1200);
    } catch (e) {
      console.error(e);
      toast({ 
        title: "Greška", 
        description: "Došlo je do greške prilikom slanja.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    toast({ title: "Sačuvano", description: "Vaš nacrt je sačuvan." });
  };

  return (
    <div className="showtime min-h-[calc(100vh-64px)] bg-background">
      <div className="grain-overlay"></div>
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="aurora text-text-primary">Kreiranje video oglasa</h1>
          <div className="aurora-stripe mb-4"></div>
          <p className="text-muted-foreground">
            Dodajte slike, uredite redosled i generišite reels oglas.
          </p>
        </div>

        <Stepper currentStep={wizardData.currentStep} />

        <div className="mt-8 relative pb-20">
          {wizardData.currentStep === 1 && (
            <DetailsStep
              formData={wizardData.formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              canProceed={canProceedToStep2()}
              isLoading={isLoading}
            />
          )}

          {wizardData.currentStep === 2 && (
            <PhotosStep
              slots={wizardData.slots}
              onSlotsChange={updateSlots}
              clipCount={wizardData.clipCount}
              onClipCountChange={updateClipCount}
              onPrev={prevStep}
              onNext={nextStep}
              canProceed={canProceedToStep3()}
            />
          )}
          
          {wizardData.currentStep === 3 && (
            <PreviewStep
              wizardData={wizardData}
              onPrev={prevStep}
              onGenerate={handleGenerate}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading}
            />
          )}

          {/* Sticky Action Bar */}
          <div className={`sticky-cta ${wizardData.currentStep > 0 ? 'visible' : ''}`}>
            <div className="p-4">
              <div className="container mx-auto flex justify-between items-center">
                {wizardData.currentStep > 1 && (
                  <Button variant="ghost" onClick={prevStep} className="text-muted-foreground">
                    Nazad
                  </Button>
                )}
                <div className="flex-1"></div>
                {wizardData.currentStep === 1 && (
                  <Button 
                    onClick={nextStep} 
                    disabled={!canProceedToStep2() || isLoading}
                    className="gradient-primary text-white hover-sheen"
                  >
                    Sledeći korak
                  </Button>
                )}
                {wizardData.currentStep === 2 && (
                  <Button 
                    onClick={nextStep} 
                    disabled={!canProceedToStep3()}
                    className="gradient-primary text-white hover-sheen"
                  >
                    Sledeći korak
                  </Button>
                )}
                {wizardData.currentStep === 3 && (
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="gradient-primary text-white hover-sheen"
                  >
                    {isLoading ? "Generišem..." : "Generiši video"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
