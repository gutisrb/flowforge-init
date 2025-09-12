import React from "react";
import { SlotCard } from "./SlotCard";
import { SlotData } from "./ImageSlots";
import { DragProvider } from "./DragContext";

interface SlotsGridProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
}

export function SlotsGrid({ slots, onSlotsChange }: SlotsGridProps) {
  const moveImage = (fromSlot: number, imageIndex: number, toSlot: number, toIndex?: number) => {
    const next = slots.map(s => ({...s, images: [...s.images]}));
    const src = next[fromSlot];
    const dst = next[toSlot];

    if (!src.images[imageIndex]) return;

    const [img] = src.images.splice(imageIndex, 1);

    // if target index provided and free, place there, else push (max 2)
    if (typeof toIndex === "number") {
      if (!dst.images[toIndex]) dst.images[toIndex] = img;
      else dst.images.push(img);
    } else {
      dst.images.push(img);
    }

    // enforce max 2 images
    dst.images = dst.images.slice(0, 2);
    onSlotsChange(next);
  };

  return (
    <DragProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot, index) => (
          <SlotCard
            key={slot.id}
            slotIndex={index}
            images={slot.images}
            onImagesChange={(images) => {
              const next = slots.map((s, i) => i === index ? { ...s, images } : s);
              onSlotsChange(next);
            }}
            onReceiveInternalImage={(payload) => moveImage(payload.fromSlot, payload.imageIndex, index, payload.toIndex)}
          />
        ))}
      </div>
    </DragProvider>
  );
}
