import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight, Trash2, Eye, MoreVertical } from "lucide-react";

interface SlotCardProps {
  slotIndex: number;
  images: File[];
  mode: "image-to-video" | "frame-to-frame";
  onImagesChange: (images: File[]) => void;
  onModeChange: (mode: "image-to-video" | "frame-to-frame") => void;
  onSwapImages: () => void;
  onRemoveSlot: () => void;
}

export function SlotCard({
  slotIndex,
  images,
  mode,
  onImagesChange,
  onModeChange,
  onSwapImages,
  onRemoveSlot,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const newImages = [...images];
      files.forEach(file => {
        if (newImages.length < 2) {
          newImages.push(file);
        }
      });
      onImagesChange(newImages);
      
      // Auto-switch to frame-to-frame if 2 images
      if (newImages.length === 2) {
        onModeChange("frame-to-frame");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...images];
      files.forEach(file => {
        if (newImages.length < 2) {
          newImages.push(file);
        }
      });
      onImagesChange(newImages);
      
      // Auto-switch to frame-to-frame if 2 images
      if (newImages.length === 2) {
        onModeChange("frame-to-frame");
      }
    }
  };

  const handleRemoveImage = (imageIndex: number) => {
    const newImages = images.filter((_, i) => i !== imageIndex);
    onImagesChange(newImages);
    
    // Auto-switch back to image-to-video if only 1 image left
    if (newImages.length <= 1) {
      onModeChange("image-to-video");
    }
  };

  const openPreview = (image: File) => {
    const url = URL.createObjectURL(image);
    setPreviewImage(url);
  };

  const closePreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors p-4 h-full min-h-[280px] flex flex-col">
        {/* Slot Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Slot {slotIndex + 1}
            </span>
            {images.length === 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                Frame-to-Frame
              </Badge>
            )}
          </div>
          
          {images.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {images.length === 2 && (
                  <DropdownMenuItem onClick={onSwapImages} className="text-sm">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Zameni redosled
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={onRemoveSlot}
                  className="text-sm text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Obriši sve
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Images Display or Drop Zone */}
        <div className="flex-1 flex flex-col">
          {images.length === 0 ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer min-h-[200px] ${
                isDragOver 
                  ? "border-accent bg-accent/10" 
                  : "border-muted-foreground/25 hover:border-accent hover:bg-accent/5"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => document.getElementById(`file-input-${slotIndex}`)?.click()}
            >
              <div className="text-center space-y-2">
                <div className="text-4xl text-muted-foreground/40">📸</div>
                <p className="text-sm font-medium text-foreground">
                  Dodaj 1 ili 2 fotografije
                </p>
                <p className="text-xs text-muted-foreground">
                  Prevuci ovde ili klikni za izbor
                </p>
              </div>
              <input
                id={`file-input-${slotIndex}`}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="flex-1 space-y-2">
              {images.map((image, imageIndex) => (
                <div
                  key={imageIndex}
                  className="relative group bg-muted rounded-lg overflow-hidden aspect-[16/9]"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Slika ${imageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image overlay controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {imageIndex === 0 ? "Početak" : "Kraj"}
                      </Badge>
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openPreview(image)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveImage(imageIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add second image option */}
              {images.length === 1 && (
                <div
                  className={`flex items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer h-20 ${
                    isDragOver 
                      ? "border-accent bg-accent/10" 
                      : "border-muted-foreground/25 hover:border-accent hover:bg-accent/5"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onClick={() => document.getElementById(`file-input-${slotIndex}`)?.click()}
                >
                  <p className="text-sm text-muted-foreground">+ Dodaj drugu sliku</p>
                  <input
                    id={`file-input-${slotIndex}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-screen preview dialog */}
      <Dialog open={!!previewImage} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Pregled slike</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Pregled"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}