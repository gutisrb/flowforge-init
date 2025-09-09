import React, { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  rectIntersection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Upload, GripVertical, X, Image as ImageIcon, Shuffle, Trash2 } from "lucide-react";
import { PhotoItem } from "./PhotoItem";
import { PhotoDropZone } from "./PhotoDropZone";
import { BulkUpload } from "./BulkUpload";

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
}

interface SortableSlotProps {
  slot: SlotData;
  index: number;
  onModeToggle: (id: string) => void;
  onImagesChange: (id: string, images: File[]) => void;
  onPhotoCrossSlotMove: (fromSlotId: string, photoIndex: number, toSlotId: string, toPhotoIndex?: number) => void;
  onPhotoDuplicate: (slotId: string, photoIndex: number) => void;
}

function SortableSlot({ slot, index, onModeToggle, onImagesChange, onPhotoCrossSlotMove, onPhotoDuplicate }: SortableSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const maxImages = slot.mode === "image-to-video" ? 1 : 2;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const replaceIndex = fileInputRef.current?.getAttribute('data-replace-index');
      if (replaceIndex !== null && replaceIndex !== undefined) {
        // Replace specific image
        const newImages = [...slot.images];
        newImages[parseInt(replaceIndex)] = files[0];
        onImagesChange(slot.id, newImages);
        fileInputRef.current?.removeAttribute('data-replace-index');
      } else {
        // Add new images
        const newImages = [...slot.images, ...files].slice(0, maxImages);
        onImagesChange(slot.id, newImages);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageIndex: number) => {
    const newImages = slot.images.filter((_, i) => i !== imageIndex);
    onImagesChange(slot.id, newImages);
  };

  const handleReplaceImage = (imageIndex: number) => {
    fileInputRef.current?.click();
    // Store which image to replace
    fileInputRef.current?.setAttribute('data-replace-index', imageIndex.toString());
  };

  const handlePhotoDuplicate = (imageIndex: number) => {
    onPhotoDuplicate(slot.id, imageIndex);
  };

  const handlePhotoReorder = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    const newImages = [...slot.images];
    const [movedImage] = newImages.splice(oldIndex, 1);
    newImages.splice(newIndex, 0, movedImage);
    onImagesChange(slot.id, newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      const newImages = [...slot.images, ...files].slice(0, maxImages);
      onImagesChange(slot.id, newImages);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const canAddMore = slot.images.length < maxImages;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative p-6 border-2 border-dashed transition-all duration-200 bg-white hover:shadow-md ${
        isDragging 
          ? 'opacity-50 rotate-1 shadow-lg scale-105' 
          : 'hover:border-primary/50'
      } ${
        slot.images.length > 0 
          ? 'border-primary/30 shadow-sm' 
          : 'border-gray-200 hover:border-primary/30'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-3 right-3 cursor-grab hover:cursor-grabbing opacity-30 hover:opacity-60 transition-opacity"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Slot Badge */}
      <Badge 
        variant="default"
        className="absolute -top-4 -left-4 h-10 w-10 rounded-full p-0 flex items-center justify-center text-lg font-bold bg-primary text-primary-foreground shadow-md"
      >
        {index + 1}
      </Badge>

      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-3">
          <Button
            size="default"
            variant={slot.mode === "image-to-video" ? "default" : "outline"}
            onClick={() => onModeToggle(slot.id)}
            className="text-base font-semibold min-h-[44px] px-6 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Jedna slika
          </Button>
          <Button
            size="default"
            variant={slot.mode === "frame-to-frame" ? "default" : "outline"}
            onClick={() => onModeToggle(slot.id)}
            className="text-base font-semibold min-h-[44px] px-6 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Dva kadra
          </Button>
        </div>

        {/* Image Display Area */}
        <div className="space-y-3">
          {slot.mode === "image-to-video" ? (
            // Single image mode
            <div className="space-y-2">
              {slot.images[0] ? (
                <PhotoItem
                  id={`${slot.id}-photo-0`}
                  file={slot.images[0]}
                  index={0}
                  onRemove={() => handleRemoveImage(0)}
                  onReplace={() => handleReplaceImage(0)}
                  onDuplicate={() => handlePhotoDuplicate(0)}
                  className="h-32"
                />
              ) : (
                <PhotoDropZone
                  id={`${slot.id}-drop-0`}
                  onDrop={() => fileInputRef.current?.click()}
                  className="h-32"
                />
              )}
            </div>
          ) : (
            // Frame-to-frame mode
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((imageIndex) => (
                <div key={imageIndex}>
                  {slot.images[imageIndex] ? (
                    <PhotoItem
                      id={`${slot.id}-photo-${imageIndex}`}
                      file={slot.images[imageIndex]}
                      index={imageIndex}
                      label={imageIndex === 0 ? "Prva fotografija" : "Druga fotografija"}
                      onRemove={() => handleRemoveImage(imageIndex)}
                      onReplace={() => handleReplaceImage(imageIndex)}
                      onDuplicate={() => handlePhotoDuplicate(imageIndex)}
                      className="h-24"
                    />
                  ) : (
                    <PhotoDropZone
                      id={`${slot.id}-drop-${imageIndex}`}
                      onDrop={() => fileInputRef.current?.click()}
                      label={imageIndex === 0 ? "Prva fotografija" : "Druga fotografija"}
                      className="h-24"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Button and Slot Actions */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={slot.mode === "frame-to-frame"}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {canAddMore && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="default"
              className="w-full min-h-[44px] text-base font-medium border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Upload className="h-5 w-5 mr-3" />
              Dodaj fotografiju
            </Button>
          )}

          {/* Slot Actions */}
          {slot.images.length > 0 && (
            <div className="flex gap-3">
              <Button
                onClick={() => onImagesChange(slot.id, [])}
                variant="outline"
                size="default"
                className="flex-1 min-h-[44px] text-base font-medium border-destructive/30 text-destructive hover:bg-destructive/5 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Obriši sve
              </Button>
              {slot.mode === "frame-to-frame" && slot.images.length === 2 && (
                <Button
                  onClick={() => handlePhotoReorder(0, 1)}
                  variant="outline"
                  size="default"
                  className="flex-1 min-h-[44px] text-base font-medium focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  Zameni mesta
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-base text-muted-foreground text-center font-medium">
          {slot.images.length}/{maxImages} {slot.images.length === 1 ? 'fotografija' : 'fotografije'}
        </div>
      </div>
    </Card>
  );
}

export function ImageSlots({ slots, onSlotsChange, totalImages, clipCount }: ImageSlotsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle slot reordering
    if (active.id !== over.id && !active.id.toString().includes('photo')) {
      const oldIndex = slots.findIndex((slot) => slot.id === active.id);
      const newIndex = slots.findIndex((slot) => slot.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onSlotsChange(arrayMove(slots, oldIndex, newIndex));
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Handle photo cross-slot movement
    if (active.id.toString().includes('photo') && over.id.toString().includes('drop')) {
      const activeId = active.id.toString();
      const overId = over.id.toString();
      
      const [activeSlotId, , activePhotoIndex] = activeId.split('-');
      const [overSlotId] = overId.split('-');
      
      if (activeSlotId !== overSlotId) {
        handlePhotoCrossSlotMove(activeSlotId, parseInt(activePhotoIndex), overSlotId);
      }
    }
  };

  const handleModeToggle = (id: string) => {
    const newSlots = slots.map((slot) =>
      slot.id === id
        ? {
            ...slot,
            mode: slot.mode === "image-to-video" ? "frame-to-frame" as const : "image-to-video" as const,
            images: [], // Clear images when switching modes
          }
        : slot
    );
    onSlotsChange(newSlots);
  };

  const handleImagesChange = (id: string, images: File[]) => {
    const newSlots = slots.map((slot) =>
      slot.id === id ? { ...slot, images } : slot
    );
    onSlotsChange(newSlots);
  };

  const handlePhotoCrossSlotMove = (fromSlotId: string, photoIndex: number, toSlotId: string, toPhotoIndex?: number) => {
    const fromSlot = slots.find(s => s.id === fromSlotId);
    const toSlot = slots.find(s => s.id === toSlotId);
    
    if (!fromSlot || !toSlot || !fromSlot.images[photoIndex]) return;

    const photo = fromSlot.images[photoIndex];
    const maxImages = toSlot.mode === "image-to-video" ? 1 : 2;
    
    // Check if target slot has space
    if (toSlot.images.length >= maxImages) return;

    const newSlots = slots.map((slot) => {
      if (slot.id === fromSlotId) {
        return { ...slot, images: slot.images.filter((_, i) => i !== photoIndex) };
      }
      if (slot.id === toSlotId) {
        const newImages = [...slot.images];
        if (toPhotoIndex !== undefined && toPhotoIndex < newImages.length) {
          newImages.splice(toPhotoIndex, 0, photo);
        } else {
          newImages.push(photo);
        }
        return { ...slot, images: newImages };
      }
      return slot;
    });
    
    onSlotsChange(newSlots);
  };

  const handlePhotoDuplicate = (slotId: string, photoIndex: number) => {
    const sourceSlot = slots.find(s => s.id === slotId);
    if (!sourceSlot || !sourceSlot.images[photoIndex]) return;

    const photo = sourceSlot.images[photoIndex];
    
    // Find next available slot
    const availableSlot = slots.find(slot => {
      const maxImages = slot.mode === "image-to-video" ? 1 : 2;
      return slot.images.length < maxImages;
    });

    if (availableSlot) {
      handleImagesChange(availableSlot.id, [...availableSlot.images, photo]);
    }
  };

  const handleBulkUpload = (files: File[]) => {
    let fileIndex = 0;
    const newSlots = slots.map(slot => {
      const maxImages = slot.mode === "image-to-video" ? 1 : 2;
      const available = maxImages - slot.images.length;
      
      if (available > 0 && fileIndex < files.length) {
        const newImages = [...slot.images];
        for (let i = 0; i < available && fileIndex < files.length; i++) {
          newImages.push(files[fileIndex]);
          fileIndex++;
        }
        return { ...slot, images: newImages };
      }
      
      return slot;
    });
    
    onSlotsChange(newSlots);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Fotografije</h2>
          <Badge 
            variant={totalImages >= clipCount ? "default" : "secondary"}
            className="px-4 py-2 font-semibold text-base min-h-[32px]"
          >
            {totalImages}/{clipCount}+
          </Badge>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          Organizujte fotografije u slotove • Prevucite za promenu redosleda • Kliknite na fotografije za zamenu
        </p>
      </div>

      {/* Bulk Upload */}
      <BulkUpload onFilesSelected={handleBulkUpload} slots={slots} />

      {/* Slots */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext items={slots.map(slot => slot.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <SortableSlot
                key={slot.id}
                slot={slot}
                index={index}
                onModeToggle={handleModeToggle}
                onImagesChange={handleImagesChange}
                onPhotoCrossSlotMove={handlePhotoCrossSlotMove}
                onPhotoDuplicate={handlePhotoDuplicate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Instructions */}
      <div className="text-center p-6 bg-muted rounded-lg border">
        <div className="space-y-4">
          <p className="text-base text-foreground font-medium">
            💡 <strong>Savet:</strong> Koristite "Jedna slika" za statičan kadar ili "Dva kadra" za animaciju između dve fotografije
          </p>
          <div className="text-base text-muted-foreground space-y-2 leading-relaxed">
            <p>• Kliknite na fotografije da ih zamenite</p>
            <p>• Prevucite fotografije između slotova za premeštanje</p>
            <p>• Koristite masovno učitavanje za dodavanje više fotografija odjednom</p>
            <p>• Kopirajte fotografije pomoću dugmeta za kopiranje</p>
          </div>
        </div>
      </div>
    </div>
  );
}