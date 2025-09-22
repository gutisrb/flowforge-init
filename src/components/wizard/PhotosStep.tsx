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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-heading-2 text-text-primary mb-2">
          Fotografije za video
        </h2>
        <p className="text-body text-text-secondary">
          Dodajte fotografije u slotove i kreirajte animacije
        </p>
      </div>

      {/* Clip count selection */}
      <div className="bg-surface-light rounded-2xl p-6">
        <h3 className="text-body-large font-medium text-text-primary mb-4">
          Broj klipova
        </h3>
        <RadioGroup 
          value={clipCount.toString()} 
          onValueChange={(value) => onClipCountChange(parseInt(value) as 5 | 6)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5" id="clips5" />
            <Label htmlFor="clips5">5 klipova</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="6" id="clips6" />
            <Label htmlFor="clips6">6 klipova</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Image slots */}
      <ImageSlots
        slots={slots}
        onSlotsChange={onSlotsChange}
        totalImages={totalImages}
        clipCount={clipCount}
        setClipCount={onClipCountChange}
        onGenerate={onNext}
        isLoading={false}
        isGenerateEnabled={canProceed}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Nazad
        </Button>
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="bg-gradient-primary text-white"
        >
          Sledeći korak
        </Button>
      </div>
    </div>
  );
};