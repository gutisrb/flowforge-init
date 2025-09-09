import React, { useRef } from "react";
import { SlotCard } from "./SlotCard";
import { SlotData } from "./ImageSlots";

interface SlotsGridProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
}

export function SlotsGrid({ slots, onSlotsChange }: SlotsGridProps) {
  const draggingSlotIndex = useRef<number | null>(null);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...slots];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onSlotsChange(next);
  };

  const moveImage = (fromSlot: number, imageIndex: number, toSlot: number) => {
    if (fromSlot === toSlot) return;
    const next = slots.map(s => ({...s, images: [...s.images], mode: s.mode}));
    const src = next[fromSlot];
    const dst = next[toSlot];
    if (!src.images[imageIndex]) return;
    if (dst.images.length >= 2) return;
    const [img] = src.images.splice(imageIndex, 1);
    dst.images.push(img);
    if (dst.images.length === 2) dst.mode = "frame-to-frame";
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
              reorder(from, index);
              return;
            }
          }}
          className="rounded-xl border bg-white p-0"
        >
          <SlotCard
            slotIndex={index}
            images={slot.images}
            mode={slot.mode}
            onImagesChange={(images) => {
              const next = slots.map((s, i) => i === index ? { ...s, images } : s);
              onSlotsChange(next);
            }}
            onModeChange={(mode) => {
              const next = slots.map((s, i) => i === index ? { ...s, mode } : s);
              onSlotsChange(next);
            }}
            onSwapImages={() => {
              const next = slots.map((s, i) => {
                if (i !== index) return s;
                if (s.images.length === 2) {
                  const swapped = [s.images[1], s.images[0]];
                  return { ...s, images: swapped };
                }
                return s;
              });
              onSlotsChange(next);
            }}
            onRemoveSlot={() => {
              // slots are fixed by clipCount; no explicit remove
            }}
            onReceiveInternalImage={(payload) => moveImage(payload.fromSlot, payload.imageIndex, index)}
          />
        </div>
      ))}
    </div>
  );
}
