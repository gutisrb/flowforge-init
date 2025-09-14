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
    <div className="bg-white rounded-xl border shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Fotografije</h3>
            <p className="text-xs text-muted-foreground">
              Dodajte 1 ili 2 fotografije po slotu · Max {maxImages} fotografija
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="outline" size="sm" onClick={handleAddPhotos}>
              <Upload className="mr-1 h-3 w-3" />
              Dodaj
            </Button>
            {totalImages > 0 && (
              <Button variant="outline" size="sm" onClick={handleRefreshAll}>
                Osveži
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <BulkDropZone
          onFilesSelected={handleBulkAdd}
          maxImages={maxImages - totalImages}
          className="mb-4 flex-shrink-0"
        />

        <div className="flex-1 min-h-0 overflow-y-auto">
          <SlotsGrid
            slots={slots}
            onSlotsChange={onSlotsChange}
          />
        </div>
      </div>

      {/* Footer (sticky) — now holds 5/6 selector */}
      <div className="border-t bg-white/95 backdrop-blur-sm flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4">
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Popunjeno: {slots.filter(s => s.images.length >= 1).length}/{clipCount}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="clipCount"
                  checked={clipCount === 5}
                  onChange={() => setClipCount(5)}
                />
                5 klipova
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs">
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
            className="h-10 px-4 text-sm font-semibold"
          >
            {isLoading ? "Generiše..." : "Generiši"}
          </Button>
        </div>
      </div>
    </div>
  );
}
