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
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Fotografije za video
        </h2>
        <p className="text-muted-foreground">
          Dodajte fotografije u slotove i kreirajte animacije
        </p>
      </div>

      {/* Clip count selection - improved design */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Izaberite broj klipova
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => onClipCountChange(5)}
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
              clipCount === 5
                ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105'
                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            5 klipova
          </button>
          <button
            type="button"
            onClick={() => onClipCountChange(6)}
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
              clipCount === 6
                ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105'
                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            6 klipova
          </button>
        </div>
      </div>

      {/* Image slots - mobile optimized */}
      <div className="bg-card rounded-xl border p-4 sm:p-6">
        <ImageSlots
          slots={slots}
          onSlotsChange={onSlotsChange}
          totalImages={totalImages}
          clipCount={clipCount}
        />
      </div>

      {/* Navigation - mobile friendly */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="order-2 sm:order-1 flex-1 sm:flex-none"
        >
          Nazad
        </Button>
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="order-1 sm:order-2 flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold py-3"
        >
          Sledeči korak ({slots.filter(s => s.images.length >= 1).length}/{clipCount})
        </Button>
      </div>
    </div>
  );
};