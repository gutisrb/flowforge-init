import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ImageSlots, SlotData } from '@/components/ImageSlots';

interface PhotosStepProps {
  slots: SlotData[];
  clipCount: 5 | 6;
  onSlotsChange: (slots: SlotData[]) => void;
  onClipCountChange: (count: 5 | 6) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

export const PhotosStep = ({
  slots,
  clipCount,
  onSlotsChange,
  onClipCountChange,
  onNext,
  onPrev,
  canProceed,
}: PhotosStepProps) => {
  const totalImages = slots.reduce((acc, slot) => acc + slot.images.length, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground animated-underline">
          Fotografije za video
        </h2>
        <p className="text-muted-foreground">
          Dodajte fotografije u slotove i kreirajte animacije
        </p>
      </div>

      <div className="mb-6 text-center">
        <div className="inline-flex bg-border/30 rounded-full p-1">
          <Button
            variant={clipCount === 5 ? "default" : "ghost"}
            size="sm"
            onClick={() => onClipCountChange(5)}
            className={`h-10 px-6 text-sm rounded-full transition-all duration-200 ${
              clipCount === 5 
                ? "gradient-primary text-white shadow-md" 
                : "text-muted-foreground hover:text-foreground hover:bg-surface"
            }`}
          >
            5 klipova
          </Button>
          <Button
            variant={clipCount === 6 ? "default" : "ghost"}
            size="sm"
            onClick={() => onClipCountChange(6)}
            className={`h-10 px-6 text-sm rounded-full transition-all duration-200 ${
              clipCount === 6 
                ? "gradient-primary text-white shadow-md" 
                : "text-muted-foreground hover:text-foreground hover:bg-surface"
            }`}
          >
            6 klipova
          </Button>
        </div>
      </div>

      <ImageSlots
        slots={slots}
        onSlotsChange={onSlotsChange}
        totalImages={totalImages}
        clipCount={clipCount}
        onNext={onNext}
        onPrev={onPrev}
        canProceed={canProceed}
      />
    </div>
  );
};