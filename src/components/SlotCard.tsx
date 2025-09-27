import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, ArrowLeftRight, GripVertical, ArrowUpDown, Sparkles } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useDrag } from "./DragContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const [slotPickerOpen, setSlotPickerOpen] = useState(false);
  const { isDragging, draggedImage, setDragState } = useDrag();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const moveImageToSlot = (imageIndex: number, targetSlot: number) => {
    if (targetSlot === slotIndex) return;
    onReceiveInternalImage({ fromSlot: slotIndex, imageIndex, toIndex: undefined });
  };

  const editImage = (imageIndex: number) => {
    const imageUrl = URL.createObjectURL(images[imageIndex]);
    localStorage.setItem('stagingInputImage', imageUrl);
    navigate('/app/stage');
  };

  const handleDragStart = (e: React.DragEvent, imageIndex: number) => {
    e.dataTransfer.setData("text/x-smartflow-image", JSON.stringify({ fromSlot: slotIndex, imageIndex }));
    setDragState(true, { fromSlot: slotIndex, imageIndex });
  };

  const handleDragEnd = () => {
    setDragState(false);
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
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
                  <div 
                    className="relative w-full h-full group cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 0)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleImageDrop(e, 0)}
                    onMouseEnter={() => setHoveredImageIndex(0)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                  >
                    <img
                      src={URL.createObjectURL(images[0])}
                      alt=""
                      className="w-full h-full object-cover object-center rounded-lg transition-all duration-200 group-hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      tabIndex={0}
                    />
                    {/* Start/End pill */}
                    <div className="absolute top-2 left-2">
                      <div className="h-4 px-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-xs font-semibold rounded-full flex items-center shadow-lg">
                        Početak/Kraj
                      </div>
                    </div>
                    {/* Status rail */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-teal-500 rounded-b-lg" />
                    {/* Quick actions overlay */}
                    {hoveredImageIndex === 0 && (
                      <div className="absolute top-2 right-2 flex gap-1 animate-in fade-in duration-200">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full hover:bg-black/30"
                          onClick={() => editImage(0)}
                          title="Uredi"
                        >
                          <Sparkles className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                    {images.map((img, idx) => (
                      <div 
                        key={idx}
                        className="relative group cursor-grab active:cursor-grabbing aspect-[4/5] overflow-hidden rounded-md"
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleImageDrop(e, idx)}
                        onMouseEnter={() => setHoveredImageIndex(idx)}
                        onMouseLeave={() => setHoveredImageIndex(null)}
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt=""
                          className="w-full h-full object-cover object-center transition-all duration-200 group-hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          tabIndex={0}
                        />
                        {/* Start/End pill */}
                        <div className={`absolute top-1 ${idx === 0 ? 'left-1' : 'right-1'}`}>
                          <div className="h-4 px-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-xs font-semibold rounded-full flex items-center shadow-lg">
                            {idx === 0 ? 'Početak' : 'Kraj'}
                          </div>
                        </div>
                        {/* Status rail */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-teal-500" />
                        {/* Quick actions overlay */}
                        {hoveredImageIndex === idx && (
                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 flex gap-1 animate-in fade-in duration-200">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full hover:bg-black/30"
                              onClick={swap}
                              title="Zameni"
                            >
                              <ArrowLeftRight className="h-3 w-3 text-white" />
                            </Button>
                            <Popover open={slotPickerOpen} onOpenChange={setSlotPickerOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full hover:bg-black/30"
                                  title="Premesti"
                                >
                                  <ArrowUpDown className="h-3 w-3 text-white" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-32 p-2">
                                <div className="grid grid-cols-3 gap-1">
                                  {[0, 1, 2, 3, 4, 5].map((slot) => (
                                    <Button
                                      key={slot}
                                      size="sm"
                                      variant={slot === slotIndex ? "default" : "ghost"}
                                      className="h-8 text-xs"
                                      onClick={() => {
                                        moveImageToSlot(idx, slot);
                                        setSlotPickerOpen(false);
                                      }}
                                      disabled={slot === slotIndex}
                                    >
                                      {slot + 1}
                                    </Button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full hover:bg-black/30"
                              onClick={() => editImage(idx)}
                              title="Uredi"
                            >
                              <Sparkles className="h-3 w-3 text-white" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 2/2 badge */}
                    <div className="absolute bottom-2 right-2">
                      <Badge className="glass-badge text-xs px-1.5 py-0.5">
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
