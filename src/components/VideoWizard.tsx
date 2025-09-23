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
  clipCount: 5 | 6;
}

const steps = [
  { id: 1, title: 'Detalji', description: 'Osnovne informacije' },
  { id: 2, title: 'Fotografije', description: 'Upload slika' },
  { id: 3, title: 'Pregled & preuzimanje', description: 'Finalizuj video' }
];

export const VideoWizard = ({ user }: VideoWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    formData: {
      title: '',
      price: '',
      location: '',
    },
    slots: Array.from({ length: 5 }, (_, i) => ({
      id: `slot-${i}`,
      mode: 'frame-to-frame',
      images: []
    })),
    clipCount: 5,
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

  const updateClipCount = useCallback((clipCount: 5 | 6) => {
    const newSlots: SlotData[] = Array.from({ length: clipCount }, (_, i) => {
      const existingSlot = wizardData.slots[i];
      return existingSlot || {
        id: `slot-${i}`,
        mode: 'frame-to-frame' as const,
        images: []
      };
    });
    setWizardData(prev => ({ ...prev, clipCount, slots: newSlots }));
  }, [wizardData.slots]);

  const canProceedToStep2 = () => {
    const { title, price, location } = wizardData.formData;
    return title.trim() !== '' && price.trim() !== '' && location.trim() !== '';
  };

  const canProceedToStep3 = () => {
    const totalImages = wizardData.slots.reduce((acc, slot) => acc + slot.images.length, 0);
    const hasAtLeastOneImagePerSlot = wizardData.slots.every(slot => slot.images.length > 0);
    return totalImages >= wizardData.clipCount && hasAtLeastOneImagePerSlot;
  };

  const nextStep = () => {
    if (currentStep === 1 && !canProceedToStep2()) {
      toast({
        title: "Podaci nedostaju",
        description: "Molimo popunite naslov, cenu i lokaciju pre prelaska na sledeći korak.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 2 && !canProceedToStep3()) {
      const totalImages = wizardData.slots.reduce((acc, slot) => acc + slot.images.length, 0);
      const hasAtLeastOneImagePerSlot = wizardData.slots.every(slot => slot.images.length > 0);
      
      if (!hasAtLeastOneImagePerSlot) {
        toast({
          title: "Nedovoljno slika",
          description: "Svaki slot mora imati bar jednu sliku.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Nedovoljno slika",
          description: `Potrebno je minimum ${wizardData.clipCount} slika za kreiranje videa.`,
          variant: "destructive",
        });
      }
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

    // Process each slot
    wizardData.slots.forEach((slot) => {
      if (slot.images.length === 1) {
        // Single image - static
        form.append(`image_${imageIndex}`, slot.images[0]);
        grouping.push({
          type: "single",
          files: [imageIndex],
          first_index: imageIndex,
          second_index: ""
        });
        imageIndex++;
      } else if (slot.images.length === 2) {
        // Two images - frame-to-frame
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

    return form;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setProgress(20);

    try {
      const webhookUrl = profile?.webhook_url || import.meta.env.VITE_WEBHOOK_URL;
      if (!webhookUrl) {
        toast({
          title: "Webhook nedostaje",
          description: "Nije postavljen webhook za vaš nalog.",
          variant: "destructive",
        });
        return;
      }

      const multipartData = createMultipartFormData();
      setProgress(55);

      const res = await fetch(webhookUrl, { method: "POST", body: multipartData });
      setProgress(90);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast({ title: "Uspešno!", description: "Započeli smo generisanje videa." });
      setProgress(100);
      
      // Reset wizard after successful submission
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
    // TODO: Implement draft saving
    toast({
      title: "Nacrt sačuvan",
      description: "Možete nastaviti kasnije.",
    });
  };

  return (
    <div className="min-h-screen bg-surface-calm">
      {/* Warning if no webhook */}
      {!profileLoading && !profile?.webhook_url && (
        <div className="bg-yellow-50 border-y border-yellow-200">
          <div className="container max-w-7xl mx-auto px-6 py-3 text-body text-yellow-900">
            Vašem nalogu još nije dodeljen webhook. Kontaktirajte administratora.
          </div>
        </div>
      )}

      <main className="container max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-heading-1 text-text-primary mb-6 text-center">
            Kreiraj video nekretnine
          </h1>
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="key-card bg-card rounded-2xl shadow-card p-8">
          {currentStep === 1 && (
            <DetailsStep
              formData={wizardData.formData}
              onChange={updateFormData}
              onNext={nextStep}
              canProceed={canProceedToStep2()}
            />
          )}
          
          {currentStep === 2 && (
            <PhotosStep
              slots={wizardData.slots}
              clipCount={wizardData.clipCount}
              onSlotsChange={updateSlots}
              onClipCountChange={updateClipCount}
              onNext={nextStep}
              onPrev={prevStep}
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