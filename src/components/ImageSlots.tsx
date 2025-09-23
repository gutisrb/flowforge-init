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

interface Props {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
  totalImages: number;
  clipCount: 5 | 6;
}

export function ImageSlots({
  slots,
  onSlotsChange,
  totalImages,
  clipCount,
}: Props) {
  const maxImages = clipCount * 2;

  const handleBulkAdd = (files: File[]) => {
    const next = slots.map(s => ({...s, images: [...s.images]}));
    let i = 0;
    // Fill 1 per slot, then second per slot
    for (let pass = 0; pass < 2; pass++) {
      for (let s = 0; s < clipCount && i < files.length; s++) {
        if (next[s].images.length === pass) {
          next[s].images.push(files[i++]);
        }
      }
    }
    onSlotsChange(next);
  };

  const handleAddPhotos = () => {
    document.getElementById("bulk-file-input")?.click();
  };

  const handleRefreshAll = () => {
    onSlotsChange(slots.map(s => ({ ...s, images: [] })));
  };

  return (
    <div className="space-y-6">
      {/* Header with counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-foreground">Fotografije</h3>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
            Dodato {totalImages}/12
          </div>
        </div>
        {totalImages > 0 && (
          <Button 
            onClick={handleRefreshAll} 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            Obriši sve
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <BulkDropZone
          onFilesSelected={handleBulkAdd}
          maxImages={maxImages - totalImages}
        />

        <SlotsGrid
          slots={slots}
          onSlotsChange={onSlotsChange}
        />
      </div>

      {/* Status */}
      <div className="text-center text-13 text-muted-foreground">
        Popunjeno {slots.filter(s => s.images.length >= 1).length}/{clipCount} slotova
      </div>
    </div>
  );
}
