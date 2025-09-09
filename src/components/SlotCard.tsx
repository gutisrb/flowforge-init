import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, ArrowLeftRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface SlotCardProps {
  slotIndex: number;
  images: File[];
  onImagesChange: (images: File[]) => void;
  onReceiveInternalImage: (payload: { fromSlot: number; imageIndex: number; toIndex?: number }) => void;
}

export function SlotCard({
  slotIndex,
  images,
  onImagesChange,
  onReceiveInternalImage,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  return (
    <>
      <div
        className={`bg-white rounded-xl border-2 ${isDragOver ? "border-primary shadow-lg shadow-primary/20" : "border-border"} transition-all duration-200 h-full min-h-[280px] flex flex-col shadow-sm hover:shadow-md`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{slotIndex + 1}</span>
            </div>
            <span className="text-sm font-medium">Slot {slotIndex + 1}</span>
            {images.length === 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                Frame-to-Frame
              </Badge>
            )}
          </div>

          {images.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={swap}
              title="Zameni redosled slika"
            >
              <ArrowLeftRight className="h-3 w-3 mr-1" />
              Swap
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-4">
          {images.length === 0 ? (
            <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <span className="text-2xl">📸</span>
              </div>
              <span className="font-medium">Dodaj 1 ili 2 fotografije</span>
              <span className="text-xs mt-1 opacity-75">Povuci ovde ili klikni za izbor</span>
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
            <div className={`grid gap-3 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {images.map((image, idx) => (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropIntoIndex(idx)}
                  className="group relative rounded-lg overflow-hidden aspect-[4/3] bg-muted border-2 border-transparent hover:border-primary/30 transition-all"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt=""
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "text/x-smartflow-image",
                        JSON.stringify({ fromSlot: slotIndex, imageIndex: idx })
                      );
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="w-full h-full object-cover cursor-move"
                  />
                  
                  {/* Overlay with controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    {/* Position badge */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-white/90 text-gray-900 border-0 shadow-sm"
                      >
                        {idx === 0 ? "Početak" : "Kraj"}
                      </Badge>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white border-0 shadow-sm"
                        onClick={() => setPreviewUrl(URL.createObjectURL(image))}
                        title="Pregled"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-red-500 hover:text-white border-0 shadow-sm text-red-600"
                        onClick={() => removeAt(idx)}
                        title="Obriši"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add second image slot when only one image */}
              {images.length === 1 && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropIntoIndex(1)}
                  className="rounded-lg border-2 border-dashed border-muted-foreground/25 aspect-[4/3] flex items-center justify-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => document.getElementById(`slot-${slotIndex}-add`)?.click()}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">+</span>
                    </div>
                    <span className="text-xs">Dodaj drugu</span>
                  </div>
                  <input
                    id={`slot-${slotIndex}-add`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
                      if (files.length) addFiles(files);
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                </div>
              )}
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
