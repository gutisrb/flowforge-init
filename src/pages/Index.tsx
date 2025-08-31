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
    form.append("extras", JSON.stringify(formData.extras || []));
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
    <div className="min-h-screen bg-background">
      <ProgressBar value={progress} />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Smartflow — Video oglasi
            </h1>
            <div className="text-sm text-muted-foreground">
              Prijavljeni: —
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <ListingForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isValid={isFormValid}
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
