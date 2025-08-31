import { useState, useEffect } from "react";
import { ListingForm } from "@/components/ListingForm";
import { ImageSlots, SlotData } from "@/components/ImageSlots";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/hooks/use-toast";

// Initialize 5 empty slots
const initialSlots: SlotData[] = Array.from({ length: 5 }, (_, i) => ({
  id: `slot-${i}`,
  mode: "image-to-video",
  images: []
}));

const Index = () => {
  const [slots, setSlots] = useState<SlotData[]>(initialSlots);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const totalImages = slots.reduce((sum, slot) => sum + slot.images.length, 0);
  const isFormValid = totalImages >= 5;
  
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
            type: "image-to-video",
            first_index: imageIndex,
            second_index: null
          });
          imageIndex++;
        } else if (slot.mode === "frame-to-frame" && slot.images.length >= 2) {
          const firstIndex = imageIndex;
          form.append(`image_${imageIndex}`, slot.images[0]);
          imageIndex++;
          form.append(`image_${imageIndex}`, slot.images[1]);
          grouping.push({
            type: "frame-to-frame",
            first_index: firstIndex,
            second_index: imageIndex
          });
          imageIndex++;
        } else if (slot.mode === "frame-to-frame" && slot.images.length === 1) {
          form.append(`image_${imageIndex}`, slot.images[0]);
          grouping.push({
            type: "image-to-video", // Fallback to single image
            first_index: imageIndex,
            second_index: null
          });
          imageIndex++;
        }
      }
    });

    // Add meta fields
    form.append("layout", "standard");
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
    form.append("timestamp", new Date().toISOString());
    form.append("total_images", imageIndex.toString());

    return form;
  };

  const handleSubmit = async (formData: any) => {
    if (!isFormValid) {
      toast({
        title: "Greška",
        description: "Otpremite 5 fotografija i popunite obavezna polja.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error("VITE_WEBHOOK_URL environment variable is not set");
      }

      const multipartData = createMultipartFormData(formData);
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ProgressBar value={progress} />
      
      {/* Header */}
      <header className="backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smartflow — Video oglasi
            </h1>
            <div className="text-sm text-muted-foreground backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 px-3 py-1 rounded-full border border-white/20">
              Prijavljeni: —
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <ListingForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isValid={isFormValid}
              totalImages={totalImages}
              formErrors={getFormErrors()}
            />
          </div>

          {/* Right Column - Image Slots */}
          <div className="space-y-6">
            <ImageSlots
              slots={slots}
              onSlotsChange={setSlots}
              totalImages={totalImages}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
