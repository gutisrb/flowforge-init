import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, GripVertical, Plus, Move } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useDrag } from "./DragContext";
import { useToast } from "@/hooks/use-toast";

interface SlotCardProps {
  slotIndex: number;
  images: File[];
  isHero?: boolean;
  onImagesChange: (images: File[]) => void;
  onReceiveInternalImage: (payload: { fromSlot: number; imageIndex: number; toIndex?: number }) => void;
  onDuplicateToNext?: (imageFile: File) => void;
  onReorderSlot?: (fromSlot: number, toSlot: number) => void;
  totalSlots: number;
}

export function SlotCard({
  slotIndex,
  images,
  isHero = false,
  onImagesChange,
  onReceiveInternalImage,
  onDuplicateToNext,
  onReorderSlot,
  totalSlots,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const { isDragging, draggedImage, setDragState } = useDrag();
  const { toast } = useToast();

  const addFiles = (files: File[]) => {
    const next = [...images, ...files].slice(0, 2);
    onImagesChange(next);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Handle internal image movement
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (payload) {
      try {
        const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
        if (images.length >= 2) {
          toast({ description: "Slot je pun", duration: 2000 });
          return;
        }
        onReceiveInternalImage({ ...data });
        return;
      } catch {}
    }

    // Handle external files
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) {
      if (images.length >= 2) {
        toast({ description: "Slot je pun", duration: 2000 });
        return;
      }
      addFiles(files);
    }
  };

  const onDropIntoIndex = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleDragStart = (e: React.DragEvent, imageIndex: number) => {
    e.dataTransfer.setData("text/x-smartflow-image", JSON.stringify({ fromSlot: slotIndex, imageIndex }));
    setDragState(true, { fromSlot: slotIndex, imageIndex });
    setDraggedImageIndex(imageIndex);
  };

  const handleDragEnd = () => {
    setDragState(false);
    setDraggedImageIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (!payload) return;
    
    try {
      const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
      if (data.fromSlot === slotIndex) {
        // Reorder within same slot
        const newImages = [...images];
        const [movedImage] = newImages.splice(data.imageIndex, 1);
        newImages.splice(targetIndex, 0, movedImage);
        onImagesChange(newImages);
      }
    } catch {}
  };

  const handleAddSecond = () => {
    document.getElementById(`add-second-${slotIndex}`)?.click();
  };

  const handleNewAction = () => {
    if (images.length === 2 && onDuplicateToNext) {
      onDuplicateToNext(images[1]); // Duplicate the end frame
    }
  };

  const canAcceptDrop = isDragging && draggedImage && (
    draggedImage.fromSlot !== slotIndex || images.length < 2
  );

  const canShowNewAction = images.length === 2 && slotIndex < totalSlots - 1 && onDuplicateToNext;

  return (
    <>
      <div
        className={`uniform-slot-card h-full flex flex-col transition-all duration-200 ${
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
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Slot {slotIndex + 1}
            </span>
          </div>
        </div>

        {/* Media area */}
        <div className="flex-1 p-4">
          {images.length === 0 ? (
            <label className="cursor-pointer flex flex-col items-center justify-center text-center h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-muted-foreground" />
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
            <div className="space-y-3">
              {/* Media rail */}
              <div className={images.length === 1 ? "space-y-3" : "flex gap-2"}>
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`photo-tile ${draggedImageIndex === idx ? 'dragging' : ''} ${
                      images.length === 1 ? 'w-full' : 'flex-1'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleImageDrop(e, idx)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Fotografija ${idx + 1}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setPreviewUrl(URL.createObjectURL(img));
                      }
                    }}
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt=""
                      className="w-full h-full object-cover object-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setPreviewUrl(URL.createObjectURL(img))}
                    />
                    
                    {/* Gradient pills */}
                    <div className={`absolute top-2 ${
                      images.length === 1 
                        ? 'left-1/2 transform -translate-x-1/2' 
                        : idx === 0 ? 'left-2' : 'right-2'
                    }`}>
                      <div className="gradient-pill">
                        {images.length === 1 ? 'Početak/Kraj' : (idx === 0 ? 'Početak' : 'Kraj')}
                      </div>
                    </div>

                    {/* New action button */}
                    {canShowNewAction && idx === 1 && (
                      <button
                        className="new-action-btn"
                        onClick={handleNewAction}
                        title="Dupliraj u sledeći slot"
                      >
                        Novi
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add second photo link */}
              {images.length === 1 && (
                <div className="text-center">
                  <button 
                    className="add-second-link"
                    onClick={handleAddSecond}
                  >
                    <Plus className="w-3 h-3" />
                    Dodaj drugu (opciono)
                  </button>
                  <input
                    id={`add-second-${slotIndex}`}
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

              {/* Actions row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {images.length >= 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-white/10"
                      onClick={swap}
                      title="Zameni pozicije slika"
                    >
                      <ArrowLeftRight className="h-3 w-3 mr-1" />
                      Zameni
                    </Button>
                  )}
                  {onReorderSlot && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs hover:bg-white/10"
                          title="Premesti slot"
                        >
                          <Move className="h-3 w-3 mr-1" />
                          Premesti
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" align="start">
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                            Premesti u:
                          </div>
                          {Array.from({ length: totalSlots }, (_, i) => i).map((targetSlot) => (
                            <Button
                              key={targetSlot}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-7 px-2 text-xs"
                              disabled={targetSlot === slotIndex}
                              onClick={() => onReorderSlot(slotIndex, targetSlot)}
                            >
                              Slot {targetSlot + 1}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
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

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && previewUrl && (URL.revokeObjectURL(previewUrl), setPreviewUrl(null))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Pregled</DialogTitle></DialogHeader>
          {previewUrl && <img src={previewUrl} className="max-h-[70vh] w-full object-contain rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
}