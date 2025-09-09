import React, { useState } from "react";
import { BulkDropZone } from "./BulkDropZone";
import { SlotsGrid } from "./SlotsGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Shuffle } from "lucide-react";

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
  isLoading?: boolean;
}

export function ImageSlots({ 
  slots, 
  onSlotsChange, 
  totalImages, 
  clipCount,
  onGenerate,
  isGenerateEnabled,
  isLoading = false
}: ImageSlotsProps) {
  const maxImages = clipCount * 2; // Each slot can have max 2 images
  const slotsWithImages = slots.filter(slot => slot.images.length > 0).length;
  const allSlotsFilled = slotsWithImages >= clipCount;

  const handleBulkAdd = (files: File[]) => {
    const updatedSlots = [...slots];
    let fileIndex = 0;
    
    // Fill slots left to right, first image then optional second
    for (let slotIndex = 0; slotIndex < clipCount && fileIndex < files.length; slotIndex++) {
      const slot = updatedSlots[slotIndex];
      
      // Add first image to slot if empty
      if (slot.images.length === 0 && fileIndex < files.length) {
        slot.images.push(files[fileIndex]);
        fileIndex++;
      }
      
      // Add second image to slot if available and slot has room
      if (slot.images.length === 1 && fileIndex < files.length) {
        slot.images.push(files[fileIndex]);
        slot.mode = "frame-to-frame";
        fileIndex++;
      }
    }
    
    onSlotsChange(updatedSlots);
  };

  const handleAutoArrange = () => {
    // Collect all images from all slots
    const allImages: File[] = [];
    slots.forEach(slot => {
      allImages.push(...slot.images);
    });
    
    // Shuffle images
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }
    
    // Redistribute shuffled images
    handleBulkAdd(allImages);
  };

  const handleAddPhotos = () => {
    document.getElementById('bulk-file-input')?.click();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Section: Clip Count Info + Bulk Drop Zone */}
      <div className="p-6 space-y-4 border-b">
        {/* Clip Count Display */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Fotografije za {clipCount} {clipCount === 5 ? 'klipova' : 'klipova'}
          </h2>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {totalImages}/{maxImages}
          </Badge>
        </div>
        
        {/* Bulk Drop Zone */}
        <BulkDropZone
          onFilesSelected={handleBulkAdd}
          maxImages={maxImages}
          className="h-32"
        />
      </div>

      {/* Main Content: Slots Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
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
            <Button
              variant="outline"
              onClick={handleAddPhotos}
              className="h-11 px-6"
            >
              <Upload className="mr-2 h-4 w-4" />
              Dodaj fotografije
            </Button>
            
            {totalImages > 0 && (
              <Button
                variant="outline"
                onClick={handleAutoArrange}
                className="h-11 px-6"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Auto-rasporedi
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
              className="h-11 px-8 text-base font-semibold gradient-primary"
            >
              {isLoading ? "Generiše se..." : "Generiši"}
            </Button>
          </div>
        </div>
        
        {/* Mobile Actions - Sticky Bottom */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAddPhotos}
                className="flex-1 h-12"
              >
                <Upload className="mr-2 h-4 w-4" />
                Dodaj
              </Button>
              
              {totalImages > 0 && (
                <Button
                  variant="outline"
                  onClick={handleAutoArrange}
                  className="h-12 px-4"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {slotsWithImages}/{clipCount} slotova • {totalImages}/{maxImages} slika
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
        </div>
      </div>
    </div>
  );
}