import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { ListingForm } from "@/components/ListingForm";
import { ImageSlots, SlotData } from "@/components/ImageSlots";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Initialize N empty slots based on clip count
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

const Index = ({ user, session }: IndexProps) => {
  const [clipCount, setClipCount] = useState(6);
  const [slots, setSlots] = useState<SlotData[]>(() => createInitialSlots(6));
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile(user);

  const totalImages = slots.reduce((sum, slot) => sum + slot.images.length, 0);
  
  // Count valid groups (slots with required images)
  const validGroups = slots.filter(slot => {
    const minRequired = slot.mode === "frame-to-frame" ? 1 : 1; // frame-to-frame needs at least 1 for fallback
    return slot.images.length >= minRequired;
  }).length;
  
  const isFormValid = validGroups >= clipCount;
  
  const getFormErrors = () => {
    const errors = [];
    const needed = clipCount - validGroups;
    if (needed > 0) errors.push(`Potrebno još ${needed} ${needed === 1 ? 'grupa' : 'grupa'}`);
    return errors;
  };

  const createMultipartFormData = (formData: any, validSlots: SlotData[]) => {
    const form = new FormData();
    
    // Add images in slot order
    let imageIndex = 0;
    const grouping: any[] = [];
    
    validSlots.forEach((slot) => {
      if (slot.images.length > 0) {
        if (slot.mode === "image-to-video") {
          form.append(`image_${imageIndex}`, slot.images[0]);
          grouping.push({
            type: "single",
            files: [imageIndex],
            first_index: imageIndex,
            second_index: ""
          });
          imageIndex++;
        } else if (slot.mode === "frame-to-frame" && slot.images.length >= 2) {
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
        } else if (slot.mode === "frame-to-frame" && slot.images.length === 1) {
          form.append(`image_${imageIndex}`, slot.images[0]);
          grouping.push({
            type: "single",
            files: [imageIndex],
            first_index: imageIndex,
            second_index: ""
          });
          imageIndex++;
        }
      }
    });

    // Add required text fields
    form.append("title", formData.title);
    form.append("price", formData.price);
    form.append("location", formData.location);
    form.append("size", formData.size || "");
    form.append("beds", formData.beds || "");
    form.append("baths", formData.baths || "");
    form.append("sprat", formData.sprat || "");
    form.append("extras", formData.extras || "");

    // Grouping and additional metadata (as specified)
    form.append("grouping", JSON.stringify(grouping));
    form.append("slot_mode_info", JSON.stringify(grouping));
    form.append("total_images", imageIndex.toString());

    return form;
  };

  const handleSubmit = async (formData: any) => {
    if (!isFormValid) {
      toast({
        title: "Greška",
        description: "Otpremite najmanje 5 fotografija i popunite Naslov, Cenu i Lokaciju.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      // Use profile webhook_url if available, otherwise fall back to env var
      const webhookUrl = profile?.webhook_url || import.meta.env.VITE_WEBHOOK_URL;
      
      if (!webhookUrl) {
        if (!profile?.webhook_url) {
          toast({
            title: "Greška",
            description: "Vašem nalogu još nije dodeljen webhook.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("No webhook URL available");
      }

      // Only process first clipCount valid groups
      const validSlots = slots.filter(slot => {
        const minRequired = slot.mode === "frame-to-frame" ? 1 : 1;
        return slot.images.length >= minRequired;
      }).slice(0, clipCount);

      const multipartData = createMultipartFormData(formData, validSlots);
      
      // Console logging for testing
      console.log("=== SMARTFLOW SUBMISSION DEBUG ===");
      console.log("Total images:", totalImages);
      console.log("Slot order and images:");
      slots.forEach((slot, index) => {
        console.log(`Slot ${index + 1} (${slot.mode}):`, slot.images.map(img => img.name));
      });
      
      // Log the grouping info (schema-aligned)
      let imageIndex = 0;
      const grouping: any[] = [];
      validSlots.forEach((slot, slotIndex) => {
        if (slot.images.length > 0) {
          if (slot.mode === "image-to-video") {
            grouping.push({
              type: "single",
              files: [imageIndex],
              first_index: imageIndex,
              second_index: ""
            });
            console.log(`Image ${imageIndex}: ${slot.images[0].name} (slot ${slotIndex}, single)`);
            imageIndex++;
          } else if (slot.mode === "frame-to-frame" && slot.images.length >= 2) {
            const firstIndex = imageIndex;
            grouping.push({
              type: "frame-to-frame",
              files: [firstIndex, firstIndex + 1],
              first_index: firstIndex,
              second_index: firstIndex + 1
            });
            console.log(`Image ${firstIndex}: ${slot.images[0].name} (slot ${slotIndex}, frame-to-frame first)`);
            console.log(`Image ${firstIndex + 1}: ${slot.images[1].name} (slot ${slotIndex}, frame-to-frame second)`);
            imageIndex += 2;
          } else if (slot.mode === "frame-to-frame" && slot.images.length === 1) {
            grouping.push({
              type: "single",
              files: [imageIndex],
              first_index: imageIndex,
              second_index: ""
            });
            console.log(`Image ${imageIndex}: ${slot.images[0].name} (slot ${slotIndex}, frame-to-frame fallback to single)`);
            imageIndex++;
          }
        }
      });
      console.log("Grouping array:", grouping);
      console.log("===============================");
      
      setProgress(50);

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: multipartData,
      });

      setProgress(90);

      if (response.ok) {
        toast({
          title: "Uspešno!",
          description: "Video je uspešno generisan.",
        });
        setProgress(100);
        
        // Reset form after success
        setTimeout(() => {
          setSlots(createInitialSlots(clipCount));
          setProgress(0);
        }, 2000);
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom generisanja videa. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressBar value={progress} />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="text-white font-bold text-lg">S</div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Smartflow
                <span className="text-sm font-normal text-muted-foreground ml-2">Video oglasi</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full border">
                Prijavljeni: {profile?.org_name || user.email}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => supabase.auth.signOut()}
              >
                Odjavi se
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Loading or Missing Webhook Warning */}
      {profileLoading && (
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-6 py-3">
            <p className="text-sm text-muted-foreground">Učitavam profil...</p>
          </div>
        </div>
      )}
      
      {!profileLoading && !profile?.webhook_url && (
        <div className="bg-yellow-50 border-yellow-200 border-b">
          <div className="container mx-auto px-6 py-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Vašem nalogu još nije dodeljen webhook. Kontaktirajte administratora.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 pb-24 sm:pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form - Sticky on desktop */}
          <div className="xl:sticky xl:top-8 xl:h-fit space-y-6">
            {/* Clip Count Selector */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Broj klipova</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="clipCount"
                      value={5}
                      checked={clipCount === 5}
                      onChange={(e) => {
                        const newCount = parseInt(e.target.value);
                        setClipCount(newCount);
                        setSlots(createInitialSlots(newCount));
                      }}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-base font-semibold">5 klipova</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="clipCount"
                      value={6}
                      checked={clipCount === 6}
                      onChange={(e) => {
                        const newCount = parseInt(e.target.value);
                        setClipCount(newCount);
                        setSlots(createInitialSlots(newCount));
                      }}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-base font-semibold">6 klipova</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <ListingForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isValid={isFormValid}
                totalImages={totalImages}
                clipCount={clipCount}
                validGroups={validGroups}
                formErrors={getFormErrors()}
              />
            </div>
          </div>

          {/* Right Column - Image Slots */}
          <div className="min-h-screen">
            <div className="bg-white rounded-xl border shadow-sm h-full overflow-hidden">
              <ImageSlots
                slots={slots}
                onSlotsChange={setSlots}
                totalImages={totalImages}
                clipCount={clipCount}
                onGenerate={() => {
                  const formElement = document.querySelector('form') as HTMLFormElement;
                  if (formElement) {
                    formElement.requestSubmit();
                  }
                }}
                isGenerateEnabled={isFormValid}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
