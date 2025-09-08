import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { ListingForm } from "@/components/ListingForm";
import { ImageSlots, SlotData } from "@/components/ImageSlots";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Initialize 6 empty slots
const initialSlots: SlotData[] = Array.from({ length: 6 }, (_, i) => ({
  id: `slot-${i}`,
  mode: "image-to-video",
  images: []
}));

interface IndexProps {
  user: User;
  session: Session;
}

const Index = ({ user, session }: IndexProps) => {
  const [slots, setSlots] = useState<SlotData[]>(initialSlots);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile(user);

  const totalImages = slots.reduce((sum, slot) => sum + slot.images.length, 0);
  const isFormValid = totalImages >= 6;
  
  const getFormErrors = () => {
    const errors = [];
    if (totalImages < 5) errors.push(`Potrebno još ${5 - totalImages} fotografija`);
    return errors;
  };

  const createMultipartFormData = (formData: any) => {
    const form = new FormData();
    
    // Add images in slot order
    let imageIndex = 0;
    const grouping: any[] = [];
    
    slots.forEach((slot) => {
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

      const multipartData = createMultipartFormData(formData);
      
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
      slots.forEach((slot, slotIndex) => {
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
          setSlots(initialSlots);
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
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <ListingForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isValid={isFormValid}
                totalImages={totalImages}
                formErrors={getFormErrors()}
              />
            </div>
          </div>

          {/* Right Column - Image Slots */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <ImageSlots
                slots={slots}
                onSlotsChange={setSlots}
                totalImages={totalImages}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
