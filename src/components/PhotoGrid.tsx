import React, { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { MainDropZone } from "./MainDropZone";
import { PhotoThumbnail } from "./PhotoThumbnail";
import { PhotoHeader } from "./PhotoHeader";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { cn } from "@/lib/utils";

interface Photo {
  file: File;
  id: string;
  isMainPhoto?: boolean;
  pairIndex?: number;
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  onGenerate: () => void;
  isGenerateEnabled: boolean;
  isLoading?: boolean;
  maxImages?: number;
  className?: string;
}

export function PhotoGrid({ 
  photos, 
  onPhotosChange, 
  onGenerate,
  isGenerateEnabled,
  isLoading = false,
  maxImages = 24,
  className 
}: PhotoGridProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = window.innerWidth < 768;

  const handleFilesSelected = (files: File[]) => {
    const newPhotos: Photo[] = files.map((file, index) => ({
      file,
      id: `photo-${Date.now()}-${index}`,
      isMainPhoto: photos.length === 0 && index === 0, // First photo becomes main if no photos exist
    }));
    
    const updatedPhotos = [...photos, ...newPhotos].slice(0, maxImages);
    onPhotosChange(updatedPhotos);
  };

  const handleSetMainPhoto = (index: number) => {
    const updatedPhotos = photos.map((photo, i) => ({
      ...photo,
      isMainPhoto: i === index
    }));
    onPhotosChange(updatedPhotos);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    
    // If we removed the main photo, make the first photo main
    if (photos[index].isMainPhoto && updatedPhotos.length > 0) {
      updatedPhotos[0].isMainPhoto = true;
    }
    
    onPhotosChange(updatedPhotos);
  };

  const handleDuplicatePhoto = (index: number) => {
    const photo = photos[index];
    if (photos.length >= maxImages) return;
    
    const duplicatedPhoto: Photo = {
      file: photo.file,
      id: `photo-${Date.now()}-duplicate`,
      isMainPhoto: false
    };
    
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index + 1, 0, duplicatedPhoto);
    onPhotosChange(updatedPhotos);
  };

  const handleAutoArrange = () => {
    // Simple auto-arrange: shuffle photos
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    if (shuffled.length > 0 && !shuffled.some(p => p.isMainPhoto)) {
      shuffled[0].isMainPhoto = true;
    }
    onPhotosChange(shuffled);
  };

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
    event.target.value = ''; // Reset input
  };

  const handlePreviewPhoto = (file: File) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Sticky Header */}
      <PhotoHeader
        totalImages={photos.length}
        maxImages={maxImages}
        onAddPhotos={handleAddPhotosClick}
        onAutoArrange={handleAutoArrange}
        onGenerate={onGenerate}
        isGenerateEnabled={isGenerateEnabled}
        isLoading={isLoading}
        isMobile={isMobile}
      />

      {/* Scrollable content */}
      <div 
        className={cn(
          "flex-1 overflow-y-auto p-6 space-y-6",
          isMobile ? "pb-20" : "", // Add bottom padding for mobile sticky header
        )}
        style={{
          maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 120px)'
        }}
      >
        {/* Main drop zone - only show if no photos */}
        {photos.length === 0 && (
          <MainDropZone
            onFilesSelected={handleFilesSelected}
            isDragOver={isDragOver}
          />
        )}

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="space-y-6">
            {/* Current photos grid */}
            <div 
              className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-2" : "grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
              )}
            >
              {photos.map((photo, index) => (
                <PhotoThumbnail
                  key={photo.id}
                  file={photo.file}
                  index={index}
                  isMainPhoto={photo.isMainPhoto}
                  onSetMainPhoto={() => handleSetMainPhoto(index)}
                  onRemove={() => handleRemovePhoto(index)}
                  onDuplicate={() => handleDuplicatePhoto(index)}
                  onPreview={() => handlePreviewPhoto(photo.file)}
                />
              ))}
              
              {/* Add more tile */}
              {photos.length < maxImages && (
                <div
                  className="relative bg-muted/30 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[200px]"
                  style={{ aspectRatio: '9/16' }}
                  onClick={handleAddPhotosClick}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Plus className="h-8 w-8" />
                    <span className="text-sm font-medium">Dodaj</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info text */}
            <div className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p>Kliknite na ★ da postavite naslovnu fotografiju • Prevucite fotografije za promenu redosleda</p>
            </div>
          </div>
        )}
      </div>
      
      <ImagePreviewModal 
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        file={previewFile}
      />
    </div>
  );
}