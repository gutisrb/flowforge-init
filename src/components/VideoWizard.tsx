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
import { compressMappedEntries } from '@/lib/compressWebhookImages';
import { MAKE_VIDEO_WEBHOOK } from '@/config/make';

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

  const createMultipartFormData = (
    entries: { key: string; file: File }[],
    grouping: any[],
  ) => {
    const form = new FormData();

    // Form fields
    form.append("title", wizardData.formData.title);
    form.append("price", wizardData.formData.price);
    form.append("location", wizardData.formData.location);
    form.append("size", wizardData.formData.size || "");
    form.append("beds", wizardData.formData.beds || "");
    form.append("baths", wizardData.formData.baths || "");
    form.append("sprat", wizardData.formData.sprat || "");
    form.append("extras", wizardData.formData.extras || "");

    for (const { key, file } of entries) {
      form.append(key, file, file.name);
    }

    form.append("grouping", JSON.stringify(grouping));
    form.append("slot_mode_info", JSON.stringify(grouping)); // (left as-is)
    form.append("total_images", String(entries.length));
    form.append("user_id", user.id); // you already had this

    return form;
  };


  const handleGenerate = async () => {
    setIsLoading(true);
    setProgress(20);

    try {
      const slotTypes: ("pair" | "single")[] = [];
      const mapped: { key: string; file: File }[] = [];
      let imageIndex = 0;

      for (const slot of wizardData.slots) {
        if (slot.images.length === 0) {
          continue;
        }

        if (slot.images.length >= 2) {
          mapped.push({ key: `image_${imageIndex}`, file: slot.images[0] });
          imageIndex++;
          mapped.push({ key: `image_${imageIndex}`, file: slot.images[1] });
          imageIndex++;
          slotTypes.push("pair");
        } else {
          mapped.push({ key: `image_${imageIndex}`, file: slot.images[0] });
          imageIndex++;
          slotTypes.push("single");
        }
      }

      const compressedEntries = await compressMappedEntries(mapped, {
        maxW: 1280,
        maxH: 1280,
        quality: 0.72,
        budgetBytes: 4.9 * 1024 * 1024,
      });

      if (compressedEntries.length === 0) {
        alert("Fotografije su prevelike čak i nakon kompresije. Smanjite broj ili rezoluciju i pokušajte ponovo.");
        setProgress(0);
        return;
      }
      if (compressedEntries.length < mapped.length) {
        console.warn(`Poslato ${compressedEntries.length}/${mapped.length} slika zbog ograničenja veličine zahteva (<5MB).`);
      }

      const grouping: any[] = [];
      let pointer = 0;

      for (const slotType of slotTypes) {
        if (pointer >= compressedEntries.length) {
          break;
        }

        if (slotType === "pair") {
          const remaining = compressedEntries.length - pointer;
          if (remaining >= 2) {
            const firstIndex = pointer;
            const secondIndex = pointer + 1;
            grouping.push({
              type: "frame-to-frame",
              files: [firstIndex, secondIndex],
              first_index: firstIndex,
              second_index: secondIndex
            });
            pointer += 2;
          } else {
            grouping.push({ type: "single", index: pointer });
            pointer += 1;
          }
        } else {
          grouping.push({ type: "single", index: pointer });
          pointer += 1;
        }
      }

      const multipartData = createMultipartFormData(compressedEntries, grouping);
      setProgress(55);

      const res = await fetch(MAKE_VIDEO_WEBHOOK, { method: "POST", body: multipartData });
      setProgress(90);

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("Webhook failed:", res.status, t);
        alert("Neuspešno slanje na automatizaciju (webhook). Pokušajte ponovo.");
        return;
      }

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
          <div className={`sticky-cta ${wizardData.currentStep > 0 && wizardData.currentStep !== 2 ? 'visible' : ''}`}>
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
                    className="btn-primary-enhanced focus-ring-enhanced h-12 px-6 py-3 gradient-primary text-white hover-sheen"
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
