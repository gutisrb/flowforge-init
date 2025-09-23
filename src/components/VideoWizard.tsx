import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Stepper } from '@/components/Stepper';
import { DetailsStep } from '@/components/wizard/DetailsStep';
import { PhotosStep } from '@/components/wizard/PhotosStep';
import { PreviewStep } from '@/components/wizard/PreviewStep';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useProgress } from '@/contexts/ProgressContext';
import { SlotData } from '@/components/ImageSlots';
import { MAKE_VIDEO_URL } from '@/config/make';

interface VideoWizardProps {
  user: User;
  session: Session;
}

export interface FormData {
  title: string;
  price: string;
  location: string;
  size?: string;
  beds?: string;
  baths?: string;
  sprat?: string;
  extras?: string;
}

export interface WizardData {
  formData: FormData;
  slots: SlotData[];
  clipCount: 5 | 10 | 15;
}

export const VideoWizard = ({ user, session }: VideoWizardProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    formData: { title: '', price: '', location: '' },
    slots: Array.from({ length: 5 }, (_, i) => ({
      id: `slot-${i}`,
      mode: 'frame-to-frame' as const,
      images: []
    })),
    clipCount: 5 as const,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile(user);
  const { progress, setProgress } = useProgress();

  const updateFormData = useCallback((data: FormData) => {
    setWizardData(prev => ({ ...prev, formData: data }));
  }, []);

  const updateSlots = useCallback((slots: SlotData[]) => {
    setWizardData(prev => ({ ...prev, slots }));
  }, []);

  const updateClipCount = useCallback((count: 5 | 10 | 15) => {
    setWizardData(prev => ({ ...prev, clipCount: count }));
  }, []);

  const nextStep = () => setCurrentStep(prev => Math.min(3, (prev + 1) as 1 | 2 | 3));
  const prevStep = () => setCurrentStep(prev => Math.max(1, (prev - 1) as 1 | 2 | 3));

  const canProceedToStep2 = () => wizardData.formData.title && wizardData.formData.price && wizardData.formData.location;
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
      if (slot.mode === 'frame-to-frame') {
        for (let j = 0; j < slot.images.length; j++) {
          form.append(`image_${imageIndex}`, slot.images[j].file);
          grouping.push({
            type: "single",
            index: imageIndex
          });
          imageIndex++;
        }
      } else if (slot.mode === 'frame-to-clip') {
        if (slot.images.length === 0) return;
        form.append(`image_${imageIndex}`, slot.images[0].file);
        grouping.push({
          type: "clip",
          index: imageIndex
        });
        imageIndex++;
      } else if (slot.mode === 'frame-to-frame-paired') {
        if (slot.images.length < 2) return;
        const firstIndex = imageIndex;
        form.append(`image_${imageIndex}`, slot.images[0].file);
        imageIndex++;
        form.append(`image_${imageIndex}`, slot.images[1].file);
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
        setWizardData({
          formData: { title: '', price: '', location: '' },
          slots: Array.from({ length: 5 }, (_, i) => ({
            id: `slot-${i}`,
            mode: 'frame-to-frame' as const,
            images: []
          })),
          clipCount: 5 as const,
        });
        setCurrentStep(1);
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
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-text-primary">Kreiranje video oglasa</h1>
          <p className="text-text-muted text-lg mt-2">
            Dodajte slike, uredite redosled i generišite reels oglas.
          </p>
        </div>

        <Stepper currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && (
            <DetailsStep
              formData={wizardData.formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              canProceed={canProceedToStep2()}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <PhotosStep
              slots={wizardData.slots}
              updateSlots={updateSlots}
              clipCount={wizardData.clipCount}
              updateClipCount={updateClipCount}
              onPrev={prevStep}
              onNext={nextStep}
              canProceed={canProceedToStep3()}
            />
          )}
          
          {currentStep === 3 && (
            <PreviewStep
              wizardData={wizardData}
              onPrev={prevStep}
              onGenerate={handleGenerate}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
};
