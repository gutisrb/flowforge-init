import React, { useRef } from "react";
import { SlotCard } from "./SlotCard";
import { SlotData } from "./ImageSlots";

interface SlotsGridProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
}

export function SlotsGrid({ slots, onSlotsChange }: SlotsGridProps) {
  const draggingSlotIndex = useRef<number | null>(null);

  const reorderSlots = (from: number, to: number) => {
    if (from === to) return;
    const next = [...slots];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onSlotsChange(next);
  };

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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {slots.map((slot, index) => (
        <div
          key={slot.id}
          draggable
          onDragStart={(e) => {
            draggingSlotIndex.current = index;
            e.dataTransfer.setData("text/x-smartflow-slot", String(index));
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const fromStr = e.dataTransfer.getData("text/x-smartflow-slot");
            if (fromStr) {
              const from = parseInt(fromStr, 10);
              reorderSlots(from, index);
              return;
            }
          }}
          className="rounded-xl border bg-white p-0"
        >
          <SlotCard
            slotIndex={index}
            images={slot.images}
            onImagesChange={(images) => {
              const next = slots.map((s, i) => i === index ? { ...s, images } : s);
              onSlotsChange(next);
            }}
            onReceiveInternalImage={(payload) => moveImage(payload.fromSlot, payload.imageIndex, index, payload.toIndex)}
          />
        </div>
      ))}
    </div>
  );
}
