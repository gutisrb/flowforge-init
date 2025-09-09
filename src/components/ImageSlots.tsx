import React from "react";
import { PhotoGrid } from "./PhotoGrid";

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

interface Photo {
  file: File;
  id: string;
  isMainPhoto?: boolean;
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
  // Convert slots to photos format for the new grid
  const convertSlotsToPhotos = (): Photo[] => {
    const photos: Photo[] = [];
    slots.forEach((slot, slotIndex) => {
      slot.images.forEach((file, imageIndex) => {
        photos.push({
          file,
          id: `${slot.id}-${imageIndex}`,
          isMainPhoto: slotIndex === 0 && imageIndex === 0 && photos.length === 0
        });
      });
    });
    return photos;
  };

  // Convert photos back to slots format to maintain backend compatibility
  const convertPhotosToSlots = (photos: Photo[]): SlotData[] => {
    // Create new slots based on clipCount
    const newSlots: SlotData[] = Array.from({ length: clipCount }, (_, i) => ({
      id: `slot-${i}`,
      mode: "image-to-video" as const,
      images: []
    }));

    // Distribute photos across slots (1 photo per slot by default)
    photos.forEach((photo, index) => {
      const slotIndex = index % clipCount;
      if (slotIndex < newSlots.length && newSlots[slotIndex].images.length === 0) {
        newSlots[slotIndex].images.push(photo.file);
      }
    });

    return newSlots;
  };

  const handlePhotosChange = (photos: Photo[]) => {
    const newSlots = convertPhotosToSlots(photos);
    onSlotsChange(newSlots);
  };

  const currentPhotos = convertSlotsToPhotos();

  return (
    <PhotoGrid
      photos={currentPhotos}
      onPhotosChange={handlePhotosChange}
      onGenerate={onGenerate}
      isGenerateEnabled={isGenerateEnabled}
      isLoading={isLoading}
      maxImages={24}
    />
  );
}