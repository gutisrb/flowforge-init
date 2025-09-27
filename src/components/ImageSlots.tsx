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
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

export function ImageSlots({
  slots,
  onSlotsChange,
  totalImages,
  clipCount,
  onNext,
  onPrev,
  canProceed,
}: Props) {
  const maxImages = clipCount * 2;

  const handleBulkAdd = (files: File[]) => {
    console.log('🔄 Bulk upload started:', files.length, 'files');
    console.log('📁 Current slots before:', slots.map(s => s.images.length));
    
    const next = slots.map(s => ({...s, images: [...s.images]}));
    let fileIndex = 0;
    
    // Fill all available slots sequentially
    for (let slotIndex = 0; slotIndex < clipCount && fileIndex < files.length; slotIndex++) {
      console.log(`🎯 Processing slot ${slotIndex}, has ${next[slotIndex].images.length} images`);
      while (next[slotIndex].images.length < 2 && fileIndex < files.length) {
        next[slotIndex].images.push(files[fileIndex++]);
        console.log(`✅ Added file ${fileIndex} to slot ${slotIndex}`);
      }
    }
    
    console.log('📁 Slots after processing:', next.map(s => s.images.length));
    console.log('🏁 Calling onSlotsChange with new slots');
    
    onSlotsChange(next);
  };

  const handleAddPhotos = () => {
    document.getElementById("bulk-file-input")?.click();
  };

  const handleRefreshAll = () => {
    onSlotsChange(slots.map(s => ({ ...s, images: [] })));
  };

  return (
    <div className="space-y-6 relative">
      {/* Compact toolbar header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-foreground">Fotografije</h3>
          <span className="text-sm text-muted-foreground">Dodato {totalImages}/12</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleAddPhotos}
            variant="default" 
            size="sm"
            className="h-8 px-3 text-sm"
          >
            Dodaj
          </Button>
          {totalImages > 0 && (
            <Button 
              onClick={handleRefreshAll} 
              variant="secondary" 
              size="sm"
              className="h-8 px-3 text-sm"
            >
              Osvježi
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-2">JPG, PNG</span>
        </div>
      </div>

      {/* Hidden bulk input */}
      <input
        id="bulk-file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
          if (files.length) handleBulkAdd(files);
          (e.target as HTMLInputElement).value = "";
        }}
      />

      {/* Drop-anywhere grid */}
      <div 
        className="grid-drop-zone transition-all duration-200"
        onDragOver={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).classList.add('drag-over');
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            (e.currentTarget as HTMLElement).classList.remove('drag-over');
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).classList.remove('drag-over');
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
          if (files.length) handleBulkAdd(files);
        }}
      >
        <SlotsGrid
          slots={slots}
          onSlotsChange={onSlotsChange}
          clipCount={clipCount}
        />
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="glass-bar h-14 px-6 flex items-center justify-between rounded-full border border-white/20">
          <Button
            onClick={onPrev}
            variant="ghost"
            size="sm"
            className="text-sm font-medium hover:bg-white/10"
          >
            Nazad
          </Button>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Popunjeno:</span>
            <div className="progress-rail">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(slots.filter(s => s.images.length >= 1).length / clipCount) * 100}%` 
                }}
              />
            </div>
            <span>{slots.filter(s => s.images.length >= 1).length}/{clipCount}</span>
          </div>

          <Button
            onClick={onNext}
            disabled={!canProceed}
            variant="default"
            size="sm"
            className="text-sm px-4 py-2 h-8 rounded-full gradient-primary disabled:opacity-50"
          >
            Sledeći korak
          </Button>
        </div>
      </div>
    </div>
  );
}
