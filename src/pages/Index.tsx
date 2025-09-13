import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { ListingForm } from "@/components/ListingForm";
import { ImageSlots, SlotData } from "@/components/ImageSlots";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useProgress } from "@/contexts/ProgressContext";

const createInitialSlots = (clipCount: number): SlotData[] =>
  Array.from({ length: clipCount }, (_, i) => ({
    id: `slot-${i}`,
    mode: "image-to-video",
    images: []
  }));

interface IndexProps {
  user: User;
  session: Session;
}

const Index = ({ user }: IndexProps) => {
  const [clipCount, setClipCount] = useState<5 | 6>(6);
  const [slots, setSlots] = useState<SlotData[]>(() => createInitialSlots(6));
  const [isLoading, setIsLoading] = useState(false);
  const { progress, setProgress } = useProgress();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile(user);

  const totalImages = slots.reduce((sum, s) => sum + s.images.length, 0);

  const validGroups = slots.filter(s => s.images.length >= 1).length;
  const isFormValid = validGroups >= clipCount;

  const createMultipartFormData = (formData: any, validSlots: SlotData[]) => {
    const form = new FormData();
    let imageIndex = 0;
    const grouping: any[] = [];

    validSlots.forEach((slot) => {
      if (slot.images.length === 1) {
        form.append(`image_${imageIndex}`, slot.images[0]);
        grouping.push({
          type: "single",
          files: [imageIndex],
          first_index: imageIndex,
          second_index: ""
        });
        imageIndex++;
      } else if (slot.images.length >= 2) {
        const firstIndex = imageIndex;
        form.append(`image_${imageIndex}`, slot.images[0]); imageIndex++;
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

    // left form fields
    form.append("title", formData.title);
    form.append("price", formData.price);
    form.append("location", formData.location);
    form.append("size", formData.size || "");
    form.append("beds", formData.beds || "");
    form.append("baths", formData.baths || "");
    form.append("sprat", formData.sprat || "");
    form.append("extras", formData.extras || "");

    form.append("grouping", JSON.stringify(grouping));
    form.append("slot_mode_info", JSON.stringify(grouping));
    form.append("total_images", String(imageIndex));

    return form;
  };

  const handleSubmit = async (formData: any) => {
    if (!isFormValid) {
      toast({
        title: "Nedovoljno slika",
        description: `Potrebno je popuniti ${clipCount} slotova (min. 1 slika po slotu).`,
        variant: "destructive",
      });
      return;
    }

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

      const validSlots = slots.filter(s => s.images.length >= 1).slice(0, clipCount);
      const multipartData = createMultipartFormData(formData, validSlots);

      setProgress(55);

      const res = await fetch(webhookUrl, { method: "POST", body: multipartData });
      setProgress(90);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast({ title: "Uspešno!", description: "Započeli smo generisanje videa." });
      setProgress(100);
      setTimeout(() => { setSlots(createInitialSlots(clipCount)); setProgress(0); }, 1200);
    } catch (e) {
      console.error(e);
      toast({ title: "Greška", description: "Došlo je do greške prilikom slanja.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // keep array length in sync with clipCount
  useEffect(() => {
    setSlots(prev => {
      const next = createInitialSlots(clipCount);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) {
        next[i].images = prev[i].images;
      }
      return next;
    });
  }, [clipCount]);

  return (
    <div className="min-h-screen bg-background">
      {/* warning if no webhook */}
      {!profileLoading && !profile?.webhook_url && (
        <div className="bg-yellow-50 border-y border-yellow-200">
          <div className="container mx-auto px-6 py-2 text-sm text-yellow-900">
            Vašem nalogu još nije dodeljen webhook. Kontaktirajte administratora.
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* LEFT: property form */}
          <div className="xl:sticky xl:top-8 xl:h-fit">
            <ListingForm
              clipCount={clipCount}
              validGroups={validGroups}
              formErrors={[]}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isValid={isFormValid}
              totalImages={totalImages}
            />
          </div>

          {/* RIGHT: photos */}
          <div>
            <ImageSlots
              slots={slots}
              onSlotsChange={setSlots}
              totalImages={totalImages}
              clipCount={clipCount}
              setClipCount={setClipCount}
              onGenerate={() => {
                const formEl = document.querySelector('form') as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              isGenerateEnabled={isFormValid}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
