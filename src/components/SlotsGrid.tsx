import React from "react";
import { SlotCard } from "./SlotCard";
import { SlotData } from "./ImageSlots";

interface SlotsGridProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
}

export function SlotsGrid({ slots, onSlotsChange }: SlotsGridProps) {
  const handleSlotImagesChange = (slotIndex: number, images: File[]) => {
    const updatedSlots = slots.map((slot, index) => 
      index === slotIndex ? { ...slot, images } : slot
    );
    onSlotsChange(updatedSlots);
  };

  const handleSlotModeChange = (slotIndex: number, mode: "image-to-video" | "frame-to-frame") => {
    const updatedSlots = slots.map((slot, index) => 
      index === slotIndex ? { ...slot, mode } : slot
    );
    onSlotsChange(updatedSlots);
  };

  const handleSwapImages = (slotIndex: number) => {
    const updatedSlots = slots.map((slot, index) => {
      if (index === slotIndex && slot.images.length === 2) {
        return { ...slot, images: [slot.images[1], slot.images[0]] };
      }
      return slot;
    });
    onSlotsChange(updatedSlots);
  };

  const handleRemoveSlot = (slotIndex: number) => {
    const updatedSlots = slots.map((slot, index) => 
      index === slotIndex ? { ...slot, images: [], mode: "image-to-video" as const } : slot
    );
    onSlotsChange(updatedSlots);
  };

  return (
    <div className="
      grid gap-4
      grid-cols-1
      sm:grid-cols-2 
      lg:grid-cols-3
      xl:grid-cols-2
      2xl:grid-cols-3
    ">
      {slots.map((slot, index) => (
        <SlotCard
          key={slot.id}
          slotIndex={index}
          images={slot.images}
          mode={slot.mode}
          onImagesChange={(images) => handleSlotImagesChange(index, images)}
          onModeChange={(mode) => handleSlotModeChange(index, mode)}
          onSwapImages={() => handleSwapImages(index)}
          onRemoveSlot={() => handleRemoveSlot(index)}
        />
      ))}
    </div>
  );
}