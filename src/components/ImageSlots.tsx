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
  setClipCount: (n: 5 | 6) => void;
  onGenerate: () => void;
  isGenerateEnabled: boolean;
  isLoading: boolean;
}

export function ImageSlots({
  slots,
  onSlotsChange,
  totalImages,
  clipCount,
  setClipCount,
  onGenerate,
  isGenerateEnabled,
  isLoading,
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
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Fotografije</h3>
            <p className="text-sm text-muted-foreground">
              Dodajte 1 ili 2 fotografije po slotu · Max {maxImages} fotografija
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{totalImages}/{maxImages}</Badge>
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
            <Button variant="outline" onClick={handleAddPhotos}>
              <Upload className="mr-2 h-4 w-4" />
              Dodaj fotografije
            </Button>
            {totalImages > 0 && (
              <Button variant="outline" onClick={handleRefreshAll}>
                Osveži (obriši sve)
              </Button>
            )}
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

      {/* Footer (sticky) — now holds 5/6 selector */}
      <div className="border-t bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-6">
            <div className="text-sm text-muted-foreground">
              Popunjeno slotova: {slots.filter(s => s.images.length >= 1).length}/{clipCount}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clipCount"
                  checked={clipCount === 5}
                  onChange={() => setClipCount(5)}
                />
                5 klipova
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clipCount"
                  checked={clipCount === 6}
                  onChange={() => setClipCount(6)}
                />
                6 klipova
              </label>
            </div>
          </div>

          <Button
            onClick={onGenerate}
            disabled={!isGenerateEnabled || isLoading}
            className="h-12 px-6 text-base font-semibold"
          >
            {isLoading ? "Generiše..." : "Generiši"}
          </Button>
        </div>
      </div>
    </div>
  );
}
