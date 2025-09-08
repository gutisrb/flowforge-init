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
        className="absolute -top-3 -left-3 h-7 w-7 rounded-full p-0 flex items-center justify-center text-sm font-semibold bg-primary text-primary-foreground shadow-sm"
      >
        {index + 1}
      </Badge>

      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={slot.mode === "image-to-video" ? "default" : "outline"}
            onClick={() => onModeToggle(slot.id)}
            className="text-xs font-medium"
          >
            Slika (1)
          </Button>
          <Button
            size="sm"
            variant={slot.mode === "frame-to-frame" ? "default" : "outline"}
            onClick={() => onModeToggle(slot.id)}
            className="text-xs font-medium"
          >
            Kadrovi (2)
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
                      label={imageIndex === 0 ? "Prvi" : "Drugi"}
                      onRemove={() => handleRemoveImage(imageIndex)}
                      onReplace={() => handleReplaceImage(imageIndex)}
                      onDuplicate={() => handlePhotoDuplicate(imageIndex)}
                      className="h-24"
                    />
                  ) : (
                    <PhotoDropZone
                      id={`${slot.id}-drop-${imageIndex}`}
                      onDrop={() => fileInputRef.current?.click()}
                      label={imageIndex === 0 ? "Prvi" : "Drugi"}
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
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Dodaj sliku
            </Button>
          )}

          {/* Slot Actions */}
          {slot.images.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={() => onImagesChange(slot.id, [])}
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
              {slot.mode === "frame-to-frame" && slot.images.length === 2 && (
                <Button
                  onClick={() => handlePhotoReorder(0, 1)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Shuffle className="h-3 w-3 mr-1" />
                  Swap
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500 text-center font-medium">
          {slot.images.length}/{maxImages} {slot.images.length === 1 ? 'slika' : 'slika'}
        </div>
      </div>
    </Card>
  );
}

export function ImageSlots({ slots, onSlotsChange, totalImages }: ImageSlotsProps) {
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
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Fotografije</h2>
          <Badge 
            variant={totalImages >= 6 ? "default" : "secondary"}
            className="px-3 py-1 font-medium"
          >
            {totalImages}/5+
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Organizujte fotografije u slotove • Prevucite za reorder • Click photos to replace
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
      <div className="text-center p-4 bg-gray-50 rounded-lg border">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            💡 <strong>Savet:</strong> Koristite "Slika" za jedan kadar ili "Prelaz" za animaciju između dve fotografije
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Click on photos to replace them</p>
            <p>• Drag photos between slots to move them</p>
            <p>• Use bulk upload to add multiple photos at once</p>
            <p>• Duplicate photos using the copy button</p>
          </div>
        </div>
      </div>
    </div>
  );
}