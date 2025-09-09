import React from "react";
import { BulkDropZone } from "./BulkDropZone";
import { SlotsGrid } from "./SlotsGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

export interface SlotData {
  id: string;
  mode: "image-to-video" | "frame-to-frame";
  images: File[];
}

export interface ImageSlotsProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
  totalImages: number;
  clipCount: number;
  onGenerate: () => void;
  isGenerateEnabled: boolean;
  isLoading: boolean;
}

export function ImageSlots({
  slots,
  onSlotsChange,
  totalImages,
  clipCount,
  onGenerate,
  isGenerateEnabled,
  isLoading,
}: ImageSlotsProps) {
  const maxImages = clipCount * 2; // Each slot can have max 2 images
  const slotsWithImages = slots.filter(slot => slot.images.length > 0).length;
  const allSlotsFilled = slotsWithImages >= clipCount;

  const handleBulkAdd = (files: File[]) => {
    const updated = [...slots].map(s => ({...s, images: [...s.images]}));
    let fileIndex = 0;

    // Fill left → right, first image, then optional second
    for (let i = 0; i < clipCount && fileIndex < files.length; i++) {
      const slot = updated[i];
      if (slot.images.length === 0 && fileIndex < files.length) {
        slot.images.push(files[fileIndex++]);
      }
      if (slot.images.length === 1 && fileIndex < files.length) {
        slot.images.push(files[fileIndex++]);
        slot.mode = "frame-to-frame";
      }
    }

    onSlotsChange(updated);
  };

  const handleAddPhotos = () => {
    document.getElementById("bulk-file-input")?.click();
  };

  const handleRefreshAll = () => {
    onSlotsChange(slots.map(s => ({ ...s, images: [] })));
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Photo Section Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Fotografije</h3>
            <p className="text-sm text-muted-foreground">
              Dodajte 1 ili 2 fotografije po slotu • Max {maxImages} fotografija
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {totalImages}/{maxImages} fotografija
            </Badge>
            <input
              id="bulk-file-input"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) handleBulkAdd(files);
                (e.target as HTMLInputElement).value = "";
              }}
            />
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div className="p-6 pt-4">
        <BulkDropZone
          onFilesSelected={handleBulkAdd}
          maxImages={maxImages - totalImages}
          className="mb-6"
        />

        <SlotsGrid
          slots={slots}
          onSlotsChange={onSlotsChange}
        />
      </div>

      {/* Sticky Actions Footer */}
      <div className="border-t bg-white/95 backdrop-blur-sm">
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleAddPhotos} className="h-11 px-6">
              <Upload className="mr-2 h-4 w-4" />
              Dodaj fotografije
            </Button>
            {totalImages > 0 && (
              <Button variant="outline" onClick={handleRefreshAll} className="h-11 px-6">
                Osveži (obriši sve)
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {slotsWithImages}/{clipCount} slotova popunjeno
            </div>
            <Button
              onClick={onGenerate}
              disabled={!isGenerateEnabled || !allSlotsFilled || isLoading}
              className="h-12 px-6 text-base font-semibold gradient-primary"
            >
              {isLoading ? "Generiše..." : "Generiši"}
            </Button>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="sm:hidden p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {slotsWithImages}/{clipCount} slotova
            </div>
            <Badge variant="secondary">{totalImages}/{maxImages}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleAddPhotos}>
              Dodaj
            </Button>
            {totalImages > 0 && (
              <Button variant="outline" className="flex-1" onClick={handleRefreshAll}>
                Osveži
              </Button>
            )}
            <Button
              className="flex-[2]"
              onClick={onGenerate}
              disabled={!isGenerateEnabled || !allSlotsFilled || isLoading}
            >
              {isLoading ? "Generiše..." : "Generiši"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
