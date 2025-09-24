import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, ArrowLeftRight, GripVertical } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useDrag } from "./DragContext";

interface SlotCardProps {
  slotIndex: number;
  images: File[];
  isHero?: boolean;
  onImagesChange: (images: File[]) => void;
  onReceiveInternalImage: (payload: { fromSlot: number; imageIndex: number; toIndex?: number }) => void;
}

export function SlotCard({
  slotIndex,
  images,
  isHero = false,
  onImagesChange,
  onReceiveInternalImage,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { isDragging, draggedImage, setDragState } = useDrag();

  const addFiles = (files: File[]) => {
    const next = [...images, ...files].slice(0, 2);
    onImagesChange(next);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // move image from another (or same) slot
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (payload) {
      try {
        const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
        onReceiveInternalImage({ ...data });
        return;
      } catch {}
    }

    // external files
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) addFiles(files);
  };

  const onDropIntoIndex = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (!payload) return;
    try {
      const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
      onReceiveInternalImage({ ...data, toIndex });
    } catch {}
  };

  const removeAt = (i: number) => onImagesChange(images.filter((_, idx) => idx !== i));

  const swap = () => {
    if (images.length === 2) onImagesChange([images[1], images[0]]);
  };

  const canAcceptDrop = isDragging && draggedImage && (
    draggedImage.fromSlot !== slotIndex || images.length < 2
  );

  return (
    <>
      <div
        className={`uniform-slot-card parallax-card h-full flex flex-col transition-all duration-200 ${
          isDragOver && canAcceptDrop 
            ? "border-primary shadow-2xl shadow-primary/30 bg-gradient-to-br from-primary/10 to-accent/5" 
            : isDragging && canAcceptDrop
            ? "border-primary/50 shadow-lg"
            : "border-border hover:shadow-md hover:-translate-y-0.5"
        }`}
        onDragOver={(e) => { 
          e.preventDefault(); 
          if (canAcceptDrop) setIsDragOver(true); 
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
          }
        }}
        onDrop={onDrop}
      >
        {/* Header */}
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Slot {slotIndex + 1}
            </span>
            {images.length === 2 && (
              <Badge className="glass-badge text-xs px-2 py-1 rounded-full">
                Početak/Kraj
              </Badge>
            )}
          </div>
        </div>

        {/* Media area */}
        <div className="flex-1 p-3">
          {images.length === 0 ? (
            <label className="uniform-media-area cursor-pointer flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                <span className="text-2xl">+</span>
              </div>
              <span className="text-sm font-medium text-foreground mb-1">
                Dodaj 1-2 fotografije
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
                  if (files.length) addFiles(files);
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </label>
          ) : (
            <div>
              <div className="uniform-media-area relative">
                {images.length === 1 ? (
                  <img
                    src={URL.createObjectURL(images[0])}
                    alt=""
                    className="w-full h-full object-cover rounded-lg transition-transform duration-200 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full relative rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(images[0])}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                    {/* Mini thumbs strip */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {images.slice(0, 2).map((img, idx) => (
                        <div key={idx} className="w-6 h-6 rounded border border-white/40 overflow-hidden">
                          <img
                            src={URL.createObjectURL(img)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <Badge className="glass-badge text-xs px-1.5 py-0.5 ml-1">
                        2/2
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Control row */}
              <div className="p-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {images.length >= 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-white/10"
                      onClick={swap}
                    >
                      Zameni
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-white/10 text-destructive"
                    onClick={() => onImagesChange([])}
                  >
                    Ukloni
                  </Button>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && previewUrl && (URL.revokeObjectURL(previewUrl), setPreviewUrl(null))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Pregled</DialogTitle></DialogHeader>
          {previewUrl && <img src={previewUrl} className="max-h-[70vh] w-full object-contain rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
