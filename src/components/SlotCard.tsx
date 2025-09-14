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
        className={`bg-white rounded-xl border-2 transition-all duration-200 h-full min-h-[320px] flex flex-col shadow-sm hover:shadow-md ${
          isDragOver && canAcceptDrop 
            ? "border-primary shadow-lg shadow-primary/20 bg-primary/5" 
            : isDragging && canAcceptDrop
            ? "border-primary/50 shadow-md"
            : "border-border"
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
        <div className="p-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Slot {slotIndex + 1}</span>
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
          {images.length === 2 && (
            <div className="flex justify-start">
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                Frame-to-Frame
              </Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-4">
          {images.length === 0 ? (
            <label className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center text-sm transition-colors ${
              isDragOver && canAcceptDrop
                ? "border-primary bg-primary/10 text-primary"
                : isDragging && canAcceptDrop
                ? "border-primary/50 bg-primary/5 text-primary/70"
                : "border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
            }`}>
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <span className="text-2xl">📸</span>
              </div>
              <span className="font-medium">
                {isDragOver && canAcceptDrop ? "Otpusti ovde" : "Dodaj 1-2 fotografije"}
              </span>
              <span className="text-xs mt-1 opacity-75">
                {isDragOver && canAcceptDrop ? "Slika će biti dodana" : "Jedna slika = statična / Dve slike = animacija"}
              </span>
              <span className="text-xs mt-1 opacity-60">
                Povuci ovde ili klikni za izbor
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
            <div className="flex flex-col gap-3">
              {images.map((image, idx) => {
                const isBeingDragged = isDragging && draggedImage?.fromSlot === slotIndex && draggedImage?.imageIndex === idx;
                const canDropHere = isDragging && draggedImage && !(draggedImage.fromSlot === slotIndex && draggedImage.imageIndex === idx);
                
                return (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      const payload = { fromSlot: slotIndex, imageIndex: idx };
                      setDragState(true, payload);
                      e.dataTransfer.setData(
                        "text/x-smartflow-image",
                        JSON.stringify(payload)
                      );
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDragState(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDropIntoIndex(idx)}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setIsDragOver(false);
                      }
                    }}
                    className={`group relative rounded-lg overflow-hidden aspect-[3/2] bg-muted border-2 transition-all cursor-move ${
                      isBeingDragged
                        ? "border-primary/50 opacity-50 scale-95"
                        : canDropHere
                        ? "border-primary/50 shadow-md"
                        : "border-transparent hover:border-primary/30"
                    }`}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    
                    {/* Drag indicator */}
                    <div
                      className="absolute top-2 left-2 p-1 bg-white/90 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none"
                      title="Povuci za prebacivanje"
                    >
                      <GripVertical className="h-4 w-4 text-gray-600" />
                    </div>
                  
                    {/* Drop overlay */}
                    {canDropHere && (
                      <div className="absolute inset-0 bg-primary/20 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                        <div className="bg-white/90 px-3 py-1 rounded-md text-xs font-medium text-primary">
                          Zameni poziciju
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                      {/* Position badge */}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-white/90 text-gray-900 border-0 shadow-sm"
                        >
                          {idx === 0 ? "Početak" : "Kraj"}
                        </Badge>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                );
              })}
              
              {/* Add second image slot when only one image */}
              {images.length === 1 && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropIntoIndex(1)}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setIsDragOver(false);
                    }
                  }}
                  className={`rounded-lg border-2 border-dashed aspect-[3/2] flex items-center justify-center text-sm transition-colors cursor-pointer ${
                    canAcceptDrop
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onClick={() => document.getElementById(`slot-${slotIndex}-add`)?.click()}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">+</span>
                    </div>
                    <span className="text-xs font-medium">
                      {canAcceptDrop ? "Otpusti ovde" : "Dodaj drugu sliku"}
                    </span>
                    <span className="text-xs opacity-75 mt-1 block">
                      Za animaciju
                    </span>
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
