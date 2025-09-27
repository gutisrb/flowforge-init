import React from "react";
import { SlotCard } from "./SlotCard";
import { SlotData } from "./ImageSlots";
import { DragProvider } from "./DragContext";

interface SlotsGridProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
  clipCount: 5 | 6;
}

export function SlotsGrid({ slots, onSlotsChange, clipCount }: SlotsGridProps) {
  const moveImage = (fromSlot: number, imageIndex: number, toSlot: number, toIndex?: number) => {
    const next = slots.map(s => ({...s, images: [...s.images]}));
    const src = next[fromSlot];
    const dst = next[toSlot];

    if (!src.images[imageIndex]) return;

    const [img] = src.images.splice(imageIndex, 1);

    // if target index provided, place there or swap if occupied
    if (typeof toIndex === "number") {
      if (!dst.images[toIndex]) {
        dst.images[toIndex] = img;
      } else {
        // Swap images - move displaced image back to source slot
        const displacedImage = dst.images[toIndex];
        dst.images[toIndex] = img;
        src.images.push(displacedImage);
      }
    } else {
      // Dropping into general slot area
      if (dst.images.length < 2) {
        dst.images.push(img);
      } else {
        // Slot is full, swap with the last image
        const displacedImage = dst.images.pop()!;
        dst.images.push(img);
        src.images.push(displacedImage);
      }
    }

    onSlotsChange(next);
  };

  const handleDuplicateToNext = (slotIndex: number) => (imageFile: File) => {
    const nextSlotIndex = slotIndex + 1;
    if (nextSlotIndex >= clipCount) return;

    const next = slots.map(s => ({...s, images: [...s.images]}));
    const nextSlot = next[nextSlotIndex];

    if (nextSlot.images.length < 2) {
      nextSlot.images.unshift(imageFile); // Add as first image (start frame)
      onSlotsChange(next);
    }
  };

  const handleReorderSlot = (fromSlot: number, toSlot: number) => {
    if (fromSlot === toSlot) return;

    const next = [...slots];
    const [movedSlot] = next.splice(fromSlot, 1);
    next.splice(toSlot, 0, movedSlot);
    
    onSlotsChange(next);
  };

    return (
      <DragProvider>
        <div className="uniform-slots-grid">
          {slots.slice(0, clipCount).map((slot, index) => (
            <SlotCard
              key={slot.id}
              slotIndex={index}
              images={slot.images}
              isHero={false}
              totalSlots={clipCount}
              onImagesChange={(images: File[]) => {
                const newSlots = [...slots];
                newSlots[index] = { ...slot, images };
                onSlotsChange(newSlots);
              }}
              onReceiveInternalImage={({ fromSlot, imageIndex, toIndex }) =>
                moveImage(fromSlot, imageIndex, index, toIndex)
              }
              onDuplicateToNext={handleDuplicateToNext(index)}
              onReorderSlot={handleReorderSlot}
            />
          ))}
        </div>
      </DragProvider>
    );
}
